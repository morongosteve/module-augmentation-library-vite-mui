import { AudioExtractionService } from '../services/audioExtractionService.js';

const audioExtractionService = new AudioExtractionService();

/**
 * Controller for audio extraction endpoints
 */
export const audioController = {
  /**
   * Extract and clean audio from YouTube video
   * POST /api/extract
   * Body: { url: string, cleanupTemp?: boolean }
   */
  async extractAudio(req, res) {
    try {
      const { url, cleanupTemp = true } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: url'
        });
      }

      console.log(`\n[API] Extract audio request received for: ${url}`);

      const result = await audioExtractionService.extractAndCleanAudio(url, {
        cleanupTemp
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);

    } catch (error) {
      console.error('[API] Extract audio error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  },

  /**
   * Quick audio download without processing
   * POST /api/quick-extract
   * Body: { url: string }
   */
  async quickExtract(req, res) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: url'
        });
      }

      console.log(`\n[API] Quick extract request received for: ${url}`);

      const result = await audioExtractionService.quickExtract(url);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);

    } catch (error) {
      console.error('[API] Quick extract error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  },

  /**
   * Get video information
   * POST /api/video-info
   * Body: { url: string }
   */
  async getVideoInfo(req, res) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: url'
        });
      }

      console.log(`\n[API] Video info request for: ${url}`);

      const result = await audioExtractionService.getVideoInfo(url);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);

    } catch (error) {
      console.error('[API] Video info error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  },

  /**
   * Health check endpoint
   * GET /api/health
   */
  async healthCheck(req, res) {
    res.json({
      success: true,
      status: 'healthy',
      service: 'YouTube Audio Extractor API',
      timestamp: new Date().toISOString()
    });
  }
};
