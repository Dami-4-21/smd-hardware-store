# 🔄 Git Setup Guide - Fresh Start

## ✅ What Was Done

1. ✅ Deleted old `.git` repository
2. ✅ Updated `.gitignore` with comprehensive rules
3. ✅ Ready for fresh Git initialization

---

## 🚀 How to Initialize Git Properly

### Step 1: Verify Clean State

```bash
# Navigate to project root
cd /home/cube/Documents/theBricoHouse/UpdatedCatalog/project-20251027T071334Z-1-001/project

# Verify .git is gone
ls -la | grep .git
# Should show only .gitignore (not .git/)

# Check what will be committed
ls -la
```

---

### Step 2: Create GitHub Repository

**Before initializing Git locally, create the repository on GitHub:**

1. Go to: https://github.com
2. Click "+" → "New repository"
3. Repository name: `smd-hardware-store` (or your preferred name)
4. Description: "SMD Tunisie Hardware Store - E-commerce Platform"
5. **Keep it Private** (recommended for now)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click "Create repository"

**Save the repository URL** (you'll need it):
```
https://github.com/YOUR_USERNAME/smd-hardware-store.git
```

---

### Step 3: Initialize Git Locally

```bash
# Initialize new Git repository
git init

# Check status
git status
# Should show untracked files
```

---

### Step 4: Review What Will Be Committed

```bash
# See what files will be added
git status

# Make sure these are NOT listed (should be ignored):
# ❌ node_modules/
# ❌ dist/
# ❌ .env files
# ❌ uploads/
# ❌ backups/

# If you see any of these, check .gitignore
```

---

### Step 5: Add Files to Git

```bash
# Add all files (respecting .gitignore)
git add .

# Check what was staged
git status

# You should see:
# ✅ src/
# ✅ admin-dashboard/src/
# ✅ backend/src/
# ✅ package.json files
# ✅ configuration files
# ✅ documentation files
```

---

### Step 6: Create First Commit

```bash
# Create initial commit
git commit -m "Initial commit: SMD Hardware Store - Production ready

- Customer frontend (React + TypeScript)
- Admin dashboard (React + TypeScript)
- Backend API (Node.js + Express + PostgreSQL)
- Docker deployment configuration
- Comprehensive deployment guides
- All features implemented and tested"

# Verify commit
git log --oneline
```

---

### Step 7: Connect to GitHub

```bash
# Add remote repository (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/smd-hardware-store.git

# Verify remote
git remote -v
# Should show:
# origin  https://github.com/YOUR_USERNAME/smd-hardware-store.git (fetch)
# origin  https://github.com/YOUR_USERNAME/smd-hardware-store.git (push)
```

---

### Step 8: Push to GitHub

```bash
# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main

# Enter your GitHub credentials when prompted
```

---

### Step 9: Verify on GitHub

1. Go to your GitHub repository
2. Refresh the page
3. You should see all your files!

---

## 📋 What Should Be in Git

### ✅ **Should Be Committed:**

```
✓ src/                          (Customer frontend source)
✓ admin-dashboard/src/          (Admin source)
✓ backend/src/                  (Backend source)
✓ backend/prisma/               (Database schema)
✓ package.json files            (Dependencies list)
✓ tsconfig.json files           (TypeScript config)
✓ vite.config.ts                (Vite config)
✓ tailwind.config.js            (Tailwind config)
✓ .gitignore                    (Git ignore rules)
✓ README.md                     (Documentation)
✓ Deployment guides             (All .md files)
✓ Dockerfile                    (Docker config)
✓ docker-compose.yml            (Docker Compose config)
```

### ❌ **Should NOT Be Committed:**

```
✗ node_modules/                 (Dependencies - too large)
✗ dist/                         (Build output - regenerated)
✗ .env files                    (Secrets - NEVER commit!)
✗ uploads/                      (User uploads)
✗ backups/                      (Database backups)
✗ .cleanup-backup/              (Temporary backup)
✗ backend/dist/                 (Compiled backend)
✗ *.log                         (Log files)
```

---

## 🔐 Important: Environment Variables

### **NEVER commit these files:**
- `.env`
- `.env.local`
- `.env.production`
- `backend/.env`

### **Instead, create example files:**

```bash
# Create example environment file
cat > .env.example << 'EOF'
# Customer Frontend Environment Variables
VITE_API_URL=https://your-api-url.com/api
EOF

# Create backend example
cat > backend/.env.example << 'EOF'
# Backend Environment Variables
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/database
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=https://your-frontend-url.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@your-domain.com
SMTP_FROM_NAME=Your App Name
EOF

# Add example files to Git
git add .env.example backend/.env.example
git commit -m "Add environment variable examples"
git push
```

---

## 🔄 Daily Git Workflow

### **Making Changes:**

```bash
# 1. Check current status
git status

# 2. Add changed files
git add .

# 3. Commit with descriptive message
git commit -m "Description of what you changed"

# 4. Push to GitHub
git push
```

### **Good Commit Messages:**

```bash
# ✅ Good examples:
git commit -m "Add customer login functionality"
git commit -m "Fix product image upload bug"
git commit -m "Update deployment documentation"
git commit -m "Improve admin dashboard performance"

# ❌ Bad examples:
git commit -m "update"
git commit -m "fix"
git commit -m "changes"
```

---

## 🌿 Branching Strategy (Optional)

### **For organized development:**

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push feature branch
git push -u origin feature/new-feature

# Merge to main when ready
git checkout main
git merge feature/new-feature
git push
```

---

## 🆘 Common Issues

### **Issue: Accidentally committed .env file**

```bash
# Remove from Git (keeps local file)
git rm --cached .env
git rm --cached backend/.env

# Commit the removal
git commit -m "Remove environment files from Git"
git push
```

### **Issue: Committed node_modules**

```bash
# Remove from Git
git rm -r --cached node_modules
git rm -r --cached admin-dashboard/node_modules
git rm -r --cached backend/node_modules

# Commit
git commit -m "Remove node_modules from Git"
git push
```

### **Issue: Want to undo last commit**

```bash
# Undo last commit (keeps changes)
git reset --soft HEAD~1

# Undo last commit (discards changes)
git reset --hard HEAD~1
```

---

## ✅ Verification Checklist

After setting up Git, verify:

- [ ] Repository created on GitHub
- [ ] Local Git initialized
- [ ] .gitignore working correctly
- [ ] No .env files in Git
- [ ] No node_modules in Git
- [ ] No dist folders in Git
- [ ] First commit created
- [ ] Pushed to GitHub successfully
- [ ] Can see files on GitHub

---

## 🎯 Next Steps

After Git is set up:

1. ✅ Git repository configured
2. ➡️ **Continue with deployment** - Open [VPS-SETUP.md](./VPS-SETUP.md)
3. ➡️ Deploy backend to VPS
4. ➡️ Deploy frontends

---

## 📚 Useful Git Commands

```bash
# View commit history
git log --oneline

# View changes
git diff

# View remote URL
git remote -v

# Pull latest changes
git pull

# Clone repository (on another computer)
git clone https://github.com/YOUR_USERNAME/smd-hardware-store.git

# Check branch
git branch

# Switch branch
git checkout branch-name
```

---

**Your Git repository is now clean and ready!** 🎉

**Follow the steps above to reinitialize Git properly.**
