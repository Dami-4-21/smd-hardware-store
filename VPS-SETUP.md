# 🖥️ VPS Setup Guide - Step by Step for Beginners

## 📚 What You'll Learn
- How to connect to your VPS
- How to secure your server
- How to install necessary software
- How to create a deployment user

**Time Required**: 30-40 minutes  
**Difficulty**: Beginner-friendly

---

## 🎯 What is a VPS?

**VPS (Virtual Private Server)** = Your own computer in a data center

Think of it like this:
- Your laptop = Your personal workspace
- VPS = An office you rent that's always open (24/7)

**Your VPS Details:**
- IP Address: `51.75.143.218`
- Operating System: Ubuntu 22.04
- Location: Data center (always online)

---

## 📋 Step 1: Connect to Your VPS

### What is SSH?

**SSH** = Secure way to control your server remotely

```
Your Computer  ----SSH Connection---->  VPS Server
   (Client)      (Encrypted tunnel)     (51.75.143.218)
```

### On Windows:

**Option A: Use PowerShell (Built-in)**
```powershell
# Open PowerShell and type:
ssh root@51.75.143.218

# You'll be asked for password
# Type it (you won't see characters - this is normal)
# Press Enter
```

**Option B: Use PuTTY (If PowerShell doesn't work)**
1. Download PuTTY: https://www.putty.org/
2. Open PuTTY
3. Enter Host Name: `51.75.143.218`
4. Port: `22`
5. Click "Open"
6. Login as: `root`
7. Enter password

### On Mac/Linux:

```bash
# Open Terminal and type:
ssh root@51.75.143.218

# Enter password when prompted
```

### First Time Connection:

You'll see this message:
```
The authenticity of host '51.75.143.218' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

**Type**: `yes` and press Enter

**Why?** This is normal for first-time connections. Your computer is asking if you trust this server.

### Success!

When connected, you'll see something like:
```
root@ubuntu:~#
```

This means you're now controlling your VPS! 🎉

---

## 🔒 Step 2: Update Your Server

### Why Update?

Think of updates like:
- Fixing bugs in your car
- Patching security holes in your house
- Getting the latest features

### Commands to Run:

```bash
# Update package list (check for new versions)
apt update

# What this does:
# - Contacts Ubuntu servers
# - Downloads list of available updates
# - Takes 10-30 seconds
```

You'll see output like:
```
Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
Get:2 http://security.ubuntu.com/ubuntu jammy-security InRelease
...
Reading package lists... Done
```

**This is good!** ✓

```bash
# Upgrade installed packages (install updates)
apt upgrade -y

# What this does:
# - Downloads and installs updates
# - The -y flag means "yes to all"
# - Takes 2-5 minutes
```

You'll see packages being installed. **Wait for it to finish.**

### Optional but Recommended:

```bash
# Remove unnecessary packages
apt autoremove -y

# Clean up
apt autoclean
```

---

## 👤 Step 3: Create a Deployment User

### Why Not Use Root?

**Root** = Administrator with unlimited power

**Problem**: If someone hacks root, they control everything!

**Solution**: Create a regular user for daily tasks

### Create User:

```bash
# Create new user named 'deployer'
adduser deployer

# You'll be asked questions:
```

**Questions and Answers:**
```
New password: [Type a strong password]
Retype new password: [Type it again]
Full Name []: Deployer
Room Number []: [Press Enter]
Work Phone []: [Press Enter]
Home Phone []: [Press Enter]
Other []: [Press Enter]
Is the information correct? [Y/n] Y
```

**Password Tips:**
- At least 12 characters
- Mix of letters, numbers, symbols
- Example: `Deploy2024!Secure#`
- **Write it down somewhere safe!**

### Give User Sudo Powers:

```bash
# Add deployer to sudo group
usermod -aG sudo deployer

# What is sudo?
# sudo = "Super User DO"
# Allows running admin commands when needed
```

### Test the New User:

```bash
# Switch to deployer user
su - deployer

# You should see:
deployer@ubuntu:~$

# Test sudo access:
sudo ls /root

# Enter deployer's password
# If it works, you'll see root's files
```

**Success!** Your deployment user is ready ✓

```bash
# Go back to root
exit

# You should see:
root@ubuntu:~#
```

---

## 🔥 Step 4: Setup Firewall

### What is a Firewall?

**Firewall** = A security guard for your server

```
Internet → Firewall → Your Server
           ↓
     Blocks bad traffic
     Allows good traffic
```

### Install UFW (Uncomplicated Firewall):

```bash
# Install UFW
apt install -y ufw

# Takes 10-20 seconds
```

### Configure Firewall Rules:

```bash
# Allow SSH (port 22) - IMPORTANT!
ufw allow OpenSSH

# Why important?
# Without this, you'll lock yourself out!
```

```bash
# Allow HTTP (port 80) - for websites
ufw allow 80/tcp

# Allow HTTPS (port 443) - for secure websites
ufw allow 443/tcp
```

### Enable Firewall:

```bash
# Turn on firewall
ufw enable

# You'll see:
Command may disrupt existing ssh connections. Proceed with operation (y|n)?
```

**Type**: `y` and press Enter

### Check Firewall Status:

```bash
# View firewall rules
ufw status

# You should see:
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

**Perfect!** Your firewall is protecting your server ✓

---

## 🛡️ Step 5: Install Fail2Ban (Brute Force Protection)

### What is Fail2Ban?

**Fail2Ban** = Automatically blocks hackers trying to guess your password

```
Hacker tries wrong password 5 times
         ↓
Fail2Ban notices
         ↓
Blocks hacker's IP for 10 minutes
```

### Install:

```bash
# Install Fail2Ban
apt install -y fail2ban

# Start service
systemctl start fail2ban

# Enable on boot
systemctl enable fail2ban
```

### Check Status:

```bash
# View Fail2Ban status
systemctl status fail2ban

# You should see:
● fail2ban.service - Fail2Ban Service
   Active: active (running)
```

**Press `q` to exit**

---

## 📦 Step 6: Install Essential Tools

### Install Basic Tools:

```bash
# Install useful tools
apt install -y curl wget git vim htop unzip

# What each tool does:
# curl - Download files from internet
# wget - Another download tool
# git - Version control (for your code)
# vim - Text editor
# htop - System monitor (like Task Manager)
# unzip - Extract zip files
```

### Test Installation:

```bash
# Check Git
git --version
# Should show: git version 2.x.x

# Check curl
curl --version
# Should show: curl 7.x.x
```

---

## 🔑 Step 7: Setup SSH Key (Optional but Recommended)

### What is an SSH Key?

**SSH Key** = A digital key instead of password

**Benefits:**
- More secure than passwords
- No typing passwords
- Can't be guessed by hackers

### On Your Computer (Not VPS):

**Windows (PowerShell):**
```powershell
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Press Enter for default location
# Enter passphrase (or leave empty)
# Press Enter twice

# Copy public key
type $env:USERPROFILE\.ssh\id_rsa.pub
```

**Mac/Linux:**
```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Press Enter for default location
# Enter passphrase (or leave empty)

# Copy public key
cat ~/.ssh/id_rsa.pub
```

**Copy the entire output** (starts with `ssh-rsa`)

### On Your VPS:

```bash
# Switch to deployer
su - deployer

# Create .ssh directory
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Create authorized_keys file
nano ~/.ssh/authorized_keys

# Paste your public key (Right-click to paste)
# Press Ctrl+X, then Y, then Enter to save

# Set permissions
chmod 600 ~/.ssh/authorized_keys

# Exit back to root
exit
```

### Test SSH Key:

**On your computer:**
```bash
# Try connecting with SSH key
ssh deployer@51.75.143.218

# Should connect without password!
```

---

## ✅ Step 8: Verify Everything

### Run These Checks:

```bash
# 1. Check system info
lsb_release -a

# Should show: Ubuntu 22.04

# 2. Check firewall
sudo ufw status

# Should show: Status: active

# 3. Check Fail2Ban
sudo systemctl status fail2ban

# Should show: active (running)

# 4. Check disk space
df -h

# Should show available space

# 5. Check memory
free -h

# Should show available RAM
```

### All Good? ✓

If all commands work, your VPS is ready!

---

## 📝 Summary - What You Did

✅ Connected to your VPS via SSH  
✅ Updated the system  
✅ Created a deployment user  
✅ Setup firewall (UFW)  
✅ Installed Fail2Ban  
✅ Installed essential tools  
✅ (Optional) Setup SSH keys  

---

## 🎯 Next Steps

Your VPS is now secure and ready!

**Next Guide**: [DOCKER-SETUP.md](./DOCKER-SETUP.md) - Install Docker

---

## 🆘 Troubleshooting

### Can't Connect via SSH?

**Problem**: Connection refused or timeout

**Solutions**:
1. Check IP address is correct: `51.75.143.218`
2. Check your internet connection
3. Try from different network
4. Contact your VPS provider

### Forgot Password?

**Solution**: Use VPS provider's console/recovery mode to reset

### Locked Out After Enabling Firewall?

**Solution**: Use VPS provider's console to disable firewall:
```bash
ufw disable
```

### Command Not Found?

**Solution**: Make sure you ran `apt update` and `apt upgrade`

---

## 💡 Important Notes

### Things to Remember:

1. **Save Your Passwords**: Write them down securely
2. **Don't Close Terminal**: While commands are running
3. **Read Error Messages**: They tell you what's wrong
4. **Take Your Time**: No need to rush
5. **Backup Important Data**: Before making changes

### Security Best Practices:

- ✓ Use strong passwords
- ✓ Enable firewall
- ✓ Keep system updated
- ✓ Use SSH keys
- ✓ Don't share root access

---

**Great job!** Your VPS is now secure and ready for Docker installation! 🎉

**Continue to**: [DOCKER-SETUP.md](./DOCKER-SETUP.md)
