import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { audioController } from './controllers/audioController.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/health', audioController.healthCheck);
app.post('/api/extract', audioController.extractAudio);
app.post('/api/quick-extract', audioController.quickExtract);
app.post('/api/video-info', audioController.getVideoInfo);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'YouTube Audio Extractor API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      extract: 'POST /api/extract - Full audio extraction and cleaning',
      quickExtract: 'POST /api/quick-extract - Quick audio download only',
      videoInfo: 'POST /api/video-info - Get video information'
    },
    documentation: {
      extract: {
        method: 'POST',
        url: '/api/extract',
        body: {
          url: 'YouTube video URL (required)',
          cleanupTemp: 'boolean (optional, default: true)'
        },
        description: 'Downloads audio from YouTube, applies noise reduction, vocal enhancement, and outputs clean audio files'
      },
      quickExtract: {
        method: 'POST',
        url: '/api/quick-extract',
        body: {
          url: 'YouTube video URL (required)'
        },
        description: 'Quickly downloads audio without processing'
      },
      videoInfo: {
        method: 'POST',
        url: '/api/video-info',
        body: {
          url: 'YouTube video URL (required)'
        },
        description: 'Retrieves video metadata without downloading'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    requestedPath: req.path
  });
});

// Start server
app.listen(config.port, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎵 YouTube Audio Extractor API');
  console.log('='.repeat(60));
  console.log(`Server running on: http://localhost:${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/api/health`);
  console.log('='.repeat(60) + '\n');
});

export default app;
