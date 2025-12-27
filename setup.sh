#!/bin/bash

echo "🎱 CueU Mobile App - Setup Script"
echo "=================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Installation failed"
    exit 1
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "=================================="
echo "🎉 Setup Complete!"
echo "=================================="
echo ""
echo "To start the app:"
echo "  npm start"
echo ""
echo "To run on iOS simulator:"
echo "  npm run ios"
echo ""
echo "To run on physical iPhone:"
echo "  1. Install 'Expo Go' from the App Store"
echo "  2. Run 'npm start'"
echo "  3. Scan the QR code with your iPhone camera"
echo ""
echo "📖 See MOBILE_SETUP.md for detailed instructions"
echo ""

