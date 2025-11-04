# 🐳 Docker Deployment Guide - SMD Tunisie Backend

## ✨ **Why Docker is Better**

### **Benefits:**
✅ **Isolated Environment** - No conflicts with system packages  
✅ **Consistent Deployment** - Same environment everywhere  
✅ **Easy Rollback** - Quick version switching  
✅ **Automatic Restarts** - Container auto-recovery  
✅ **Resource Management** - Better control over CPU/memory  
✅ **Easy Scaling** - Add more containers easily  
✅ **Simplified Updates** - Just rebuild and restart  
✅ **Portable** - Move between servers easily  

---

## 🚀 **Quick Start (3 Commands)**

```bash
# 1. Navigate to backend folder
cd backend

# 2. Create .env file from template
cp .env.docker .env
# Edit .env with your passwords and secrets

# 3. Start everything
docker-compose up -d
```

**That's it!** Your backend is running at `http://51.75.143.218`

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Install Docker on VPS** (5 min)

```bash
# SSH to VPS
ssh root@51.75.143.218

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get install -y docker-compose

# Verify
docker --version
docker-compose --version
```

### **Step 2: Upload Backend Files** (5 min)

```bash
# From local machine
ssh root@51.75.143.218 "mkdir -p /var/www/smd-backend"
scp -r ./backend/* root@51.75.143.218:/var/www/smd-backend/
```

### **Step 3: Configure Environment** (3 min)

```bash
# On VPS
cd /var/www/smd-backend/backend
cp .env.docker .env
nano .env

# Generate secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

### **Step 4: Start Containers** (5 min)

```bash
# Build and start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### **Step 5: Initialize Database** (2 min)

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed admin user
docker-compose exec backend npm run seed
```

### **Step 6: Test** (2 min)

```bash
# Health check
curl http://51.75.143.218/api/health

# Categories
curl http://51.75.143.218/api/categories
```

---

## 🎯 **Common Commands**

### **Container Management:**
```bash
docker-compose up -d          # Start
docker-compose down           # Stop
docker-compose restart        # Restart
docker-compose ps             # Status
docker-compose logs -f        # Logs
```

### **Database:**
```bash
# Migrations
docker-compose exec backend npx prisma migrate deploy

# Access DB
docker-compose exec postgres psql -U smd_user -d smd_hardware

# Backup
docker-compose exec postgres pg_dump -U smd_user smd_hardware > backup.sql
```

### **Updates:**
```bash
# Pull code
git pull

# Rebuild
docker-compose build backend
docker-compose up -d backend
```

---

## 🔧 **Troubleshooting**

### **Containers won't start:**
```bash
docker-compose logs
docker-compose down -v
docker-compose up -d
```

### **Database connection failed:**
```bash
docker-compose logs postgres
docker-compose exec postgres psql -U smd_user -d smd_hardware -c "SELECT 1;"
```

### **CORS errors:**
```bash
# Check .env CORS_ORIGIN
cat .env | grep CORS_ORIGIN
docker-compose restart backend
```

---

## 📊 **Monitoring**

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Health checks
curl http://localhost/health
curl http://localhost/api/health
```

---

## 🔐 **Security**

```bash
# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Never commit .env
echo ".env" >> .gitignore
```

---

## 📦 **Files Created**

1. ✅ `backend/Dockerfile`
2. ✅ `backend/.dockerignore`
3. ✅ `backend/docker-compose.yml`
4. ✅ `backend/.env.docker`
5. ✅ `backend/nginx.conf`
6. ✅ `backend/init-db.sql`

---

## ✨ **Advantages Over PM2**

| Feature | Docker | PM2 |
|---------|--------|-----|
| **Isolation** | ✅ Full | ❌ Shared |
| **Database Included** | ✅ Yes | ❌ No |
| **Portability** | ✅ High | ❌ Low |
| **Rollback** | ✅ Easy | ⚠️ Manual |
| **Scaling** | ✅ Built-in | ⚠️ Limited |
| **Updates** | ✅ Simple | ⚠️ Complex |

---

**🎉 Docker deployment is ready!**

*Simpler, safer, and more professional than traditional deployment.* 🚀
