#!/bin/bash

# ATOS Application Deployment Script
# Bu script Linux sunucuda çalıştırılacak

set -e

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="atos-app"
DEPLOY_DIR="/opt/atos-app"
BACKUP_DIR="/opt/backups"
REPO_URL="https://github.com/FreeFrontendTeam/atos-be.git"
BRANCH="main"

echo -e "${BLUE}🚀 ATOS Application Deployment Started${NC}"

# Function to print colored output
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. Consider using a dedicated user."
    fi
}

# Install Docker and Docker Compose if not present
install_docker() {
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."

        # Update package index
        sudo apt-get update

        # Install packages to allow apt to use a repository over HTTPS
        sudo apt-get install -y \
            apt-transport-https \
            ca-certificates \
            curl \
            gnupg \
            lsb-release

        # Add Docker's official GPG key
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

        # Set up stable repository
        echo \
          "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Install Docker Engine
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io

        # Add current user to docker group
        sudo usermod -aG docker $USER

        log_success "Docker installed successfully"
    else
        log_success "Docker is already installed"
    fi
}

install_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        log_info "Installing Docker Compose..."

        # Install Docker Compose
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose

        log_success "Docker Compose installed successfully"
    else
        log_success "Docker Compose is already installed"
    fi
}

# Create necessary directories
create_directories() {
    log_info "Creating directories..."

    sudo mkdir -p $DEPLOY_DIR
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p /var/log/atos

    # Set proper permissions
    sudo chown -R $USER:$USER $DEPLOY_DIR
    sudo chown -R $USER:$USER $BACKUP_DIR

    log_success "Directories created"
}

# Clone or update repository
setup_repository() {
    log_info "Setting up repository..."

    if [ -d "$DEPLOY_DIR/.git" ]; then
        log_info "Repository exists, updating..."
        cd $DEPLOY_DIR
        git fetch origin
        git reset --hard origin/$BRANCH
        git clean -fd
    else
        log_info "Cloning repository..."
        cd /opt
        sudo rm -rf $DEPLOY_DIR
        git clone $REPO_URL $DEPLOY_DIR
        cd $DEPLOY_DIR
        git checkout $BRANCH
        sudo chown -R $USER:$USER $DEPLOY_DIR
    fi

    log_success "Repository setup complete"
}

# Setup environment variables
setup_environment() {
    log_info "Setting up environment variables..."

    cd $DEPLOY_DIR

    if [ ! -f ".env" ]; then
        if [ -f ".env.production" ]; then
            cp .env.production .env
            log_success "Environment file copied from .env.production"
        else
            log_warning ".env file not found. Please create one manually."
            log_info "Sample environment variables:"
            cat << EOF > .env.sample
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=atos_db
DB_USER=atos_user
DB_PASSWORD=change-this-password

# JWT Configuration
JWT_SECRET=change-this-jwt-secret

# Redis Configuration
REDIS_PASSWORD=change-this-redis-password

# Security
CORS_ORIGIN=https://yourdomain.com
EOF
            log_warning "Please edit .env file with your actual values"
        fi
    else
        log_success "Environment file already exists"
    fi
}

# Backup current deployment
backup_current() {
    log_info "Creating backup of current deployment..."

    if [ -d "$DEPLOY_DIR" ]; then
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        cd $DEPLOY_DIR

        # Stop services before backup
        docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

        # Create backup
        tar -czf "$BACKUP_DIR/$BACKUP_NAME" . 2>/dev/null || true

        log_success "Backup created: $BACKUP_NAME"

        # Keep only last 10 backups
        cd $BACKUP_DIR
        ls -t backup-*.tar.gz | tail -n +11 | xargs rm -f 2>/dev/null || true
    fi
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."

    cd $DEPLOY_DIR

    # Build and start services
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d

    log_success "Application deployed"
}

# Health check
health_check() {
    log_info "Performing health check..."

    # Wait for services to start
    sleep 30

    # Check if containers are running
    cd $DEPLOY_DIR
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log_success "Containers are running"
    else
        log_error "Some containers are not running"
        docker-compose -f docker-compose.prod.yml ps
        return 1
    fi

    # Check health endpoints
    max_attempts=30
    attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/health &> /dev/null; then
            log_success "API health check passed"
            break
        fi

        log_info "Health check attempt $attempt/$max_attempts..."
        sleep 5
        ((attempt++))
    done

    if [ $attempt -gt $max_attempts ]; then
        log_error "Health check failed"
        return 1
    fi

    # Check web frontend
    if curl -f http://localhost:8081/ &> /dev/null; then
        log_success "Web health check passed"
    else
        log_warning "Web health check failed"
    fi
}

# Setup systemd service for auto-restart
setup_systemd() {
    log_info "Setting up systemd service..."

    sudo tee /etc/systemd/system/atos-app.service > /dev/null << EOF
[Unit]
Description=ATOS Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable atos-app.service

    log_success "Systemd service created"
}

# Setup log rotation
setup_logging() {
    log_info "Setting up log rotation..."

    sudo tee /etc/logrotate.d/atos-app > /dev/null << EOF
/var/log/atos/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 $USER $USER
    postrotate
        docker kill -s USR1 \$(docker ps -q --filter "name=atos")
    endscript
}
EOF

    log_success "Log rotation configured"
}

# Main deployment function
main() {
    log_info "Starting ATOS application deployment..."

    check_root
    install_docker
    install_docker_compose
    create_directories
    setup_repository
    setup_environment
    backup_current
    deploy_application
    health_check
    setup_systemd
    setup_logging

    log_success "🎉 ATOS application deployed successfully!"
    log_info "Application is running at:"
    log_info "  - Web: http://$(hostname -I | awk '{print $1}'):8081"
    log_info "  - API: http://$(hostname -I | awk '{print $1}'):8080"
    log_info ""
    log_info "Useful commands:"
    log_info "  - Check status: cd $DEPLOY_DIR && docker-compose -f docker-compose.prod.yml ps"
    log_info "  - View logs: cd $DEPLOY_DIR && docker-compose -f docker-compose.prod.yml logs -f"
    log_info "  - Restart: sudo systemctl restart atos-app"
    log_info "  - Stop: cd $DEPLOY_DIR && docker-compose -f docker-compose.prod.yml down"
}

# Handle errors
error_handler() {
    log_error "Deployment failed on line $1"
    log_info "Rolling back..."

    # Try to restore from backup
    if [ -d "$BACKUP_DIR" ]; then
        LATEST_BACKUP=$(ls -t $BACKUP_DIR/backup-*.tar.gz 2>/dev/null | head -n1)
        if [ -n "$LATEST_BACKUP" ]; then
            log_info "Restoring from backup: $LATEST_BACKUP"
            cd $DEPLOY_DIR
            docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
            tar -xzf "$LATEST_BACKUP"
            docker-compose -f docker-compose.prod.yml up -d 2>/dev/null || true
            log_success "Rollback completed"
        fi
    fi

    exit 1
}

trap 'error_handler $LINENO' ERR

# Run main function
main "$@"
