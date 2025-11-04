# 🐳 Docker Setup Guide - Complete Beginner's Guide

## 📚 What You'll Learn
- What Docker is and why we use it
- How to install Docker and Docker Compose
- How to verify installation
- Basic Docker commands

**Time Required**: 20-30 minutes  
**Difficulty**: Beginner-friendly

---

## 🎯 What is Docker?

### Simple Explanation:

**Docker** = A way to package your application with everything it needs

Think of it like this:

```
Traditional Way (Problems):
Your App → Needs Node.js v18
         → Needs PostgreSQL
         → Needs specific libraries
         → "Works on my machine" problem

Docker Way (Solution):
┌─────────────────────────┐
│   Docker Container      │
│  ┌──────────────────┐  │
│  │ Your App         │  │
│  │ Node.js v18      │  │
│  │ All dependencies │  │
│  └──────────────────┘  │
└─────────────────────────┘
    ↓
Works everywhere! ✓
```

### Real-World Analogy:

**Shipping Container** = **Docker Container**

```
Physical Shipping:
- Container holds products
- Same container on truck, ship, train
- Easy to move anywhere

Docker:
- Container holds your app
- Same container on laptop, VPS, cloud
- Easy to deploy anywhere
```

### Why Docker for Your Project?

✅ **Consistency**: Same environment everywhere  
✅ **Isolation**: Each service in its own container  
✅ **Easy Updates**: Just rebuild and restart  
✅ **Rollback**: Easy to go back to previous version  
✅ **Scalability**: Easy to add more containers  

---

## 📋 Prerequisites

Before starting, make sure you completed:
- ✅ [VPS-SETUP.md](./VPS-SETUP.md) - VPS is configured

**Check you're connected to VPS:**
```bash
# You should see:
deployer@ubuntu:~$
```

---

## 🚀 Step 1: Install Docker

### What We're Installing:

1. **Docker Engine** = The core Docker software
2. **Docker Compose** = Tool to manage multiple containers

### Install Docker:

```bash
# Download Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh

# What this does:
# curl = Download tool
# -fsSL = Flags for silent download
# -o = Output to file
# Takes 5-10 seconds
```

```bash
# Run the installation script
sudo sh get-docker.sh

# What happens:
# - Detects your OS (Ubuntu 22.04)
# - Installs Docker Engine
# - Sets up Docker service
# Takes 1-2 minutes
```

You'll see output like:
```
# Executing docker install script...
+ sh -c apt-get update -qq >/dev/null
+ sh -c apt-get install -y -qq docker-ce >/dev/null
...
```

**Wait for it to finish!**

### Verify Docker Installation:

```bash
# Check Docker version
docker --version

# Should show something like:
Docker version 24.0.7, build afdd53b
```

**Success!** Docker is installed ✓

### Start Docker Service:

```bash
# Start Docker
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Check Docker status
sudo systemctl status docker
```

You should see:
```
● docker.service - Docker Application Container Engine
   Active: active (running)
```

**Press `q` to exit**

---

## 🔧 Step 2: Configure Docker Permissions

### Why This Step?

**Problem**: Right now, you need `sudo` for every Docker command

```bash
sudo docker ps  # Annoying to type sudo every time!
```

**Solution**: Add your user to the docker group

### Add User to Docker Group:

```bash
# Add deployer to docker group
sudo usermod -aG docker $USER

# What this does:
# usermod = Modify user
# -aG = Add to group
# docker = The group name
# $USER = Your current username (deployer)
```

### Apply Changes:

```bash
# Log out and back in for changes to take effect
exit

# SSH back in
ssh deployer@51.75.143.218
```

### Test Without Sudo:

```bash
# Try Docker command without sudo
docker ps

# Should show:
CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES

# (Empty list is fine - we haven't created containers yet)
```

**No error? Perfect!** ✓

---

## 📦 Step 3: Install Docker Compose

### What is Docker Compose?

**Docker Compose** = Tool to run multiple containers together

```
Your Application:
┌─────────────────────────────┐
│  docker-compose.yml         │
│                             │
│  services:                  │
│    backend:    ← Container 1│
│    postgres:   ← Container 2│
│    redis:      ← Container 3│
└─────────────────────────────┘
        ↓
One command starts all:
docker-compose up -d
```

### Install Docker Compose:

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# What this does:
# - Downloads latest version
# - Saves to /usr/local/bin/
# - $(uname -s) = Linux
# - $(uname -m) = x86_64
# Takes 10-20 seconds
```

```bash
# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# What this does:
# chmod = Change mode (permissions)
# +x = Add execute permission
```

### Verify Installation:

```bash
# Check Docker Compose version
docker-compose --version

# Should show:
Docker Compose version v2.23.0
```

**Success!** Docker Compose is installed ✓

---

## 🧪 Step 4: Test Docker Installation

### Run a Test Container:

```bash
# Run hello-world container
docker run hello-world

# What happens:
# 1. Docker looks for 'hello-world' image locally
# 2. Doesn't find it, downloads from Docker Hub
# 3. Creates a container from the image
# 4. Runs the container
# 5. Shows a message
# 6. Container stops
```

You should see:
```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
...
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

**This is perfect!** ✓

### Understanding What Happened:

```
1. You ran: docker run hello-world
           ↓
2. Docker checked: Do I have this image?
           ↓
3. Docker: No, let me download it
           ↓
4. Docker Hub → Downloaded image
           ↓
5. Docker: Created container from image
           ↓
6. Container: Ran and printed message
           ↓
7. Container: Stopped (job done)
```

### View Downloaded Images:

```bash
# List Docker images
docker images

# Should show:
REPOSITORY     TAG       IMAGE ID       CREATED        SIZE
hello-world    latest    9c7a54a9a43c   3 months ago   13.3kB
```

