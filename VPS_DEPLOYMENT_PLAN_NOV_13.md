# 🚀 VPS Deployment Plan - November 13, 2025

## 📋 **DEPLOYMENT OVERVIEW**

**Purpose:** Deploy latest code with French localization and TND currency updates  
**Target VPS:** vps-31bc60e9 (51.75.143.218)  
**Estimated Time:** 45-60 minutes  
**Downtime:** ~5 minutes  
**Risk Level:** 🟢 LOW

---

## 🎯 **WHAT WE'RE DEPLOYING**

### **Latest Commit:**
- **Hash:** `8e7644c`
- **Branch:** `main`
- **Date:** November 13, 2025, 1:01 AM

### **Key Updates:**
1. ✅ **French Localization** - Product Creation Page fully translated
2. ✅ **TND Currency** - All prices with 3 decimal places
3. ✅ **Critical Fixes** - All TypeScript errors resolved
4. ✅ **Size/Pack System** - Complete implementation
5. ✅ **B2B Features** - Enhanced quotation workflow

### **Files Changed:**
- 132 files modified
- +27,490 lines added
- -1,158 lines removed

---

## 📊 **CURRENT VPS STATUS**

### **System:**
- **OS:** Ubuntu 22.04.5 LTS
- **Disk:** 11GB free (86% used) ⚠️
- **Memory:** 1.1GB available
- **Docker:** 27.3.1 ✅

### **Running Services:**
- **Backend:** Port 3001 (smd-backend container)
- **Database:** PostgreSQL 15 (smd-postgres container)
- **Web Server:** NGINX (ports 80, 443)

### **Current Setup:**
- **Backend Path:** `/var/www/smd-store/backend/`
- **Docker Path:** `/var/www/smd-backend/`
- **Git Repo:** `https://github.com/Dami-4-21/smd-hardware-store.git`
- **Current Branch:** `master` (needs to switch to `main`)

### **CORS Configuration:**
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,https://smd-hardware-store.netlify.app,https://smd-customer-shop.netlify.app
```

---

## ⚠️ **PRE-DEPLOYMENT CHECKS**

### **Issues to Address:**

#### **1. Branch Name Changed** 🔴
- **Current:** `master`
- **New:** `main`
- **Action:** Update git remote tracking

#### **2. CORS Needs Update** 🟡
- **Missing:** `localhost:5175`, `localhost:5176`
- **Action:** Add to CORS_ORIGIN

#### **3. Disk Space Low** 🟡
- **Current:** 86% used
- **Action:** Clean Docker before deployment

#### **4. Node.js Version** 🟡
- **Current:** v12.22.9
- **Recommended:** v18+
- **Action:** Update in Dockerfile (optional)

---

## 🎯 **DEPLOYMENT PLAN**

### **PHASE 1: BACKUP & PREPARATION** (10 minutes)

```bash
# 1. SSH into VPS
ssh root@51.75.143.218

# 2. Create backup directory
mkdir -p /root/backups/$(date +%Y%m%d_%H%M%S)
cd /root/backups/$(date +%Y%m%d_%H%M%S)

# 3. Backup database
echo "📦 Backing up database..."
docker exec smd-postgres pg_dump -U smd_user smd_hardware > database_backup.sql
echo "✅ Database backed up"

# 4. Backup .env files
echo "📦 Backing up environment files..."
cp /var/www/smd-store/backend/.env backend_env_backup
cp /var/www/smd-backend/.env docker_env_backup 2>/dev/null || echo "No docker .env"
echo "✅ Environment files backed up"

# 5. Check disk space
echo "💾 Checking disk space..."
df -h | grep -E "Filesystem|/dev/"

# 6. Clean Docker (if needed)
echo "🧹 Cleaning Docker..."
docker system prune -f
echo "✅ Docker cleaned"
```

---

### **PHASE 2: UPDATE GIT CONFIGURATION** (5 minutes)

```bash
# Navigate to backend directory
cd /var/www/smd-store/backend

# Check current status
echo "📊 Current git status:"
git status
git branch -a

# Update remote to track main branch
echo "🔄 Updating git configuration..."
git fetch origin
git branch -m master main 2>/dev/null || echo "Already on main"
git branch -u origin/main main

# Verify
git branch -vv
```

---

### **PHASE 3: PULL LATEST CODE** (5 minutes)

```bash
# Still in /var/www/smd-store/backend

# Stash any local changes
echo "💾 Stashing local changes..."
git stash

# Pull latest code from main branch
echo "⬇️ Pulling latest code..."
git pull origin main

# Verify we got the latest commit
echo "✅ Verifying commit..."
git log -1 --oneline
# Should show: 8e7644c feat: Complete French localization...

# Check what changed
git log --oneline -5
```

---

### **PHASE 4: UPDATE ENVIRONMENT VARIABLES** (5 minutes)

```bash
# Edit backend .env file
nano /var/www/smd-store/backend/.env
```

**Update these lines:**

```env
# Update CORS to include all ports
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,https://smd-hardware-store.netlify.app,https://smd-customer-shop.netlify.app,https://admin-smd-hardware.netlify.app

