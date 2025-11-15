# 🛡️ SAFE UPDATE GUIDE - Step by Step

## 📋 **YOUR CURRENT SETUP** (From VPS Audit)

### **Domain & SSL:**
- **Domain:** catalogquienquillerie.sqb-tunisie.com
- **API URL:** https://catalogquienquillerie.sqb-tunisie.com/api
- **SSL:** Valid until 2026-02-04 ✅

### **VPS Details:**
- **IP:** 51.75.143.218
- **OS:** Ubuntu 22.04.5 LTS
- **Docker:** 27.3.1 ✅
- **Database:** PostgreSQL 15 ✅

### **Running Containers:**
1. **smd-backend** - Port 3001 (Backend API)
2. **smd-postgres** - Port 5432 (Database)
3. **smd-nginx** - Port 80 (HTTP)
4. **nginx-proxy** - Port 443 (HTTPS)

### **Current CORS:**
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,https://smd-hardware-store.netlify.app,https://smd-customer-shop.netlify.app
```

### **Backend Location:**
- **Path:** `/var/www/smd-store/backend/`
- **Git Branch:** `master` (needs to switch to `main`)
- **Last Commit:** bc260b6 (Fix banner controller)

---

## 🎯 **WHAT WE'RE UPDATING**

### **Latest Commit:** 8e7644c
- ✅ French Localization (Admin Dashboard)
- ✅ TND Currency (Customer App)
- ✅ Bug Fixes (TypeScript errors)

---

## 📝 **STEP-BY-STEP UPDATE PROCESS**

### **STEP 1: CHECK CURRENT STATUS** ✅ (START HERE)

**Action:** Let's verify everything is working before we change anything.

```bash
# Connect to VPS
ssh root@51.75.143.218
```

**After you connect, tell me: "Connected to VPS"**

⏸️ **STOP - Wait for your confirmation before proceeding**

---

### **STEP 2: VERIFY RUNNING SERVICES** 🔍

**Action:** Check what's currently running (READ ONLY - no changes)

```bash
# Check Docker containers
docker ps

# Check backend health
curl http://localhost:3001/health

# Check backend version
cd /var/www/smd-store/backend
git log -1 --oneline
```

**Tell me what you see:**
- Are all 4 containers running? (smd-backend, smd-postgres, smd-nginx, nginx-proxy)
- Does health check return `{"status":"ok"}`?
- What's the current commit? (Should be: bc260b6)

⏸️ **STOP - Tell me the results**

---

### **STEP 3: CREATE BACKUP** 💾

**Action:** Backup database and .env before any changes

```bash
# Create backup directory with timestamp
mkdir -p /root/backups/$(date +%Y%m%d_%H%M%S)

# Backup database
echo "Backing up database..."
docker exec smd-postgres pg_dump -U smd_user smd_hardware > /root/backups/$(date +%Y%m%d_%H%M%S)/database_backup.sql

# Backup .env file
echo "Backing up .env..."
cp /var/www/smd-store/backend/.env /root/backups/$(date +%Y%m%d_%H%M%S)/env_backup

# Verify backups
ls -lh /root/backups/$(ls -t /root/backups/ | head -1)/
```

**Tell me:**
- Did the backup complete successfully?
- Do you see both files (database_backup.sql and env_backup)?

⏸️ **STOP - Confirm backups are created**

---

### **STEP 4: UPDATE GIT BRANCH** 🔄

**Action:** Switch from `master` to `main` branch

```bash
# Navigate to backend
cd /var/www/smd-store/backend

# Check current branch
git branch

# Fetch latest from GitHub
git fetch origin

# Switch to main branch
git checkout main

# Set upstream
git branch -u origin/main main

# Verify
git branch -vv
```

**Tell me:**
- Did the branch switch successfully?
- Are you now on `main` branch?

⏸️ **STOP - Confirm branch switched**

---

### **STEP 5: PULL LATEST CODE** ⬇️

**Action:** Get the latest code (commit 8e7644c)

```bash
# Still in /var/www/smd-store/backend

# Stash any local changes (if any)
git stash

# Pull latest code
git pull origin main

# Verify we got the right commit
git log -1 --oneline
```

**Expected output:** `8e7644c feat: Complete French localization...`

**Tell me:**
- Did the pull succeed?
- Do you see commit 8e7644c?
- Any errors?

⏸️ **STOP - Confirm code pulled**

---

### **STEP 6: UPDATE CORS (IMPORTANT)** 🔒

**Action:** Add missing CORS origins for Netlify

```bash
# Edit .env file
nano /var/www/smd-store/backend/.env
```

**Find this line:**
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,https://smd-hardware-store.netlify.app,https://smd-customer-shop.netlify.app
```

