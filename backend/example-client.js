#!/usr/bin/env node

/**
 * Example client for testing the YouTube Audio Extractor API
 * Make sure the server is running on http://localhost:3001
 */

const API_URL = 'http://localhost:3001';
const TEST_VIDEO = 'https://youtu.be/4wtgz5KLwOU?si=Sa0j2gSn7aAmy01v';

async function makeRequest(endpoint, data) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { error: error.message };
  }
}

async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();

    if (data.success) {
      console.log('✅ API is healthy');
      console.log(`   Status: ${data.status}`);
      console.log(`   Service: ${data.service}`);
      return true;
    } else {
      console.log('❌ API health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to API');
    console.log(`   Error: ${error.message}`);
    console.log('\n💡 Make sure the server is running:');
    console.log('   cd backend && npm start');
    return false;
  }
}

async function testVideoInfo() {
  console.log('\n📹 Getting Video Information...');
  console.log('-'.repeat(60));

  const result = await makeRequest('/api/video-info', { url: TEST_VIDEO });

  if (result.error) {
    console.log('❌ Request failed:', result.error);
    return;
  }

  if (result.data.success) {
    console.log('✅ Video info retrieved successfully');
    console.log(`   Title: ${result.data.info.title}`);
    console.log(`   Duration: ${result.data.info.duration}s`);
    console.log(`   Uploader: ${result.data.info.uploader}`);
  } else {
    console.log('❌ Failed to get video info');
    console.log(`   Error: ${result.data.error}`);
  }
}

async function testQuickExtract() {
  console.log('\n⚡ Testing Quick Extract...');
  console.log('-'.repeat(60));
  console.log('This will download audio without processing...\n');

  const result = await makeRequest('/api/quick-extract', { url: TEST_VIDEO });

  if (result.error) {
    console.log('❌ Request failed:', result.error);
    return;
  }

  if (result.data.success) {
    console.log('✅ Quick extraction successful!');
    console.log(`   Job ID: ${result.data.jobId}`);
    console.log(`   Video: ${result.data.metadata.title}`);
    console.log(`   Output: ${result.data.outputFiles.wav}`);
  } else {
    console.log('❌ Quick extraction failed');
    console.log(`   Error: ${result.data.error}`);
    if (result.data.details) {
      console.log(`   Details: ${result.data.details}`);
    }
  }
}

async function testFullExtraction() {
  console.log('\n🎤 Testing Full Audio Extraction with Vocal Enhancement...');
  console.log('-'.repeat(60));
  console.log('This will take several minutes...\n');

  const startTime = Date.now();
  const result = await makeRequest('/api/extract', {
    url: TEST_VIDEO,
    cleanupTemp: true
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.error) {
    console.log('❌ Request failed:', result.error);
    return;
  }

  if (result.data.success) {
    console.log(`✅ Full extraction completed in ${duration}s!`);
    console.log(`\n📊 Results:`);
    console.log(`   Job ID: ${result.data.jobId}`);
    console.log(`   Video: ${result.data.metadata.title}`);
    console.log(`\n🎵 Audio Details:`);
    console.log(`   Duration: ${result.data.audioMetadata.duration}s`);
    console.log(`   Sample Rate: ${result.data.audioMetadata.sampleRate} Hz`);
    console.log(`   Channels: ${result.data.audioMetadata.channels}`);
    console.log(`\n📁 Output Files:`);
    console.log(`   WAV: ${result.data.outputFiles.wav}`);
    console.log(`   MP3: ${result.data.outputFiles.mp3 || 'N/A'}`);
  } else {
    console.log('❌ Full extraction failed');
    console.log(`   Error: ${result.data.error}`);
    if (result.data.details) {
      console.log(`   Details: ${result.data.details}`);
    }
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🎵 YOUTUBE AUDIO EXTRACTOR API - CLIENT TEST');
  console.log('='.repeat(60));
  console.log(`\nAPI URL: ${API_URL}`);
  console.log(`Test Video: ${TEST_VIDEO}`);

  // Check if API is running
  const isHealthy = await testHealthCheck();

  if (!isHealthy) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ Cannot proceed - API is not accessible');
    console.log('='.repeat(60) + '\n');
    process.exit(1);
  }

  // Get video info
  await testVideoInfo();

  // Prompt user for which tests to run
  console.log('\n' + '='.repeat(60));
  console.log('📝 Available Tests:');
  console.log('='.repeat(60));
  console.log('1. Quick Extract (fast, download only)');
  console.log('2. Full Extraction (slow, includes vocal enhancement)');
  console.log('3. Both tests');
  console.log('='.repeat(60));

  // For automated testing, run info only
  // Users can modify this file to run full tests

  console.log('\n💡 TIP: Edit this file to run quick or full extraction tests');
  console.log('   Uncomment the lines below in the main() function:\n');
  console.log('   // await testQuickExtract();');
  console.log('   // await testFullExtraction();\n');

  // Uncomment to run tests:
  // await testQuickExtract();
  // await testFullExtraction();

  console.log('\n' + '='.repeat(60));
  console.log('✅ CLIENT TEST COMPLETE');
  console.log('='.repeat(60) + '\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
