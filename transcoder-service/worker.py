import redis
import json
import os
import shutil
import tempfile
import time
from config import Config
from storage import StorageManager
from transcoder import Transcoder
from database import DatabaseManager

class TranscoderWorker:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=Config.REDIS_HOST, 
            port=Config.REDIS_PORT, 
            db=0
        )
        self.queue_name = "video_queue"
        self.storage = StorageManager()
        self.db = DatabaseManager()

    def run(self):
        retries = 5
        while retries > 0:
            try:
                self.redis_client.ping()
                print("Successfully connected to Redis.")
                break
            except Exception as e:
                retries -= 1
                print(f"Failed to connect to Redis. Retrying in 5s... ({retries} retries left)")
                time.sleep(5)
        
        if retries == 0:
            print("Fatal: Could not connect to Redis after multiple attempts.")
            return

        print(f"Worker started. Listening on {self.queue_name}...")
        while True:
            # BLPOP blocks until a message is available
            # Returns a tuple (queue_name, message)
            _, message_json = self.redis_client.blpop(self.queue_name)
            
            try:
                message = json.loads(message_json)
                self.process_message(message)
            except Exception as e:
                print(f"Failed to process message: {e}")
                # In a production app, you might move this to a Dead Letter Queue

    def process_message(self, message):
        video_id = message.get("videoId")
        gcs_path = message.get("gcsPath")
        user_id = message.get("userId")

        if not all([video_id, gcs_path, user_id]):
            print(f"Invalid message format: {message}")
            return

        print(f"Processing video {video_id} for user {user_id}...")

        # Create a temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            local_input_path = os.path.join(temp_dir, "input_video")
            local_output_dir = os.path.join(temp_dir, "output_hls")
            
            try:
                # 1. Download raw video
                self.storage.download_video(gcs_path, local_input_path)

                # 2. Transcode to HLS
                transcoder = Transcoder(local_output_dir)
                transcoder.process_to_hls(local_input_path)

                # 3. Generate Thumbnail
                transcoder.generate_thumbnail(local_input_path)

                # 4. Upload processed segments
                remote_output_dir = f"processed/{user_id}/{video_id}"
                master_playlist_path = self.storage.upload_directory(local_output_dir, remote_output_dir)

                # 4. Update Database
                # Construct the full public path or bucket path as needed
                # Here we store the relative path within the processed bucket
                self.db.update_video_status(video_id, 'READY', hls_path=master_playlist_path)
                
                print(f"Successfully processed video {video_id}")

            except Exception as e:
                print(f"Error processing video {video_id}: {e}")
                self.db.update_video_status(video_id, 'FAILED')
                raise e

if __name__ == "__main__":
    # Validate config before starting
    try:
        Config.validate()
        worker = TranscoderWorker()
        worker.run()
    except Exception as e:
        print(f"Fatal error: {e}")