### Clean Up Test:

```bash
# Remove test container
docker rm $(docker ps -aq)

# Remove test image
docker rmi hello-world

# What these do:
# docker ps -aq = List all container IDs
# docker rm = Remove containers
# docker rmi = Remove images
```

---

## 📚 Step 5: Learn Basic Docker Commands

### Essential Commands:

#### **1. Working with Containers:**

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Start a container
docker start <container-name>

# Stop a container
docker stop <container-name>

# Restart a container
docker restart <container-name>

# Remove a container
docker rm <container-name>

# View container logs
docker logs <container-name>

# Follow logs in real-time
docker logs -f <container-name>

# Execute command in running container
docker exec -it <container-name> bash
```

#### **2. Working with Images:**

```bash
# List images
docker images

# Pull an image from Docker Hub
docker pull <image-name>

# Remove an image
docker rmi <image-name>

# Build image from Dockerfile
docker build -t <image-name> .
```

#### **3. Docker Compose Commands:**

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild and start
docker-compose up -d --build

# View running services
docker-compose ps
```

### Command Breakdown:

**Flags Explained:**
- `-d` = Detached mode (run in background)
- `-it` = Interactive terminal
- `-f` = Follow (for logs)
- `-a` = All
- `--build` = Rebuild images

---

## 🔍 Step 6: Understand Docker Architecture

### How Docker Works:

```
┌─────────────────────────────────────────┐
│         Your VPS Server                  │
│                                          │
│  ┌────────────────────────────────┐    │
│  │      Docker Engine             │    │
│  │                                 │    │
│  │  ┌──────────┐  ┌──────────┐   │    │
│  │  │Container │  │Container │   │    │
│  │  │          │  │          │   │    │
│  │  │ Backend  │  │PostgreSQL│   │    │
│  │  │ (Node.js)│  │(Database)│   │    │
│  │  └──────────┘  └──────────┘   │    │
│  │                                 │    │
│  │  ┌──────────┐                  │    │
│  │  │Container │                  │    │
│  │  │  Redis   │                  │    │
│  │  │ (Cache)  │                  │    │
│  │  └──────────┘                  │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │    Docker Volumes (Storage)     │    │
│  │  - Database data                │    │
│  │  - Uploaded files               │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Key Concepts:

**1. Images vs Containers:**

```
Image = Blueprint (Recipe)
  ↓
Container = Running instance (Actual dish)

Example:
- postgres:15 = Image (PostgreSQL v15 blueprint)
- smd-postgres = Container (Your running database)
```

**2. Volumes:**

```
Problem: Container data is lost when container stops

Solution: Volumes = Persistent storage

┌──────────────┐
│  Container   │
│              │
│  /app/data ──┼──→ Volume (on host)
└──────────────┘
                    ↓
              Data persists even if
              container is deleted
```

**3. Networks:**

```
Containers can talk to each other:

Backend Container
       ↓
   (Network)
       ↓
Database Container

They use container names:
postgresql://postgres:5432/database
           ↑
      Container name (not IP)
```

---

## ✅ Step 7: Verify Everything Works

### Run These Checks:

```bash
# 1. Check Docker version
docker --version

# 2. Check Docker Compose version
docker-compose --version

# 3. Check Docker service status
sudo systemctl status docker

# 4. Check Docker without sudo
docker ps

# 5. Check Docker info
docker info
```

### All Commands Work? ✓

If all commands run without errors, Docker is ready!

---

## 📝 Summary - What You Did

✅ Installed Docker Engine  
✅ Installed Docker Compose  
✅ Configured user permissions  
✅ Tested Docker installation  
✅ Learned basic Docker commands  
✅ Understood Docker architecture  

---

## 🎯 Next Steps

Docker is now installed and ready!

**Next Guide**: [BACKEND-DEPLOYMENT.md](./BACKEND-DEPLOYMENT.md) - Deploy your backend

---

## 🆘 Troubleshooting

### Docker Command Not Found?

**Problem**: `docker: command not found`

**Solution**:
```bash
# Check if Docker is installed
which docker

# If not found, reinstall:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Permission Denied?

**Problem**: `permission denied while trying to connect to the Docker daemon`

**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in
exit
ssh deployer@51.75.143.218

# Try again
docker ps
```

### Docker Service Not Running?

**Problem**: `Cannot connect to the Docker daemon`

**Solution**:
```bash
# Start Docker service
sudo systemctl start docker

# Enable on boot
sudo systemctl enable docker

# Check status
sudo systemctl status docker
```

### Docker Compose Not Working?

**Problem**: `docker-compose: command not found`

**Solution**:
```bash
# Check installation location
ls -l /usr/local/bin/docker-compose

# If not found, reinstall:
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 💡 Important Notes

### Things to Remember:

1. **Containers are Temporary**: Data inside containers is lost when they stop (use volumes!)
2. **Images are Cached**: Downloaded images stay on your server
3. **Logs are Important**: Always check logs when something fails
4. **Resources Matter**: Containers use CPU and RAM
5. **Updates**: Keep Docker updated for security

### Best Practices:

- ✓ Use Docker Compose for multi-container apps
- ✓ Always use volumes for persistent data
- ✓ Name your containers clearly
- ✓ Clean up unused images and containers
- ✓ Monitor resource usage

### Useful Tips:

```bash
# Clean up everything (careful!)
docker system prune -a

# View disk usage
docker system df

# Monitor resources
docker stats

# View all Docker info
docker info
```

---

**Excellent work!** Docker is now ready for your application! 🐳

**Continue to**: [BACKEND-DEPLOYMENT.md](./BACKEND-DEPLOYMENT.md)
