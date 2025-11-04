# 🎨 Frontend Deployment Guide - Deploy Shop & Admin Dashboard

## 📚 What You'll Learn
- How to build React applications for production
- How to deploy to shared hosting (cPanel)
- How to deploy to Netlify (recommended)
- How to configure domains
- How to setup automatic deployments

**Time Required**: 40-60 minutes  
**Difficulty**: Beginner-Intermediate

---

## 📋 Prerequisites

Before starting, make sure you completed:
- ✅ [BACKEND-DEPLOYMENT.md](./BACKEND-DEPLOYMENT.md) - Backend is running
- ✅ [NGINX-SSL-SETUP.md](./NGINX-SSL-SETUP.md) - API is accessible

**Check you're ready:**
```bash
# Test API is accessible
curl https://51.75.143.218/api/categories

# Should return JSON
```

---

## 🎯 What We're Deploying

### Two Frontend Applications:

```
1. Customer Shop (React App)
   - Domain: www.catalogquienquillerie.sqb-tunisie.com
   - What it does: Product browsing, cart, checkout
   - Users: Customers

2. Admin Dashboard (React App)
   - Domain: www.sqb-tunisie.com
   - What it does: Manage products, orders, customers
   - Users: Admin staff
```

### Deployment Options:

**Option A: Shared Hosting (cPanel)**
- ✓ You already have it
- ✓ Simple FTP upload
- ✓ Good for static sites
- ✗ Manual deployment
- ✗ No automatic builds

**Option B: Netlify (Recommended)**
- ✓ Free tier available
- ✓ Automatic deployments from Git
- ✓ Global CDN (fast worldwide)
- ✓ Free SSL certificates
- ✓ Easy rollbacks
- ✓ Preview deployments

---

## 🏗️ Part 1: Prepare Frontend Applications

### Step 1: Configure Environment Variables

#### **Customer Shop (.env.production):**

```bash
# On your LOCAL computer
# Navigate to project root
cd /path/to/your/project

# Create production environment file
nano .env.production
```

**Paste:**

```bash
# API URL (your VPS)
VITE_API_URL=https://51.75.143.218/api

# Or if you setup domain for API:
# VITE_API_URL=https://api.sqb-tunisie.com/api
```

**Save and exit**

#### **Admin Dashboard (.env.production):**

```bash
# Navigate to admin dashboard
cd admin-dashboard

# Create production environment file
nano .env.production
```

**Paste:**

```bash
# API URL
VITE_API_URL=https://51.75.143.218/api
```

**Save and exit**

### Step 2: Test Production Build Locally

#### **Build Customer Shop:**

```bash
# Navigate to project root
cd /path/to/your/project

# Install dependencies (if not already)
npm install

# Build for production
npm run build

# What happens:
# - Vite reads .env.production
# - Compiles React + TypeScript
# - Optimizes and minifies code
# - Outputs to dist/ folder
# Takes 1-3 minutes
```

You should see:
```
vite v4.5.0 building for production...
✓ 1234 modules transformed.
dist/index.html                  0.45 kB
dist/assets/index-abc123.css    45.67 kB
dist/assets/index-xyz789.js    234.56 kB

✓ built in 45.67s
```

#### **Build Admin Dashboard:**

```bash
# Navigate to admin dashboard
cd admin-dashboard

# Install dependencies
npm install

# Build for production
npm run build

# Outputs to admin-dashboard/dist/
```

### Step 3: Test Built Files Locally

```bash
# Install serve (if not already)
npm install -g serve

# Serve customer shop
cd /path/to/your/project
serve -s dist -p 3000

# Open browser: http://localhost:3000
# Test the app works

# Stop with Ctrl+C

# Serve admin dashboard
cd admin-dashboard
serve -s dist -p 3001

# Open browser: http://localhost:3001
# Test the app works
```

**Both apps work locally? Great!** ✓

---

## 🚀 Part 2: Deploy to Netlify (Recommended)

### Why Netlify?

