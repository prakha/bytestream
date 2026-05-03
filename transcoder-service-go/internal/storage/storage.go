package storage

import (
	"context"
	"os"
	"path/filepath"
	"transcoder-service-go/internal/config"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type StorageManager struct {
	client                     *minio.Client
	RawBucket, ProcessedBucket string
}

func NewStorageManager(cfg *config.Config) (*StorageManager, error) {
	endpoint := cfg.MinioEndpoint
	secure := false

	if len(endpoint) > 8 && endpoint[:8] == "https://" {
		endpoint = endpoint[8:]
		secure = true
	} else if len(endpoint) > 7 && endpoint[:7] == "http://" {
		endpoint = endpoint[7:]
		secure = false
	}

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: secure,
	})
	return &StorageManager{client: client, RawBucket: cfg.MinioRawBucket, ProcessedBucket: cfg.MinioProcessedBucket}, err
}

func (m *StorageManager) DownloadVideo(ctx context.Context, s3Path, localPath string) error {
	return m.client.FGetObject(ctx, m.RawBucket, s3Path, localPath, minio.GetObjectOptions{})
}

func (m *StorageManager) UploadDirectory(ctx context.Context, localDir, remoteDir string) (string, error) {
	err := filepath.Walk(localDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return err
		}
		relPath, _ := filepath.Rel(localDir, path)
		_, err = m.client.FPutObject(ctx, m.ProcessedBucket, filepath.Join(remoteDir, relPath), path, minio.PutObjectOptions{})
		return err
	})
	return filepath.Join(remoteDir, "master.m3u8"), err
}
