# 🌐 VPS Domain Setup - sqb-tunisie.com

**Date**: November 15, 2025  
**New Architecture**: Full VPS deployment (No Netlify)

---

## 📌 New Domain Configuration

### **Backend API** 🔧
- **Domain**: `www.catalogquienquillerie.sqb-tunisie.com`
- **Purpose**: REST API for both admin and customer apps
- **Port**: 3001 (internal)
- **Status**: ✅ Already working

### **Admin Dashboard** 👨‍💼
- **Domain**: `sqb-tunisie.com/admin`
- **Purpose**: Admin panel for managing products, orders, customers
- **Root**: `/var/www/admin` (or similar)
- **Build**: React app (admin-dashboard)

### **Customer Shop** 🛒
- **Domain**: `sqb-tunisie.com/customer`
- **Purpose**: Customer-facing e-commerce shop
- **Root**: `/var/www/customer` (or similar)
- **Build**: React app (customer frontend)

---

## 🏗️ Architecture Overview

```
                    ┌─────────────────────────────────┐
                    │   sqb-tunisie.com (VPS)        │
                    └─────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
         ┌──────────▼──────────┐    ┌──────────▼──────────┐
         │   /admin            │    │   /customer         │
         │   Admin Dashboard   │    │   Customer Shop     │
         │   (React Build)     │    │   (React Build)     │
         └──────────┬──────────┘    └──────────┬──────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────────────┐
                    │  www.catalogquienquillerie.      │
                    │  sqb-tunisie.com                  │
                    │  Backend API (Node.js + Docker)   │
                    └─────────────┬─────────────────────┘
                                  │
                    ┌─────────────▼─────────────────────┐
                    │  PostgreSQL Database (Docker)     │
                    └───────────────────────────────────┘
```

---

## 🔧 Nginx Configuration

### **Main Configuration** (`/etc/nginx/sites-available/sqb-tunisie.com`)

```nginx
# Backend API
server {
    listen 80;
    listen [::]:80;
    server_name www.catalogquienquillerie.sqb-tunisie.com catalogquienquillerie.sqb-tunisie.com;

    # SSL will be added here later with certbot

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Main domain with admin and customer
server {
    listen 80;
    listen [::]:80;
    server_name sqb-tunisie.com www.sqb-tunisie.com;

    # SSL will be added here later with certbot

    # Admin Dashboard
    location /admin {
        alias /var/www/sqb-tunisie/admin;
        try_files $uri $uri/ /admin/index.html;
        
        # Handle React Router
        location ~ ^/admin/(.*)$ {
            try_files $uri $uri/ /admin/index.html;
        }
    }

    # Customer Shop
    location /customer {
        alias /var/www/sqb-tunisie/customer;
        try_files $uri $uri/ /customer/index.html;
        
        # Handle React Router
        location ~ ^/customer/(.*)$ {
            try_files $uri $uri/ /customer/index.html;
        }
    }

    # Redirect root to customer shop
    location = / {
        return 301 /customer;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 📁 Directory Structure on VPS

```
/var/www/
├── sqb-tunisie/
│   ├── admin/                    # Admin dashboard build
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   ├── customer/                 # Customer shop build
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   └── backend/                  # Backend source code
│       ├── src/
│       ├── prisma/
│       ├── uploads/
│       ├── .env
│       └── docker-compose.yml
```

---

## 🚀 Deployment Steps

### **Step 1: Prepare VPS Directories**

```bash
# SSH to VPS
ssh root@51.75.143.218

# Create directory structure
mkdir -p /var/www/sqb-tunisie/admin
mkdir -p /var/www/sqb-tunisie/customer
mkdir -p /var/www/sqb-tunisie/backend

# Set permissions
chown -R www-data:www-data /var/www/sqb-tunisie
chmod -R 755 /var/www/sqb-tunisie
```

### **Step 2: Deploy Backend**

```bash
# Navigate to backend directory
cd /var/www/sqb-tunisie/backend

# Clone or pull latest code
git clone https://github.com/Dami-4-21/smd-hardware-store.git .
# OR if already exists:
git pull origin main

# Copy backend files
cd backend
cp .env.example .env

# Edit .env with production values
nano .env
```

**Critical .env settings:**
```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/smd_store"

# API
PORT=3001
NODE_ENV=production

# CORS - IMPORTANT: Include your new domains
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,https://sqb-tunisie.com,https://www.sqb-tunisie.com,https://www.catalogquienquillerie.sqb-tunisie.com

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Other settings...
```

```bash
# Install dependencies
npm install

# Build
npm run build

# Start with Docker
docker-compose up -d

# Verify
curl http://localhost:3001/health
```

### **Step 3: Build and Deploy Admin Dashboard**

```bash
# On your local machine or VPS
cd /path/to/project/admin-dashboard

# Update API URL in environment
# Create .env.production
cat > .env.production << EOF
VITE_API_URL=https://www.catalogquienquillerie.sqb-tunisie.com/api
EOF

# Build
npm install
npm run build

