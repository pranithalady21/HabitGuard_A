#!/bin/bash
# Installation and Setup Script for HabitGuard
# Run this script to automatically set up the project

echo "================================"
echo "HabitGuard Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Install Backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install Frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/habitguard_A
NODE_ENV=development
EOF
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "================================"
echo "Setup Complete! 🎉"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Ensure MongoDB is running"
echo "2. Start Backend: npm run dev"
echo "3. Start Frontend: cd frontend && npm start"
echo "4. Health Check: http://localhost:3000"
echo ""
echo "Documentation:"
echo "- README.md - Overview"
echo "- GET_STARTED.md - Full Guide"
echo "- QUICK_START.md - 2-Min Setup"
echo ""
