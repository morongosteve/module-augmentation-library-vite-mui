#!/bin/bash

# iOS ML Setup Script
# Automates the setup process for iOS ML integration

set -e

echo "========================================="
echo "iOS ML Integration Setup"
echo "========================================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script must be run on macOS for iOS development"
    exit 1
fi

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
echo "   Node.js $(node -v) ✓"

# Check npm
echo "✓ Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "   npm $(npm -v) ✓"

# Check CocoaPods
echo "✓ Checking CocoaPods..."
if ! command -v pod &> /dev/null; then
    echo "⚠️  CocoaPods is not installed"
    echo "   Installing CocoaPods..."
    sudo gem install cocoapods
else
    echo "   CocoaPods $(pod --version) ✓"
fi

# Check Xcode
echo "✓ Checking Xcode..."
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed. Please install Xcode from the App Store."
    exit 1
fi
XCODE_VERSION=$(xcodebuild -version | head -n1 | awk '{print $2}')
echo "   Xcode $XCODE_VERSION ✓"

echo ""
echo "========================================="
echo "Installing Dependencies"
echo "========================================="
echo ""

# Install npm dependencies
echo "📦 Installing npm packages..."
npm install

echo ""
echo "========================================="
echo "Setting up iOS"
echo "========================================="
echo ""

# Install Pods
echo "📦 Installing iOS dependencies (CocoaPods)..."
cd ios
pod install
cd ..

echo ""
echo "========================================="
echo "Setup Complete! 🎉"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Connect your iPhone or start a simulator"
echo "2. Run: npm run ios"
echo "3. Check out the example: src/components/MLChatExample.tsx"
echo ""
echo "Documentation:"
echo "- Mobile README: ./README.md"
echo "- iOS Setup Guide: ./docs/iOS-SETUP.md"
echo "- Model Conversion: ./docs/MODEL-CONVERSION.md"
echo ""
echo "Available models:"
echo "- Llama 3.2 1B (700MB) - Recommended for iPhone 12+"
echo "- Llama 3.2 3B (2GB) - Recommended for iPhone 13 Pro+"
echo "- Phi-3 Mini (2.3GB) - Good balance"
echo "- TinyLlama (670MB) - Testing/low-end devices"
echo ""
echo "To get device capabilities, run the app and check MLService.getDeviceCapabilities()"
echo ""
