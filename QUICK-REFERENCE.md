# ⚡ Quick Reference Card - Essential Commands

## 🔑 Server Access

```bash
# SSH into VPS
ssh deployer@51.75.143.218

# Switch to root
sudo su -

# Exit SSH
exit
```

---

## 🐳 Docker Commands

### Container Management:
```bash
# View running containers
docker-compose ps

# View all containers
docker ps -a

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Rebuild and start
docker-compose up -d --build

# View logs
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f backend

# Last 50 lines
docker-compose logs --tail=50 backend
```

### Container Access:
```bash
# Execute command in container
docker exec smd-backend <command>

# Open shell in container
docker exec -it smd-backend sh

# Check container health
docker inspect smd-backend | grep Health
```

---

## 🗄️ Database Commands

```bash
# Connect to PostgreSQL
docker exec -it smd-postgres psql -U smd_user -d smd_hardware

# Run migrations
docker exec smd-backend npx prisma migrate deploy

# Check migration status
docker exec smd-backend npx prisma migrate status

# Generate Prisma client
docker exec smd-backend npx prisma generate

# Backup database
docker exec smd-postgres pg_dump -U smd_user smd_hardware | gzip > backup.sql.gz

# Restore database
gunzip < backup.sql.gz | docker exec -i smd-postgres psql -U smd_user smd_hardware
```

### PostgreSQL Commands (inside psql):
```sql
-- List tables
\dt

-- Describe table
\d users

-- List databases
\l

-- Quit
\q
```

---

## 🌐 Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View access log
sudo tail -f /var/log/nginx/smd-api-access.log

# View error log
sudo tail -f /var/log/nginx/smd-api-error.log

# Edit configuration
sudo nano /etc/nginx/sites-available/smd-api
```

---

## 🔐 SSL/Certbot Commands

```bash
# Obtain certificate
sudo certbot --nginx -d api.sqb-tunisie.com

# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# List certificates
sudo certbot certificates

# Check auto-renewal
sudo systemctl status certbot.timer
```

---

## 💾 Backup & Restore

```bash
# Run backup script
cd /var/www/smd-store
./scripts/backup.sh

# List backups
ls -lh backups/

# Restore database
gunzip < backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i smd-postgres psql -U smd_user smd_hardware

# Restore uploads
tar -xzf backups/uploads_backup_YYYYMMDD_HHMMSS.tar.gz -C /
```

---

## 🔄 Update Procedures

```bash
# Navigate to project
cd /var/www/smd-store

# Backup first!
./scripts/backup.sh

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker exec smd-backend npx prisma migrate deploy

# Check health
curl http://localhost:3001/health
```

---

## ⏪ Rollback

```bash
# Run rollback script
cd /var/www/smd-store
./scripts/rollback.sh

# Or manual rollback
git log --oneline  # Find commit
git checkout <commit-hash>
docker-compose down
docker-compose up -d --build
```

---

## 🔍 Monitoring & Debugging

### Check Services:
```bash
# All Docker containers
docker-compose ps

# System resources
htop

# Disk space
df -h

# Memory usage
free -h

# Network connections
sudo netstat -tulpn

# Check port 3001
sudo netstat -tulpn | grep 3001
```

### Test Endpoints:
```bash
# Health check
curl http://localhost:3001/health

# API endpoint
curl http://localhost:3001/api/categories

# With authentication
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/orders
```

### View Logs:
```bash
# Backend logs
docker-compose logs backend

# Database logs
docker-compose logs postgres

# Redis logs
docker-compose logs redis

# Nginx access log
sudo tail -f /var/log/nginx/smd-api-access.log

# Nginx error log
sudo tail -f /var/log/nginx/smd-api-error.log

# System log
sudo journalctl -xe
```

---

## 🔥 Firewall Commands

```bash
# Check firewall status
sudo ufw status

# Allow port
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny port
sudo ufw deny 8080/tcp

# Enable firewall
sudo ufw enable

# Disable firewall
sudo ufw disable

# Reset firewall
sudo ufw reset
```

---

## 📦 System Maintenance

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Clean up
sudo apt autoremove -y
sudo apt autoclean

# Clean Docker
docker system prune -a

# Clean Docker volumes
docker volume prune

# Reboot server
sudo reboot
```

---

## 🎨 Frontend Deployment

### Build:
```bash
# Customer shop
cd /path/to/project
npm install
npm run build

# Admin dashboard
cd admin-dashboard
npm install
npm run build
```

