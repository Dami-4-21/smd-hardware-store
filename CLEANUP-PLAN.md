# 🗑️ WooCommerce Cleanup Plan

## What Will Be Deleted

### ✅ Safe to Delete (WooCommerce-related):

#### 1. **wordpress-plugin/** folder
- `wordpress-plugin/size-manager/` - Old WooCommerce size manager plugin
- `wordpress-plugin/updated-size-manager/` - Updated version
- `wordpress-plugin/INSTALLATION-GUIDE.md` - Plugin installation guide
- **Why delete**: You're using custom Node.js API now, not WordPress/WooCommerce

#### 2. **netlify/** folder
- `netlify/functions/api.ts` - Old serverless functions for WooCommerce API
- **Why delete**: You're deploying backend to VPS with Docker, not Netlify Functions

#### 3. **Old Deployment Scripts**
- `deploy.sh` - Old deployment script for WooCommerce setup
- `build-and-deploy.sh` - Old build script
- `deploy-customer-frontend.sh` - Outdated deployment script
- **Why delete**: You have new comprehensive deployment guides

#### 4. **Old Test Files**
- `test-api.js` - Tests WooCommerce API connection
- `test-complete-flow.sh` - Tests old workflow
- **Why delete**: These test WooCommerce, not your custom API

#### 5. **Duplicate/Old Config Files**
- `package-backend.json` - Duplicate of backend/package.json
- `.env.backend` - Duplicate of backend/.env
- **Why delete**: Duplicates cause confusion

#### 6. **Old Documentation**
- `CLEANUP-SUMMARY.md` - Already cleaned up
- Any WooCommerce migration docs
- **Why delete**: No longer relevant

---

## ⚠️ Keep These Files (Important):

### ✅ **Keep - Current Application:**
- `src/` - Your React customer frontend
- `admin-dashboard/` - Your admin dashboard
- `backend/` - Your Node.js API
- `dist/` - Built files (can rebuild anytime)

### ✅ **Keep - New Deployment Guides:**
- `PRODUCTION-DEPLOYMENT-ARCHITECTURE.md`
- `VPS-SETUP.md`
- `DOCKER-SETUP.md`
- `BACKEND-DEPLOYMENT.md`
- `NGINX-SSL-SETUP.md`
- `FRONTEND-DEPLOYMENT.md`
- `UPDATE-PROCEDURES.md`
- `TROUBLESHOOTING.md`
- `DEPLOYMENT-COMPLETE-GUIDE.md`
- `QUICK-REFERENCE.md`

### ✅ **Keep - Configuration:**
- `package.json` - Customer frontend dependencies
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `.env` - Environment variables
- `.env.production` - Production environment
- `.gitignore` - Git ignore rules

### ✅ **Keep - Documentation:**
- `README.md` - Project overview
- Feature-specific guides (CUSTOMER-MANAGEMENT-GUIDE.md, etc.)
- Integration guides

---

## 🚀 How to Clean Up

### Option 1: Automated Cleanup (Recommended)

```bash
# Navigate to project root
cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project

# Make script executable
chmod +x cleanup-woocommerce.sh

# Run cleanup (creates backup first)
./cleanup-woocommerce.sh
```

**What it does:**
1. ✅ Creates backup in `.cleanup-backup/` folder
2. ✅ Deletes all WooCommerce-related files
3. ✅ Deletes old scripts and tests
4. ✅ Shows summary of what was deleted

### Option 2: Manual Cleanup

```bash
# Delete WordPress plugins
rm -rf wordpress-plugin/

# Delete Netlify functions
rm -rf netlify/

# Delete old scripts
rm -f deploy.sh build-and-deploy.sh deploy-customer-frontend.sh

# Delete old tests
rm -f test-api.js test-complete-flow.sh

# Delete duplicates
rm -f package-backend.json .env.backend

# Delete old docs
rm -f CLEANUP-SUMMARY.md
```

---

## 📊 Before & After

### Before Cleanup:
```
project/
├── wordpress-plugin/        ← DELETE (WooCommerce)
├── netlify/                 ← DELETE (old serverless)
├── deploy.sh                ← DELETE (old script)
├── test-api.js              ← DELETE (WooCommerce test)
├── package-backend.json     ← DELETE (duplicate)
├── .env.backend             ← DELETE (duplicate)
├── src/                     ✓ KEEP
├── admin-dashboard/         ✓ KEEP
├── backend/                 ✓ KEEP
└── [deployment guides]      ✓ KEEP
```

### After Cleanup:
```
project/
├── src/                     ✓ Customer frontend
├── admin-dashboard/         ✓ Admin dashboard
├── backend/                 ✓ Node.js API
├── dist/                    ✓ Built files
├── [deployment guides]      ✓ Deployment docs
├── package.json             ✓ Config
├── vite.config.ts           ✓ Config
└── .env files               ✓ Config
```

**Result**: Clean, focused project ready for deployment! 🎯

---

## ✅ Verification After Cleanup

Run these commands to verify everything still works:

```bash
# 1. Customer frontend still builds
npm run build

# 2. Admin dashboard still builds
cd admin-dashboard
npm run build
cd ..

# 3. Backend still works
cd backend
npm install
npm run build
cd ..
```

All should work perfectly! ✓

---

## 🆘 If Something Goes Wrong

Don't worry! The cleanup script creates a backup:

```bash
# Restore from backup
cp -r .cleanup-backup/* .

# Or restore specific file
cp .cleanup-backup/deploy.sh .
```

---

## 🎯 Ready to Clean?

Run the cleanup script when you're ready:

```bash
./cleanup-woocommerce.sh
```

Then proceed with deployment! 🚀
