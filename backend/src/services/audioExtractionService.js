import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { YouTubeService } from './youtubeService.js';
import { AudioProcessingService } from './audioProcessingService.js';
import { config } from '../config/config.js';

/**
 * Orchestration service that combines YouTube download and audio processing
 */
export class AudioExtractionService {
  constructor() {
    this.youtubeService = new YouTubeService();
    this.audioProcessingService = new AudioProcessingService();
  }

  /**
   * Complete audio extraction and cleaning pipeline
   * @param {string} videoUrl - YouTube video URL
   * @param {object} options - Processing options
   * @returns {Promise<object>}
   */
  async extractAndCleanAudio(videoUrl, options = {}) {
    const jobId = uuidv4();
    const timestamp = Date.now();

    console.log(`\n=== Starting Audio Extraction Job ${jobId} ===`);
    console.log(`Video URL: ${videoUrl}`);

    try {
      // Validate URL
      if (!this.youtubeService.isValidYouTubeUrl(videoUrl)) {
        return {
          success: false,
          error: 'Invalid YouTube URL',
          jobId
        };
      }

      const videoId = this.youtubeService.extractVideoId(videoUrl);
      console.log(`Video ID: ${videoId}`);

      // Setup file paths
      const baseFilename = `${videoId}_${timestamp}`;
      const rawAudioPath = path.join(config.tempDir, `${baseFilename}_raw.wav`);
      const filteredAudioPath = path.join(config.tempDir, `${baseFilename}_filtered.wav`);
      const enhancedAudioPath = path.join(config.tempDir, `${baseFilename}_enhanced.wav`);
      const cleanVoicePath = path.join(config.outputDir, `${baseFilename}_clean_voice.wav`);
      const mp3OutputPath = path.join(config.outputDir, `${baseFilename}_clean_voice.mp3`);

      // Ensure directories exist
      await fs.mkdir(config.tempDir, { recursive: true });
      await fs.mkdir(config.outputDir, { recursive: true });

      const results = {
        jobId,
        videoId,
        steps: {},
        files: {}
      };

      // Step 1: Download audio from YouTube
      console.log(`\n--- Step 1: Downloading Audio ---`);
      const downloadResult = await this.youtubeService.downloadAudio(videoUrl, rawAudioPath);
      results.steps.download = downloadResult;

      if (!downloadResult.success) {
        return {
          success: false,
          error: 'Failed to download audio from YouTube',
          details: downloadResult.error,
          jobId
        };
      }

      results.metadata = downloadResult.metadata;
      results.files.raw = rawAudioPath;

      // Step 2: Extract raw audio (ensure proper format)
      console.log(`\n--- Step 2: Extracting Raw Audio ---`);
      const extractResult = await this.audioProcessingService.extractRawAudio(
        rawAudioPath,
        filteredAudioPath
      );
      results.steps.extract = extractResult;

      if (!extractResult.success) {
        return {
          success: false,
          error: 'Failed to extract raw audio',
          details: extractResult.error,
          jobId,
          results
        };
      }

      results.files.extracted = filteredAudioPath;

      // Step 3: Apply noise reduction and filtering
      console.log(`\n--- Step 3: Applying Noise Reduction ---`);
      const noiseReductionResult = await this.audioProcessingService.applyNoiseReduction(
        filteredAudioPath,
        enhancedAudioPath
      );
      results.steps.noiseReduction = noiseReductionResult;

      if (!noiseReductionResult.success) {
        return {
          success: false,
          error: 'Failed to apply noise reduction',
          details: noiseReductionResult.error,
          jobId,
          results
        };
      }

      results.files.noiseReduced = enhancedAudioPath;

      // Step 4: Enhance vocals
      console.log(`\n--- Step 4: Enhancing Vocals ---`);
      const vocalEnhancementResult = await this.audioProcessingService.enhanceVocals(
        enhancedAudioPath,
        cleanVoicePath
      );
      results.steps.vocalEnhancement = vocalEnhancementResult;

      if (!vocalEnhancementResult.success) {
        return {
          success: false,
          error: 'Failed to enhance vocals',
          details: vocalEnhancementResult.error,
          jobId,
          results
        };
      }

      results.files.cleanVoice = cleanVoicePath;

      // Step 5: Convert to MP3 for easier sharing
      console.log(`\n--- Step 5: Converting to MP3 ---`);
      const mp3ConversionResult = await this.audioProcessingService.convertFormat(
        cleanVoicePath,
        mp3OutputPath,
        'mp3'
      );
      results.steps.mp3Conversion = mp3ConversionResult;

      if (mp3ConversionResult.success) {
        results.files.mp3 = mp3OutputPath;
      }

      // Get final file metadata
      const metadataResult = await this.audioProcessingService.getAudioMetadata(cleanVoicePath);
      if (metadataResult.success) {
        results.audioMetadata = metadataResult.metadata;
      }

      // Cleanup temporary files
      if (options.cleanupTemp !== false) {
        console.log(`\n--- Cleaning up temporary files ---`);
        await this.cleanupTempFiles([rawAudioPath, filteredAudioPath, enhancedAudioPath]);
      }

      console.log(`\n=== Audio Extraction Job ${jobId} Completed Successfully ===\n`);

      return {
        success: true,
        jobId,
        videoId,
        metadata: results.metadata,
        audioMetadata: results.audioMetadata,
        outputFiles: {
          wav: cleanVoicePath,
          mp3: results.files.mp3 || null
        },
        message: 'Audio extracted and cleaned successfully'
      };

    } catch (error) {
      console.error(`\n=== Job ${jobId} Failed ===`);
      console.error(error);

      return {
        success: false,
        error: 'Unexpected error during audio extraction',
        details: error.message,
        jobId
      };
    }
  }

