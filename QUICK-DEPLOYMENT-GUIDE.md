# ⚡ Quick Deployment Guide

## 🎯 **Your Server Setup**

| Component | Location | URL |
|-----------|----------|-----|
| **Backend API** | VPS: `51.75.143.218` | `http://51.75.143.218:3001/api` |
| **Customer Frontend** | Shared Hosting | `https://www.catalogquienquillerie.sqb-tunisie.com` |
| **Admin Dashboard** | Shared Hosting | `https://www.admin-dashboard.sqb-tunisie.com` |

---

## 🚀 **3-Step Deployment**

### **Step 1: Deploy Backend to VPS** (30 minutes)

```bash
# 1. SSH into your VPS
ssh root@51.75.143.218

# 2. Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PostgreSQL (if not installed)
sudo apt-get install -y postgresql postgresql-contrib

# 4. Install PM2 globally
npm install -g pm2

# 5. Create project directory
mkdir -p /var/www/smd-backend
cd /var/www/smd-backend

# 6. Upload your backend files
# From your local machine:
scp -r ./backend/* root@51.75.143.218:/var/www/smd-backend/

# 7. Back on VPS - Install dependencies
cd /var/www/smd-backend
npm install --production

# 8. Setup PostgreSQL database
sudo -u postgres psql
CREATE DATABASE smd_hardware;
CREATE USER smd_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE smd_hardware TO smd_user;
\q

# 9. Create .env file
nano .env
# Copy contents from .env.production.example
# Update DATABASE_URL with your password
# Save and exit (Ctrl+X, Y, Enter)

# 10. Run database migrations
npx prisma migrate deploy

# 11. Seed admin user
npm run seed

# 12. Start backend with PM2
pm2 start npm --name "smd-backend" -- start
pm2 startup
pm2 save

# 13. Test backend
curl http://localhost:3001/api/health
```

### **Step 2: Deploy Customer Frontend** (10 minutes)

```bash
# On your local machine

# 1. Navigate to project folder
cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project

# 2. Run deployment script
./deploy-customer-frontend.sh

# 3. Upload dist/ folder to shared hosting
# Via FTP, cPanel File Manager, or command line:
# - Login to cPanel
# - Go to File Manager
# - Navigate to public_html/ (or catalogquienquillerie subdirectory)
# - Upload all files from dist/ folder
# - Make sure .htaccess is included

# 4. Test the site
# Visit: https://www.catalogquienquillerie.sqb-tunisie.com
```

### **Step 3: Deploy Admin Dashboard** (10 minutes)

```bash
# On your local machine

# 1. Navigate to admin dashboard folder
cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project/admin-dashboard

# 2. Run deployment script
./deploy-admin-dashboard.sh

# 3. Upload dist/ folder to shared hosting
# Via FTP, cPanel File Manager, or command line:
# - Login to cPanel
# - Go to File Manager
# - Navigate to admin-dashboard subdomain root
# - Upload all files from dist/ folder
# - Make sure .htaccess is included

# 4. Test the admin dashboard
# Visit: https://www.admin-dashboard.sqb-tunisie.com
# Login with admin credentials
```

---

## ✅ **Verification Checklist**

### **Backend (VPS):**
- [ ] SSH access works
- [ ] PostgreSQL is running: `sudo systemctl status postgresql`
- [ ] Backend is running: `pm2 status`
- [ ] Health check works: `curl http://51.75.143.218:3001/api/health`
- [ ] Categories API works: `curl http://51.75.143.218:3001/api/categories`

### **Customer Frontend:**
- [ ] Site loads: https://www.catalogquienquillerie.sqb-tunisie.com
- [ ] HTTPS works (green padlock)
- [ ] Can browse categories
- [ ] Can view products
- [ ] Can add to cart
- [ ] No console errors

### **Admin Dashboard:**
- [ ] Site loads: https://www.admin-dashboard.sqb-tunisie.com
- [ ] HTTPS works (green padlock)
- [ ] Can login
- [ ] Can view categories
- [ ] Can create category
- [ ] Can upload images
- [ ] No console errors

---

## 🔧 **Common Issues & Fixes**

### **Issue: CORS Error**
```bash
# On VPS, edit backend .env
nano /var/www/smd-backend/.env

# Add/update CORS_ORIGIN:
CORS_ORIGIN=https://www.catalogquienquillerie.sqb-tunisie.com,https://www.admin-dashboard.sqb-tunisie.com

# Restart backend
pm2 restart smd-backend
```

### **Issue: API Connection Failed**
```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs smd-backend

# Restart backend
pm2 restart smd-backend
```

### **Issue: Database Connection Failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check .env DATABASE_URL
nano /var/www/smd-backend/.env

# Test database connection
sudo -u postgres psql -d smd_hardware -c "SELECT 1;"
```

### **Issue: 404 on Frontend Routes**
```bash
# Make sure .htaccess is uploaded
# Check if mod_rewrite is enabled on shared hosting
# Contact hosting support if needed
```

### **Issue: Images Not Loading**
```bash
# Check CORS on backend
# Check upload directory permissions
sudo chmod -R 755 /var/www/smd-backend/uploads
```

---

## 📞 **Quick Commands**

### **Backend Management:**
```bash
# SSH to VPS
ssh root@51.75.143.218

# Check backend status
pm2 status

# View logs
pm2 logs smd-backend

# Restart backend
pm2 restart smd-backend

# Stop backend
pm2 stop smd-backend

# Check database
sudo -u postgres psql -d smd_hardware
```

### **Frontend Rebuild:**
```bash
# Customer Frontend
cd project
./deploy-customer-frontend.sh

# Admin Dashboard
cd admin-dashboard
./deploy-admin-dashboard.sh
```

---

## 🔐 **Security Reminders**

1. **Change default passwords** in backend .env
2. **Use strong JWT secrets** (min 32 characters)
3. **Enable firewall** on VPS: `sudo ufw enable`
4. **Keep Node.js updated**: `npm install -g n && n lts`
5. **Regular backups** of PostgreSQL database
6. **Monitor PM2 logs** regularly

---

## 📊 **Monitoring**

### **Backend Health:**
```bash
# Check if backend is responding
curl http://51.75.143.218:3001/api/health

# Check PM2 status
pm2 status

# Monitor in real-time
pm2 monit
```

### **Database Health:**
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Check database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('smd_hardware'));"

# Check connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 🎉 **You're Done!**

Your complete e-commerce system is now deployed:

✅ **Backend API** running on VPS  
✅ **Customer Frontend** on shared hosting  
✅ **Admin Dashboard** on shared hosting  

**Test URLs:**
- Customer: https://www.catalogquienquillerie.sqb-tunisie.com
- Admin: https://www.admin-dashboard.sqb-tunisie.com
- API: http://51.75.143.218:3001/api

---

**Need help?** Check `PRODUCTION-DEPLOYMENT-CONFIG.md` for detailed configuration.

*SMD Tunisie Hardware Store - Deployed and Ready!* 🚀
