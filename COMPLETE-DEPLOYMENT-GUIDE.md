# 🚀 Complete VPS Deployment Guide - Step by Step

**For Complete Beginners** - Deploy your SMD Hardware Store to a VPS

---

## 📋 **What You'll Need**

✅ **VPS Server** (you already have this!)  
✅ **Domain Name** (e.g., smd-tunisie.com)  
✅ **SSH Access** to your VPS  
✅ **Your Project Files** (this folder)  

**Recommended VPS Specs:**
- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 2 cores minimum
- **Storage**: 20GB minimum
- **OS**: Ubuntu 22.04 LTS (recommended)

---

## 🎯 **Overview - What We'll Deploy**

```
Your VPS Server
├── PostgreSQL Database (Port 5432)
├── Backend API (Port 3001)
├── Admin Dashboard (Port 5174)
└── Customer Frontend (Port 5173)
```

**Access URLs:**
- Customer App: `http://your-domain.com`
- Admin Dashboard: `http://your-domain.com/admin`
- Backend API: `http://your-domain.com/api`

---

## 📝 **Step-by-Step Deployment**

---

## **PHASE 1: Connect to Your VPS** (5 minutes)

### **Step 1.1: Get Your VPS Details**

Your VPS provider should have given you:
- **IP Address**: e.g., `123.45.67.89`
- **Username**: usually `root` or `ubuntu`
- **Password** or **SSH Key**

### **Step 1.2: Connect via SSH**

**On Windows:**
1. Download **PuTTY**: https://www.putty.org/
2. Open PuTTY
3. Enter your VPS IP address
4. Click "Open"
5. Login with username and password

**On Mac/Linux:**
1. Open Terminal
2. Run:
```bash
ssh root@YOUR_VPS_IP
# Example: ssh root@123.45.67.89
```
3. Enter password when prompted

**✅ Success**: You should see a command prompt like `root@server:~#`

---

## **PHASE 2: Prepare Your Server** (15 minutes)

### **Step 2.1: Update System**

Copy and paste these commands one by one:

```bash
# Update package list
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y
```

### **Step 2.2: Install Required Software**

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (web server)
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install PM2 (process manager)
sudo npm install -g pm2
```

**✅ Checkpoint**: Run `node --version` - should show v20.x.x

---

## **PHASE 3: Setup PostgreSQL Database** (10 minutes)

### **Step 3.1: Create Database and User**

```bash
# Switch to postgres user
sudo -u postgres psql

# You're now in PostgreSQL shell (postgres=#)
```

In the PostgreSQL shell, run these commands:

```sql
-- Create database
CREATE DATABASE smd_hardware;

-- Create user with password (CHANGE THIS PASSWORD!)
CREATE USER smd_admin WITH PASSWORD 'YourStrongPassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE smd_hardware TO smd_admin;

-- Exit PostgreSQL
\q
```

### **Step 3.2: Configure PostgreSQL for Remote Access**

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Find this line (press Ctrl+W to search):
```
#listen_addresses = 'localhost'
```

Change it to:
```
listen_addresses = 'localhost'
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

```bash
# Edit access control
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Add this line at the end:
```
host    smd_hardware    smd_admin    127.0.0.1/32    md5
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Verify it's running
sudo systemctl status postgresql
```

**✅ Success**: Should show "active (running)" in green

---

## **PHASE 4: Upload Your Project** (10 minutes)

### **Step 4.1: Create Project Directory**

```bash
# Create directory for your project
sudo mkdir -p /var/www/smd-store
cd /var/www/smd-store
```

### **Step 4.2: Upload Files**

**Option A: Using Git (Recommended)**

If your project is on GitHub:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

**Option B: Using SCP/SFTP**

On your local computer:

**Windows (using WinSCP):**
1. Download WinSCP: https://winscp.net/
2. Connect to your VPS (IP, username, password)
3. Navigate to `/var/www/smd-store`
4. Upload your entire project folder

**Mac/Linux:**
```bash
# From your local computer
scp -r /path/to/your/project root@YOUR_VPS_IP:/var/www/smd-store
```

**✅ Checkpoint**: Run `ls -la` - you should see your project files

---

## **PHASE 5: Setup Backend** (15 minutes)

### **Step 5.1: Install Backend Dependencies**

```bash
cd /var/www/smd-store/backend
npm install
```

### **Step 5.2: Create Environment File**

```bash
nano .env
```

Paste this content (UPDATE THE VALUES):

```env
# Server
NODE_ENV=production
PORT=3001
API_URL=http://your-domain.com

