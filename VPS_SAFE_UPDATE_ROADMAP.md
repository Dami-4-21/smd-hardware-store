# VPS Safe Update Roadmap - Docker Strategy (Netlify + VPS)
**Date**: November 15, 2025  
**Objective**: Safely audit and update deployed application without disrupting existing configuration

---

## 📌 **CURRENT DEPLOYMENT ARCHITECTURE**

Based on previous session (Nov 13, 2025):

### **Frontend (Netlify) - AUTO-DEPLOYS** ✅
- **Admin Dashboard**: Deployed on Netlify
- **Customer Shop**: Deployed on Netlify
- **Auto-Deploy**: Triggers on GitHub push to `main`
- **Build Time**: 2-5 minutes
- **Status**: Working perfectly

### **Backend (VPS with Docker)** 🐳
- **VPS IP**: 51.75.143.218
- **Backend**: Running in Docker container
- **Database**: PostgreSQL in Docker
- **Port**: 3001 (backend API)
- **Status**: Working with B2B features

### **Previous Challenges Faced:**
1. ✅ **CORS Issues** - Resolved by adding Netlify URLs to CORS_ORIGIN
2. ✅ **Currency Format** - Fixed TND 3 decimals
3. ✅ **French Localization** - Completed for admin dashboard
4. ✅ **TypeScript Errors** - All resolved

---

## 🎯 Overview

This roadmap ensures a **zero-downtime update** by:
1. Auditing current VPS state (backend only)
2. Backing up existing configuration
3. Using Docker for isolated backend updates
4. Netlify handles frontend automatically
5. Rolling back if issues occur

---

## Phase 1: Pre-Update Audit (30 minutes)

### Step 1.0: Check Netlify Status FIRST ⚡
```bash
# Before touching VPS, verify Netlify deployments
# Go to: https://app.netlify.com
# Check both sites:
# 1. Admin Dashboard - Should show "Published" or "Deploying"
# 2. Customer Shop - Should show "Published" or "Deploying"
#
# ⚠️ IMPORTANT: Netlify auto-deploys when you push to GitHub
# If builds are in progress, WAIT for them to complete before updating VPS
```

### Step 1.1: Connect to VPS and Verify Access
```bash
# SSH into VPS (use your actual credentials)
ssh root@51.75.143.218

# Verify you're in the right location
cd /var/www/smd-store
pwd
ls -la
```

### Step 1.2: Check Current Application Status
```bash
# Check if using Docker
docker ps
docker-compose ps

# Check if using PM2
pm2 list

# Check if using systemd
systemctl status backend
systemctl status frontend

# Check nginx status
sudo systemctl status nginx

# Check which ports are in use
sudo netstat -tulpn | grep LISTEN
```

### Step 1.3: Document Current Configuration
```bash
# Create audit directory
mkdir -p ~/vps-audit-$(date +%Y%m%d)
cd ~/vps-audit-$(date +%Y%m%d)

# Save current environment variables (CRITICAL - Contains CORS config)
cp /var/www/smd-store/backend/.env ./backend-env-backup

# ⚠️ VERIFY CORS_ORIGIN includes Netlify URLs
echo "=== CURRENT CORS CONFIGURATION ===" > cors-check.txt
grep CORS_ORIGIN /var/www/smd-store/backend/.env >> cors-check.txt
cat cors-check.txt

# Save Docker configuration
cp /var/www/smd-backend/docker-compose.yml ./docker-compose-backup.yml 2>/dev/null || echo "No docker-compose found"

# Save nginx configuration (if exists)
sudo cp /etc/nginx/sites-available/* ./nginx-config-backup 2>/dev/null || echo "No nginx config"

# Document running processes
ps aux > running-processes.txt
docker ps -a > docker-containers.txt
docker images > docker-images.txt

# Check database status
docker ps | grep postgres > postgres-status.txt
docker exec $(docker ps -qf "name=postgres") pg_isready 2>/dev/null >> postgres-status.txt || echo "Check DB manually"

# Save current git state
cd /var/www/smd-store/backend
git log --oneline -5 > ~/vps-audit-$(date +%Y%m%d)/git-current-state.txt
git status > ~/vps-audit-$(date +%Y%m%d)/git-status.txt
git branch -v > ~/vps-audit-$(date +%Y%m%d)/git-branches.txt
```

### Step 1.4: Test Current Application
```bash
# Test backend health
curl http://localhost:3001/health

# Test backend API endpoints
curl http://localhost:3001/api/products?limit=5
curl http://localhost:3001/api/categories

# ⚠️ NOTE: Frontend is on Netlify, NOT on VPS
# Don't test localhost:5173 - that's only for local development
# Instead, check Netlify URLs in browser:
# - Admin: https://your-admin.netlify.app
# - Customer: https://your-customer.netlify.app

# Test database connection
docker exec $(docker ps -qf "name=postgres") psql -U postgres -c "SELECT version();"
```

