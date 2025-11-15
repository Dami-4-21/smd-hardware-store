# ✅ Manual Deployment Checklist - sqb-tunisie.com

**Date**: November 15, 2025  
**Architecture**: Full VPS deployment (No Netlify)

---

## 📌 Domain Configuration

- **Backend API**: `www.catalogquienquillerie.sqb-tunisie.com` (Port 3001)
- **Admin Dashboard**: `sqb-tunisie.com/admin`
- **Customer Shop**: `sqb-tunisie.com/customer`

---

## 🔧 Configuration Changes Made

### **1. Vite Base Path** ✅
- **Customer Shop** (`vite.config.ts`): Added `base: '/customer/'`
- **Admin Dashboard** (`admin-dashboard/vite.config.ts`): Added `base: '/admin/'`

### **2. Environment Files Created** ✅
- `.env.production.example` - Customer shop API URL template
- `admin-dashboard/.env.production.example` - Admin dashboard API URL template

### **3. API URL Configuration**
Both should point to:
```
VITE_API_URL=https://www.catalogquienquillerie.sqb-tunisie.com/api
```

---

## 📝 Manual Deployment Steps

### **Step 1: Build Locally**

#### Build Customer Shop:
```bash
cd /path/to/SmartCatalogueproject

# Create .env.production
echo "VITE_API_URL=https://www.catalogquienquillerie.sqb-tunisie.com/api" > .env.production

# Build
npm install
npm run build

# Result: dist/ folder ready to upload
```

#### Build Admin Dashboard:
```bash
cd admin-dashboard

# Create .env.production
echo "VITE_API_URL=https://www.catalogquienquillerie.sqb-tunisie.com/api" > .env.production

# Build
npm install
npm run build

# Result: dist/ folder ready to upload
```

### **Step 2: Upload to VPS**

You can use any method you prefer:
- SCP/SFTP
- FileZilla
- rsync
- Direct build on VPS

**Target directories on VPS:**
- Admin: `/var/www/sqb-tunisie/admin/`
- Customer: `/var/www/sqb-tunisie/customer/`

### **Step 3: Backend Configuration**

Make sure backend `.env` includes:
```env
CORS_ORIGIN=https://sqb-tunisie.com,https://www.sqb-tunisie.com,https://www.catalogquienquillerie.sqb-tunisie.com
```

### **Step 4: Nginx Configuration**

Ensure nginx is configured to serve:
- `/admin` → Admin dashboard files
- `/customer` → Customer shop files
- API domain → Backend (port 3001)

### **Step 5: Test**

- [ ] https://sqb-tunisie.com/admin loads
- [ ] https://sqb-tunisie.com/customer loads
- [ ] https://www.catalogquienquillerie.sqb-tunisie.com/health returns OK
- [ ] No CORS errors in browser console
- [ ] Can login to admin
- [ ] Can browse products in customer shop

---

## 🎯 Quick Reference

### **What Changed:**
1. ✅ Added base paths to Vite configs
2. ✅ Created .env.production.example files
3. ✅ Updated documentation for new domain structure

### **What You Need to Do:**
1. Build both apps locally (or on VPS)
2. Upload dist folders to VPS
3. Configure nginx (if not already done)
4. Update backend CORS
5. Test everything

---

## 📚 Documentation Available

- **VPS_DOMAIN_SETUP.md** - Complete nginx config and setup guide
- **VPS_SAFE_UPDATE_ROADMAP.md** - Detailed update procedures
- **deploy-to-vps.sh** - Automated script (if you want to use it later)

---

## 🚀 Ready to Deploy

All code changes are ready. You can now:
1. Build the applications
2. Deploy to your VPS manually
3. Configure as needed

**Good luck with your manual deployment!** 🎯
