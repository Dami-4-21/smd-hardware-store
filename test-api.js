#!/usr/bin/env node

// Simple API test script to verify WooCommerce connection
import dotenv from 'dotenv';
import pkg from '@woocommerce/woocommerce-rest-api';
const WooCommerceRestApi = pkg.default;

dotenv.config();

console.log('🔍 Testing WooCommerce API Connection...\n');

const WooCommerce = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL || 'https://www.sqb-tunisie.com',
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: 'wc/v3',
  queryStringAuth: true
});

async function testConnection() {
  try {
    // Test categories endpoint
    console.log('📂 Testing categories endpoint...');
    const categoriesResponse = await WooCommerce.get('products/categories', { per_page: 5 });
    console.log(`✅ Categories: ${categoriesResponse.data.length} found`);
    if (categoriesResponse.data.length > 0) {
      console.log(`   📁 Sample category: ${categoriesResponse.data[0].name}`);
    }

    // Test products endpoint
    console.log('\n🛍️  Testing products endpoint...');
    const productsResponse = await WooCommerce.get('products', { per_page: 5 });
    console.log(`✅ Products: ${productsResponse.data.length} found`);
    if (productsResponse.data.length > 0) {
      console.log(`   📦 Sample product: ${productsResponse.data[0].name} - $${productsResponse.data[0].price}`);
    }

    // Test authentication
    console.log('\n🔐 Testing authentication...');
    const authResponse = await WooCommerce.get('products/categories', { per_page: 1 });
    console.log('✅ Authentication successful!');

    console.log('\n🎉 All tests passed! Your WooCommerce API is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the backend proxy: npm run server');
    console.log('   2. Start the React app: npm run dev');
    console.log('   3. Test the integration at http://localhost:5173');

  } catch (error) {
    console.error('\n❌ API Connection Failed!');
    console.error('Error:', error.message);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }

    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your .env file has correct credentials');
    console.log('   2. Verify your WooCommerce API keys are valid');
    console.log('   3. Ensure your store URL is accessible');
    console.log('   4. Check if CORS is enabled on your WooCommerce store');

    process.exit(1);
  }
}

testConnection();
