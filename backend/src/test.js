import { AudioExtractionService } from './services/audioExtractionService.js';

const TEST_VIDEO_URL = 'https://youtu.be/4wtgz5KLwOU?si=Sa0j2gSn7aAmy01v';

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TESTING YOUTUBE AUDIO EXTRACTION SERVICE');
  console.log('='.repeat(70) + '\n');

  const service = new AudioExtractionService();

  // Test 1: Get Video Info
  console.log('TEST 1: Getting Video Information');
  console.log('-'.repeat(70));
  try {
    const infoResult = await service.getVideoInfo(TEST_VIDEO_URL);
    if (infoResult.success) {
      console.log('✅ Video info retrieved successfully:');
      console.log(JSON.stringify(infoResult.info, null, 2));
    } else {
      console.log('❌ Failed to get video info:', infoResult.error);
    }
  } catch (error) {
    console.log('❌ Test 1 error:', error.message);
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Test 2: Quick Extract
  console.log('TEST 2: Quick Audio Extraction (Download Only)');
  console.log('-'.repeat(70));
  try {
    const quickResult = await service.quickExtract(TEST_VIDEO_URL);
    if (quickResult.success) {
      console.log('✅ Quick extraction successful!');
      console.log('Job ID:', quickResult.jobId);
      console.log('Video ID:', quickResult.videoId);
      console.log('Output file:', quickResult.outputFiles.wav);
      console.log('Metadata:', JSON.stringify(quickResult.metadata, null, 2));
    } else {
      console.log('❌ Quick extraction failed:', quickResult.error);
    }
  } catch (error) {
    console.log('❌ Test 2 error:', error.message);
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Test 3: Full Extraction with Cleaning
  console.log('TEST 3: Full Audio Extraction with Vocal Enhancement');
  console.log('-'.repeat(70));
  try {
    const fullResult = await service.extractAndCleanAudio(TEST_VIDEO_URL, {
      cleanupTemp: true
    });

    if (fullResult.success) {
      console.log('\n✅ FULL EXTRACTION SUCCESSFUL!');
      console.log('\n📊 Results Summary:');
      console.log('  Job ID:', fullResult.jobId);
      console.log('  Video ID:', fullResult.videoId);
      console.log('\n📹 Video Metadata:');
      console.log('  Title:', fullResult.metadata?.title);
      console.log('  Duration:', fullResult.metadata?.duration, 'seconds');
      console.log('  Uploader:', fullResult.metadata?.uploader);
      console.log('\n🎵 Audio Metadata:');
      console.log('  Duration:', fullResult.audioMetadata?.duration, 'seconds');
      console.log('  Sample Rate:', fullResult.audioMetadata?.sampleRate, 'Hz');
      console.log('  Channels:', fullResult.audioMetadata?.channels);
      console.log('\n📁 Output Files:');
      console.log('  WAV:', fullResult.outputFiles.wav);
      console.log('  MP3:', fullResult.outputFiles.mp3);
      console.log('\n✨ Processing complete! Clean vocal audio is ready.\n');
    } else {
      console.log('\n❌ FULL EXTRACTION FAILED');
      console.log('Error:', fullResult.error);
      console.log('Details:', fullResult.details);
    }
  } catch (error) {
    console.log('❌ Test 3 error:', error.message);
    console.error(error);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🏁 TESTING COMPLETE');
  console.log('='.repeat(70) + '\n');
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error during testing:', error);
  process.exit(1);
});
