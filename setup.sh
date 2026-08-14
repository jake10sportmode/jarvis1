#!/bin/bash
set -e

echo "🤖 JARVIS Setup Script"
echo "====================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or later."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt
echo "✅ Python dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"
echo ""

# Generate SSL certificates if they don't exist
if [ ! -f "cert.pem" ] || [ ! -f "key.pem" ]; then
    echo "🔐 Generating SSL certificates..."
    openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj '/CN=localhost' 2>/dev/null
    echo "✅ SSL certificates generated"
else
    echo "✅ SSL certificates already exist"
fi
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found."
    echo ""
    echo "To complete setup, you need API keys:"
    echo ""
    echo "1. GEMINI_API_KEY:"
    echo "   → Go to: https://aistudio.google.com/app/apikey"
    echo "   → Click 'Create API Key'"
    echo "   → Copy the key"
    echo ""
    echo "2. FISH_API_KEY:"
    echo "   → Go to: https://fish.audio"
    echo "   → Sign up and get your API key"
    echo ""
    echo "Create a .env file in this folder with:"
    echo "   GEMINI_API_KEY=your-key-here"
    echo "   FISH_API_KEY=your-key-here"
    echo ""
else
    echo "✅ .env file found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start JARVIS:"
echo "  1. Make sure you have a .env file with your API keys"
echo "  2. Run: python server.py"
echo "  3. In another terminal: cd frontend && npm run dev"
echo "  4. Open Chrome to http://localhost:5173"
echo ""
