import subprocess
import os
import json

class Transcoder:
    def __init__(self, output_dir):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def _has_audio(self, input_path):
        """
        Checks if the input video file has an audio stream.
        """
        command = [
            'ffprobe', '-v', 'error', '-show_streams', '-select_streams', 'a',
            '-print_format', 'json', input_path
        ]
        try:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
            data = json.loads(result.stdout)
            return len(data.get('streams', [])) > 0
        except Exception as e:
            print(f"Error checking for audio: {e}")
            return False

    def process_to_hls(self, input_path):
        """
        Transcodes input video into HLS with 3 variants: 360p, 720p, 1080p.
        Generates .ts segments and a master .m3u8 playlist.
        """
        has_audio = self._has_audio(input_path)
        print(f"Transcoding {input_path} to HLS (has_audio={has_audio}) in {self.output_dir}...")
        
        # Base command
        command = ['ffmpeg', '-i', input_path]
        
        # Add video variants
        # 360p
        command += ['-map', '0:v:0']
        if has_audio:
            command += ['-map', '0:a:0']
        command += ['-s:v:0', '640x360', '-c:v:0', 'libx264', '-b:v:0', '800k']
        
        # 720p
        command += ['-map', '0:v:0']
        if has_audio:
            command += ['-map', '0:a:0']
        command += ['-s:v:1', '1280x720', '-c:v:1', 'libx264', '-b:v:1', '2800k']
        
        # 1080p
        command += ['-map', '0:v:0']
        if has_audio:
            command += ['-map', '0:a:0']
        command += ['-s:v:2', '1920x1080', '-c:v:2', 'libx264', '-b:v:2', '5000k']
        
        # Audio settings
        if has_audio:
            command += ['-c:a', 'aac', '-ar', '48000', '-b:a', '128k']
        
        # HLS options
        command += [
            '-f', 'hls',
            '-hls_time', '10',
            '-hls_playlist_type', 'vod',
            '-hls_flags', 'independent_segments',
            '-master_pl_name', 'master.m3u8',
            '-hls_segment_filename', os.path.join(self.output_dir, 'v%v/segment%03d.ts')
        ]
        
        # Stream map
        if has_audio:
            command += ['-var_stream_map', 'v:0,a:0 v:1,a:1 v:2,a:2']
        else:
            command += ['-var_stream_map', 'v:0 v:1 v:2']
            
        command.append(os.path.join(self.output_dir, 'v%v/index.m3u8'))

        try:
            subprocess.run(command, check=True, capture_output=True)
            print("Transcoding completed successfully.")
            return os.path.join(self.output_dir, "master.m3u8")
        except subprocess.CalledProcessError as e:
            print(f"Error during transcoding: {e.stderr.decode()}")
            raise e

    def generate_thumbnail(self, input_path):
        """
        Extracts a thumbnail from the video at 00:00:01 timestamp.
        """
        thumbnail_path = os.path.join(self.output_dir, "thumbnail.jpg")
        print(f"Generating thumbnail for {input_path} at {thumbnail_path}...")
        
        command = [
            'ffmpeg', '-ss', '00:00:01', '-i', input_path,
            '-vframes', '1', '-q:v', '2',
            thumbnail_path
        ]

        try:
            subprocess.run(command, check=True, capture_output=True)
            print("Thumbnail generated successfully.")
            return thumbnail_path
        except subprocess.CalledProcessError as e:
            print(f"Error during thumbnail generation: {e.stderr.decode()}")
            # We don't want to fail the whole process if thumbnail fails
            return None
