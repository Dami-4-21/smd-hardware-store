# 🔄 Update & Maintenance Procedures

## 📚 What You'll Learn
- How to update your application safely
- How to rollback if something goes wrong
- How to backup before updates
- How to test updates
- Best practices for maintenance

**Time Required**: 15-30 minutes per update  
**Difficulty**: Intermediate

---

## 🎯 Update Workflow Overview

```
1. Backup Everything
        ↓
2. Test Locally
        ↓
3. Push to GitHub
        ↓
4. Deploy Backend
        ↓
5. Deploy Frontend
        ↓
6. Test Production
        ↓
7. Monitor for Issues
```

---

## 💾 Step 1: Backup Before Updating

### Why Backup?

```
Updates can go wrong:
- Code bugs
- Database migration issues
- Configuration errors

Backup = Safety net
If something breaks, restore backup!
```

### Backup Script:

```bash
# SSH into VPS
ssh deployer@51.75.143.218

# Navigate to project
cd /var/www/smd-store

# Create backup script
nano scripts/backup.sh
```

**Paste:**

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/www/smd-store/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="smd_hardware"
DB_USER="smd_user"
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

echo "🔄 Starting backup: $DATE"

# Backup database
echo "📦 Backing up database..."
docker exec smd-postgres pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Backup uploads
echo "📦 Backing up uploads..."
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" /var/www/smd-store/uploads

# Backup environment file
echo "📦 Backing up configuration..."
cp .env "$BACKUP_DIR/env_backup_$DATE"

# Remove old backups
echo "🗑️  Removing old backups..."
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "env_backup_*" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed: $DATE"
echo "📁 Location: $BACKUP_DIR"
```

**Make executable:**

```bash
chmod +x scripts/backup.sh
```

### Run Backup:

```bash
# Run backup
./scripts/backup.sh

# Verify backup created
ls -lh backups/

# Should show:
# db_backup_20241103_183000.sql.gz
# uploads_backup_20241103_183000.tar.gz
# env_backup_20241103_183000
```

---

## 🔧 Step 2: Update Backend

### Update Process:

```
1. Backup (done above)
2. Pull latest code
3. Rebuild containers
4. Run migrations
5. Test
```

### Pull Latest Code:

```bash
# Navigate to project
cd /var/www/smd-store

# Check current branch
git branch

# Pull latest changes
git pull origin main

# What you'll see:
# remote: Counting objects...
# Receiving objects: 100% (50/50)
# Updating abc1234..def5678
```

### Rebuild and Restart:

```bash
# Stop containers
docker-compose down

# Rebuild images (with no cache for clean build)
docker-compose build --no-cache

# Start containers
docker-compose up -d

# Wait 30 seconds for services to start
sleep 30
```

### Run Database Migrations:

```bash
# Run migrations
docker exec smd-backend npx prisma migrate deploy

# What happens:
# - Checks for new migrations
# - Applies them in order
# - Updates database schema
```

### Verify Backend:

```bash
# Check containers are running
docker-compose ps

# All should show "Up"

# Test health endpoint
curl http://localhost:3001/health

# Should return JSON with status: OK
```

---

## 🎨 Step 3: Update Frontend

### Option A: Automatic (Netlify with GitHub)

```
When you push to GitHub:
1. GitHub triggers Netlify
2. Netlify builds your app
3. Netlify deploys automatically
4. Done! ✓

No manual work needed!
```

**Just push your code:**

```bash
# On your LOCAL computer
cd /path/to/your/project

# Make your changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Update: description of changes"

# Push to GitHub
git push origin main

# Netlify automatically deploys!
# Check Netlify dashboard for progress
```

### Option B: Manual (Shared Hosting)

```bash
# On your LOCAL computer

# Build customer shop
cd /path/to/your/project
npm run build