### Deploy to Netlify:
```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## 🔧 Git Commands

```bash
# Check status
git status

# Pull latest
git pull origin main

# Add changes
git add .

# Commit
git commit -m "Description"

# Push
git push origin main

# View log
git log --oneline

# Checkout commit
git checkout <commit-hash>

# Create branch
git checkout -b feature-name

# Switch branch
git checkout main
```

---

## 🆘 Emergency Commands

### If Everything Breaks:
```bash
# 1. Backup first!
cd /var/www/smd-store
./scripts/backup.sh

# 2. Restart everything
docker-compose down
docker-compose up -d

# 3. Check logs
docker-compose logs

# 4. If still broken, rollback
./scripts/rollback.sh
```

### If Database Corrupted:
```bash
# Restore from backup
gunzip < backups/db_backup_LATEST.sql.gz | \
  docker exec -i smd-postgres psql -U smd_user smd_hardware
```

### If Out of Disk Space:
```bash
# Check space
df -h

# Clean Docker
docker system prune -a

# Remove old backups
find /var/www/smd-store/backups -mtime +30 -delete

# Clean logs
sudo truncate -s 0 /var/log/nginx/*.log
```

---

## 📊 Health Checks

```bash
# Quick health check script
cat > /tmp/health.sh << 'EOF'
#!/bin/bash
echo "=== Health Check ==="
echo "Backend: $(curl -s http://localhost:3001/health | grep -o '"status":"[^"]*"')"
echo "Database: $(docker exec smd-postgres pg_isready -U smd_user)"
echo "Redis: $(docker exec smd-redis redis-cli ping)"
echo "Nginx: $(sudo systemctl is-active nginx)"
echo "Disk: $(df -h / | awk 'NR==2 {print $5}')"
echo "Memory: $(free -m | awk 'NR==2{printf "%.0f%%", $3*100/$2 }')"
EOF

chmod +x /tmp/health.sh
/tmp/health.sh
```

---

## 🔑 Important Paths

```bash
# Project root
/var/www/smd-store/

# Backend code
/var/www/smd-store/backend/

# Uploads
/var/www/smd-store/uploads/

# Backups
/var/www/smd-store/backups/

# Scripts
/var/www/smd-store/scripts/

# Logs
/var/www/smd-store/logs/

# Nginx config
/etc/nginx/sites-available/smd-api

# Nginx logs
/var/log/nginx/

# SSL certificates
/etc/letsencrypt/live/
```

---

## 🌐 Important URLs

```bash
# Backend API
https://51.75.143.218/api

# Health check
https://51.75.143.218/health

# Customer shop
https://www.catalogquienquillerie.sqb-tunisie.com

# Admin dashboard
https://www.sqb-tunisie.com

# Uploads
https://51.75.143.218/uploads/
```

---

## 📝 Environment Variables

```bash
# View environment
cat /var/www/smd-store/.env

# Edit environment
nano /var/www/smd-store/.env

# After editing, restart
docker-compose restart backend
```

---

## 💡 Pro Tips

```bash
# Create aliases for common commands
echo "alias dps='docker-compose ps'" >> ~/.bashrc
echo "alias dlogs='docker-compose logs -f backend'" >> ~/.bashrc
echo "alias dre='docker-compose restart'" >> ~/.bashrc
source ~/.bashrc

# Now you can use:
dps      # Instead of docker-compose ps
dlogs    # Instead of docker-compose logs -f backend
dre      # Instead of docker-compose restart
```

---

## 📞 Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| 502 Bad Gateway | `docker-compose restart backend` |
| Container won't start | `docker-compose logs <container>` |
| Database connection failed | `docker-compose restart postgres` |
| Nginx error | `sudo nginx -t && sudo systemctl reload nginx` |
| Out of memory | `docker-compose restart` |
| Disk full | `docker system prune -a` |
| SSL expired | `sudo certbot renew` |
| Can't connect | Check firewall: `sudo ufw status` |

---

## 📖 Documentation Links

- **Main Guide**: [DEPLOYMENT-COMPLETE-GUIDE.md](./DEPLOYMENT-COMPLETE-GUIDE.md)
- **Architecture**: [PRODUCTION-DEPLOYMENT-ARCHITECTURE.md](./PRODUCTION-DEPLOYMENT-ARCHITECTURE.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Updates**: [UPDATE-PROCEDURES.md](./UPDATE-PROCEDURES.md)

---

**💾 Save this file for quick reference!**

**Print it out and keep it handy while working on the server.**