### Step 1.5: Create Backup
```bash
# Backup database (CRITICAL - Contains all your data)
POSTGRES_CONTAINER=$(docker ps -qf "name=postgres")
docker exec $POSTGRES_CONTAINER pg_dumpall -U postgres > ~/vps-audit-$(date +%Y%m%d)/database-full-backup.sql

# Verify backup was created
ls -lh ~/vps-audit-$(date +%Y%m%d)/database-full-backup.sql

# Backup uploads directory (product images, etc.)
tar -czf ~/vps-audit-$(date +%Y%m%d)/uploads-backup.tar.gz /var/www/smd-store/backend/uploads/

# Create full backend backup (just in case)
cd /var/www
tar -czf ~/vps-audit-$(date +%Y%m%d)/backend-full-backup.tar.gz smd-store/backend/

# ⚠️ NOTE: Frontend is on Netlify, no need to backup frontend files on VPS
```

**✅ Checkpoint**: You now have a complete backup and audit trail.

---

## Phase 2: Prepare Docker Environment (20 minutes)

### Step 2.1: Check Docker Installation
```bash
# Verify Docker is installed
docker --version
docker-compose --version

# If not installed:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2.2: Review Docker Configuration
```bash
cd /path/to/project

# Check if docker-compose.yml exists
cat docker-compose.yml

# Check if Dockerfile exists
cat backend/Dockerfile
```

### Step 2.3: Verify Environment Variables
```bash
# Check backend .env
cat backend/.env | grep -v "PASSWORD\|SECRET\|KEY"

# Ensure all required variables are set:
# - DATABASE_URL
# - JWT_SECRET
# - CORS_ORIGIN
# - PORT
# - etc.
```

**✅ Checkpoint**: Docker environment is ready.

---

## Phase 3: Pull Latest Changes (10 minutes)

### Step 3.1: Fetch Updates
```bash
cd /path/to/project

# Check current branch
git branch

# Stash any local changes (if needed)
git stash

# Fetch latest changes
git fetch origin main

# Show what will change
git log HEAD..origin/main --oneline

# Show file changes
git diff HEAD..origin/main --stat
```

### Step 3.2: Review Changes
```bash
# Review specific files that changed
git diff HEAD..origin/main backend/src/
git diff HEAD..origin/main src/

# Check if package.json changed
git diff HEAD..origin/main backend/package.json
git diff HEAD..origin/main package.json

# Check if Prisma schema changed
git diff HEAD..origin/main backend/prisma/schema.prisma
```

### Step 3.3: Pull Changes
```bash
# Pull the changes
git pull origin main

# If you stashed changes, reapply them
git stash pop
```

**✅ Checkpoint**: Latest code is on VPS.

---

## Phase 4: Docker Update Strategy (30 minutes)

### Step 4.1: Build New Docker Images
```bash
cd /path/to/project

# Build backend image
docker-compose build backend

# Build frontend image (if using Docker for frontend)
docker-compose build frontend

# Or build manually:
cd backend
docker build -t smd-backend:latest .
cd ..
```

### Step 4.2: Test New Images (Without Stopping Current)
```bash
# Run new backend on different port for testing
docker run -d \
  --name backend-test \
  -p 3002:3001 \
  --env-file backend/.env \
  -e PORT=3001 \
  smd-backend:latest

# Wait a few seconds
sleep 5

# Test new backend
curl http://localhost:3002/health

# Check logs
docker logs backend-test

# If successful, stop test container
docker stop backend-test
docker rm backend-test
```

### Step 4.3: Update Database (If Schema Changed)
```bash
# Check if migrations are needed
cd backend

# Generate Prisma client
docker-compose run --rm backend npx prisma generate

# Run migrations (IMPORTANT: This affects production DB)
docker-compose run --rm backend npx prisma migrate deploy

# Verify migrations
docker-compose run --rm backend npx prisma migrate status
```

**⚠️ CRITICAL DECISION POINT**: If migrations ran successfully, proceed. If errors, STOP and investigate.

---

## Phase 5: Rolling Update (15 minutes)

### Step 5.1: Update Backend (Zero Downtime)
```bash
cd /path/to/project

# Start new backend container with different name
docker-compose up -d --no-deps --scale backend=2 backend

# Wait for new container to be healthy
sleep 10
curl http://localhost:3001/health

# If healthy, stop old container
docker-compose stop backend
docker-compose rm -f backend

# Rename new container
docker-compose up -d backend

# Verify
docker-compose ps
curl http://localhost:3001/health
```

### Step 5.2: Update Frontend
```bash
# Rebuild frontend
npm install
npm run build

