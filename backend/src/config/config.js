import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  port: process.env.PORT || 3001,

  // Paths
  tempDir: path.join(__dirname, '../../temp'),
  outputDir: path.join(__dirname, '../../output'),

  // Audio extraction settings
  audio: {
    defaultFormat: 'wav',
    sampleRate: 44100,
    channels: 1, // Mono for voice isolation
    bitDepth: 16,

    // Noise reduction settings
    highPassFilter: 80, // Hz - remove low frequency noise
    lowPassFilter: 8000, // Hz - focus on human voice range

    // Voice activity detection
    silenceThreshold: -30, // dB
    minSegmentDuration: 0.5, // seconds
  },

  // YouTube download settings
  youtube: {
    format: 'bestaudio',
    extractAudio: true,
    audioFormat: 'wav',
    audioQuality: 0, // Best quality
  }
};