# Copy to VPS
scp -r dist/* root@51.75.143.218:/var/www/sqb-tunisie/admin/

# OR if building on VPS:
cd /var/www/sqb-tunisie/admin-dashboard
npm install
npm run build
cp -r dist/* /var/www/sqb-tunisie/admin/
```

### **Step 4: Build and Deploy Customer Shop**

```bash
# On your local machine or VPS
cd /path/to/project

# Update API URL in environment
# Create .env.production
cat > .env.production << EOF
VITE_API_URL=https://www.catalogquienquillerie.sqb-tunisie.com/api
EOF

# Build
npm install
npm run build

# Copy to VPS
scp -r dist/* root@51.75.143.218:/var/www/sqb-tunisie/customer/

# OR if building on VPS:
cd /var/www/sqb-tunisie/customer-shop
npm install
npm run build
cp -r dist/* /var/www/sqb-tunisie/customer/
```

### **Step 5: Configure Nginx**

```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/sqb-tunisie.com

# Paste the configuration from above

# Enable site
sudo ln -s /etc/nginx/sites-available/sqb-tunisie.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### **Step 6: Setup SSL with Let's Encrypt**

```bash
# Install certbot if not already installed
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificates for all domains
sudo certbot --nginx -d sqb-tunisie.com -d www.sqb-tunisie.com -d www.catalogquienquillerie.sqb-tunisie.com -d catalogquienquillerie.sqb-tunisie.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (recommended)

# Verify auto-renewal
sudo certbot renew --dry-run
```

---

## ✅ Verification Checklist

### **Backend API**
```bash
# Health check
curl https://www.catalogquienquillerie.sqb-tunisie.com/health

# API endpoints
curl https://www.catalogquienquillerie.sqb-tunisie.com/api/products?limit=5
curl https://www.catalogquienquillerie.sqb-tunisie.com/api/categories
```

### **Admin Dashboard**
- [ ] Open https://sqb-tunisie.com/admin in browser
- [ ] Login page loads correctly
- [ ] Can login with admin credentials
- [ ] Dashboard shows data
- [ ] No CORS errors in console (F12)
- [ ] Can create/edit products

### **Customer Shop**
- [ ] Open https://sqb-tunisie.com/customer in browser
- [ ] Homepage loads with products
- [ ] Can browse categories
- [ ] Can view product details
- [ ] Can add to cart
- [ ] Can login/register
- [ ] No CORS errors in console (F12)

---

## 🔄 Update Process (After Initial Setup)

### **Update Backend**
```bash
ssh root@51.75.143.218
cd /var/www/sqb-tunisie/backend
git pull origin main
npm install
npm run build
docker-compose restart backend
curl http://localhost:3001/health
```

### **Update Admin Dashboard**
```bash
# Build locally
cd /path/to/project/admin-dashboard
npm run build
scp -r dist/* root@51.75.143.218:/var/www/sqb-tunisie/admin/

# OR build on VPS
ssh root@51.75.143.218
cd /var/www/sqb-tunisie/admin-dashboard
git pull origin main
npm install
npm run build
cp -r dist/* /var/www/sqb-tunisie/admin/
```

### **Update Customer Shop**
```bash
# Build locally
cd /path/to/project
npm run build
scp -r dist/* root@51.75.143.218:/var/www/sqb-tunisie/customer/

# OR build on VPS
ssh root@51.75.143.218
cd /var/www/sqb-tunisie/customer-shop
git pull origin main
npm install
npm run build
cp -r dist/* /var/www/sqb-tunisie/customer/
```

---

## 🚨 Important Notes

### **Base Path Configuration**

Since admin and customer are served from `/admin` and `/customer` paths, you need to configure the base path in Vite:

**admin-dashboard/vite.config.ts:**
```typescript
export default defineConfig({
  base: '/admin/',
  // ... rest of config
})
```

**customer-shop/vite.config.ts:**
```typescript
export default defineConfig({
  base: '/customer/',
  // ... rest of config
})
```

### **React Router Configuration**

Update your router to use the base path:

**admin-dashboard/src/main.tsx:**
```typescript
import { BrowserRouter } from 'react-router-dom';

<BrowserRouter basename="/admin">
  <App />
</BrowserRouter>
```

**customer-shop/src/main.tsx:**
```typescript
import { BrowserRouter } from 'react-router-dom';

<BrowserRouter basename="/customer">
  <App />
</BrowserRouter>
```

---

## 📝 DNS Configuration

Make sure your DNS records point to your VPS:

```
A     sqb-tunisie.com                    → 51.75.143.218
A     www.sqb-tunisie.com                → 51.75.143.218
A     catalogquienquillerie.sqb-tunisie.com     → 51.75.143.218
A     www.catalogquienquillerie.sqb-tunisie.com → 51.75.143.218
```

---

## 🔍 Troubleshooting

### **Issue: 404 on page refresh**
**Cause**: React Router not configured properly  
**Solution**: Check nginx `try_files` directive and React Router basename

### **Issue: CORS errors**
**Cause**: Backend CORS_ORIGIN doesn't include frontend domains  
**Solution**: Update `.env` CORS_ORIGIN and restart backend

### **Issue: Assets not loading**
**Cause**: Wrong base path in Vite config  
**Solution**: Set `base: '/admin/'` or `base: '/customer/'` in vite.config.ts

### **Issue: API calls fail**
**Cause**: Wrong API URL in frontend  
**Solution**: Check VITE_API_URL in .env.production

---

## ✅ Final Checklist

- [ ] Backend running on www.catalogquienquillerie.sqb-tunisie.com
- [ ] Admin accessible at sqb-tunisie.com/admin
- [ ] Customer accessible at sqb-tunisie.com/customer
- [ ] SSL certificates installed (HTTPS)
- [ ] CORS configured correctly
- [ ] Base paths configured in Vite
- [ ] React Router basenames configured
- [ ] DNS records pointing to VPS
- [ ] All features working (login, products, orders, etc.)

---

**Your new setup eliminates Netlify and runs everything on your VPS!** 🚀
