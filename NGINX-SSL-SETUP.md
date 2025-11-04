# 🌐 Nginx & SSL Setup Guide - Make Your API Accessible

## 📚 What You'll Learn
- What Nginx is and why we need it
- How to install and configure Nginx
- How to setup SSL certificates (HTTPS)
- How to configure reverse proxy
- How to serve uploaded files

**Time Required**: 30-40 minutes  
**Difficulty**: Intermediate

---

## 📋 Prerequisites

Before starting, make sure you completed:
- ✅ [VPS-SETUP.md](./VPS-SETUP.md) - VPS is configured
- ✅ [DOCKER-SETUP.md](./DOCKER-SETUP.md) - Docker is installed
- ✅ [BACKEND-DEPLOYMENT.md](./BACKEND-DEPLOYMENT.md) - Backend is running

**Check you're ready:**
```bash
# Backend is running
docker-compose ps

# Should show smd-backend as "Up"
```

---

## 🎯 What is Nginx?

### Simple Explanation:

**Nginx** = A web server that sits in front of your application

```
Without Nginx:
User → Backend (Port 3001)
Problems:
- No HTTPS
- No security
- Backend exposed directly

With Nginx:
User → Nginx (Port 443 HTTPS) → Backend (Port 3001)
Benefits:
✓ HTTPS/SSL
✓ Security headers
✓ Rate limiting
✓ Static file serving
✓ Load balancing
```

### Real-World Analogy:

```
Backend = Kitchen (cooks food)
Nginx = Waiter (serves customers)

Customer doesn't go to kitchen directly
Waiter takes order → Kitchen prepares → Waiter serves

Benefits:
- Kitchen stays organized
- Waiter handles customer service
- Kitchen focuses on cooking
```

### What Nginx Does for You:

1. **Reverse Proxy** - Forwards requests to your backend
2. **SSL Termination** - Handles HTTPS encryption
3. **Static Files** - Serves images, uploads directly
4. **Security** - Adds security headers
5. **Rate Limiting** - Prevents abuse
6. **Caching** - Speeds up responses

---

## 📦 Step 1: Install Nginx

### Install:

```bash
# Update package list
sudo apt update

# Install Nginx
sudo apt install -y nginx

# Takes 30-60 seconds
```

### Start Nginx:

```bash
# Start Nginx service
sudo systemctl start nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

You should see:
```
● nginx.service - A high performance web server
   Active: active (running)
```

**Press `q` to exit**

### Test Nginx:

```bash
# Test from VPS
curl http://localhost

# Should show HTML (Nginx welcome page)
```

**From your browser:**
- Go to: `http://51.75.143.218`
- You should see: "Welcome to nginx!"

**Success!** Nginx is running ✓

---

## 🔧 Step 2: Configure Nginx for Your API

### Understanding Nginx Configuration:

```
/etc/nginx/
├── nginx.conf              ← Main config (don't touch)
├── sites-available/        ← Available site configs
│   └── smd-api            ← We'll create this
└── sites-enabled/          ← Active site configs
    └── smd-api → ../sites-available/smd-api (symlink)
```

### Remove Default Site:

```bash
# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Verify it's gone
ls /etc/nginx/sites-enabled/
# Should be empty
```

### Create API Configuration:

```bash
# Create new site configuration
sudo nano /etc/nginx/sites-available/smd-api
```

**Paste this configuration:**

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_conn_zone $binary_remote_addr zone=addr:10m;

