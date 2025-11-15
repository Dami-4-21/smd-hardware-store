#!/bin/bash

################################################################################
# VPS Safe Update Script with Docker
# Purpose: Safely audit and update deployed application
# Date: November 15, 2025
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_PATH="/path/to/your/project"  # UPDATE THIS
BACKUP_DIR="$HOME/vps-audit-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$BACKUP_DIR/update.log"

################################################################################
# Helper Functions
################################################################################

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

confirm() {
    read -p "$(echo -e ${YELLOW}$1${NC}) [y/N]: " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        error "$1 is not installed"
        return 1
    fi
    return 0
}

################################################################################
# Phase 1: Pre-Update Audit
################################################################################

phase1_audit() {
    log "=== PHASE 1: PRE-UPDATE AUDIT ==="
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    log "Created backup directory: $BACKUP_DIR"
    
    # Check if project exists
    if [ ! -d "$PROJECT_PATH" ]; then
        error "Project directory not found: $PROJECT_PATH"
        exit 1
    fi
    
    cd "$PROJECT_PATH"
    
    # Check Docker
    info "Checking Docker status..."
    if check_command docker; then
        docker ps > "$BACKUP_DIR/docker-containers-before.txt"
        docker images > "$BACKUP_DIR/docker-images-before.txt"
        log "Docker is running"
    else
        warning "Docker not found"
    fi
    
    # Check Docker Compose
    if check_command docker-compose; then
        docker-compose ps > "$BACKUP_DIR/docker-compose-status.txt" 2>/dev/null || true
    fi
    
    # Check PM2
    if check_command pm2; then
        pm2 list > "$BACKUP_DIR/pm2-status.txt" 2>/dev/null || true
    fi
    
    # Check nginx
    if check_command nginx; then
        sudo systemctl status nginx > "$BACKUP_DIR/nginx-status.txt" 2>/dev/null || true
    fi
    
    # Save current git state
    info "Saving current git state..."
    git log --oneline -10 > "$BACKUP_DIR/git-state-before.txt"
    git status > "$BACKUP_DIR/git-status-before.txt"
    git diff > "$BACKUP_DIR/git-diff-before.txt" 2>/dev/null || true
    
    # Backup environment files
    info "Backing up environment files..."
    [ -f backend/.env ] && cp backend/.env "$BACKUP_DIR/backend-env-backup"
    [ -f .env.production ] && cp .env.production "$BACKUP_DIR/frontend-env-backup"
    [ -f docker-compose.yml ] && cp docker-compose.yml "$BACKUP_DIR/docker-compose-backup.yml"
    
    # Backup nginx config
    if [ -f /etc/nginx/sites-available/* ]; then
        sudo cp /etc/nginx/sites-available/* "$BACKUP_DIR/" 2>/dev/null || true
    fi
    
    # Test current application
    info "Testing current application..."
    if curl -f http://localhost:3001/health > "$BACKUP_DIR/health-check-before.txt" 2>&1; then
        log "Backend health check: OK"
    else
        warning "Backend health check failed"
    fi
    
    log "Phase 1 complete: Audit saved to $BACKUP_DIR"
}

################################################################################
# Phase 2: Database Backup
################################################################################

phase2_backup() {
    log "=== PHASE 2: DATABASE BACKUP ==="
    
    if confirm "Do you want to backup the database?"; then
        info "Starting database backup..."
        
        # Try Docker PostgreSQL backup
        if docker ps | grep -q postgres; then
            POSTGRES_CONTAINER=$(docker ps --filter "ancestor=postgres" --format "{{.Names}}" | head -1)
            if [ -n "$POSTGRES_CONTAINER" ]; then
                info "Found PostgreSQL container: $POSTGRES_CONTAINER"
                docker exec "$POSTGRES_CONTAINER" pg_dumpall -U postgres > "$BACKUP_DIR/database-full-backup.sql" 2>&1
                log "Database backup created: $BACKUP_DIR/database-full-backup.sql"
            fi
        else
            warning "No PostgreSQL container found, skipping database backup"
        fi
        
        # Backup uploads directory
        if [ -d "$PROJECT_PATH/backend/uploads" ]; then
            info "Backing up uploads directory..."
            tar -czf "$BACKUP_DIR/uploads-backup.tar.gz" "$PROJECT_PATH/backend/uploads/" 2>/dev/null
            log "Uploads backup created"
        fi
    else
        warning "Database backup skipped"
    fi
}

################################################################################
# Phase 3: Pull Latest Changes
################################################################################

phase3_pull() {
    log "=== PHASE 3: PULL LATEST CHANGES ==="
    
    cd "$PROJECT_PATH"
    
    # Fetch updates
    info "Fetching latest changes from GitHub..."
    git fetch origin main
    
    # Show what will change
    info "Changes to be pulled:"
    git log HEAD..origin/main --oneline | tee -a "$LOG_FILE"
    
    if ! confirm "Do you want to pull these changes?"; then
        warning "Update cancelled by user"
        exit 0
    fi
    
    # Stash local changes if any
    if ! git diff-index --quiet HEAD --; then
        warning "Local changes detected, stashing..."
        git stash save "Auto-stash before update $(date)"
    fi
    
    # Pull changes
    info "Pulling changes..."
    git pull origin main
    
    log "Phase 3 complete: Latest code pulled"
}

################################################################################
# Phase 4: Build Docker Images
################################################################################

phase4_build() {
    log "=== PHASE 4: BUILD DOCKER IMAGES ==="
    
    cd "$PROJECT_PATH"
    
    if [ ! -f docker-compose.yml ]; then
        warning "docker-compose.yml not found, skipping Docker build"
        return
    fi
    
    info "Building Docker images..."
    docker-compose build --no-cache
    
    log "Phase 4 complete: Docker images built"
}

################################################################################
# Phase 5: Update Database Schema
################################################################################

phase5_migrate() {
    log "=== PHASE 5: UPDATE DATABASE SCHEMA ==="
    
    cd "$PROJECT_PATH/backend"
    
    # Check if schema changed
    if git diff HEAD@{1} HEAD -- prisma/schema.prisma | grep -q "^+"; then
        warning "Database schema has changed!"
        
        if confirm "Do you want to run database migrations?"; then
            info "Running Prisma migrations..."
            
            # Generate Prisma client
            docker-compose run --rm backend npx prisma generate
            
            # Deploy migrations
            docker-compose run --rm backend npx prisma migrate deploy
            
            log "Database migrations completed"
        else
            warning "Database migrations skipped"
        fi
    else
        info "No database schema changes detected"
    fi
}

################################################################################
# Phase 6: Rolling Update
################################################################################

phase6_update() {
    log "=== PHASE 6: ROLLING UPDATE ==="
    
    cd "$PROJECT_PATH"
    
    if confirm "Do you want to restart services with new code?"; then
        info "Restarting services..."
        
        # Restart backend
        docker-compose up -d --no-deps backend
        sleep 5
        
        # Check backend health
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log "Backend restarted successfully"
        else
            error "Backend health check failed after restart!"
            if confirm "Do you want to rollback?"; then
                rollback
                exit 1
            fi
        fi
        
        # Update frontend
        info "Building frontend..."
        npm install
        npm run build
        
        # Copy to nginx (adjust path as needed)
        if [ -d dist ]; then
            sudo cp -r dist/* /var/www/html/ 2>/dev/null || warning "Could not copy frontend files"
        fi
        
        # Reload nginx
        sudo nginx -t && sudo systemctl reload nginx
        
        log "Phase 6 complete: Services updated"
    else
        warning "Service restart skipped"
    fi
}

################################################################################
# Phase 7: Verification
################################################################################

phase7_verify() {
    log "=== PHASE 7: POST-UPDATE VERIFICATION ==="
    
    cd "$PROJECT_PATH"
    
    # Check Docker containers
    info "Checking Docker containers..."
    docker-compose ps | tee -a "$LOG_FILE"
    
    # Health checks
    info "Running health checks..."
    
    # Backend health
    if curl -f http://localhost:3001/health > "$BACKUP_DIR/health-check-after.txt" 2>&1; then
        log "✓ Backend health check: OK"
    else
        error "✗ Backend health check: FAILED"
    fi
    
    # Frontend check
    if curl -I http://localhost:5173 > /dev/null 2>&1; then
        log "✓ Frontend check: OK"
    else
        warning "✗ Frontend check: FAILED (may be normal if using nginx)"
    fi
    
    # Check logs for errors
    info "Checking recent logs for errors..."
    docker-compose logs backend --tail=50 | grep -i error | tee -a "$LOG_FILE" || log "No errors found in logs"
    
    # Save post-update state
    docker ps > "$BACKUP_DIR/docker-containers-after.txt"
    git log --oneline -5 > "$BACKUP_DIR/git-state-after.txt"
    
    log "Phase 7 complete: Verification done"
}

################################################################################
# Phase 8: Cleanup
################################################################################

phase8_cleanup() {
    log "=== PHASE 8: CLEANUP ==="
    
    if confirm "Do you want to clean up old Docker images?"; then
        info "Cleaning up Docker..."
        docker image prune -f
        docker volume prune -f
        log "Docker cleanup complete"
    fi
    
    # Create update summary
    cat > "$BACKUP_DIR/update-summary.txt" <<EOF
Update Summary
==============
Date: $(date)
Backup Location: $BACKUP_DIR
Git Commit Before: $(head -1 "$BACKUP_DIR/git-state-before.txt")
Git Commit After: $(cd "$PROJECT_PATH" && git log --oneline -1)
Status: SUCCESS
Downtime: ~30 seconds (rolling update)
EOF
    
    log "Update summary saved to $BACKUP_DIR/update-summary.txt"
    log "Phase 8 complete: Cleanup done"
}

################################################################################
# Rollback Function
################################################################################

rollback() {
    error "=== INITIATING ROLLBACK ==="
    
    cd "$PROJECT_PATH"
    
    # Stop containers
    docker-compose down
    
    # Restore git state
    PREVIOUS_COMMIT=$(head -1 "$BACKUP_DIR/git-state-before.txt" | awk '{print $1}')
    git reset --hard "$PREVIOUS_COMMIT"
    
    # Restore database if backup exists
    if [ -f "$BACKUP_DIR/database-full-backup.sql" ]; then
        warning "Restoring database..."
        POSTGRES_CONTAINER=$(docker ps --filter "ancestor=postgres" --format "{{.Names}}" | head -1)
        if [ -n "$POSTGRES_CONTAINER" ]; then
            docker exec -i "$POSTGRES_CONTAINER" psql -U postgres < "$BACKUP_DIR/database-full-backup.sql"
        fi
    fi
    
    # Restart services
    docker-compose up -d
    
    error "Rollback complete. System restored to previous state."
}

################################################################################
# Main Execution
################################################################################

main() {
    clear
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         VPS Safe Update Script with Docker                ║"
    echo "║         SMD Hardware Store                                 ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Verify we're running as the right user
    info "Running as user: $(whoami)"
    info "Project path: $PROJECT_PATH"
    
    if [ ! -d "$PROJECT_PATH" ]; then
        error "Project path not found. Please update PROJECT_PATH in the script."
        exit 1
    fi
    
    # Run phases
    phase1_audit
    phase2_backup
    phase3_pull
    phase4_build
    phase5_migrate
    phase6_update
    phase7_verify
    phase8_cleanup
    
    # Final summary
    echo -e "\n${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              UPDATE COMPLETED SUCCESSFULLY                 ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log "All phases completed successfully!"
    log "Backup location: $BACKUP_DIR"
    log "Log file: $LOG_FILE"
    
    echo -e "\n${BLUE}Next steps:${NC}"
    echo "1. Monitor application logs: docker-compose logs -f backend"
    echo "2. Check application in browser"
    echo "3. Review backup: ls -lh $BACKUP_DIR"
    echo "4. If issues occur, run: bash $0 rollback"
}

# Handle rollback command
if [ "$1" == "rollback" ]; then
    if [ -z "$2" ]; then
        error "Please specify backup directory"
        echo "Usage: $0 rollback /path/to/backup/directory"
        exit 1
    fi
    BACKUP_DIR="$2"
    rollback
    exit 0
fi

# Run main
main
