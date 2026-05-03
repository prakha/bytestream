package transcoder

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

type Transcoder struct{ OutputDir string }

func (t *Transcoder) hasAudio(inputPath string) bool {
	cmd := exec.Command("ffprobe", "-v", "error", "-show_streams", "-select_streams", "a", "-print_format", "json", inputPath)
	var out bytes.Buffer
	cmd.Stdout = &out
	if err := cmd.Run(); err != nil {
		return false
	}
	var data struct {
		Streams []interface{} `json:"streams"`
	}
	json.Unmarshal(out.Bytes(), &data)
	return len(data.Streams) > 0
}

func (t *Transcoder) ProcessToHLS(inputPath string) (string, error) {
	os.MkdirAll(t.OutputDir, 0755)
	hasAudio := t.hasAudio(inputPath)

	args := []string{"-i", inputPath}

	// 360p
	args = append(args, "-map", "0:v:0")
	if hasAudio {
		args = append(args, "-map", "0:a:0")
	}
	args = append(args, "-s:v:0", "640x360", "-c:v:0", "libx264", "-b:v:0", "800k")

	// 720p
	args = append(args, "-map", "0:v:0")
	if hasAudio {
		args = append(args, "-map", "0:a:0")
	}
	args = append(args, "-s:v:1", "1280x720", "-c:v:1", "libx264", "-b:v:1", "2800k")

	// 1080p
	args = append(args, "-map", "0:v:0")
	if hasAudio {
		args = append(args, "-map", "0:a:0")
	}
	args = append(args, "-s:v:2", "1920x1080", "-c:v:2", "libx264", "-b:v:2", "5000k")

	if hasAudio {
		args = append(args, "-c:a", "aac", "-ar", "48000", "-b:a", "128k")
		args = append(args, "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2")
	} else {
		args = append(args, "-var_stream_map", "v:0 v:1 v:2")
	}

	args = append(args,
		"-f", "hls",
		"-hls_time", "10",
		"-hls_playlist_type", "vod",
		"-hls_flags", "independent_segments",
		"-master_pl_name", "master.m3u8",
		"-hls_segment_filename", filepath.Join(t.OutputDir, "v%v/segment%03d.ts"),
		filepath.Join(t.OutputDir, "v%v/index.m3u8"),
	)

	cmd := exec.Command("ffmpeg", args...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("ffmpeg error: %v, stderr: %s", err, stderr.String())
	}
	return filepath.Join(t.OutputDir, "master.m3u8"), nil
}

func (t *Transcoder) GenerateThumbnail(inputPath string) (string, error) {
	thumbnailPath := filepath.Join(t.OutputDir, "thumbnail.jpg")
	args := []string{
		"-ss", "00:00:01",
		"-i", inputPath,
		"-vframes", "1",
		"-q:v", "2",
		thumbnailPath,
	}

	cmd := exec.Command("ffmpeg", args...)
	if err := cmd.Run(); err != nil {
		return "", err
	}
	return thumbnailPath, nil
}