# Verify these are set correctly:
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://smd_user:YOUR_PASSWORD@localhost:5432/smd_hardware?schema=public"
JWT_SECRET=YOUR_SECRET
JWT_REFRESH_SECRET=YOUR_REFRESH_SECRET
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

**Verify changes:**
```bash
grep "CORS_ORIGIN" /var/www/smd-store/backend/.env
```

---

### **PHASE 5: INSTALL DEPENDENCIES & RUN MIGRATIONS** (10 minutes)

```bash
# Navigate to backend
cd /var/www/smd-store/backend

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Run Prisma migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Verify database tables
echo "✅ Verifying database..."
docker exec smd-postgres psql -U smd_user -d smd_hardware -c "\dt" | grep -E "quotations|users|products"
```

**Expected tables:**
- ✅ `quotations`
- ✅ `quotation_items`
- ✅ `invoices`
- ✅ `users` (with B2B fields)
- ✅ `products` (with size/pack fields)

---

### **PHASE 6: BUILD & RESTART BACKEND** (10 minutes)

```bash
# Build TypeScript
echo "🔨 Building backend..."
cd /var/www/smd-store/backend
npm run build

# Check if build succeeded
if [ -d "dist" ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed - check errors"
  exit 1
fi

# Restart Docker container
echo "🔄 Restarting backend container..."
cd /var/www/smd-backend
docker-compose restart backend

# Wait for container to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Check container status
docker ps | grep smd-backend
```

---

### **PHASE 7: REBUILD FRONTEND APPS** (10 minutes)

#### **Admin Dashboard:**
```bash
# Navigate to admin dashboard
cd /var/www/smd-store/admin-dashboard

# Install dependencies
echo "📦 Installing admin dashboard dependencies..."
npm install

# Build admin dashboard
echo "🔨 Building admin dashboard..."
npm run build

# Check build output
ls -lh dist/
```

#### **Customer App:**
```bash
# Navigate to customer app
cd /var/www/smd-store

# Install dependencies
echo "📦 Installing customer app dependencies..."
npm install

# Build customer app
echo "🔨 Building customer app..."
npm run build

# Check build output
ls -lh dist/
```

---

### **PHASE 8: VERIFICATION & TESTING** (10 minutes)

```bash
# 1. Check backend health
echo "🏥 Checking backend health..."
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"..."}

# 2. Check Docker containers
echo "🐳 Checking Docker containers..."
docker ps

# 3. Check backend logs
echo "📋 Checking backend logs..."
docker logs smd-backend --tail 50

# 4. Check database connection
echo "🗄️ Checking database..."
docker exec smd-postgres psql -U smd_user -d smd_hardware -c "SELECT COUNT(*) FROM users;"

# 5. Test API endpoints
echo "🧪 Testing API endpoints..."
curl http://localhost:3001/api/products | head -20
curl http://localhost:3001/api/categories | head -20

# 6. Check CORS
echo "🔒 Verifying CORS..."
grep CORS_ORIGIN /var/www/smd-store/backend/.env

# 7. Check disk space
echo "💾 Checking disk space..."
df -h | grep -E "Filesystem|/dev/"
```

---

## ✅ **SUCCESS CRITERIA**

Deployment is successful when:

- [ ] Backend health check returns `{"status":"ok"}`
- [ ] Docker containers are running (check with `docker ps`)
- [ ] Database has new tables (`quotations`, `invoices`)
- [ ] No errors in backend logs
- [ ] CORS includes all required origins
- [ ] Admin dashboard builds successfully
- [ ] Customer app builds successfully
- [ ] API endpoints respond correctly
- [ ] Disk space is acceptable (>5GB free)

---

## 🔄 **ROLLBACK PLAN**

If something goes wrong:

```bash
# 1. Stop backend
docker-compose -f /var/www/smd-backend/docker-compose.yml stop backend

# 2. Restore database
BACKUP_FILE=$(ls -t /root/backups/*/database_backup.sql | head -1)
docker exec -i smd-postgres psql -U smd_user -d smd_hardware < $BACKUP_FILE

# 3. Restore .env
BACKUP_ENV=$(ls -t /root/backups/*/backend_env_backup | head -1)
cp $BACKUP_ENV /var/www/smd-store/backend/.env

# 4. Revert git
cd /var/www/smd-store/backend
git reset --hard HEAD~1

# 5. Restart backend
cd /var/www/smd-backend
docker-compose up -d backend
```

---

## 📝 **POST-DEPLOYMENT TASKS**

### **1. Test French Localization:**
```bash
# Access admin dashboard
# Go to Settings → General
# Change language to Français
# Navigate to Products → Add Product
# Verify all text is in French
```