**Change it to:**
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,https://smd-hardware-store.netlify.app,https://smd-customer-shop.netlify.app,https://catalogquienquillerie.sqb-tunisie.com
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Verify the change:**
```bash
grep CORS_ORIGIN /var/www/smd-store/backend/.env
```

**Tell me:**
- Did you update the CORS line?
- Does it now include localhost:5175, localhost:5176, and your domain?

⏸️ **STOP - Confirm CORS updated**

---

### **STEP 7: INSTALL DEPENDENCIES** 📦

**Action:** Install any new npm packages

```bash
# Still in /var/www/smd-store/backend

# Install dependencies
npm install
```

**This may take 1-2 minutes**

**Tell me:**
- Did npm install complete successfully?
- Any errors or warnings?

⏸️ **STOP - Confirm dependencies installed**

---

### **STEP 8: RUN DATABASE MIGRATIONS** 🗄️

**Action:** Update database schema (if needed)

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify tables
docker exec smd-postgres psql -U smd_user -d smd_hardware -c "\dt" | grep -E "quotations|users|products"
```

**Tell me:**
- Did migrations run successfully?
- Do you see the tables listed?

⏸️ **STOP - Confirm migrations completed**

---

### **STEP 9: BUILD BACKEND** 🔨

**Action:** Compile TypeScript to JavaScript

```bash
# Build the backend
npm run build

# Check if build succeeded
ls -lh dist/
```

**Tell me:**
- Did the build complete successfully?
- Do you see the `dist` folder with files?

⏸️ **STOP - Confirm build succeeded**

---

### **STEP 10: RESTART BACKEND** 🔄

**Action:** Restart the backend container to apply changes

```bash
# Navigate to docker-compose location
cd /var/www/smd-backend

# Restart backend container
docker-compose restart backend

# Wait for it to start
sleep 10

# Check container status
docker ps | grep smd-backend

# Check logs
docker logs smd-backend --tail 20
```

**Tell me:**
- Is the container running?
- Any errors in the logs?

⏸️ **STOP - Confirm backend restarted**

---

### **STEP 11: VERIFY BACKEND HEALTH** ✅

**Action:** Test that backend is working

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test API endpoint
curl http://localhost:3001/api/products | head -20

# Check CORS is updated
grep CORS_ORIGIN /var/www/smd-store/backend/.env
```

**Tell me:**
- Does health check return `{"status":"ok"}`?
- Does the API respond?
- Is CORS showing the updated value?

⏸️ **STOP - Confirm backend is healthy**

---

### **STEP 12: TEST PRODUCTION** 🧪

**Action:** Test your live sites

**Test Admin Dashboard:**
1. Open: https://admin-smd-hardware.netlify.app (or your admin URL)
2. Login
3. Go to Settings → General
4. Change language to **Français**
5. Go to Products → Add Product
6. Check if text is in French

**Test Customer Shop:**
1. Open: https://smd-customer-shop.netlify.app (or your customer URL)
2. View any product
3. Check price shows **3 decimals** (e.g., 25.000 TND)
4. Add to cart
5. Go to checkout
6. Verify all prices show 3 decimals

**Tell me:**
- Is French localization working in admin?
- Are prices showing 3 decimals in customer shop?
- Any errors in browser console?

⏸️ **STOP - Confirm everything is working**

---

## 🎉 **COMPLETION CHECKLIST**

After all steps, verify:

- [ ] All Docker containers running
- [ ] Backend health check passes
- [ ] Database has latest schema
- [ ] CORS includes all origins
- [ ] French localization works
- [ ] TND currency shows 3 decimals
- [ ] No errors in logs
- [ ] Backups created successfully

---

## 🔄 **ROLLBACK PLAN** (If something goes wrong)

```bash
# Stop backend
docker-compose -f /var/www/smd-backend/docker-compose.yml stop backend

# Restore database
BACKUP_FILE=$(ls -t /root/backups/*/database_backup.sql | head -1)
docker exec -i smd-postgres psql -U smd_user -d smd_hardware < $BACKUP_FILE

# Restore .env
BACKUP_ENV=$(ls -t /root/backups/*/env_backup | head -1)
cp $BACKUP_ENV /var/www/smd-store/backend/.env

# Revert git
cd /var/www/smd-store/backend
git checkout bc260b6

# Restart backend
cd /var/www/smd-backend
docker-compose up -d backend
```

---

## 📞 **CURRENT STATUS**

**Ready to start?**

👉 **Begin with STEP 1:** Connect to your VPS

```bash
ssh root@51.75.143.218
```

**Then tell me: "Connected to VPS" and I'll guide you to Step 2!**

---

**Remember:** 
- ✅ We check everything before making changes
- ✅ We have backups ready
- ✅ We can rollback if needed
- ✅ We go one step at a time
- ✅ You confirm each step before proceeding

**Let's start! Connect to your VPS and let me know when you're ready!** 🚀