```
Benefits:
✓ Free for personal projects
✓ Automatic deployments from Git
✓ Global CDN (fast everywhere)
✓ Free SSL certificates
✓ Custom domains
✓ Rollback to previous versions
✓ Preview deployments for testing
```

### Step 1: Create Netlify Account

1. Go to: https://www.netlify.com
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize Netlify

### Step 2: Push Code to GitHub

```bash
# On your LOCAL computer
cd /path/to/your/project

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create repository on GitHub:
# 1. Go to github.com
# 2. Click "New repository"
# 3. Name: smd-hardware-store
# 4. Create repository

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/smd-hardware-store.git

# Push code
git branch -M main
git push -u origin main
```

### Step 3: Deploy Customer Shop to Netlify

#### **Create netlify.toml (Customer Shop):**

```bash
# In project root
nano netlify.toml
```

**Paste:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Save and commit:**

```bash
git add netlify.toml
git commit -m "Add Netlify configuration"
git push
```

#### **Deploy via Netlify Dashboard:**

1. Go to Netlify dashboard
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select your repository: `smd-hardware-store`
5. Configure build settings:
   - **Base directory**: (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"

**Wait 2-3 minutes for deployment...**

You'll get a URL like: `https://random-name-123456.netlify.app`

**Test it!** Open the URL in browser.

#### **Setup Custom Domain:**

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter: `www.catalogquienquillerie.sqb-tunisie.com`
4. Click "Verify"
5. Netlify will show DNS instructions

**Configure DNS:**

Go to your domain registrar and add:

```
Type: CNAME
Name: www.catalogquienquillerie
Value: random-name-123456.netlify.app
TTL: 3600
```

**Wait 10-30 minutes for DNS propagation**

#### **Enable HTTPS:**

1. In Netlify, go to "Domain settings"
2. Scroll to "HTTPS"
3. Click "Verify DNS configuration"
4. Click "Provision certificate"

**Wait 1-2 minutes...**

**Done!** Your shop is now at: `https://www.catalogquienquillerie.sqb-tunisie.com` 🎉

### Step 4: Deploy Admin Dashboard to Netlify

#### **Create separate netlify.toml for admin:**

```bash
# Navigate to admin dashboard
cd admin-dashboard

# Create netlify.toml
nano netlify.toml
```

**Paste same configuration as above**

**Save and commit:**

```bash
git add netlify.toml
git commit -m "Add Netlify config for admin"
git push
```

#### **Deploy Admin Dashboard:**

1. In Netlify, click "Add new site"
2. Import from GitHub
3. Select same repository
4. Configure:
   - **Base directory**: `admin-dashboard`
   - **Build command**: `npm run build`
   - **Publish directory**: `admin-dashboard/dist`
5. Deploy

#### **Setup Custom Domain:**

1. Add domain: `www.sqb-tunisie.com`
2. Configure DNS:

```
Type: CNAME
Name: www
Value: your-admin-site.netlify.app
TTL: 3600
```

3. Enable HTTPS

**Done!** Admin is at: `https://www.sqb-tunisie.com` 🎉

---

## 📦 Part 3: Deploy to Shared Hosting (Alternative)

### Step 1: Build Applications

```bash
# Build customer shop
cd /path/to/your/project
npm run build

# Build admin dashboard
cd admin-dashboard
npm run build
```

### Step 2: Create .htaccess Files

#### **For Customer Shop:**

```bash
# Create .htaccess in dist folder
cd dist
nano .htaccess
```

**Paste:**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # SPA routing
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType image/x-icon "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

**Do the same for admin dashboard**

### Step 3: Upload via FTP

#### **Option A: Using FileZilla (GUI)**

1. Download FileZilla: https://filezilla-project.org/
2. Open FileZilla
3. Enter FTP credentials:
   - Host: `ftp.sqb-tunisie.com`
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21
4. Connect
5. Navigate to `public_html` (for shop) or subdomain folder
6. Upload all files from `dist/` folder
7. Wait for upload to complete (5-10 minutes)

#### **Option B: Using Command Line (lftp)**

```bash
# Install lftp
sudo apt install lftp

# Create upload script
nano upload-shop.sh
```

**Paste:**

```bash
#!/bin/bash

HOST="ftp.sqb-tunisie.com"
USER="your_ftp_username"
PASS="your_ftp_password"
REMOTE_DIR="/public_html"
LOCAL_DIR="./dist"

lftp -c "
set ftp:ssl-allow no;
open ftp://$USER:$PASS@$HOST;
mirror --reverse --delete --verbose $LOCAL_DIR $REMOTE_DIR;
bye
"

echo "Upload complete!"
```

**Make executable and run:**

```bash
chmod +x upload-shop.sh
./upload-shop.sh
```

### Step 4: Configure Domain

**In cPanel:**

1. Go to "Domains" or "Addon Domains"
2. Add domain: `www.catalogquienquillerie.sqb-tunisie.com`
3. Point to `public_html` folder
4. Enable SSL (Let's Encrypt)

**Repeat for admin dashboard**

---

## 🔄 Part 4: Setup Automatic Deployments

### Using GitHub Actions (for Netlify)

#### **Create workflow file:**

```bash
# In project root
mkdir -p .github/workflows
nano .github/workflows/deploy.yml
```

**Paste:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-shop:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./admin-dashboard
        run: npm install
      
      - name: Build
        working-directory: ./admin-dashboard
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './admin-dashboard/dist'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_ADMIN_SITE_ID }}
```

#### **Add GitHub Secrets:**

1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Add secrets:
   - `API_URL`: `https://51.75.143.218/api`
   - `NETLIFY_AUTH_TOKEN`: (from Netlify account settings)
   - `NETLIFY_SITE_ID`: (from Netlify site settings)
   - `NETLIFY_ADMIN_SITE_ID`: (from admin site settings)

