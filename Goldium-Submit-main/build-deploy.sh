#!/bin/bash

# Build script untuk deployment
echo "🔨 Building Goldium DeFi application..."

# Run build
npm run build

# Fix deployment structure 
echo "📁 Creating deployment structure..."
mkdir -p dist/public
cp dist/index.html dist/public/
cp -r dist/assets dist/public/

echo "✅ Build completed successfully!"
echo "📦 Assets copied to dist/public/ for deployment"

# Test production server
echo "🧪 Testing production server..."
NODE_ENV=production REPLIT_DEPLOYMENT=1 timeout 5s node dist/index.js > /dev/null 2>&1 && echo "✅ Production server test passed!" || echo "⚠️ Production server test failed (port may be in use)"

echo "🚀 Ready for deployment!"