### **2. Test TND Currency:**
```bash
# Access customer app
# View any product
# Verify price shows 3 decimals (e.g., 25.000 TND)
# Add to cart
# Go to checkout
# Verify all prices show 3 decimals
```

### **3. Test B2B Features:**
```bash
# Login as B2B customer
# Create a quotation
# Admin approves quotation
# Verify invoice is created
# Check all financial calculations
```

### **4. Monitor Logs:**
```bash
# Watch backend logs for errors
docker logs -f smd-backend

# Check for any errors
# Press Ctrl+C to stop watching
```

---

## 🆘 **TROUBLESHOOTING**

### **Issue: Build fails**
```bash
# Check Node.js version
node --version

# If too old, update:
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

### **Issue: Database migration fails**
```bash
# Check database connection
docker exec smd-postgres psql -U smd_user -d smd_hardware -c "SELECT version();"

# Reset migrations (CAREFUL!)
cd /var/www/smd-store/backend
npx prisma migrate reset --force
npx prisma migrate deploy
```

### **Issue: CORS errors**
```bash
# Verify CORS in .env
cat /var/www/smd-store/backend/.env | grep CORS

# Restart backend
docker-compose -f /var/www/smd-backend/docker-compose.yml restart backend
```

### **Issue: Out of disk space**
```bash
# Clean Docker aggressively
docker system prune -a --volumes -f

# Remove old logs
journalctl --vacuum-time=7d

# Check space
df -h
```

---

## 📞 **DEPLOYMENT CHECKLIST**

### **Before Starting:**
- [ ] Have SSH access to VPS (51.75.143.218)
- [ ] Have root or sudo access
- [ ] Have 1 hour available
- [ ] Reviewed this deployment plan
- [ ] Ready to test after deployment

### **During Deployment:**
- [ ] Phase 1: Backup complete
- [ ] Phase 2: Git updated to main branch
- [ ] Phase 3: Latest code pulled (commit 8e7644c)
- [ ] Phase 4: Environment variables updated
- [ ] Phase 5: Dependencies installed & migrations run
- [ ] Phase 6: Backend built & restarted
- [ ] Phase 7: Frontend apps rebuilt
- [ ] Phase 8: All verifications passed

### **After Deployment:**
- [ ] French localization working
- [ ] TND currency displaying correctly
- [ ] B2B features functional
- [ ] No console errors
- [ ] All tests passing
- [ ] Monitoring in place

---

## 🎯 **QUICK START COMMANDS**

### **Full Deployment Script:**

```bash
#!/bin/bash
# Save this as: deploy-nov13.sh

echo "🚀 Starting deployment..."
echo "📅 Date: $(date)"

# Phase 1: Backup
echo "📦 Phase 1: Creating backups..."
BACKUP_DIR="/root/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
docker exec smd-postgres pg_dump -U smd_user smd_hardware > $BACKUP_DIR/database_backup.sql
cp /var/www/smd-store/backend/.env $BACKUP_DIR/backend_env_backup
docker system prune -f

# Phase 2: Update Git
echo "🔄 Phase 2: Updating git configuration..."
cd /var/www/smd-store/backend
git fetch origin
git branch -m master main 2>/dev/null || true
git branch -u origin/main main

# Phase 3: Pull Code
echo "⬇️ Phase 3: Pulling latest code..."
git stash
git pull origin main
git log -1 --oneline

# Phase 4: Update .env (manual step)
echo "⚠️ Phase 4: MANUAL - Update CORS in .env file"
echo "Press Enter when done..."
read

# Phase 5: Dependencies & Migrations
echo "📦 Phase 5: Installing dependencies..."
npm install
npx prisma migrate deploy
npx prisma generate

# Phase 6: Build & Restart
echo "🔨 Phase 6: Building and restarting..."
npm run build
cd /var/www/smd-backend
docker-compose restart backend
sleep 10

# Phase 7: Frontend (optional)
echo "🎨 Phase 7: Building frontend apps..."
cd /var/www/smd-store/admin-dashboard
npm install && npm run build
cd /var/www/smd-store
npm install && npm run build

# Phase 8: Verify
echo "✅ Phase 8: Verifying deployment..."
curl http://localhost:3001/health
docker ps | grep smd

echo "🎉 Deployment complete!"
echo "📋 Check logs: docker logs smd-backend"
```

---

## 🎉 **READY TO DEPLOY!**

**When you're ready, follow these steps:**

1. **SSH into VPS:**
   ```bash
   ssh root@51.75.143.218
   ```

2. **Run deployment phases one by one** (recommended)
   - Follow each phase in order
   - Verify each step before proceeding

3. **OR use the automated script** (faster)
   - Copy the script above
   - Save as `deploy-nov13.sh`
   - Run: `bash deploy-nov13.sh`

---

**Deployment Confidence:** 🟢 **HIGH**  
**Estimated Time:** 45-60 minutes  
**Risk Level:** LOW (backups included)  
**Status:** ✅ **READY TO GO!**

**Let me know when you want to start the deployment!** 🚀
