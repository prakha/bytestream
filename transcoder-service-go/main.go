package main

import (
	"context"
	"log"
	"transcoder-service-go/internal/config"
	"transcoder-service-go/internal/database"
	"transcoder-service-go/internal/storage"
	"transcoder-service-go/internal/worker"
)

func main() {
	log.Println("Starting Go Transcoder Service...")

	cfg := config.LoadConfig()
	
	db, err := database.NewDatabaseManager(cfg)
	if err != nil {
		log.Fatalf("Database failed: %v", err)
	}

	store, err := storage.NewStorageManager(cfg)
	if err != nil {
		log.Fatalf("Storage failed: %v", err)
	}

	w := worker.NewTranscoderWorker(cfg, db, store)
	
	log.Println("Worker is ready and listening...")
	w.Run(context.Background())
}
