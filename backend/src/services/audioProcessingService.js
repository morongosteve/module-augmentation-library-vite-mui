import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config/config.js';

/**
 * Service for processing and cleaning audio files
 */
export class AudioProcessingService {
  /**
   * Extract raw audio from video/audio file
   * @param {string} inputPath - Path to input file
   * @param {string} outputPath - Path for output file
   * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
   */
  async extractRawAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      console.log(`[AudioProcessing] Extracting raw audio from: ${inputPath}`);

      ffmpeg(inputPath)
        .noVideo()
        .audioCodec('pcm_s16le')
        .audioFrequency(config.audio.sampleRate)
        .audioChannels(config.audio.channels)
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log(`[AudioProcessing] FFmpeg command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          console.log(`[AudioProcessing] Processing: ${progress.percent?.toFixed(2)}% done`);
        })
        .on('end', () => {
          console.log(`[AudioProcessing] Raw audio extraction completed`);
          resolve({
            success: true,
            filePath: outputPath
          });
        })
        .on('error', (err) => {
          console.error(`[AudioProcessing] Extraction error:`, err);
          resolve({
            success: false,
            error: err.message
          });
        })
        .run();
    });
  }

  /**
   * Apply noise reduction and filtering to audio
   * @param {string} inputPath - Path to input audio file
   * @param {string} outputPath - Path for filtered output file
   * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
   */
  async applyNoiseReduction(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      console.log(`[AudioProcessing] Applying noise reduction to: ${inputPath}`);

      // Build complex filter for noise reduction
      // - highpass: Remove low frequency noise (rumble, hum)
      // - lowpass: Focus on human voice frequency range
      // - afftdn: FFT denoiser for general noise reduction
      // - compand: Compression for consistent volume
      const audioFilters = [
        `highpass=f=${config.audio.highPassFilter}`,
        `lowpass=f=${config.audio.lowPassFilter}`,
        'afftdn=nf=-25',
        'compand=attacks=0.3:decays=0.8:points=-80/-80|-45/-15|-27/-9|0/-7|20/-7:soft-knee=6:gain=0:volume=-90:delay=0.2'
      ].join(',');

      ffmpeg(inputPath)
        .audioFilters(audioFilters)
        .audioCodec('pcm_s16le')
        .audioFrequency(config.audio.sampleRate)
        .audioChannels(config.audio.channels)
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log(`[AudioProcessing] FFmpeg filter command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          console.log(`[AudioProcessing] Filtering: ${progress.percent?.toFixed(2)}% done`);
        })
        .on('end', () => {
          console.log(`[AudioProcessing] Noise reduction completed`);
          resolve({
            success: true,
            filePath: outputPath
          });
        })
        .on('error', (err) => {
          console.error(`[AudioProcessing] Filtering error:`, err);
          resolve({
            success: false,
            error: err.message
          });
        })
        .run();
    });
  }

  /**
   * Remove silence and extract voice segments
   * @param {string} inputPath - Path to input audio file
   * @param {string} outputPath - Path for output file
   * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
   */
  async removeSilence(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      console.log(`[AudioProcessing] Removing silence from: ${inputPath}`);

      // silenceremove filter parameters:
      // - start_periods: Remove silence from beginning
      // - start_duration: Minimum duration of silence to remove
      // - start_threshold: Volume threshold for silence detection
      const silenceFilter = `silenceremove=start_periods=1:start_duration=1:start_threshold=${config.audio.silenceThreshold}dB:detection=peak,silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=${config.audio.silenceThreshold}dB:detection=peak`;

      ffmpeg(inputPath)
        .audioFilters(silenceFilter)
        .audioCodec('pcm_s16le')
        .audioFrequency(config.audio.sampleRate)
        .audioChannels(config.audio.channels)
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log(`[AudioProcessing] FFmpeg silence removal command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          console.log(`[AudioProcessing] Silence removal: ${progress.percent?.toFixed(2)}% done`);
        })
        .on('end', () => {
          console.log(`[AudioProcessing] Silence removal completed`);
          resolve({
            success: true,
            filePath: outputPath
          });
        })
        .on('error', (err) => {
          console.error(`[AudioProcessing] Silence removal error:`, err);
          resolve({
            success: false,
            error: err.message
          });
        })
        .run();
    });
  }

  /**
   * Apply vocal enhancement (complete pipeline)
   * @param {string} inputPath - Path to input audio file
   * @param {string} outputPath - Path for final output file
   * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
   */
  async enhanceVocals(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      console.log(`[AudioProcessing] Applying vocal enhancement to: ${inputPath}`);

      // Complete vocal enhancement pipeline:
      // 1. High-pass filter to remove low-frequency noise
      // 2. Low-pass filter to focus on voice range
      // 3. FFT denoiser for noise reduction
      // 4. EQ boost for vocal clarity (1-4 kHz)
      // 5. Dynamic range compression
      // 6. Normalization
      const vocalFilters = [
        `highpass=f=${config.audio.highPassFilter}`,
        `lowpass=f=${config.audio.lowPassFilter}`,
        'afftdn=nf=-20',
        'equalizer=f=3000:width_type=h:width=1000:g=3',
        'compand=attacks=0.3:decays=0.8:points=-80/-80|-45/-15|-27/-9|0/-7|20/-7:soft-knee=6:gain=0:volume=-90:delay=0.2',
        'loudnorm=I=-16:TP=-1.5:LRA=11'
      ].join(',');

      ffmpeg(inputPath)
        .audioFilters(vocalFilters)
        .audioCodec('pcm_s16le')
        .audioFrequency(config.audio.sampleRate)
        .audioChannels(config.audio.channels)
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log(`[AudioProcessing] FFmpeg vocal enhancement command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          console.log(`[AudioProcessing] Enhancement: ${progress.percent?.toFixed(2)}% done`);
        })
        .on('end', () => {
          console.log(`[AudioProcessing] Vocal enhancement completed`);
          resolve({
            success: true,
            filePath: outputPath
          });
        })
        .on('error', (err) => {
          console.error(`[AudioProcessing] Enhancement error:`, err);
          resolve({
            success: false,
            error: err.message
          });
        })
        .run();
    });
  }

  /**
   * Get audio file metadata
   * @param {string} filePath - Path to audio file
   * @returns {Promise<object>}
   */
  async getAudioMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          console.error(`[AudioProcessing] Metadata error:`, err);
          resolve({
            success: false,
            error: err.message
          });
        } else {
          const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
          resolve({
            success: true,
            metadata: {
              duration: metadata.format.duration,
              bitRate: metadata.format.bit_rate,
              sampleRate: audioStream?.sample_rate,
              channels: audioStream?.channels,
              codec: audioStream?.codec_name,
            }
          });
        }
      });
    });
  }

  /**
   * Convert audio to different format
   * @param {string} inputPath - Path to input audio file
   * @param {string} outputPath - Path for output file
   * @param {string} format - Output format (mp3, wav, ogg, etc.)
   * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
   */
  async convertFormat(inputPath, outputPath, format = 'mp3') {
    return new Promise((resolve, reject) => {
      console.log(`[AudioProcessing] Converting to ${format}: ${inputPath}`);

      const command = ffmpeg(inputPath).output(outputPath);

      // Format-specific settings
      if (format === 'mp3') {
        command.audioCodec('libmp3lame').audioBitrate('192k');
      } else if (format === 'wav') {
        command.audioCodec('pcm_s16le');
      } else if (format === 'ogg') {
        command.audioCodec('libvorbis').audioBitrate('192k');
      }

      command
        .on('start', (commandLine) => {
          console.log(`[AudioProcessing] FFmpeg conversion command: ${commandLine}`);
        })
        .on('end', () => {
          console.log(`[AudioProcessing] Format conversion completed`);
          resolve({
            success: true,
            filePath: outputPath
          });
        })
        .on('error', (err) => {
          console.error(`[AudioProcessing] Conversion error:`, err);
          resolve({
            success: false,
            error: err.message
          });
        })
        .run();
    });
  }
}
