import psycopg2
from config import Config

import time

class DatabaseManager:
    def __init__(self):
        retries = 5
        while retries > 0:
            try:
                self.conn = psycopg2.connect(
                    host=Config.DB_HOST,
                    database=Config.DB_NAME,
                    user=Config.DB_USER,
                    password=Config.DB_PASSWORD,
                    port=Config.DB_PORT
                )
                print("Successfully connected to PostgreSQL.")
                break
            except Exception as e:
                retries -= 1
                print(f"Failed to connect to PostgreSQL. Retrying in 5s... ({retries} retries left)")
                time.sleep(5)
        
        if retries == 0:
            raise Exception("Could not connect to PostgreSQL after multiple attempts.")

    def update_video_status(self, video_id, status, hls_path=None):
        """Updates the status and HLS path of a video in the database."""
        print(f"Updating video {video_id} status to {status}...")
        with self.conn.cursor() as cur:
            if hls_path:
                cur.execute(
                    "UPDATE videos SET status = %s, gcs_hls_path = %s WHERE id = %s",
                    (status, hls_path, video_id)
                )
            else:
                cur.execute(
                    "UPDATE videos SET status = %s WHERE id = %s",
                    (status, video_id)
                )
            self.conn.commit()

    def close(self):
        self.conn.close()
