package config

import (
	"os"
	"github.com/joho/godotenv"
)

type Config struct {
	RedisHost, RedisPort                          string
	DBHost, DBPort, DBUser, DBPassword, DBName    string
	MinioEndpoint, MinioAccessKey, MinioSecretKey string
	MinioRawBucket, MinioProcessedBucket          string
}

func LoadConfig() *Config {
	godotenv.Load() // Loads .env if present
	return &Config{
		RedisHost:            getEnv("REDIS_HOST", "localhost"),
		RedisPort:            getEnv("REDIS_PORT", "6379"),
		DBHost:               getEnv("DB_HOST", "localhost"),
		DBPort:               getEnv("DB_PORT", "5432"),
		DBUser:               getEnv("DB_USER", "postgres"),
		DBPassword:           getEnv("DB_PASSWORD", "password"),
		DBName:               getEnv("DB_NAME", "youtube"),
		MinioEndpoint:        getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinioAccessKey:       getEnv("MINIO_ACCESS_KEY", "minioadmin"),
		MinioSecretKey:       getEnv("MINIO_SECRET_KEY", "minioadmin"),
		MinioRawBucket:       getEnv("MINIO_RAW_BUCKET", "raw-videos"),
		MinioProcessedBucket: getEnv("MINIO_PROCESSED_BUCKET", "processed-videos"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok { return value }
	return fallback
}
