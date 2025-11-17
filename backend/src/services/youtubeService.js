import youtubedl from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config/config.js';

/**
 * Service for downloading audio from YouTube videos
 */
export class YouTubeService {
  /**
   * Download audio from a YouTube video
   * @param {string} videoUrl - The YouTube video URL
   * @param {string} outputPath - Path where the audio file will be saved
   * @returns {Promise<{success: boolean, filePath?: string, error?: string, metadata?: object}>}
   */
  async downloadAudio(videoUrl, outputPath) {
    try {
      console.log(`[YouTubeService] Starting download from: ${videoUrl}`);

      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Extract video info first
      const info = await youtubedl(videoUrl, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
      });

      console.log(`[YouTubeService] Video title: ${info.title}`);
      console.log(`[YouTubeService] Duration: ${info.duration} seconds`);

      // Download audio
      const result = await youtubedl(videoUrl, {
        extractAudio: true,
        audioFormat: 'wav',
        audioQuality: 0, // Best quality
        output: outputPath,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        format: 'bestaudio/best',
      });

      console.log(`[YouTubeService] Download completed successfully`);

      return {
        success: true,
        filePath: outputPath,
        metadata: {
          title: info.title,
          duration: info.duration,
          uploader: info.uploader,
          uploadDate: info.upload_date,
          description: info.description,
        }
      };
    } catch (error) {
      console.error(`[YouTubeService] Download error:`, error);
      return {
        success: false,
        error: error.message || 'Failed to download audio from YouTube'
      };
    }
  }

  /**
   * Get video information without downloading
   * @param {string} videoUrl - The YouTube video URL
   * @returns {Promise<object>}
   */
  async getVideoInfo(videoUrl) {
    try {
      const info = await youtubedl(videoUrl, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
      });

      return {
        success: true,
        info: {
          id: info.id,
          title: info.title,
          duration: info.duration,
          uploader: info.uploader,
          uploadDate: info.upload_date,
          viewCount: info.view_count,
          description: info.description?.substring(0, 500) + '...',
        }
      };
    } catch (error) {
      console.error(`[YouTubeService] Info retrieval error:`, error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve video information'
      };
    }
  }

  /**
   * Validate YouTube URL
   * @param {string} url - The URL to validate
   * @returns {boolean}
   */
  isValidYouTubeUrl(url) {
    const patterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?.*v=[\w-]+/,
    ];

    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract video ID from YouTube URL
   * @param {string} url - The YouTube URL
   * @returns {string|null}
   */
  extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/,
      /youtube\.com\/embed\/([^&\?\/]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
}
