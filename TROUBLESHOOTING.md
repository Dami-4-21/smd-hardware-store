# 🔧 Troubleshooting Guide - Common Issues & Solutions

## 📚 Quick Reference

This guide covers common problems you might encounter and how to fix them.

---

## 🔍 How to Use This Guide

1. **Find your problem** in the table of contents
2. **Follow the diagnostic steps**
3. **Apply the solution**
4. **Verify it's fixed**

---

## 📋 Table of Contents

1. [Backend Issues](#backend-issues)
2. [Database Issues](#database-issues)
3. [Frontend Issues](#frontend-issues)
4. [Nginx Issues](#nginx-issues)
5. [Docker Issues](#docker-issues)
6. [SSL/HTTPS Issues](#ssl-https-issues)
7. [Performance Issues](#performance-issues)
8. [Deployment Issues](#deployment-issues)

---

## 🔴 Backend Issues

### Issue: Backend Container Won't Start

**Symptoms:**
```bash
docker-compose ps
# Shows: smd-backend | Exit 1
```

**Diagnosis:**
```bash
# Check logs
docker-compose logs backend

# Common error messages:
# - "Error: Cannot find module"
# - "Database connection failed"
# - "Port already in use"
```

**Solutions:**

**1. Missing Dependencies:**
```bash
cd /var/www/smd-store/backend
docker-compose build --no-cache backend
docker-compose up -d
```

**2. Database Not Ready:**
```bash
# Wait for database to be healthy
docker-compose ps postgres
# Should show "healthy"

# If not, restart database
docker-compose restart postgres
sleep 30
docker-compose restart backend
```

**3. Port Already in Use:**
```bash
# Check what's using port 3001
sudo netstat -tulpn | grep 3001

# Kill the process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

**4. Environment Variables Missing:**
```bash
# Check .env file exists
cat /var/www/smd-store/.env

# Verify all required variables
grep -E "DB_|JWT_|REDIS_" .env

# Restart after fixing
docker-compose restart backend
```

---

### Issue: Backend Returns 500 Internal Server Error

**Symptoms:**
```bash
curl http://localhost:3001/api/categories
# Returns: {"error": "Internal Server Error"}
```

**Diagnosis:**
```bash
# Check backend logs
docker-compose logs --tail=50 backend

# Look for:
# - Stack traces
# - Database errors
# - Uncaught exceptions
```

**Solutions:**

**1. Database Connection Issue:**
```bash
# Test database connection
docker exec smd-backend npx prisma db pull

# If fails, check DATABASE_URL in .env
# Should be: postgresql://user:pass@postgres:5432/dbname
```

**2. Prisma Client Not Generated:**
```bash
# Regenerate Prisma client
docker exec smd-backend npx prisma generate

# Restart backend
docker-compose restart backend
```

**3. Code Error:**
```bash
# Check logs for stack trace
docker-compose logs backend | grep "Error:"

# Fix the code issue
# Rebuild and restart
docker-compose build backend
docker-compose up -d
```

---

### Issue: API Endpoints Return 404

**Symptoms:**
```bash
curl http://localhost:3001/api/products
# Returns: 404 Not Found
```

**Diagnosis:**
```bash
# Check if route is registered
docker exec smd-backend cat src/server.ts | grep "products"

# Check logs
docker-compose logs backend | grep "Route"
```

**Solutions:**

**1. Route Not Registered:**
```bash
# Edit server.ts
# Add: app.use('/api/products', productRoutes);

# Rebuild
docker-compose build backend
docker-compose up -d
```

**2. Controller Not Exported:**
```bash
# Check controller exports
docker exec smd-backend cat src/controllers/product.controller.ts | grep "export"

# Fix exports and rebuild
```

---

## 🗄️ Database Issues

### Issue: Database Connection Failed

**Symptoms:**
```bash
docker-compose logs backend
# Shows: "Error: connect ECONNREFUSED"
```

**Diagnosis:**
```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Test connection
docker exec smd-postgres pg_isready -U smd_user
```

**Solutions:**

**1. Postgres Not Running:**
```bash
# Start postgres
docker-compose up -d postgres

# Wait for it to be healthy
sleep 30

# Restart backend
docker-compose restart backend
```

**2. Wrong Credentials:**
```bash
# Check .env file
cat .env | grep DB_

# Should match docker-compose.yml
# Update if needed and restart
docker-compose restart
```

**3. Network Issue:**
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

---

### Issue: Migration Failed

**Symptoms:**
```bash
npx prisma migrate deploy
# Error: Migration failed to apply
```

**Diagnosis:**
```bash
# Check migration status
docker exec smd-backend npx prisma migrate status

# Check database tables
docker exec smd-postgres psql -U smd_user -d smd_hardware -c "\dt"
```

**Solutions:**

**1. Conflicting Migration:**
```bash
# Mark migration as applied (if already applied manually)
docker exec smd-backend npx prisma migrate resolve --applied "migration_name"

# Try again
docker exec smd-backend npx prisma migrate deploy
```

**2. Database Schema Mismatch:**
```bash
# Backup first!
./scripts/backup.sh

# Reset database (WARNING: Loses data!)
docker exec smd-backend npx prisma migrate reset

# Or restore from backup and try again
```

**3. Syntax Error in Migration:**
```bash
# Check migration file
docker exec smd-backend cat prisma/migrations/*/migration.sql

# Fix SQL syntax
# Create new migration
docker exec smd-backend npx prisma migrate dev --name fix_migration
```

---

### Issue: Database Disk Full

**Symptoms:**
```bash
docker-compose logs postgres
# Shows: "No space left on device"
```

**Diagnosis:**
```bash
# Check disk usage
df -h

# Check Docker volumes
docker system df
```

**Solutions:**

**1. Clean Up Old Data:**
```bash
# Remove old backups
find /var/www/smd-store/backups -mtime +30 -delete

# Clean Docker
docker system prune -a
```

**2. Vacuum Database:**
```bash
# Vacuum to reclaim space
docker exec smd-postgres psql -U smd_user -d smd_hardware -c "VACUUM FULL;"
```

**3. Increase Disk Space:**
```bash
# Contact VPS provider to increase disk
# Or move to larger VPS
```

---

## 🎨 Frontend Issues

### Issue: Frontend Shows Blank Page

**Symptoms:**
- Browser shows white/blank page
- No errors visible

**Diagnosis:**
```bash
# Open browser console (F12)
# Check for errors

# Common errors:
# - "Failed to fetch"
# - "CORS error"
# - "Unexpected token"
```

**Solutions:**

**1. Wrong API URL:**
```bash
# Check .env.production
cat .env.production

# Should be: VITE_API_URL=https://51.75.143.218/api
# Rebuild if wrong
npm run build
```

**2. Build Error:**
```bash
# Clear and rebuild
rm -rf dist node_modules
npm install
npm run build

# Check for build errors
```

**3. Routing Issue:**
```bash
# Check .htaccess exists (shared hosting)
cat dist/.htaccess

# Should have SPA routing rules
# If missing, create it
```

---

### Issue: API Calls Fail (CORS Error)

**Symptoms:**
```
Console error:
"Access to fetch at 'https://51.75.143.218/api/...' 
from origin 'https://www.catalogquienquillerie.sqb-tunisie.com' 
has been blocked by CORS policy"
```

**Diagnosis:**
```bash
# Check backend CORS configuration
ssh deployer@51.75.143.218
cat /var/www/smd-store/.env | grep CORS_ORIGIN
```

**Solutions:**

**1. Add Frontend Domain to CORS:**
```bash
# Edit .env
nano /var/www/smd-store/.env

# Update CORS_ORIGIN
CORS_ORIGIN=https://www.catalogquienquillerie.sqb-tunisie.com,https://www.sqb-tunisie.com

# Restart backend
docker-compose restart backend
```

**2. Check Nginx Headers:**
```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/smd-api

# Add CORS headers if needed
# Reload Nginx
sudo systemctl reload nginx
```

---

### Issue: Images Not Loading

**Symptoms:**
- Product images show broken
- 404 errors in console

**Diagnosis:**
```bash
# Check image URL in browser console
# Example: https://51.75.143.218/uploads/products/image.jpg

# Test if file exists
ssh deployer@51.75.143.218
ls /var/www/smd-store/uploads/products/
```

**Solutions:**

**1. Files Not Uploaded:**
```bash
# Check uploads directory
ls -la /var/www/smd-store/uploads/

# Check permissions
sudo chown -R deployer:deployer /var/www/smd-store/uploads
sudo chmod -R 755 /var/www/smd-store/uploads
```

**2. Nginx Not Serving Files:**
```bash
# Check Nginx config
sudo nano /etc/nginx/sites-available/smd-api

# Should have:
location /uploads/ {
    alias /var/www/smd-store/uploads/;
    ...
}

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

**3. Wrong Image Path:**
```bash
# Check API response
curl https://51.75.143.218/api/products/1

# Image URL should be full path:
# "imageUrl": "https://51.75.143.218/uploads/products/image.jpg"
```

---

## 🌐 Nginx Issues

### Issue: 502 Bad Gateway

**Symptoms:**
```
Browser shows: 502 Bad Gateway
```

**Diagnosis:**
```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/smd-api-error.log

# Check if backend is running
docker-compose ps backend
```

**Solutions:**

**1. Backend Not Running:**
```bash
# Start backend
docker-compose up -d backend

# Wait 30 seconds
sleep 30

# Test
curl http://localhost:3001/health
```

**2. Backend Not Responding:**
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

**3. Nginx Can't Connect:**
```bash
# Check upstream in Nginx config
sudo nano /etc/nginx/sites-available/smd-api

# Should be: server 127.0.0.1:3001;
# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

### Issue: 413 Request Entity Too Large

**Symptoms:**
```
Error when uploading files:
413 Request Entity Too Large
```

**Solutions:**

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/smd-api

# Add or increase:
client_max_body_size 50M;

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

### Issue: SSL Certificate Error

**Symptoms:**
```
Browser: "Your connection is not private"
Certificate error
```

**Solutions:**

**1. Certificate Expired:**
```bash
# Check certificate
sudo certbot certificates

# Renew
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx
```

**2. Wrong Certificate Path:**
```bash
# Check Nginx config
sudo nano /etc/nginx/sites-available/smd-api

# Verify paths:
ssl_certificate /etc/letsencrypt/live/domain/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/domain/privkey.pem;

# Test
sudo nginx -t
```

---

## 🐳 Docker Issues

### Issue: Docker Daemon Not Running

**Symptoms:**
```bash
docker ps
# Error: Cannot connect to Docker daemon
```

**Solutions:**

```bash
# Start Docker
sudo systemctl start docker

# Enable on boot
sudo systemctl enable docker

# Check status
sudo systemctl status docker
```

---

### Issue: Container Keeps Restarting

**Symptoms:**
```bash
docker-compose ps
# Shows: Restarting
```

**Diagnosis:**
```bash
# Check logs
docker-compose logs <container-name>

# Check last 100 lines
docker-compose logs --tail=100 <container-name>
```

**Solutions:**

**1. Application Crash:**
```bash
# Fix the code issue
# Rebuild
docker-compose build <container-name>
docker-compose up -d
```

**2. Health Check Failing:**
```bash
# Check health check in docker-compose.yml
# Adjust timeout or disable temporarily
# Restart
docker-compose restart <container-name>
```

---

### Issue: Out of Disk Space

**Symptoms:**
```bash
docker build
# Error: no space left on device
```

**Solutions:**

```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk space
df -h

# Remove old images
docker images
docker rmi <image-id>
```

---

## 🔐 SSL/HTTPS Issues

### Issue: Mixed Content Warning

**Symptoms:**
```
Console: "Mixed Content: The page was loaded over HTTPS, 
but requested an insecure resource"
```

**Solutions:**

```bash
# Ensure all API calls use HTTPS
# Check .env.production
VITE_API_URL=https://51.75.143.218/api
# NOT http://

# Rebuild frontend
npm run build
```

---

## 🚀 Performance Issues

### Issue: Slow API Response

**Diagnosis:**
```bash
# Test response time
time curl https://51.75.143.218/api/products

# Check backend logs
docker-compose logs backend | grep "slow"

# Check database
docker exec smd-postgres psql -U smd_user -d smd_hardware -c "SELECT * FROM pg_stat_activity;"
```

**Solutions:**

**1. Database Slow:**
```bash
# Add indexes
docker exec smd-backend npx prisma studio
# Or add indexes in schema.prisma

# Vacuum database
docker exec smd-postgres psql -U smd_user -d smd_hardware -c "VACUUM ANALYZE;"
```

**2. No Caching:**
```bash
# Check Redis is running
docker-compose ps redis

# Implement caching in code
# Restart backend
```

**3. Too Many Requests:**
```bash
# Check Nginx rate limiting
sudo nano /etc/nginx/sites-available/smd-api

# Adjust limits
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

---

## 📝 Quick Commands Reference

### Check Everything:
```bash
# All services status
docker-compose ps

# All logs
docker-compose logs

# System resources
htop

# Disk space
df -h

# Network
sudo netstat -tulpn
```

### Restart Everything:
```bash
# Restart all containers
docker-compose restart

# Or stop and start
docker-compose down
docker-compose up -d
```

### Emergency Reset:
```bash
# Backup first!
./scripts/backup.sh

# Reset everything
docker-compose down -v
docker-compose up -d --build
docker exec smd-backend npx prisma migrate deploy
```

---

## 🆘 Still Having Issues?

### Gather Information:

```bash
# Create debug report
cat > debug-report.txt << EOF
=== System Info ===
$(uname -a)
$(docker --version)
$(docker-compose --version)

=== Services Status ===
$(docker-compose ps)

=== Backend Logs ===
$(docker-compose logs --tail=50 backend)

=== Nginx Status ===
$(sudo systemctl status nginx)

=== Disk Space ===
$(df -h)

=== Memory ===
$(free -h)
EOF

# View report
cat debug-report.txt
```

### Get Help:

1. Check logs carefully
2. Search error message online
3. Check Docker documentation
4. Check Nginx documentation
5. Ask in forums (StackOverflow, Reddit)

---

**Remember**: Most issues are solved by:
1. ✅ Checking logs
2. ✅ Restarting services
3. ✅ Verifying configuration
4. ✅ Reading error messages carefully

**Good luck!** 🍀
