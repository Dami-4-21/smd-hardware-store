#!/bin/bash

################################################################################
# Deploy to VPS - sqb-tunisie.com
# Deploys admin and customer apps to VPS with custom domains
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VPS_HOST="root@51.75.143.218"
VPS_ADMIN_PATH="/var/www/sqb-tunisie/admin"
VPS_CUSTOMER_PATH="/var/www/sqb-tunisie/customer"
VPS_BACKEND_PATH="/var/www/sqb-tunisie/backend"

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Deploy to VPS - sqb-tunisie.com                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print colored messages
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if SSH connection works
check_ssh() {
    log "Checking SSH connection to VPS..."
    if ssh -o ConnectTimeout=5 $VPS_HOST "echo 'SSH connection successful'" > /dev/null 2>&1; then
        log "✓ SSH connection OK"
    else
        error "Cannot connect to VPS. Please check your SSH configuration."
        exit 1
    fi
}

# Deploy admin dashboard
deploy_admin() {
    log "=== DEPLOYING ADMIN DASHBOARD ==="
    
    cd admin-dashboard
    
    # Check if .env.production exists
    if [ ! -f .env.production ]; then
        warning ".env.production not found, creating from example..."
        cp .env.production.example .env.production
        warning "Please edit .env.production with correct values"
        read -p "Press Enter to continue after editing .env.production..."
    fi
    
    info "Installing dependencies..."
    npm install
    
    info "Building admin dashboard..."
    npm run build
    
    if [ ! -d "dist" ]; then
        error "Build failed - dist directory not found"
        exit 1
    fi
    
    log "Uploading to VPS..."
    ssh $VPS_HOST "mkdir -p $VPS_ADMIN_PATH"
    rsync -avz --delete dist/ $VPS_HOST:$VPS_ADMIN_PATH/
    
    log "✓ Admin dashboard deployed"
    cd ..
}

# Deploy customer shop
deploy_customer() {
    log "=== DEPLOYING CUSTOMER SHOP ==="
    
    # Check if .env.production exists
    if [ ! -f .env.production ]; then
        warning ".env.production not found, creating from example..."
        cp .env.production.example .env.production
        warning "Please edit .env.production with correct values"
        read -p "Press Enter to continue after editing .env.production..."
    fi
    
    info "Installing dependencies..."
    npm install
    
    info "Building customer shop..."
    npm run build
    
    if [ ! -d "dist" ]; then
        error "Build failed - dist directory not found"
        exit 1
    fi
    
    log "Uploading to VPS..."
    ssh $VPS_HOST "mkdir -p $VPS_CUSTOMER_PATH"
    rsync -avz --delete dist/ $VPS_HOST:$VPS_CUSTOMER_PATH/
    
    log "✓ Customer shop deployed"
}

# Deploy backend
deploy_backend() {
    log "=== DEPLOYING BACKEND ==="
    
    info "Syncing backend code to VPS..."
    ssh $VPS_HOST "mkdir -p $VPS_BACKEND_PATH"
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude 'dist' \
        --exclude '.env' \
        --exclude 'uploads' \
        backend/ $VPS_HOST:$VPS_BACKEND_PATH/
    
    info "Installing dependencies on VPS..."
    ssh $VPS_HOST "cd $VPS_BACKEND_PATH && npm install"
    
    info "Building backend on VPS..."
    ssh $VPS_HOST "cd $VPS_BACKEND_PATH && npm run build"
    
    info "Restarting backend container..."
    ssh $VPS_HOST "cd $VPS_BACKEND_PATH && docker-compose restart backend"
    
    # Wait a bit for backend to start
    sleep 3
    
    info "Checking backend health..."
    if ssh $VPS_HOST "curl -f http://localhost:3001/health" > /dev/null 2>&1; then
        log "✓ Backend is healthy"
    else
        warning "Backend health check failed - please check logs"
    fi
    
    log "✓ Backend deployed"
}

# Set permissions
set_permissions() {
    log "=== SETTING PERMISSIONS ==="
    
    ssh $VPS_HOST "chown -R www-data:www-data /var/www/sqb-tunisie"
    ssh $VPS_HOST "chmod -R 755 /var/www/sqb-tunisie"
    
    log "✓ Permissions set"
}

# Reload nginx
reload_nginx() {
    log "=== RELOADING NGINX ==="
    
    info "Testing nginx configuration..."
    if ssh $VPS_HOST "nginx -t" > /dev/null 2>&1; then
        log "✓ Nginx configuration OK"
        
        info "Reloading nginx..."
        ssh $VPS_HOST "systemctl reload nginx"
        log "✓ Nginx reloaded"
    else
        error "Nginx configuration test failed"
        exit 1
    fi
}

# Main deployment
main() {
    check_ssh
    
    # Ask what to deploy
    echo ""
    echo "What would you like to deploy?"
    echo "1) Admin Dashboard only"
    echo "2) Customer Shop only"
    echo "3) Backend only"
    echo "4) Admin + Customer (Frontend only)"
    echo "5) Everything (Admin + Customer + Backend)"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            deploy_admin
            ;;
        2)
            deploy_customer
            ;;
        3)
            deploy_backend
            ;;
        4)
            deploy_admin
            deploy_customer
            ;;
        5)
            deploy_admin
            deploy_customer
            deploy_backend
            ;;
        *)
            error "Invalid choice"
            exit 1
            ;;
    esac
    
    set_permissions
    reload_nginx
    
    echo ""
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              DEPLOYMENT SUCCESSFUL! ✓                      ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo ""
    echo -e "${BLUE}Your applications are now live:${NC}"
    echo ""
    echo "  Admin Dashboard:  https://sqb-tunisie.com/admin"
    echo "  Customer Shop:    https://sqb-tunisie.com/customer"
    echo "  Backend API:      https://www.catalogquienquillerie.sqb-tunisie.com"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Test admin dashboard in browser"
    echo "  2. Test customer shop in browser"
    echo "  3. Check browser console for errors (F12)"
    echo "  4. Verify API calls are working"
    echo ""
}

# Run main
main