# Upstream backend
upstream backend_api {
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP server (will redirect to HTTPS later)
server {
    listen 80;
    listen [::]:80;
    server_name 51.75.143.218;

    # Server info
    server_tokens off;

    # Logging
    access_log /var/log/nginx/smd-api-access.log;
    error_log /var/log/nginx/smd-api-error.log warn;

    # Max upload size
    client_max_body_size 50M;
    client_body_timeout 60s;

    # Health check endpoint
    location /health {
        proxy_pass http://backend_api/health;
        access_log off;
    }

    # API endpoints
    location /api/ {
        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;
        limit_conn addr 10;

        # Proxy settings
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Uploaded files
    location /uploads/ {
        alias /var/www/smd-store/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
        
        # Security
        location ~ \.(php|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

**Save and exit** (`Ctrl + X`, `Y`, `Enter`)

### Understanding the Configuration:

```nginx
Rate Limiting:
- Prevents abuse
- Max 10 requests per second per IP
- Burst of 20 allowed

Upstream:
- Defines backend server
- Health checks
- Connection pooling

Proxy Settings:
- Forward requests to backend
- Add security headers
- Set timeouts

Static Files:
- Serve uploads directly
- Cache for 30 days
- Block dangerous files
```

### Enable the Site:

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/smd-api /etc/nginx/sites-enabled/

# Verify link created
ls -la /etc/nginx/sites-enabled/

# Should show:
# smd-api -> /etc/nginx/sites-available/smd-api
```

### Test Configuration:

```bash
# Test Nginx configuration
sudo nginx -t

# Should show:
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**If you see errors, check your configuration file for typos!**

### Reload Nginx:

```bash
# Reload Nginx to apply changes
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

---

## 🧪 Step 3: Test Nginx Proxy

### Test from VPS:

```bash
# Test health endpoint through Nginx
curl http://localhost/health

# Should return:
{
  "status": "OK",
  "timestamp": "...",
  "uptime": ...,
  "environment": "production"
}
```

### Test API endpoint:

```bash
# Test categories endpoint
curl http://localhost/api/categories

# Should return:
{
  "success": true,
  "data": []
}
```

### Test from Your Computer:

**Open browser and go to:**
- `http://51.75.143.218/health`
- `http://51.75.143.218/api/categories`

**You should see JSON responses!** ✓

---

## 🔐 Step 4: Install SSL Certificate (HTTPS)

### What is SSL/HTTPS?

```
HTTP  = http://yoursite.com  (Not secure ❌)
HTTPS = https://yoursite.com (Secure ✓)

HTTPS encrypts data between user and server

Benefits:
✓ Secure login
✓ Protect customer data
✓ SEO ranking boost
✓ Browser trust (green padlock 🔒)
✓ Required for modern web
```

### Install Certbot:

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version

# Should show: certbot 1.x.x
```

### Option A: SSL for Domain (Recommended)

**If you have a domain pointing to your VPS:**

```bash
# Get SSL certificate
sudo certbot --nginx -d api.sqb-tunisie.com

# Follow prompts:
# 1. Enter email address
# 2. Agree to terms (Y)
# 3. Share email? (N)
# 4. Redirect HTTP to HTTPS? (2 - Yes)
```

### Option B: Self-Signed Certificate (Testing Only)

**For IP address (not recommended for production):**

```bash
# Create self-signed certificate
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx-selfsigned.key \
  -out /etc/nginx/ssl/nginx-selfsigned.crt

# Answer questions:
Country Name: TN
State: Tunis
Locality: Tunis
Organization: SMD Tunisie
Common Name: 51.75.143.218
Email: admin@smd-tunisie.com
```

**Then update Nginx config:**

```bash
sudo nano /etc/nginx/sites-available/smd-api
```

**Add HTTPS server block:**

```nginx
# Add after the HTTP server block:

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name 51.75.143.218;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rest of configuration (copy from HTTP server)
    # ... (all location blocks)
}
```

### Update HTTP Server to Redirect:

```nginx
# Modify HTTP server block:
server {
    listen 80;
    listen [::]:80;
    server_name 51.75.143.218;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}
```

**Save and test:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ Step 5: Test HTTPS

### Test from Browser:

**Go to:**
- `https://51.75.143.218/health`
- `https://51.75.143.218/api/categories`

**Self-signed certificate warning?**
- Click "Advanced"
- Click "Proceed to 51.75.143.218"
- This is normal for self-signed certificates

### Test from Command Line:

```bash
# Test HTTPS (ignore certificate warning)
curl -k https://51.75.143.218/health

# Should return JSON
```

---

## 🔄 Step 6: Setup Auto-Renewal (If using Certbot)

### Test Renewal:

```bash
# Dry run (test without actually renewing)
sudo certbot renew --dry-run

# Should show:
Congratulations, all simulated renewals succeeded
```

### Auto-Renewal is Already Setup:

```bash
# Check certbot timer
sudo systemctl status certbot.timer

# Should show: active (running)
```

Certbot automatically renews certificates before they expire!

---

## 📊 Step 7: Configure Firewall

### Update Firewall Rules:

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status

# Should show:
To                         Action      From
--                         ------      ----
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

## 🎨 Step 8: Add Security Headers

### Edit Nginx Config:

```bash
sudo nano /etc/nginx/sites-available/smd-api
```

**Add to HTTPS server block:**

```nginx
# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

**Save, test, and reload:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📝 Step 9: Setup Logging

### Log Files Location:

```
/var/log/nginx/
├── smd-api-access.log    ← All requests
├── smd-api-error.log     ← Errors only
├── access.log            ← General access
└── error.log             ← General errors
```

### View Logs:

```bash
# View access log (last 50 lines)
sudo tail -n 50 /var/log/nginx/smd-api-access.log

# Follow access log in real-time
sudo tail -f /var/log/nginx/smd-api-access.log

# View error log
sudo tail -n 50 /var/log/nginx/smd-api-error.log

# Press Ctrl+C to stop following
```

### Setup Log Rotation:

```bash
# Create log rotation config
sudo nano /etc/logrotate.d/smd-api
```

**Paste:**

```
/var/log/nginx/smd-api-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

**Save and exit**

---

## ✅ Step 10: Final Verification

### Complete Checklist:

```bash
# 1. Nginx is running
sudo systemctl status nginx

# 2. Backend is accessible through Nginx
curl http://localhost/health

# 3. HTTPS is working
curl -k https://51.75.143.218/health

# 4. API endpoints work
curl https://51.75.143.218/api/categories

# 5. Firewall allows traffic
sudo ufw status

# 6. Logs are working
sudo tail -n 5 /var/log/nginx/smd-api-access.log
```

### Test from Frontend:

**Update your frontend .env.production:**

```bash
# On your local computer
# Edit: src/.env.production

VITE_API_URL=https://51.75.143.218/api
```

**Build and test:**

```bash
npm run build
# Test the build locally
```

---

## 📝 Summary - What You Did

✅ Installed Nginx  
✅ Configured reverse proxy  
✅ Setup SSL/HTTPS  
✅ Added security headers  
✅ Configured rate limiting  
✅ Setup static file serving  
✅ Configured logging  
✅ Updated firewall  
✅ Tested everything  

---

## 🎯 Next Steps

Your API is now accessible via HTTPS!

**Next Guide**: [FRONTEND-DEPLOYMENT.md](./FRONTEND-DEPLOYMENT.md) - Deploy your frontends

---

## 🆘 Troubleshooting

### Nginx Won't Start?

```bash
# Check configuration
sudo nginx -t

# Check logs
sudo tail -n 50 /var/log/nginx/error.log

# Check if port 80/443 is in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### 502 Bad Gateway?

```bash
# Backend not running
docker-compose ps

# Backend not accessible
curl http://localhost:3001/health

# Check Nginx error log
sudo tail -f /var/log/nginx/smd-api-error.log
```

### SSL Certificate Issues?

```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx SSL config
sudo nginx -t
```

### Can't Access from Browser?

```bash
# Check firewall
sudo ufw status

# Check Nginx is listening
sudo netstat -tulpn | grep nginx

# Test from VPS first
curl http://localhost/health
```

---

**Excellent work!** Your API is now secure and accessible! 🔒

**Continue to**: [FRONTEND-DEPLOYMENT.md](./FRONTEND-DEPLOYMENT.md)