# Database (UPDATE PASSWORD!)
DATABASE_URL=postgresql://smd_admin:YourStrongPassword123!@localhost:5432/smd_hardware

# JWT Secrets (GENERATE NEW ONES!)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this-too
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS (UPDATE WITH YOUR DOMAIN!)
CORS_ORIGIN=http://your-domain.com,http://www.your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload Directory
UPLOAD_DIR=/var/www/smd-store/backend/uploads
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

**⚠️ IMPORTANT**: Generate secure secrets!

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output and use as JWT_SECRET

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output and use as REFRESH_TOKEN_SECRET
```

### **Step 5.3: Run Database Migrations**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Create admin user
npx ts-node scripts/create-admin.ts
# Follow prompts to create your admin account
```

### **Step 5.4: Build Backend**

```bash
npm run build
```

### **Step 5.5: Start Backend with PM2**

```bash
# Start backend
pm2 start dist/index.js --name smd-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it outputs
```

**✅ Checkpoint**: Run `pm2 status` - backend should be "online"

---

## **PHASE 6: Setup Admin Dashboard** (10 minutes)

### **Step 6.1: Install Dependencies**

```bash
cd /var/www/smd-store/admin-dashboard
npm install
```

### **Step 6.2: Create Environment File**

```bash
nano .env
```

Paste this (UPDATE YOUR DOMAIN):

```env
VITE_API_URL=http://your-domain.com/api
VITE_APP_NAME=SMD Admin Dashboard
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

### **Step 6.3: Build Admin Dashboard**

```bash
npm run build
```

**✅ Success**: Should create a `dist` folder

---

## **PHASE 7: Setup Customer Frontend** (10 minutes)

### **Step 7.1: Install Dependencies**

```bash
cd /var/www/sqb-store
npm install
```

### **Step 7.2: Create Environment File**

```bash
nano .env
```

Paste this:

```env
VITE_API_URL=http://your-domain.com/api
VITE_APP_NAME=SMD Hardware Store
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

### **Step 7.3: Build Customer Frontend**

```bash
npm run build
```

**✅ Success**: Should create a `dist` folder

---

## **PHASE 8: Configure Nginx** (15 minutes)

### **Step 8.1: Create Nginx Configuration**

```bash
sudo nano /etc/nginx/sites-available/smd-store
```

Paste this configuration (UPDATE YOUR_DOMAIN):

```nginx
# Customer Frontend
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Customer App
    location / {
        root /var/www/smd-store/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Admin Dashboard
    location /admin {
        alias /var/www/smd-store/admin-dashboard/dist;
        try_files $uri $uri/ /admin/index.html;
    }

    # Backend API
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
    }

    # Uploaded files
    location /uploads {
        alias /var/www/smd-store/backend/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

### **Step 8.2: Enable Site**

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/smd-store /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

**✅ Success**: `nginx -t` should say "syntax is ok"

---

## **PHASE 9: Configure Firewall** (5 minutes)

```bash
# Allow SSH (IMPORTANT - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for future SSL)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## **PHASE 10: Setup SSL (HTTPS)** (10 minutes)

### **Step 10.1: Install Certbot**

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### **Step 10.2: Get SSL Certificate**

```bash
# Get certificate (UPDATE YOUR EMAIL AND DOMAIN!)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@example.com --agree-tos --no-eff-email
```

Follow the prompts:
- Agree to terms: `Y`
- Redirect HTTP to HTTPS: `2` (recommended)

**✅ Success**: Your site is now HTTPS! 🔒

### **Step 10.3: Auto-Renewal**

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot auto-renews, but verify cron job exists
sudo systemctl status certbot.timer
```

---

## **PHASE 11: Point Your Domain** (Varies by provider)

### **Step 11.1: Update DNS Records**

Go to your domain registrar (GoDaddy, Namecheap, etc.) and add these DNS records:

**A Records:**
```
Type: A
Name: @
Value: YOUR_VPS_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_VPS_IP
TTL: 3600
```

**⏰ Wait**: DNS propagation can take 1-48 hours (usually 1-2 hours)

**Check DNS**: Visit https://dnschecker.org and enter your domain

---

## **PHASE 12: Test Your Deployment** (10 minutes)

### **Step 12.1: Check Backend**

```bash
# Check if backend is running
pm2 status

# View backend logs
pm2 logs smd-backend

# Test API endpoint
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### **Step 12.2: Check Nginx**

```bash
# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### **Step 12.3: Test in Browser**

1. **Customer Frontend**: `http://your-domain.com`
   - Should show hardware store homepage
   - Categories should load
   - Products should display

