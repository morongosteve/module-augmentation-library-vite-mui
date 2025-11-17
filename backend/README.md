# YouTube Audio Extractor API

A Node.js backend API for extracting and cleaning audio from YouTube videos with advanced vocal enhancement and noise reduction.

## Features

- 🎵 **YouTube Audio Download** - Extract audio from any YouTube video using yt-dlp
- 🎤 **Vocal Enhancement** - Advanced audio processing pipeline for clean vocal extraction
- 🔇 **Noise Reduction** - FFmpeg-powered noise filtering and cleanup
- 🎛️ **Audio Processing** - High-pass/low-pass filters, EQ, compression, and normalization
- 📊 **Multiple Formats** - Output as WAV (lossless) and MP3 (compressed)
- 🚀 **REST API** - Easy-to-use HTTP endpoints

## Prerequisites

Before running this API, you need to install:

1. **Node.js** (v18 or higher)
2. **yt-dlp** - YouTube video downloader
3. **FFmpeg** - Audio/video processing tool

### Installing Prerequisites

#### Ubuntu/Debian
```bash
# Install yt-dlp
sudo apt update
sudo apt install yt-dlp

# Install FFmpeg
sudo apt install ffmpeg

# Verify installations
yt-dlp --version
ffmpeg -version
```

#### macOS
```bash
# Using Homebrew
brew install yt-dlp
brew install ffmpeg

# Verify installations
yt-dlp --version
ffmpeg -version
```

#### Windows
```bash
# Using Chocolatey
choco install yt-dlp
choco install ffmpeg

# Or download from:
# yt-dlp: https://github.com/yt-dlp/yt-dlp/releases
# FFmpeg: https://ffmpeg.org/download.html
```

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Node.js dependencies:
```bash
npm install
```

## Usage

### Starting the Server

```bash
npm start
```

The server will start on `http://localhost:3001`

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Running Tests

Test the API with the provided YouTube video:

```bash
npm test
```

## API Endpoints

### 1. Health Check
**GET** `/api/health`

Check if the API is running.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "service": "YouTube Audio Extractor API",
  "timestamp": "2024-11-17T12:00:00.000Z"
}
```

### 2. Get Video Information
**POST** `/api/video-info`

Retrieve YouTube video metadata without downloading.

**Request Body:**
```json
{
  "url": "https://youtu.be/4wtgz5KLwOU"
}
```

**Response:**
```json
{
  "success": true,
  "info": {
    "id": "4wtgz5KLwOU",
    "title": "Video Title",
    "duration": 180,
    "uploader": "Channel Name",
    "uploadDate": "20240101",
    "viewCount": 1000,
    "description": "..."
  }
}
```

### 3. Quick Audio Extract
**POST** `/api/quick-extract`

Download audio without processing (faster).

**Request Body:**
```json
{
  "url": "https://youtu.be/4wtgz5KLwOU"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid-here",
  "videoId": "4wtgz5KLwOU",
  "metadata": {
    "title": "Video Title",
    "duration": 180
  },
  "outputFiles": {
    "wav": "/path/to/output.wav"
  },
  "message": "Audio downloaded successfully"
}
```

### 4. Full Audio Extraction with Cleaning
**POST** `/api/extract`

Complete audio extraction and vocal enhancement pipeline.

**Request Body:**
```json
{
  "url": "https://youtu.be/4wtgz5KLwOU",
  "cleanupTemp": true
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid-here",
  "videoId": "4wtgz5KLwOU",
  "metadata": {
    "title": "Video Title",
    "duration": 180,
    "uploader": "Channel Name"
  },
  "audioMetadata": {
    "duration": 180.5,
    "sampleRate": 44100,
    "channels": 1,
    "codec": "pcm_s16le"
  },
  "outputFiles": {
    "wav": "/path/to/clean_voice.wav",
    "mp3": "/path/to/clean_voice.mp3"
  },
  "message": "Audio extracted and cleaned successfully"
}
```

## Audio Processing Pipeline

The full extraction process includes these steps:

1. **Download** - Extract audio from YouTube using yt-dlp
2. **Raw Extraction** - Convert to PCM WAV format (44.1kHz, mono, 16-bit)
3. **Noise Reduction** - Apply filters:
   - High-pass filter (80Hz) - Remove low-frequency noise
   - Low-pass filter (8000Hz) - Focus on voice range
   - FFT denoiser - General noise reduction
   - Compression - Normalize volume levels
4. **Vocal Enhancement** - Apply:
   - EQ boost for vocal clarity (1-4 kHz)
   - Dynamic range compression
   - Loudness normalization
5. **Format Conversion** - Export as WAV and MP3

## Configuration

Edit `src/config/config.js` to customize:

```javascript
export const config = {
  port: 3001,

  audio: {
    sampleRate: 44100,
    channels: 1,
    highPassFilter: 80,
    lowPassFilter: 8000,
    silenceThreshold: -30,
  }
};
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── config.js              # Configuration
│   ├── controllers/
│   │   └── audioController.js     # API endpoints
│   ├── services/
│   │   ├── youtubeService.js      # YouTube download
│   │   ├── audioProcessingService.js  # FFmpeg processing
│   │   └── audioExtractionService.js  # Orchestration
│   ├── server.js                  # Express server
│   └── test.js                    # Test script
├── temp/                          # Temporary files
├── output/                        # Final output files
├── package.json
└── README.md
```

## Example: Using with cURL

```bash
# Get video info
curl -X POST http://localhost:3001/api/video-info \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtu.be/4wtgz5KLwOU"}'

# Extract and clean audio
curl -X POST http://localhost:3001/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtu.be/4wtgz5KLwOU"}'
```

## Example: Using with JavaScript

```javascript
async function extractAudio(videoUrl) {
  const response = await fetch('http://localhost:3001/api/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: videoUrl }),
  });

  const result = await response.json();
  console.log(result);
  return result;
}

extractAudio('https://youtu.be/4wtgz5KLwOU');
```

## Troubleshooting

### Error: "yt-dlp not found"
Make sure yt-dlp is installed and in your system PATH:
```bash
which yt-dlp  # Unix/macOS
where yt-dlp  # Windows
```

### Error: "ffmpeg not found"
Ensure FFmpeg is installed:
```bash
which ffmpeg  # Unix/macOS
where ffmpeg  # Windows
```

### Error: "Cannot download video"
- Check your internet connection
- Verify the YouTube URL is valid
- Some videos may be region-restricted or age-restricted

### Slow Processing
Processing time depends on:
- Video duration
- Server CPU performance
- Network speed for download

Typical processing times:
- 1-minute video: ~30-60 seconds
- 5-minute video: ~2-4 minutes
- 10-minute video: ~4-8 minutes

## License

MIT

## Notes

- Output files are stored in the `output/` directory
- Temporary files are automatically cleaned up after processing
- The API supports concurrent requests
- Audio quality focuses on vocal clarity and noise reduction