# Upload to server
scp -r dist/* deployer@51.75.143.218:/var/www/shop/

# Or use FTP client (FileZilla)

# Build admin dashboard
cd admin-dashboard
npm run build

# Upload to server
scp -r dist/* deployer@51.75.143.218:/var/www/admin/
```

---

## 🧪 Step 4: Test After Update

### Backend Tests:

```bash
# SSH into VPS
ssh deployer@51.75.143.218

# Test health
curl http://localhost:3001/health

# Test API endpoints
curl http://localhost:3001/api/categories
curl http://localhost:3001/api/products

# Check logs for errors
docker-compose logs --tail=50 backend

# No errors? Good! ✓
```

### Frontend Tests:

**Customer Shop:**
1. Go to: `https://www.catalogquienquillerie.sqb-tunisie.com`
2. ✓ Page loads
3. ✓ Browse products
4. ✓ Add to cart
5. ✓ Checkout works

**Admin Dashboard:**
1. Go to: `https://www.sqb-tunisie.com`
2. ✓ Login works
3. ✓ Dashboard loads
4. ✓ Can create product
5. ✓ Can view orders

### Monitor Logs:

```bash
# Watch backend logs
docker-compose logs -f backend

# Watch Nginx logs
sudo tail -f /var/log/nginx/smd-api-error.log

# Press Ctrl+C to stop
```

---

## ⏪ Step 5: Rollback (If Something Goes Wrong)

### When to Rollback?

```
Rollback if:
❌ Application crashes
❌ Critical bugs
❌ Database errors
❌ Users can't access site
❌ Data corruption
```

### Rollback Script:

```bash
# Create rollback script
nano scripts/rollback.sh
```

**Paste:**

```bash
#!/bin/bash

set -e

echo "⏪ Starting rollback..."

# Get last commit
CURRENT_COMMIT=$(git rev-parse HEAD)
LAST_COMMIT=$(git rev-parse HEAD~1)

echo "Current commit: $CURRENT_COMMIT"
echo "Rolling back to: $LAST_COMMIT"

read -p "Continue with rollback? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled"
    exit 1
fi

# Checkout previous commit
git checkout $LAST_COMMIT

# Rebuild containers
echo "🐳 Rebuilding containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services..."
sleep 30

# Check health
echo "🏥 Checking health..."
curl -f http://localhost:3001/health || {
    echo "❌ Health check failed!"
    exit 1
}

echo "✅ Rollback completed successfully!"
echo "📝 Note: You may need to restore database backup if schema changed"
```

**Make executable:**

```bash
chmod +x scripts/rollback.sh
```

### Rollback Database:

```bash
# List backups
ls -lh backups/

# Restore database backup
BACKUP_FILE="backups/db_backup_20241103_183000.sql.gz"

# Restore
gunzip < $BACKUP_FILE | docker exec -i smd-postgres psql -U smd_user smd_hardware

echo "✅ Database restored"
```

### Rollback Uploads:

```bash
# Restore uploads
BACKUP_FILE="backups/uploads_backup_20241103_183000.tar.gz"

# Extract
tar -xzf $BACKUP_FILE -C /

echo "✅ Uploads restored"
```

---

## 📅 Step 6: Schedule Automatic Backups

### Setup Cron Job:

```bash
# Edit crontab
crontab -e

# Add this line (backup daily at 2 AM):
0 2 * * * /var/www/smd-store/scripts/backup.sh >> /var/log/backup.log 2>&1

# Save and exit
```

### Verify Cron Job:

```bash
# List cron jobs
crontab -l

# Should show your backup job
```

### Test Backup:

```bash
# Run backup manually
./scripts/backup.sh

# Check it worked
ls -lh backups/
```

---

## 🔍 Step 7: Monitor Application

### Health Check Script:

```bash
# Create monitoring script
nano scripts/health-check.sh
```

**Paste:**

```bash
#!/bin/bash

echo "🏥 Health Check - $(date)"

# Check backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend: Healthy"
else
    echo "❌ Backend: Down!"
    # Restart backend
    docker-compose restart backend
    # Send alert (email, Slack, etc.)
fi

# Check database
if docker exec smd-postgres pg_isready -U smd_user > /dev/null 2>&1; then
    echo "✅ Database: Healthy"
else
    echo "❌ Database: Down!"
    docker-compose restart postgres
fi

# Check Redis
if docker exec smd-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Down!"
    docker-compose restart redis
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  Disk usage high: ${DISK_USAGE}%"
else
    echo "✅ Disk space: ${DISK_USAGE}%"
fi

# Check memory
FREE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $3*100/$2 }')
if [ $FREE_MEM -gt 90 ]; then
    echo "⚠️  Memory usage high: ${FREE_MEM}%"
else
    echo "✅ Memory: ${FREE_MEM}%"
fi

echo "---"
```

**Make executable:**

```bash
chmod +x scripts/health-check.sh
```

### Schedule Health Checks:

```bash
# Edit crontab
crontab -e

# Add (check every 5 minutes):
*/5 * * * * /var/www/smd-store/scripts/health-check.sh >> /var/log/health-check.log 2>&1
```

---

## 📊 Step 8: View Logs

### Backend Logs:

```bash
# View recent logs
docker-compose logs --tail=100 backend

