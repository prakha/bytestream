package database

import (
	"database/sql"
	"fmt"
	"time"
	"transcoder-service-go/internal/config"

	_ "github.com/lib/pq"
)

type DatabaseManager struct {
	db *sql.DB
}

func NewDatabaseManager(cfg *config.Config) (*DatabaseManager, error) {
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName)

	// Retry Loop if the datahase connection fails
	for i := 0; i < 5; i++ {
		db, err := sql.Open("postgres", connStr)
		if err == nil && db.Ping() == nil {
			return &DatabaseManager{db: db}, nil
		}
		time.Sleep(5 * time.Second)
	}
	return nil, fmt.Errorf("DB connection failed")
}

func (m *DatabaseManager) UpdateVideoStatus(id, status, hlsPath string) error {
	if hlsPath != "" {
		_, err := m.db.Exec("UPDATE videos SET status = $1, gcs_hls_path = $2 WHERE id = $3", status, hlsPath, id)
		return err
	}
	_, err := m.db.Exec("UPDATE videos SET status = $1 WHERE id = $2", status, id)
	return err
}
