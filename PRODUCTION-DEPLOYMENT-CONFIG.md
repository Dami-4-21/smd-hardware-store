# 🚀 Production Deployment Configuration

## 📍 **Server Locations**

### **Backend API (VPS)**
- **IP Address**: `51.75.143.218`
- **Port**: `3001`
- **URL**: `http://51.75.143.218:3001/api`
- **Technology**: Node.js + Express + PostgreSQL
- **Access**: SSH access required

### **Customer Frontend (Shared Hosting)**
- **Domain**: `www.catalogquienquillerie.sqb-tunisie.com`
- **URL**: `https://www.catalogquienquillerie.sqb-tunisie.com`
- **Technology**: React + TypeScript (Static Build)
- **Deployment**: FTP/cPanel upload

### **Admin Dashboard (Shared Hosting)**
- **Domain**: `www.admin-dashboard.sqb-tunisie.com`
- **URL**: `https://www.admin-dashboard.sqb-tunisie.com`
- **Technology**: React + TypeScript (Static Build)
- **Deployment**: FTP/cPanel upload

---

## 🔧 **Configuration Files**

### **1. Backend (.env)**

Create `/backend/.env` on VPS:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://smd_user:your_secure_password@localhost:5432/smd_hardware?schema=public"

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://www.catalogquienquillerie.sqb-tunisie.com,https://www.admin-dashboard.sqb-tunisie.com

# Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Admin Configuration
ADMIN_EMAIL=admin@sqb-tunisie.com
ADMIN_PASSWORD=change_this_secure_password
```

### **2. Customer Frontend (.env.production)**

Create `/project/.env.production`:

```env
# Production API URL (VPS Backend)
VITE_API_URL=http://51.75.143.218:3001/api

# App Configuration
VITE_APP_NAME=SMD Hardware Store
VITE_APP_URL=https://www.catalogquienquillerie.sqb-tunisie.com
```

### **3. Admin Dashboard (.env.production)**

Create `/admin-dashboard/.env.production`:

```env
# Production API URL (VPS Backend)
VITE_API_URL=http://51.75.143.218:3001/api

# App Configuration
VITE_APP_NAME=SMD Admin Dashboard
VITE_APP_URL=https://www.admin-dashboard.sqb-tunisie.com
```

---

## 🏗️ **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   Customer Frontend      │
│  (Shared Hosting)        │
│  catalogquienquillerie   │
│  .sqb-tunisie.com        │
└────────────┬─────────────┘
             │
             │ HTTPS
             │
             ▼
┌──────────────────────────┐
│    Backend API (VPS)     │
│   51.75.143.218:3001     │
│  Node.js + PostgreSQL    │
└────────────┬─────────────┘
             │
             │ HTTPS
             │
             ▼
┌──────────────────────────┐
│   Admin Dashboard        │
│   (Shared Hosting)       │
│  admin-dashboard         │
│  .sqb-tunisie.com        │
└──────────────────────────┘
```

---

## 📦 **Build Commands**

### **Customer Frontend:**
```bash
cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project

# Build for production
npm run build

# Output: dist/ folder
# Upload to: www.catalogquienquillerie.sqb-tunisie.com
```

### **Admin Dashboard:**
```bash
cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project/admin-dashboard

# Build for production
npm run build

# Output: dist/ folder
# Upload to: www.admin-dashboard.sqb-tunisie.com
```

### **Backend:**
```bash
# On VPS (51.75.143.218)
cd /var/www/smd-backend

# Install dependencies
npm install --production

# Run Prisma migrations
npx prisma migrate deploy

# Start with PM2
pm2 start npm --name "smd-backend" -- start
pm2 save
```

---

## 🔐 **Security Configuration**

### **1. Backend CORS Setup**

Update `/backend/src/server.ts`:

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://www.catalogquienquillerie.sqb-tunisie.com',
    'https://www.admin-dashboard.sqb-tunisie.com',
    'http://localhost:5173', // Development
    'http://localhost:5174'  // Development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### **2. Nginx Configuration (VPS)**

Create `/etc/nginx/sites-available/smd-backend`:

```nginx
server {
    listen 80;
    server_name 51.75.143.218;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    location /uploads {
        alias /var/www/smd-backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### **3. Firewall Rules (VPS)**

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Backend API
sudo ufw allow 3001/tcp

# Enable firewall
sudo ufw enable
```

---

## 📤 **Deployment Steps**

