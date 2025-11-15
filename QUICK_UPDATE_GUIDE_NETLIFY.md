# 🚀 Quick Update Guide - Netlify + VPS Setup

**Last Updated**: November 15, 2025  
**Based on**: Previous session (Nov 13, 2025) + Current deployment

---

## 📌 Your Current Setup

### **Frontend (Netlify)** - Automatic ✅
- **Admin Dashboard**: Auto-deploys from GitHub
- **Customer Shop**: Auto-deploys from GitHub  
- **Trigger**: Push to `main` branch
- **Build Time**: 2-5 minutes
- **Action Required**: NONE (automatic)

### **Backend (VPS)** - Manual 🐳
- **IP**: 51.75.143.218
- **Container**: Docker
- **Database**: PostgreSQL (Docker)
- **Port**: 3001
- **Action Required**: Manual update (if backend code changed)

---

## ⚡ Quick Update Process (10 minutes)

### **Step 1: Check What Changed** (2 min)
```bash
# On your local machine
cd /path/to/SmartCatalogueproject
git log --oneline -5

# Check if backend files changed:
git diff HEAD~1 HEAD backend/
```

### **Step 2: Netlify Status** (2 min)
1. Go to https://app.netlify.com
2. Check both sites:
   - Admin Dashboard
   - Customer Shop
3. Status should be "Published" or "Deploying"
4. **If "Deploying"**: Wait for it to finish

### **Step 3: Update Backend (Only if needed)** (5 min)
```bash
# SSH to VPS
ssh root@51.75.143.218

# Navigate to backend
cd /var/www/smd-store/backend

# Check current version
git log -1 --oneline

# Pull latest
git pull origin main

# If code changed, rebuild:
docker-compose build backend
docker-compose up -d backend

# Verify
curl http://localhost:3001/health
```

### **Step 4: Verify** (1 min)
- ✅ Check admin dashboard in browser
- ✅ Check customer shop in browser
- ✅ Test a few features

---

## 🎯 When to Update What

### **Frontend Changed** (Admin/Customer UI)
- ✅ **Netlify handles it automatically**
- ⏱️ Wait 2-5 minutes for build
- 🔄 Refresh browser to see changes
- ❌ **Don't touch VPS**

### **Backend Changed** (API/Database)
- 🔧 **Manual update on VPS required**
- ⏱️ Takes 5 minutes
- 🐳 Use Docker commands
- ✅ Test with `curl` commands

### **Both Changed**
1. Wait for Netlify to finish (automatic)
2. Then update VPS backend (manual)
3. Verify both work together

---

## 🚨 Common Issues & Solutions

### **Issue 1: CORS Error**
**Symptom**: Frontend can't connect to backend

**Solution**:
```bash
# SSH to VPS
ssh root@51.75.143.218

# Check CORS config
grep CORS_ORIGIN /var/www/smd-store/backend/.env

# Should include your Netlify URLs:
# CORS_ORIGIN=http://localhost:5173,https://your-admin.netlify.app,https://your-customer.netlify.app

# If missing, edit:
nano /var/www/smd-store/backend/.env

# Add your Netlify URLs to CORS_ORIGIN
# Save: Ctrl+X, Y, Enter

# Restart backend
cd /var/www/smd-backend
docker-compose restart backend
```

### **Issue 2: Netlify Build Fails**
**Symptom**: Netlify shows "Failed" status

**Solution**:
1. Check build logs in Netlify dashboard
2. Common causes:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies
3. Fix locally, commit, push again

### **Issue 3: Backend Won't Start**
**Symptom**: `curl http://localhost:3001/health` fails

**Solution**:
```bash
# Check logs
docker logs smd-backend --tail 50

# Common causes:
# - Database not running
# - Port already in use
# - Environment variables missing

# Restart everything:
docker-compose down
docker-compose up -d

# Check status:
docker ps
```

---

## 📋 Pre-Update Checklist

Before updating, verify:

- [ ] Code is pushed to GitHub (`main` branch)
- [ ] No uncommitted changes locally
- [ ] Netlify builds are complete
- [ ] You have VPS SSH access
- [ ] You have backup of database (if major changes)

---

## 🔍 Quick Health Check Commands

### **Check Netlify**
```bash
# In browser:
# https://app.netlify.com
# Look for "Published" status
```

### **Check VPS Backend**
```bash
ssh root@51.75.143.218

# Backend health
curl http://localhost:3001/health

# Docker status
docker ps

# Backend logs
docker logs smd-backend --tail 20

# Database status
docker exec $(docker ps -qf "name=postgres") pg_isready
```

### **Check Frontend (in browser)**
```bash
# Admin Dashboard
https://your-admin.netlify.app

# Customer Shop
https://your-customer.netlify.app

# Check browser console for errors (F12)
```

---

## 📝 Update Log Template

Keep track of updates:

```
Date: [DATE]
Commit: [GIT HASH]
Changes: [WHAT CHANGED]
Frontend: [Netlify auto-deployed ✅]
Backend: [Updated manually ✅ / No changes ❌]
Issues: [Any problems encountered]
Status: [SUCCESS / FAILED]
```

---

## 🎯 Remember

### **DO:**
✅ Push to GitHub first  
✅ Wait for Netlify to finish  
✅ Backup database before major changes  
✅ Test after updating  
✅ Check CORS if frontend can't connect  

### **DON'T:**
❌ Update VPS before Netlify finishes  
❌ Skip database backup  
❌ Forget to restart backend after changes  
❌ Update production without testing locally  
❌ Change .env without restarting services  

---

## 🆘 Emergency Rollback

If something breaks:

### **Rollback Frontend (Netlify)**
1. Go to Netlify dashboard
2. Click on the site
3. Go to "Deploys"
4. Find previous working deploy
5. Click "..." → "Publish deploy"

### **Rollback Backend (VPS)**
```bash
ssh root@51.75.143.218
cd /var/www/smd-store/backend

# Find previous commit
git log --oneline -10

# Rollback to previous commit
git reset --hard PREVIOUS_COMMIT_HASH

# Rebuild and restart
docker-compose build backend
docker-compose up -d backend

# Verify
curl http://localhost:3001/health
```

---

## 📞 Quick Reference

### **VPS Access**
```bash
ssh root@51.75.143.218
```

### **Backend Path**
```bash
cd /var/www/smd-store/backend
```

### **Docker Commands**
```bash
# Status
docker ps

# Logs
docker logs smd-backend --tail 50

# Restart
docker-compose restart backend

# Rebuild
docker-compose build backend
docker-compose up -d backend

# Stop all
docker-compose down

# Start all
docker-compose up -d
```

### **Useful Checks**
```bash
# Backend health
curl http://localhost:3001/health

# Git status
git log -1 --oneline
git status

# CORS config
grep CORS_ORIGIN .env

# Database status
docker exec $(docker ps -qf "name=postgres") pg_isready
```

---

## 🎉 Success Indicators

Update is successful when:

- ✅ Netlify shows "Published" (green)
- ✅ `curl http://localhost:3001/health` returns OK
- ✅ Admin dashboard loads in browser
- ✅ Customer shop loads in browser
- ✅ No CORS errors in browser console
- ✅ Features work as expected

---

**Remember**: Netlify = Automatic, VPS = Manual

**Your setup is working great! Just follow this guide for smooth updates.** 🚀
