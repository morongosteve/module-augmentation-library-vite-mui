# Setup Guide for YouTube Audio Extractor API

## Prerequisites Installation

This API requires two external tools to be installed on your system:

### 1. Install FFmpeg

FFmpeg is required for audio processing, filtering, and format conversion.

#### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
```

#### macOS:
```bash
brew install ffmpeg
```

#### Windows:
Download from [ffmpeg.org](https://ffmpeg.org/download.html) or use Chocolatey:
```bash
choco install ffmpeg
```

#### Verify Installation:
```bash
ffmpeg -version
```

### 2. Install yt-dlp

yt-dlp is used for downloading audio from YouTube.

#### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y yt-dlp
```

Or install via pip:
```bash
sudo pip3 install yt-dlp
```

Or download the binary:
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

#### macOS:
```bash
brew install yt-dlp
```

#### Windows:
Download from [GitHub Releases](https://github.com/yt-dlp/yt-dlp/releases) or use Chocolatey:
```bash
choco install yt-dlp
```

#### Verify Installation:
```bash
yt-dlp --version
```

## Quick Start

Once you have installed FFmpeg and yt-dlp:

1. Install Node.js dependencies:
```bash
cd backend
npm install
```

2. Test the installation:
```bash
npm test
```

3. Start the API server:
```bash
npm start
```

The API will be available at `http://localhost:3001`

## Troubleshooting

### "Command not found" errors

If you get errors like:
- `ffmpeg: command not found`
- `yt-dlp: command not found`

Make sure the tools are installed and in your system PATH:

```bash
# Check PATH
echo $PATH

# Find where tools are installed
which ffmpeg
which yt-dlp
```

### Permission Issues

If you encounter permission errors during installation:

```bash
# Ubuntu/Debian - use sudo
sudo apt-get install ffmpeg yt-dlp

# macOS - ensure Homebrew is properly installed
brew doctor
```

### Network Issues

If downloads fail:
- Check your internet connection
- Verify you can access YouTube from your location
- Some videos may be region-restricted

## Testing

To test with the example video (https://youtu.be/4wtgz5KLwOU):

```bash
npm test
```

This will:
1. Get video information
2. Perform a quick audio download
3. Run the full extraction pipeline with vocal enhancement

Output files will be in the `backend/output/` directory.

## Docker Alternative (Optional)

If you prefer to use Docker to avoid manual installation:

```dockerfile
# Create a Dockerfile in the backend directory
FROM node:18

# Install system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg yt-dlp && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3001
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t audio-extractor .
docker run -p 3001:3001 audio-extractor
```
