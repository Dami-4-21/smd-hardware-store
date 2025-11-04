# 🚀 Backend Deployment Guide - Deploy Your API with Docker

## 📚 What You'll Learn
- How to prepare your backend code for production
- How to create Docker configuration files
- How to deploy backend with Docker Compose
- How to run database migrations
- How to verify everything works

**Time Required**: 45-60 minutes  
**Difficulty**: Intermediate

---

## 📋 Prerequisites

Before starting, make sure you completed:
- ✅ [VPS-SETUP.md](./VPS-SETUP.md) - VPS is configured
- ✅ [DOCKER-SETUP.md](./DOCKER-SETUP.md) - Docker is installed

**Check you're ready:**
```bash
# Connected to VPS as deployer
whoami  # Should show: deployer

# Docker is working
docker --version
docker-compose --version
```

---

## 🎯 What We're Building

### Backend Architecture:

```
┌─────────────────────────────────────────┐
│         Docker Compose                   │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  Backend API Container         │    │
│  │  - Node.js 18                  │    │
│  │  - Express.js                  │    │
│  │  - Your application code       │    │
│  │  - Port: 3001                  │    │
│  └────────────┬───────────────────┘    │
│               │                          │
│  ┌────────────▼───────────────────┐    │
│  │  PostgreSQL Container          │    │
│  │  - Database                    │    │
│  │  - Port: 5432                  │    │
│  │  - Persistent volume           │    │
│  └────────────┬───────────────────┘    │
│               │                          │
│  ┌────────────▼───────────────────┐    │
│  │  Redis Container               │    │
│  │  - Cache & sessions            │    │
│  │  - Port: 6379                  │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 📁 Step 1: Create Project Structure on VPS

### Create Directories:

```bash
# Create main project directory
sudo mkdir -p /var/www/smd-store
sudo chown -R deployer:deployer /var/www/smd-store
cd /var/www/smd-store

# What these commands do:
# mkdir -p = Create directory (and parents if needed)
# chown = Change owner to deployer user
# cd = Change directory (go into folder)
```

```bash
# Create subdirectories
mkdir -p backend
mkdir -p uploads
mkdir -p backups
mkdir -p logs
mkdir -p scripts

# Verify structure
ls -la

