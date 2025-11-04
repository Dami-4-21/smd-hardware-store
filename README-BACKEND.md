# WooCommerce API Proxy Setup Guide

## 🚨 SECURITY WARNING

**NEVER commit the `.env.backend` file or expose your `CONSUMER_SECRET` in client-side code!**

This backend proxy ensures your WooCommerce credentials remain secure on the server.

## Option 1: Express.js Server (Recommended for Development)

### Setup

1. **Install backend dependencies:**
   ```bash
   npm install -g package-backend.json
   # or
   cp package-backend.json package.json && npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.backend .env
   # Edit .env with your actual WooCommerce credentials
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

4. **Update your React app configuration:**
   Edit `src/config/api.ts`:
   ```typescript
   export const API_CONFIG = {
     BASE_URL: 'http://localhost:3001/api',
     // ... rest of config
   };
   ```

## Option 2: Netlify Serverless Functions

### Setup for Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Set environment variables in Netlify:**
   - Go to your Netlify site dashboard
   - Navigate to Site Settings > Environment Variables
   - Add these variables:
     ```
     WOOCOMMERCE_URL=https://www.sqb-tunisie.com
     WOOCOMMERCE_CONSUMER_KEY=ck_9ea2c038002c981296a19679add1d057338a3fef
     WOOCOMMERCE_CONSUMER_SECRET=cs_07d5fcc411413459e46c01eee503f77a57beec7c
     ```

3. **Deploy functions:**
   ```bash
   netlify dev  # Local development
   netlify deploy --prod  # Production deploy
   ```

4. **Update your React app configuration:**
   ```typescript
   export const API_CONFIG = {
     BASE_URL: '/.netlify/functions/api',
     // ... rest of config
   };
   ```

## Option 3: Vercel Serverless Functions

1. **Create `api` directory:**
   ```bash
   mkdir api
   # Move the serverless function code to api/api.js
   ```

2. **Set environment variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add the WooCommerce credentials

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## API Endpoints

Your React app can now use these secure endpoints:

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `GET /api/categories/:id/subcategories` - Get subcategories
- `GET /api/categories/:id/products` - Get products for category
- `GET /api/products` - Get all products (with search)

## Environment Variables for React App

Update your frontend `.env.local` or `src/config/api.ts`:

```env
VITE_API_BASE_URL=http://localhost:3001/api  # For Express server
# OR
VITE_API_BASE_URL=/.netlify/functions/api    # For Netlify
# OR
VITE_API_BASE_URL=/api                       # For Vercel
```

## Security Benefits

✅ **Consumer Secret never exposed in browser**  
✅ **CORS properly configured**  
✅ **Rate limiting and error handling**  
✅ **Production-ready logging**  
✅ **Environment-based configuration**

## Testing the API

Once your proxy is running, test these endpoints:

```bash
# Test categories
curl http://localhost:3001/api/categories

# Test products
curl http://localhost:3001/api/products

# Test category with products
curl http://localhost:3001/api/categories/15/products
```
