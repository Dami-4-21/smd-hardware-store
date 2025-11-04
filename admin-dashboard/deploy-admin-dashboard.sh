#!/bin/bash

# Deploy Admin Dashboard to Shared Hosting
# Target: www.admin-dashboard.sqb-tunisie.com

echo "🚀 Deploying Admin Dashboard..."
echo "================================"

# Step 1: Clean previous build
echo "📦 Cleaning previous build..."
rm -rf dist

# Step 2: Install dependencies
echo "📥 Installing dependencies..."
npm install

# Step 3: Build for production
echo "🔨 Building for production..."
npm run build

# Step 4: Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist folder not found."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "📤 Next steps:"
echo "1. Upload the contents of the 'dist' folder to your shared hosting"
echo "2. Target directory: admin-dashboard subdomain root"
echo "3. Make sure .htaccess file is included"
echo ""
echo "📁 Files to upload:"
ls -lh dist/
echo ""
echo "🌐 Deployment URL: https://www.admin-dashboard.sqb-tunisie.com"
echo "🔗 Backend API: http://51.75.143.218:3001/api"
echo ""
echo "✨ Admin Dashboard ready for deployment!"
