# YouTube Audio Extractor API - Project Summary

## Overview

A complete Node.js backend API system for extracting and cleaning audio from YouTube videos, with advanced vocal enhancement and noise reduction capabilities.

## What Was Built

### Core Services

1. **YouTubeService** (`src/services/youtubeService.js`)
   - Downloads audio from YouTube videos using yt-dlp
   - Validates YouTube URLs
   - Extracts video metadata
   - Handles video ID extraction

2. **AudioProcessingService** (`src/services/audioProcessingService.js`)
   - Raw audio extraction and format conversion
   - Noise reduction using FFmpeg filters
   - Vocal enhancement pipeline
   - Silence removal
   - Audio format conversion (WAV, MP3, OGG)
   - Metadata extraction

3. **AudioExtractionService** (`src/services/audioExtractionService.js`)
   - Orchestrates the complete extraction pipeline
   - Manages temporary and output files
   - Combines download and processing steps
   - Provides both quick and full extraction modes

### API Layer

4. **AudioController** (`src/controllers/audioController.js`)
   - RESTful API endpoints
   - Request validation
   - Error handling

5. **Express Server** (`src/server.js`)
   - HTTP server setup
   - CORS support
   - Request logging
   - Route configuration

### Testing & Utilities

6. **Test Suite** (`src/test.js`)
   - Automated testing for all features
   - Tests with the provided YouTube video
   - Demonstrates all three modes:
     - Video info retrieval
     - Quick extraction
     - Full extraction with enhancement

7. **Dependency Checker** (`check-dependencies.js`)
   - Validates system requirements
   - Provides installation guidance
   - Pre-flight checks before server start

8. **Example Client** (`example-client.js`)
   - Demonstrates API usage
   - Tests all endpoints
   - Shows request/response examples

## Audio Processing Pipeline

The complete vocal extraction and enhancement pipeline includes:

### Step 1: Download
- Extract audio from YouTube using yt-dlp
- Best available audio quality

### Step 2: Raw Extraction
- Convert to PCM WAV format
- 44.1 kHz sample rate
- Mono channel (ideal for voice)
- 16-bit depth

### Step 3: Noise Reduction
- **High-pass filter (80Hz)**: Removes low-frequency rumble
- **Low-pass filter (8000Hz)**: Focuses on human voice range
- **FFT denoiser**: Advanced frequency-domain noise reduction
- **Compander**: Dynamic range compression

### Step 4: Vocal Enhancement
- **EQ boost (1-4 kHz)**: Enhances vocal clarity
- **Dynamic compression**: Normalizes volume levels
- **Loudness normalization**: Consistent output levels

### Step 5: Output
- Clean WAV file (lossless)
- MP3 file (compressed, portable)

## API Endpoints

### GET /api/health
Health check endpoint

### POST /api/video-info
Get video metadata without downloading
```json
{
  "url": "https://youtu.be/VIDEO_ID"
}
```

### POST /api/quick-extract
Fast audio download without processing
```json
{
  "url": "https://youtu.be/VIDEO_ID"
}
```

### POST /api/extract
Complete extraction with vocal enhancement
```json
{
  "url": "https://youtu.be/VIDEO_ID",
  "cleanupTemp": true
}
```

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── config.js              # Configuration settings
│   ├── controllers/
│   │   └── audioController.js     # API endpoint handlers
│   ├── services/
│   │   ├── youtubeService.js      # YouTube download logic
│   │   ├── audioProcessingService.js  # FFmpeg processing
│   │   └── audioExtractionService.js  # Orchestration layer
│   ├── server.js                  # Express server
│   └── test.js                    # Automated tests
├── temp/                          # Temporary processing files
├── output/                        # Final output files
├── check-dependencies.js          # System requirements checker
├── example-client.js              # API usage examples
├── package.json                   # Node.js dependencies
├── README.md                      # User documentation
├── SETUP.md                       # Installation guide
└── PROJECT_SUMMARY.md             # This file
```

## Configuration

All settings are centralized in `src/config/config.js`:

- Server port (default: 3001)
- Audio processing parameters:
  - Sample rate: 44100 Hz
  - Channels: 1 (mono)
  - High-pass filter: 80 Hz
  - Low-pass filter: 8000 Hz
  - Silence threshold: -30 dB
- File paths for temp and output directories

## Dependencies

### Node.js Packages
- **express**: Web server framework
- **cors**: CORS middleware
- **youtube-dl-exec**: yt-dlp wrapper
- **fluent-ffmpeg**: FFmpeg wrapper
- **uuid**: Unique ID generation

### System Requirements
- **Node.js** v18+
- **yt-dlp**: YouTube downloader
- **FFmpeg**: Audio processing

## Test Video

The implementation was designed to work with:
**URL**: https://youtu.be/4wtgz5KLwOU?si=Sa0j2gSn7aAmy01v

This video was used for testing the complete extraction pipeline.

## Usage Example

```bash
# Check dependencies
npm run check

# Start the server
npm start

# In another terminal, test the API
node example-client.js

# Or use curl
curl -X POST http://localhost:3001/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtu.be/4wtgz5KLwOU"}'
```

## Performance

Typical processing times (depends on video length and system):
- Video info: < 2 seconds
- Quick extract: 10-30 seconds (download only)
- Full extraction: 1-5 minutes (includes all processing)

## Output Files

Files are saved to `backend/output/` with naming pattern:
- `{VIDEO_ID}_{TIMESTAMP}_clean_voice.wav` (lossless)
- `{VIDEO_ID}_{TIMESTAMP}_clean_voice.mp3` (compressed)

Temporary files in `backend/temp/` are automatically cleaned up after processing.

## Next Steps

To use this API:

1. Install system prerequisites (FFmpeg, yt-dlp)
2. Run `npm install` to install Node.js dependencies
3. Run `npm run check` to verify installation
4. Run `npm start` to start the server
5. Test with `node example-client.js` or `npm test`

## Technical Highlights

- **Modular Architecture**: Separation of concerns (YouTube, audio processing, orchestration)
- **Error Handling**: Comprehensive error handling at all layers
- **Logging**: Detailed console logging for debugging
- **File Management**: Automatic cleanup of temporary files
- **Format Support**: Multiple output formats
- **REST API**: Clean, RESTful endpoint design
- **Documentation**: Extensive inline comments and user guides

## License

MIT
