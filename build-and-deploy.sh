#!/bin/bash

# Hardware Store - Build and Deploy Script
# This script prepares your project for deployment to shared hosting

set -e  # Exit on error

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$HOME/sqb-deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/sqb-deploy-backup-$TIMESTAMP"

echo "🚀 Hardware Store - Build and Deploy Script"
echo "=============================================="
echo ""

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf "$PROJECT_DIR/dist"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/app"
echo "✅ Cleaned"
echo ""

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
cd "$PROJECT_DIR"
npm install
echo "✅ Dependencies installed"
echo ""

# Step 3: Build the project
echo "🔨 Building project for production..."
npm run build
echo "✅ Build complete"
echo ""

# Step 4: Prepare deployment files
echo "📋 Preparing deployment files..."
cp -r "$PROJECT_DIR/dist"/* "$DEPLOY_DIR/app/"
cp "$PROJECT_DIR/.htaccess" "$DEPLOY_DIR/app/"

# Create a README for deployment
cat > "$DEPLOY_DIR/app/DEPLOYMENT-INFO.txt" << EOF
Hardware Store Application
Deployment Date: $(date)
Version: 1.0.0

Files included:
- index.html - Main application entry point
- assets/ - JavaScript, CSS, and other assets
- .htaccess - Server configuration for routing

Deployment Instructions:
1. Upload all files to public_html/app/ on your shared hosting
2. Ensure .htaccess file is uploaded (may be hidden)
3. Set file permissions: 644 for files, 755 for directories
4. Visit https://www.sqb-tunisie.com/app/ to verify

For detailed instructions, see DEPLOYMENT-GUIDE.md
EOF

echo "✅ Files prepared"
echo ""

# Step 5: Create deployment package
echo "📦 Creating deployment package..."
cd "$DEPLOY_DIR"
zip -r "sqb-app-$TIMESTAMP.zip" app/ > /dev/null 2>&1
echo "✅ Package created: sqb-app-$TIMESTAMP.zip"
echo ""

# Step 6: Display summary
echo "✨ Build and Deployment Preparation Complete!"
echo "=============================================="
echo ""
echo "📁 Deployment Directory: $DEPLOY_DIR"
echo "📦 Package File: sqb-app-$TIMESTAMP.zip"
echo ""
echo "📋 Next Steps:"
echo "1. Download the zip file from: $DEPLOY_DIR/sqb-app-$TIMESTAMP.zip"
echo "2. Log in to your cPanel"
echo "3. Navigate to File Manager > public_html"
echo "4. Create 'app' folder if it doesn't exist"
echo "5. Upload the zip file to public_html/app/"
echo "6. Extract the zip file"
echo "7. Delete the zip file"
echo "8. Visit https://www.sqb-tunisie.com/app/"
echo ""
echo "🔗 Application URL: https://www.sqb-tunisie.com/app/"
echo ""
echo "📚 For detailed instructions, see: DEPLOYMENT-GUIDE.md"
echo ""