# Follow logs in real-time
docker-compose logs -f backend

# Search logs for errors
docker-compose logs backend | grep ERROR

# View logs by time
docker-compose logs --since 1h backend
```

### Nginx Logs:

```bash
# Access log (all requests)
sudo tail -f /var/log/nginx/smd-api-access.log

# Error log (errors only)
sudo tail -f /var/log/nginx/smd-api-error.log

# Search for specific IP
sudo grep "192.168.1.1" /var/log/nginx/smd-api-access.log
```

### Database Logs:

```bash
# PostgreSQL logs
docker-compose logs postgres

# Slow queries
docker exec smd-postgres psql -U smd_user -d smd_hardware -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

---

## 🔐 Step 9: Security Updates

### Update System Packages:

```bash
# SSH into VPS
ssh deployer@51.75.143.218

# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Reboot if kernel updated
sudo reboot
```

### Update Docker Images:

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Update Node.js Dependencies:

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Or update specific package
npm install package-name@latest

# Rebuild
docker-compose build backend
docker-compose up -d
```

---

## ✅ Best Practices

### Before Every Update:

1. ✅ **Backup everything**
2. ✅ **Test locally first**
3. ✅ **Read changelog**
4. ✅ **Update during low traffic**
5. ✅ **Have rollback plan**

### During Update:

1. ✅ **Monitor logs**
2. ✅ **Test each step**
3. ✅ **Don't skip migrations**
4. ✅ **Keep terminal open**
5. ✅ **Document changes**

### After Update:

1. ✅ **Test all features**
2. ✅ **Monitor for 24 hours**
3. ✅ **Check error logs**
4. ✅ **Verify backups**
5. ✅ **Update documentation**

---

## 📝 Update Checklist

### Pre-Update:
- [ ] Backup database
- [ ] Backup uploads
- [ ] Backup configuration
- [ ] Test locally
- [ ] Notify users (if major update)

### Update:
- [ ] Pull latest code
- [ ] Rebuild containers
- [ ] Run migrations
- [ ] Restart services
- [ ] Clear cache

### Post-Update:
- [ ] Test health endpoint
- [ ] Test API endpoints
- [ ] Test frontend
- [ ] Check logs
- [ ] Monitor performance

### If Issues:
- [ ] Check logs
- [ ] Try restart
- [ ] Rollback if needed
- [ ] Restore backup
- [ ] Document issue

---

## 📝 Summary

✅ Created backup procedures  
✅ Learned update workflow  
✅ Setup rollback procedures  
✅ Scheduled automatic backups  
✅ Setup health monitoring  
✅ Learned log management  
✅ Security update procedures  

---

## 🎯 Next Steps

**Next Guide**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions

---

## 🆘 Common Issues

### Update Failed?

```bash
# Check what went wrong
docker-compose logs backend

# Rollback
./scripts/rollback.sh

# Restore database if needed
```

### Migration Failed?

```bash
# Check migration status
docker exec smd-backend npx prisma migrate status

# Reset if needed (CAREFUL - loses data!)
docker exec smd-backend npx prisma migrate reset

# Restore from backup
```

### Can't Access After Update?

```bash
# Check all services running
docker-compose ps

# Restart everything
docker-compose restart

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

---

**You now know how to safely update your application!** 🔄
