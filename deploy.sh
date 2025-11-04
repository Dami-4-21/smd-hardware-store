#!/bin/bash

# WooCommerce API Proxy Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: development, staging, production

ENVIRONMENT=${1:-development}
echo "🚀 Deploying WooCommerce API Proxy for $ENVIRONMENT"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please create .env file with your WooCommerce credentials:"
    echo "   WOOCOMMERCE_URL=https://www.sqb-tunisie.com"
    echo "   WOOCOMMERCE_CONSUMER_KEY=your_key"
    echo "   WOOCOMMERCE_CONSUMER_SECRET=your_secret"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cp package-backend.json package.json
npm install

# Test API connection
echo "🔍 Testing WooCommerce API connection..."
node -e "
require('dotenv').config();
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

const WooCommerce = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: 'wc/v3'
});

WooCommerce.get('products/categories?per_page=1')
  .then(response => {
    console.log('✅ WooCommerce API connection successful!');
    console.log('📊 Available categories:', response.data.length);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ WooCommerce API connection failed:');
    console.error('   Error:', error.message);
    console.error('   Please check your credentials in .env file');
    process.exit(1);
  });
"

if [ $? -eq 0 ]; then
    echo "✅ API connection test passed!"

    # Start server based on environment
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🌐 Starting production server..."
        npm install -g pm2
        pm2 start server.js --name "woocommerce-proxy"
        pm2 save
        pm2 startup
        echo "✅ Production server started with PM2"
    else
        echo "🛠️  Starting development server..."
        echo "📍 Server will be available at: http://localhost:3001"
        echo "📋 API endpoints:"
        echo "   GET /api/categories"
        echo "   GET /api/products"
        echo "   GET /api/categories/:id/products"
        npm run dev
    fi
else
    echo "❌ API connection test failed!"
    echo "🔧 Please check your WooCommerce credentials"
    exit 1
fi