  /**
   * Quick extraction with basic processing (faster)
   * @param {string} videoUrl - YouTube video URL
   * @returns {Promise<object>}
   */
  async quickExtract(videoUrl) {
    const jobId = uuidv4();
    const timestamp = Date.now();

    console.log(`\n=== Starting Quick Audio Extraction ${jobId} ===`);

    try {
      if (!this.youtubeService.isValidYouTubeUrl(videoUrl)) {
        return {
          success: false,
          error: 'Invalid YouTube URL',
          jobId
        };
      }

      const videoId = this.youtubeService.extractVideoId(videoUrl);
      const baseFilename = `${videoId}_${timestamp}`;
      const outputPath = path.join(config.outputDir, `${baseFilename}_audio.wav`);

      await fs.mkdir(config.outputDir, { recursive: true });

      // Download audio
      const downloadResult = await this.youtubeService.downloadAudio(videoUrl, outputPath);

      if (!downloadResult.success) {
        return {
          success: false,
          error: 'Failed to download audio',
          details: downloadResult.error,
          jobId
        };
      }

      console.log(`\n=== Quick Extraction ${jobId} Completed ===\n`);

      return {
        success: true,
        jobId,
        videoId,
        metadata: downloadResult.metadata,
        outputFiles: {
          wav: outputPath
        },
        message: 'Audio downloaded successfully'
      };

    } catch (error) {
      console.error(`Quick extraction failed:`, error);
      return {
        success: false,
        error: 'Quick extraction failed',
        details: error.message,
        jobId
      };
    }
  }

  /**
   * Cleanup temporary files
   * @param {string[]} filePaths - Array of file paths to delete
   */
  async cleanupTempFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
        console.log(`Deleted: ${path.basename(filePath)}`);
      } catch (error) {
        console.warn(`Could not delete ${filePath}:`, error.message);
      }
    }
  }

  /**
   * Get video information
   * @param {string} videoUrl - YouTube video URL
   * @returns {Promise<object>}
   */
  async getVideoInfo(videoUrl) {
    return await this.youtubeService.getVideoInfo(videoUrl);
  }
}
