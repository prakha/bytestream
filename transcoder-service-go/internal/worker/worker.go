package worker

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"github.com/redis/go-redis/v9"
	"transcoder-service-go/internal/config"
	"transcoder-service-go/internal/database"
	"transcoder-service-go/internal/storage"
	"transcoder-service-go/internal/transcoder"
)

type TranscoderWorker struct {
	redis *redis.Client
	db    *database.DatabaseManager
	store *storage.StorageManager
}

func NewTranscoderWorker(cfg *config.Config, db *database.DatabaseManager, store *storage.StorageManager) *TranscoderWorker {
	rdb := redis.NewClient(&redis.Options{Addr: cfg.RedisHost + ":" + cfg.RedisPort})
	return &TranscoderWorker{
		redis: rdb,
		db:    db,
		store: store,
	}
}

func (w *TranscoderWorker) Run(ctx context.Context) {
	log.Println("Checking Redis connection...")
	if err := w.redis.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("Successfully connected to Redis.")

	for {
		log.Println("Waiting for message on video_queue...")
		res, err := w.redis.BLPop(ctx, 0, "video_queue").Result()
		if err != nil {
			log.Printf("Error popping from queue: %v", err)
			continue
		}

		var msg struct{ VideoID, GCSPath, UserID string }
		if err := json.Unmarshal([]byte(res[1]), &msg); err != nil {
			log.Printf("Error parsing message: %v", err)
			continue
		}

		log.Printf("Processing video %s for user %s...", msg.VideoID, msg.UserID)

		tempDir, _ := os.MkdirTemp("", "transcoder-*")
		localIn := tempDir + "/input"
		localOut := tempDir + "/output"

		if err := w.store.DownloadVideo(ctx, msg.GCSPath, localIn); err != nil {
			log.Printf("Download failed: %v", err)
			w.db.UpdateVideoStatus(msg.VideoID, "FAILED", "")
			continue
		}
		
		t := &transcoder.Transcoder{OutputDir: localOut}
		log.Println("Starting transcoding process...")
		if _, err := t.ProcessToHLS(localIn); err != nil {
			log.Printf("Transcoding failed: %v", err)
			w.db.UpdateVideoStatus(msg.VideoID, "FAILED", "")
			continue
		}

		log.Println("Generating thumbnail...")
		t.GenerateThumbnail(localIn)
		
		remoteDir := "processed/" + msg.UserID + "/" + msg.VideoID
		log.Println("Uploading results to storage...")
		finalPath, err := w.store.UploadDirectory(ctx, localOut, remoteDir)
		if err != nil {
			log.Printf("Upload failed: %v", err)
			w.db.UpdateVideoStatus(msg.VideoID, "FAILED", "")
			continue
		}
		
		if err := w.db.UpdateVideoStatus(msg.VideoID, "READY", finalPath); err != nil {
			log.Printf("Database update failed: %v", err)
		}
		
		log.Printf("Successfully processed video %s", msg.VideoID)
		os.RemoveAll(tempDir)
	}
}