**Now every push to main branch automatically deploys!** 🚀

---

## ✅ Step 5: Final Verification

### Test Customer Shop:

1. Go to: `https://www.catalogquienquillerie.sqb-tunisie.com`
2. ✓ Page loads
3. ✓ Can browse categories
4. ✓ Can view products
5. ✓ Can add to cart
6. ✓ Can checkout

### Test Admin Dashboard:

1. Go to: `https://www.sqb-tunisie.com`
2. ✓ Page loads
3. ✓ Can login
4. ✓ Can view dashboard
5. ✓ Can manage products
6. ✓ Can view orders

### Test API Connection:

```bash
# Check CORS is configured
curl -H "Origin: https://www.catalogquienquillerie.sqb-tunisie.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://51.75.143.218/api/categories
```

---

## 📝 Summary - What You Did

✅ Built production-ready React apps  
✅ Deployed customer shop  
✅ Deployed admin dashboard  
✅ Configured custom domains  
✅ Enabled HTTPS/SSL  
✅ Setup automatic deployments  
✅ Tested everything works  

---

## 🎯 Next Steps

Your frontends are now live!

**Next Guide**: [UPDATE-PROCEDURES.md](./UPDATE-PROCEDURES.md) - How to update your app

---

## 🆘 Troubleshooting

### Build Fails?

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### API Connection Fails?

```bash
# Check CORS in backend .env
CORS_ORIGIN=https://www.catalogquienquillerie.sqb-tunisie.com,https://www.sqb-tunisie.com

# Restart backend
docker-compose restart backend
```

### Domain Not Working?

```bash
# Check DNS propagation
nslookup www.catalogquienquillerie.sqb-tunisie.com

# Wait 10-30 minutes for DNS to propagate
```

### Blank Page After Deployment?

```bash
# Check browser console for errors
# Usually API URL is wrong in .env.production

# Rebuild with correct API URL
npm run build
```

---

**Congratulations!** Your entire application is now live! 🎉

**Continue to**: [UPDATE-PROCEDURES.md](./UPDATE-PROCEDURES.md)