2. **Admin Dashboard**: `http://your-domain.com/admin`
   - Should show login page
   - Login with admin credentials you created
   - Test category creation
   - Test product creation

3. **API**: `http://your-domain.com/api/categories`
   - Should return JSON with categories

---

## **PHASE 13: Maintenance & Monitoring** (Ongoing)

### **Useful Commands**

```bash
# View all PM2 processes
pm2 status

# Restart backend
pm2 restart smd-backend

# View backend logs
pm2 logs smd-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory usage
free -h

# Check database
sudo -u postgres psql -d smd_hardware -c "SELECT COUNT(*) FROM categories;"
```

### **Backup Database**

Create a backup script:

```bash
nano /root/backup-db.sh
```

Paste:

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump smd_hardware > $BACKUP_DIR/smd_hardware_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: smd_hardware_$DATE.sql"
```

Make executable:

```bash
chmod +x /root/backup-db.sh
```

Setup daily backup:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /root/backup-db.sh
```

---

## **🎯 Quick Reference**

### **Important Directories**

```
/var/www/smd-store/              # Project root
/var/www/smd-store/backend/      # Backend API
/var/www/smd-store/admin-dashboard/  # Admin dashboard
/var/www/smd-store/dist/         # Customer frontend
/var/log/nginx/                  # Nginx logs
/var/www/smd-store/backend/uploads/  # Uploaded images
```

### **Important Commands**

```bash
# Restart everything
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql

# Update code (if using Git)
cd /var/www/smd-store
git pull
cd backend && npm run build && pm2 restart smd-backend
cd ../admin-dashboard && npm run build
cd .. && npm run build

# View logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

---

## **🆘 Troubleshooting**

### **Problem: Backend won't start**

```bash
# Check logs
pm2 logs smd-backend

# Common issues:
# 1. Database connection - check DATABASE_URL in .env
# 2. Port already in use - check: sudo lsof -i :3001
# 3. Missing dependencies - run: npm install
```

### **Problem: Can't access website**

```bash
# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Check DNS
ping your-domain.com
```

### **Problem: Database connection failed**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
sudo -u postgres psql -d smd_hardware

# Check password in .env matches database user
```

### **Problem: SSL certificate issues**

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## **📊 Performance Optimization**

### **Enable Redis Caching (Optional)**

```bash
# Install Redis
sudo apt install -y redis-server

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis

# Update backend to use Redis for caching
```

### **Setup CDN (Optional)**

For better performance, use Cloudflare:
1. Sign up at https://cloudflare.com
2. Add your domain
3. Update nameservers at your registrar
4. Enable caching and optimization

---

## **🔒 Security Checklist**

✅ **Change default passwords**  
✅ **Use strong JWT secrets**  
✅ **Enable firewall (UFW)**  
✅ **Setup SSL/HTTPS**  
✅ **Regular backups**  
✅ **Keep system updated**: `sudo apt update && sudo apt upgrade`  
✅ **Monitor logs regularly**  
✅ **Use SSH keys instead of passwords** (advanced)  
✅ **Setup fail2ban** (prevents brute force attacks)  

---

## **✅ Deployment Checklist**

- [ ] VPS purchased and accessible
- [ ] Domain name configured
- [ ] SSH access working
- [ ] System updated
- [ ] Node.js installed
- [ ] PostgreSQL installed and configured
- [ ] Nginx installed
- [ ] PM2 installed
- [ ] Database created
- [ ] Project files uploaded
- [ ] Backend .env configured
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Backend running via PM2
- [ ] Admin dashboard built
- [ ] Customer frontend built
- [ ] Nginx configured
- [ ] Firewall configured
- [ ] SSL certificate installed
- [ ] DNS records updated
- [ ] Website accessible
- [ ] Admin login working
- [ ] API endpoints working
- [ ] Backups configured

---

## **🎊 Congratulations!**

Your SMD Hardware Store is now **LIVE** on the internet! 🚀

**Access URLs:**
- 🛒 **Customer Store**: `https://your-domain.com`
- 👨‍💼 **Admin Dashboard**: `https://your-domain.com/admin`
- 🔌 **API**: `https://your-domain.com/api`

---

## **📞 Need Help?**

If you get stuck:

1. **Check logs**: `pm2 logs` and `sudo tail -f /var/log/nginx/error.log`
2. **Google the error message**
3. **Check StackOverflow**
4. **Review this guide step-by-step**

---

**Built for SMD Tunisie** 🛠️  
*From zero to deployed in one day!*

**Last Updated**: October 29, 2025
