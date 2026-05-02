import os
import boto3
from botocore.client import Config as BotoConfig
from config import Config

class StorageManager:
    def __init__(self):
        self.s3 = boto3.resource(
            's3',
            endpoint_url=Config.MINIO_ENDPOINT,
            aws_access_key_id=Config.MINIO_ACCESS_KEY,
            aws_secret_access_key=Config.MINIO_SECRET_KEY,
            config=BotoConfig(signature_version='s3v4'),
            region_name='us-east-1'
        )
        self.raw_bucket_name = Config.MINIO_RAW_BUCKET
        self.processed_bucket_name = Config.MINIO_PROCESSED_BUCKET

    def download_video(self, s3_path, local_path):
        """Downloads an object from the raw bucket to a local file."""
        print(f"Downloading {s3_path} to {local_path} from {self.raw_bucket_name}...")
        self.s3.Bucket(self.raw_bucket_name).download_file(s3_path, local_path)
        return local_path

    def upload_directory(self, local_dir, remote_dir):
        """Uploads all files in a directory to the processed bucket."""
        print(f"Uploading {local_dir} to {remote_dir} in {self.processed_bucket_name}...")
        bucket = self.s3.Bucket(self.processed_bucket_name)
        
        for root, dirs, files in os.walk(local_dir):
            for file in files:
                local_file_path = os.path.join(root, file)
                rel_path = os.path.relpath(local_file_path, local_dir)
                remote_path = os.path.join(remote_dir, rel_path)
                
                bucket.upload_file(local_file_path, remote_path)
        
        return os.path.join(remote_dir, "master.m3u8")
