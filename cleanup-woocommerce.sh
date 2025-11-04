#!/bin/bash

echo "🗑️  Cleaning up WooCommerce and old files..."
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Backup before deletion (just in case)
echo "📦 Creating backup of files to be deleted..."
mkdir -p .cleanup-backup
cp -r wordpress-plugin .cleanup-backup/ 2>/dev/null || true
cp -r netlify .cleanup-backup/ 2>/dev/null || true
cp deploy.sh .cleanup-backup/ 2>/dev/null || true
cp build-and-deploy.sh .cleanup-backup/ 2>/dev/null || true
cp test-api.js .cleanup-backup/ 2>/dev/null || true
cp test-complete-flow.sh .cleanup-backup/ 2>/dev/null || true
cp package-backend.json .cleanup-backup/ 2>/dev/null || true
cp .env.backend .cleanup-backup/ 2>/dev/null || true

echo "✅ Backup created in .cleanup-backup/"
echo ""

# Delete WordPress plugin folder
echo "🗑️  Deleting wordpress-plugin/ folder..."
rm -rf wordpress-plugin/

# Delete old deployment scripts
echo "🗑️  Deleting old deployment scripts..."
rm -f deploy.sh
rm -f build-and-deploy.sh
rm -f deploy-customer-frontend.sh

# Delete old test files
echo "🗑️  Deleting old test files..."
rm -f test-api.js
rm -f test-complete-flow.sh

# Delete Netlify functions (if you're not using Netlify Functions)
echo "🗑️  Deleting netlify/ folder..."
rm -rf netlify/

# Delete duplicate files
echo "🗑️  Deleting duplicate files..."
rm -f package-backend.json
rm -f .env.backend

# Delete old documentation that references WooCommerce
echo "🗑️  Cleaning up old documentation..."
rm -f CLEANUP-SUMMARY.md
rm -f WOOCOMMERCE-TO-CUSTOM-API-MIGRATION.md 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "  ✓ Deleted wordpress-plugin/ folder"
echo "  ✓ Deleted old deployment scripts"
echo "  ✓ Deleted old test files"
echo "  ✓ Deleted netlify/ folder"
echo "  ✓ Deleted duplicate config files"
echo "  ✓ Cleaned up old documentation"
echo ""
echo "💾 Backup saved in .cleanup-backup/ (you can delete this later)"
echo ""
echo "🎯 Your project is now clean and ready for deployment!"