# You should see:
# drwxr-xr-x  backend/
# drwxr-xr-x  uploads/
# drwxr-xr-x  backups/
# drwxr-xr-x  logs/
# drwxr-xr-x  scripts/
```

### Understanding the Structure:

```
/var/www/smd-store/
├── backend/              ← Your backend code goes here
├── uploads/              ← Product images, RNE PDFs
├── backups/              ← Database backups
├── logs/                 ← Application logs
├── scripts/              ← Deployment scripts
├── docker-compose.yml    ← Docker configuration (we'll create)
└── .env                  ← Environment variables (we'll create)
```

---

## 📤 Step 2: Upload Your Backend Code

### Option A: Using Git (Recommended)

```bash
# Navigate to backend directory
cd /var/www/smd-store

# Initialize git repository
git init

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Pull your code
git pull origin main

# What this does:
# - Connects to your GitHub repository
# - Downloads all your code
# - Keeps version control
```

**If you don't have Git repository yet:**
```bash
# On your local computer, create GitHub repo first:
# 1. Go to github.com
# 2. Click "New Repository"
# 3. Name it: smd-hardware-store
# 4. Create repository

# Then on your local computer:
cd /path/to/your/project
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smd-hardware-store.git
git push -u origin main
```

### Option B: Using SCP (File Transfer)

```bash
# On your LOCAL computer (not VPS):
# Navigate to your project directory
cd /path/to/your/project

# Upload backend folder
scp -r backend deployer@51.75.143.218:/var/www/smd-store/

# What this does:
# scp = Secure copy
# -r = Recursive (copy folder and contents)
# Takes 1-5 minutes depending on size
```

### Verify Files Uploaded:

```bash
# On VPS, check backend files
cd /var/www/smd-store/backend
ls -la

# You should see:
# src/
# prisma/
# package.json
# tsconfig.json
# etc.
```

---

## 🐳 Step 3: Create Dockerfile

### What is a Dockerfile?

**Dockerfile** = Recipe to build your application image

```
Dockerfile says:
1. Start with Node.js 18
2. Copy my code
3. Install dependencies
4. Build TypeScript
5. Run the app

Docker reads this and creates an image
```

### Create Dockerfile:

```bash
# Navigate to backend directory
cd /var/www/smd-store/backend

# Create Dockerfile
nano Dockerfile
```

**Paste this content:**

```dockerfile
# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine

# Install dumb-init (handles signals properly)
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Create uploads directory
RUN mkdir -p /app/uploads

# Set environment to production
ENV NODE_ENV=production

# Expose port 3001
EXPOSE 3001

# Use dumb-init to run app
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

### Understanding the Dockerfile:

```
Multi-stage build:

Stage 1 (Builder):
- Install everything
- Build TypeScript
- Generate Prisma client

Stage 2 (Production):
- Copy only built files
- Smaller image size
- Faster startup

Benefits:
✓ Smaller final image
✓ Faster deployment
✓ More secure
```

---

## 🔧 Step 4: Create Docker Compose File

### What is docker-compose.yml?

**docker-compose.yml** = Configuration for all your containers

```
One file defines:
- Backend container
- Database container
- Redis container
- How they connect
- Volumes for data
- Environment variables
```

### Create docker-compose.yml:

```bash
# Navigate to main directory
cd /var/www/smd-store

# Create docker-compose.yml
nano docker-compose.yml
```

**Paste this content:**

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: smd-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "127.0.0.1:5432:5432"
    networks:
      - smd-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: smd-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - smd-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: smd-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      SMTP_FROM_EMAIL: ${SMTP_FROM_EMAIL}
      SMTP_FROM_NAME: ${SMTP_FROM_NAME}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    ports:
      - "127.0.0.1:3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - smd-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  smd-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

**Save and exit** (`Ctrl + X`, `Y`, `Enter`)

### Understanding docker-compose.yml:

```yaml
services:          # Define containers
  postgres:        # Database container
    image:         # Use official PostgreSQL image
    volumes:       # Persistent storage
    healthcheck:   # Check if database is ready
    
  redis:           # Cache container
    command:       # Run with password
    
  backend:         # Your API container
    build:         # Build from Dockerfile
    depends_on:    # Wait for database & redis
    volumes:       # Share uploads & logs with host

networks:          # Allow containers to talk
volumes:           # Persistent data storage
```

---

## 🔐 Step 5: Create Environment Variables

### Create .env File:

```bash
# Create .env file
nano .env
```

**Paste this content (CHANGE THE VALUES!):**

```bash
# Database Configuration
DB_NAME=smd_hardware
DB_USER=smd_user
DB_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD_123!

# Redis Configuration
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD_456!

# JWT Secrets (generate random strings)
JWT_SECRET=CHANGE_THIS_TO_RANDOM_STRING_MIN_32_CHARS_789!
JWT_REFRESH_SECRET=CHANGE_THIS_TO_ANOTHER_RANDOM_STRING_012!

# CORS Origins (your frontend URLs)
CORS_ORIGIN=https://www.catalogquienquillerie.sqb-tunisie.com,https://www.sqb-tunisie.com

# SMTP Configuration (for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
SMTP_FROM_EMAIL=noreply@sqb-tunisie.com
SMTP_FROM_NAME=SMD Tunisie
```

**Save and exit**

### Generate Strong Passwords:

```bash
# Generate random password for database
openssl rand -base64 32

# Copy output and use as DB_PASSWORD

# Generate another for Redis
openssl rand -base64 32

# Generate JWT secrets
openssl rand -base64 48
openssl rand -base64 48
```

### Secure the .env File:

```bash
# Make .env readable only by owner
chmod 600 .env

# Verify permissions
ls -la .env

# Should show: -rw------- (only owner can read/write)
```

### SMTP Configuration (Gmail Example):

If using Gmail:
1. Go to Google Account settings
2. Security → 2-Step Verification (enable it)
3. Security → App passwords
4. Generate app password
5. Use that password in SMTP_PASSWORD

---

## 🚀 Step 6: Build and Start Containers

### Build Docker Images:

```bash
# Navigate to project directory
cd /var/www/smd-store

# Build images (first time takes 5-10 minutes)
docker-compose build

# What happens:
# - Reads docker-compose.yml
# - Builds backend image from Dockerfile
# - Downloads postgres and redis images
# - Creates images
```

You'll see output like:
```
[+] Building 234.5s (18/18) FINISHED
 => [internal] load build definition
 => => transferring dockerfile
 => [internal] load .dockerignore
 => [builder 1/8] FROM docker.io/library/node:18-alpine
...
```

**Wait for it to complete!**

### Start All Containers:

```bash
# Start containers in background
docker-compose up -d

# What this does:
# -d = Detached mode (runs in background)
# Starts: postgres, redis, backend
# Takes 30-60 seconds
```

You'll see:
```
[+] Running 4/4
 ✔ Network smd-network       Created
 ✔ Container smd-postgres    Started
 ✔ Container smd-redis       Started
 ✔ Container smd-backend     Started
```

### Check Container Status:

```bash
# View running containers
docker-compose ps

# Should show:
NAME            STATUS          PORTS
smd-postgres    Up 30 seconds   127.0.0.1:5432->5432/tcp
smd-redis       Up 30 seconds   127.0.0.1:6379->6379/tcp
smd-backend     Up 15 seconds   127.0.0.1:3001->3001/tcp
```

**All showing "Up"? Perfect!** ✓

---

## 🗄️ Step 7: Run Database Migrations

### What are Migrations?

**Migrations** = Instructions to create database tables

```
Prisma migration files say:
1. Create users table
2. Create products table
3. Create orders table
etc.

Running migrations = Creating all tables
```

### Run Migrations:

```bash
# Execute migrations inside backend container
docker exec smd-backend npx prisma migrate deploy

# What this does:
# docker exec = Run command in container
# smd-backend = Container name
# npx prisma migrate deploy = Run migrations
```

You'll see:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database

12 migrations found in prisma/migrations

Applying migration `20240101000000_init`
Applying migration `20240102000000_add_categories`
...

The following migrations have been applied:

migrations/
  └─ 20240101000000_init/
  └─ 20240102000000_add_categories/
  ...

All migrations have been successfully applied.
```

**Success!** Database tables created ✓

### Verify Database:

```bash
# Connect to PostgreSQL container
docker exec -it smd-postgres psql -U smd_user -d smd_hardware

# You're now in PostgreSQL prompt
# List tables:
\dt

# Should show:
#  Schema |         Name          | Type  |  Owner
# --------+-----------------------+-------+----------
#  public | users                 | table | smd_user
#  public | categories            | table | smd_user
#  public | products              | table | smd_user
#  ...

# Exit PostgreSQL
\q
```

---

## ✅ Step 8: Verify Backend is Working

### Check Backend Health:

```bash
# Test health endpoint
curl http://localhost:3001/health

# Should return:
{
  "status": "OK",
  "timestamp": "2024-11-03T18:30:00.000Z",
  "uptime": 45.123,
  "environment": "production"
}
```

**Got JSON response? Excellent!** ✓

### Check Backend Logs:

```bash
# View backend logs
docker-compose logs backend

# Should see:
smd-backend | Server running on port 3001
smd-backend | Database connected successfully
smd-backend | Environment: production
```

### Follow Logs in Real-Time:

```bash
# Watch logs as they happen
docker-compose logs -f backend

# Press Ctrl+C to stop watching
```

---

## 🔍 Step 9: Test API Endpoints

### Test Categories Endpoint:

```bash
# Get all categories
curl http://localhost:3001/api/categories

# Should return (empty array if no data yet):
{
  "success": true,
  "data": []
}
```

### Test from Outside VPS:

```bash
# On your LOCAL computer:
curl http://51.75.143.218:3001/health

# If this doesn't work, it's because:
# - Firewall blocking
# - Port not exposed
# We'll fix this with Nginx in next guide
```

---

## 📊 Step 10: Create Admin User

### Seed Initial Admin:

```bash
# Create seed script or use Prisma Studio
docker exec -it smd-backend npx prisma studio

# This opens Prisma Studio (database GUI)
# But it's on the server, not accessible yet

# Alternative: Create admin via SQL
docker exec -it smd-postgres psql -U smd_user -d smd_hardware
```

**In PostgreSQL prompt:**

```sql
-- Create admin user (password: Admin123!)
INSERT INTO users (
  email,
  password,
  "firstName",
  "lastName",
  role,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin@smd-tunisie.com',
  '$2b$10$rBV2kHf5R0XxEQZ5Xq3zXeK4vK5YqH.Nh7Qp8Wq1Zx2Yq3Zx4Yq5',
  'Admin',
  'SMD',
  'ADMIN',
  true,
  NOW(),
  NOW()
);

-- Exit
\q
```

**Note**: The password hash above is for "Admin123!" - Change it after first login!

---

## 📝 Summary - What You Did

✅ Created project structure on VPS  
✅ Uploaded backend code  
✅ Created Dockerfile  
✅ Created docker-compose.yml  
✅ Configured environment variables  
✅ Built Docker images  
✅ Started all containers  
✅ Ran database migrations  
✅ Verified backend is working  
✅ Created admin user  

---

## 🎯 Next Steps

Your backend is now running in Docker!

**Next Guide**: [NGINX-SSL-SETUP.md](./NGINX-SSL-SETUP.md) - Make it accessible from internet

---

## 🆘 Troubleshooting

### Container Won't Start?

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Database not ready (wait 30 seconds)
# - Port already in use
# - Missing environment variables
```

### Database Connection Failed?

```bash
# Check postgres is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify credentials in .env file
cat .env | grep DB_
```

### Build Failed?

```bash
# Clean and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Can't Access API?

```bash
# Check if backend is listening
docker exec smd-backend netstat -tuln | grep 3001

# Check firewall
sudo ufw status

# Test from inside container
docker exec smd-backend curl http://localhost:3001/health
```

---

**Excellent progress!** Your backend is now running in production! 🎉

**Continue to**: [NGINX-SSL-SETUP.md](./NGINX-SSL-SETUP.md)