# If using nginx, copy new build
sudo cp -r dist/* /var/www/html/

# Or if using Docker:
docker-compose up -d --no-deps --build frontend

# Reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5.3: Update Admin Dashboard (If Separate)
```bash
cd admin-dashboard
npm install
npm run build

# Copy to appropriate location
sudo cp -r dist/* /var/www/admin/

# Or update Docker container
docker-compose up -d --no-deps --build admin-dashboard
```

**✅ Checkpoint**: All services updated and running.

---

## Phase 6: Post-Update Verification (15 minutes)

### Step 6.1: Health Checks
```bash
# Check all containers
docker-compose ps

# Check backend health
curl http://localhost:3001/health

# Check backend logs
docker-compose logs backend --tail=50

# Check database connection
docker-compose exec backend npx prisma db pull --print

# Test API endpoints
curl http://localhost:3001/api/products?limit=5
curl http://localhost:3001/api/categories
```

### Step 6.2: Frontend Verification
```bash
# Check frontend is accessible
curl -I https://your-domain.com

# Check admin dashboard
curl -I https://your-domain.com/admin

# Check static assets
curl -I https://your-domain.com/assets/index.js
```

### Step 6.3: Functional Testing
```bash
# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# Test product listing
curl http://localhost:3001/api/products

# Test dashboard stats (with admin token)
curl http://localhost:3001/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 6.4: Monitor Logs
```bash
# Watch logs in real-time
docker-compose logs -f backend

# Check for errors
docker-compose logs backend | grep -i error
docker-compose logs backend | grep -i warning

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**✅ Checkpoint**: Application is working correctly.

---

## Phase 7: Cleanup (10 minutes)

### Step 7.1: Remove Old Images
```bash
# List all images
docker images

# Remove old/unused images
docker image prune -a

# Remove unused volumes (CAREFUL!)
docker volume prune
```

### Step 7.2: Document Update
```bash
cd ~/vps-audit-$(date +%Y%m%d)

# Save post-update state
docker ps > docker-containers-after.txt
docker images > docker-images-after.txt
git log --oneline -5 > git-state-after.txt

# Create update log
cat > update-log.txt <<EOF
Update Date: $(date)
Git Commit Before: $(cat git-current-state.txt | head -1)
Git Commit After: $(cd /path/to/project && git log --oneline -1)
Status: SUCCESS
Issues: None
Downtime: 0 minutes
EOF
```

### Step 7.3: Verify Backup Retention
```bash
# Keep last 7 days of backups
find ~/vps-audit-* -type d -mtime +7 -exec rm -rf {} \;

# Verify current backup exists
ls -lh ~/vps-audit-$(date +%Y%m%d)/
```

**✅ Checkpoint**: Cleanup complete, system documented.

---

## 🚨 Rollback Procedure (If Something Goes Wrong)

### Quick Rollback
```bash
cd /path/to/project

# Stop current containers
docker-compose down

# Restore previous git state
git log --oneline -10
git reset --hard PREVIOUS_COMMIT_HASH

# Restore database (if needed)
docker-compose up -d postgres
docker exec -i postgres-container psql -U your-db-user your-db-name < ~/vps-audit-YYYYMMDD/database-backup.sql

# Rebuild and start
docker-compose build
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:3001/health
```

### Full Rollback
```bash
# Stop everything
docker-compose down -v

# Restore full project
cd /path/to/project/..
rm -rf your-project-folder
tar -xzf ~/vps-audit-YYYYMMDD/project-full-backup.tar.gz

# Restore database
docker-compose up -d postgres
docker exec -i postgres-container psql -U your-db-user your-db-name < ~/vps-audit-YYYYMMDD/database-backup.sql

# Start services
cd your-project-folder
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:3001/health
```

---

## 📋 Quick Reference Checklist

- [ ] Phase 1: Pre-Update Audit completed
- [ ] Phase 2: Docker environment ready
- [ ] Phase 3: Latest code pulled
- [ ] Phase 4: New images built and tested
- [ ] Phase 5: Rolling update completed
- [ ] Phase 6: Post-update verification passed
- [ ] Phase 7: Cleanup done
- [ ] Backup created and verified
- [ ] Rollback procedure documented
- [ ] Team notified of update

---

## 🔧 Useful Commands Reference

```bash
# Check Docker status
docker-compose ps
docker stats

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart specific service
docker-compose restart backend

# Rebuild specific service
docker-compose up -d --no-deps --build backend

# Execute command in container
docker-compose exec backend npm run migrate

# Check container health
docker inspect --format='{{.State.Health.Status}}' container-name

# Monitor resources
docker stats --no-stream

# Clean up
docker system prune -a
docker volume prune
```

---

## 📞 Emergency Contacts

- **VPS Provider Support**: [Your provider contact]
- **Database Admin**: [Contact info]
- **DevOps Team**: [Contact info]
- **Backup Location**: `~/vps-audit-YYYYMMDD/`

---

## 📝 Notes

- Always test in staging environment first if available
- Keep at least 3 backups before major updates
- Document any custom configurations
- Update this roadmap based on your specific setup
- Schedule updates during low-traffic periods

---

**Last Updated**: November 15, 2025  
**Next Review**: Before next deployment
