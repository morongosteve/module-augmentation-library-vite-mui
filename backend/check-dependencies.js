#!/usr/bin/env node

/**
 * Check if all required dependencies are installed
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const dependencies = [
  {
    name: 'Node.js',
    command: 'node --version',
    required: 'v18.0.0',
    critical: true
  },
  {
    name: 'npm',
    command: 'npm --version',
    required: '8.0.0',
    critical: true
  },
  {
    name: 'FFmpeg',
    command: 'ffmpeg -version',
    required: 'any',
    critical: true
  },
  {
    name: 'yt-dlp',
    command: 'yt-dlp --version',
    required: 'any',
    critical: true
  }
];

console.log('\n' + '='.repeat(60));
console.log('🔍 CHECKING DEPENDENCIES');
console.log('='.repeat(60) + '\n');

async function checkDependency(dep) {
  try {
    const { stdout, stderr } = await execAsync(dep.command);
    const version = stdout.trim().split('\n')[0];
    console.log(`✅ ${dep.name.padEnd(15)} ${version}`);
    return { name: dep.name, installed: true, version };
  } catch (error) {
    console.log(`❌ ${dep.name.padEnd(15)} NOT FOUND`);
    return { name: dep.name, installed: false, critical: dep.critical };
  }
}

async function main() {
  const results = [];

  for (const dep of dependencies) {
    const result = await checkDependency(dep);
    results.push(result);
  }

  console.log('\n' + '='.repeat(60));

  const missing = results.filter(r => !r.installed);
  const criticalMissing = missing.filter(r => r.critical);

  if (criticalMissing.length > 0) {
    console.log('⚠️  MISSING CRITICAL DEPENDENCIES\n');
    console.log('The following dependencies are required:\n');

    criticalMissing.forEach(dep => {
      console.log(`  • ${dep.name}`);
    });

    console.log('\n📖 Installation instructions:');
    console.log('   See SETUP.md for detailed installation steps\n');

    if (criticalMissing.some(d => d.name === 'FFmpeg')) {
      console.log('   FFmpeg:');
      console.log('     Ubuntu/Debian: sudo apt-get install ffmpeg');
      console.log('     macOS: brew install ffmpeg');
      console.log('     Windows: choco install ffmpeg\n');
    }

    if (criticalMissing.some(d => d.name === 'yt-dlp')) {
      console.log('   yt-dlp:');
      console.log('     Ubuntu/Debian: sudo apt-get install yt-dlp');
      console.log('     macOS: brew install yt-dlp');
      console.log('     Windows: choco install yt-dlp\n');
    }

    console.log('='.repeat(60) + '\n');
    process.exit(1);
  } else {
    console.log('✅ ALL DEPENDENCIES INSTALLED\n');
    console.log('You can now run:');
    console.log('  npm start  - Start the API server');
    console.log('  npm test   - Run tests\n');
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Error checking dependencies:', error);
  process.exit(1);
});