### **Step 1: Deploy Backend to VPS**

```bash
# 1. SSH into VPS
ssh root@51.75.143.218

# 2. Create directory
mkdir -p /var/www/smd-backend
cd /var/www/smd-backend

# 3. Upload backend files (from local machine)
# Use SCP or Git
scp -r ./backend/* root@51.75.143.218:/var/www/smd-backend/

# 4. Install dependencies
npm install --production

# 5. Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE smd_hardware;
CREATE USER smd_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE smd_hardware TO smd_user;
\q

# 6. Run migrations
npx prisma migrate deploy

# 7. Create admin user
npm run seed

# 8. Start with PM2
pm2 start npm --name "smd-backend" -- start
pm2 startup
pm2 save

# 9. Setup Nginx
sudo cp nginx.conf /etc/nginx/sites-available/smd-backend
sudo ln -s /etc/nginx/sites-available/smd-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 2: Deploy Customer Frontend**

```bash
# 1. Build locally
cd project
npm run build

# 2. Upload to shared hosting
# Via FTP or cPanel File Manager
# Upload contents of dist/ folder to:
# public_html/catalogquienquillerie/ (or root)

# 3. Create .htaccess
# (See .htaccess configuration below)
```

### **Step 3: Deploy Admin Dashboard**

```bash
# 1. Build locally
cd admin-dashboard
npm run build

# 2. Upload to shared hosting
# Via FTP or cPanel File Manager
# Upload contents of dist/ folder to:
# public_html/admin-dashboard/ (or subdomain root)

# 3. Create .htaccess
# (See .htaccess configuration below)
```

---

## 📄 **.htaccess Configuration**

### **For Both Frontends:**

Create `.htaccess` in the root of each deployment:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle React Router
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
  
  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

## 🔍 **Testing Checklist**

### **Backend API:**
- [ ] SSH access to VPS works
- [ ] PostgreSQL is running
- [ ] Backend starts without errors
- [ ] API responds at `http://51.75.143.218:3001/api/health`
- [ ] CORS allows frontend domains
- [ ] File uploads work
- [ ] Authentication works

### **Customer Frontend:**
- [ ] Site loads at `https://www.catalogquienquillerie.sqb-tunisie.com`
- [ ] HTTPS is working
- [ ] Can browse categories
- [ ] Can view products
- [ ] Can add to cart
- [ ] API calls work
- [ ] Images load correctly

### **Admin Dashboard:**
- [ ] Site loads at `https://www.admin-dashboard.sqb-tunisie.com`
- [ ] HTTPS is working
- [ ] Can login
- [ ] Can manage categories
- [ ] Can manage products
- [ ] Image upload works
- [ ] API calls work

---

## 🐛 **Troubleshooting**

### **CORS Errors:**
```bash
# Check backend CORS configuration
# Ensure frontend URLs are in CORS_ORIGIN
```

### **API Connection Failed:**
```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs smd-backend

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

### **Database Connection Failed:**
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Check DATABASE_URL in .env
# Ensure user has permissions
```

### **Build Errors:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## 📊 **Monitoring**

### **Backend Monitoring:**
```bash
# PM2 monitoring
pm2 monit

# Check logs
pm2 logs smd-backend --lines 100

# Check system resources
htop
```

### **Database Monitoring:**
```bash
# PostgreSQL connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('smd_hardware'));"
```

---

## 🔄 **Update Procedure**

### **Backend Updates:**
```bash
# SSH to VPS
ssh root@51.75.143.218

# Pull latest code
cd /var/www/smd-backend
git pull

# Install dependencies
npm install --production

# Run migrations
npx prisma migrate deploy

# Restart
pm2 restart smd-backend
```

### **Frontend Updates:**
```bash
# Build locally
npm run build

# Upload new dist/ folder
# Replace files on shared hosting
```

---

## 📞 **Support Information**

### **VPS Access:**
- IP: `51.75.143.218`
- SSH: `ssh root@51.75.143.218`
- Backend: `http://51.75.143.218:3001`

### **Domains:**
- Customer: `https://www.catalogquienquillerie.sqb-tunisie.com`
- Admin: `https://www.admin-dashboard.sqb-tunisie.com`

### **Database:**
- Name: `smd_hardware`
- User: `smd_user`
- Port: `5432`

---

**🚀 Ready for Production Deployment!**

*SMD Tunisie Hardware Store - Production Configuration* 🛠️
