# ATOS Application Deployment Guide

## 📋 Gereksinimler

- Ubuntu 20.04+ / CentOS 8+ Linux sunucu
- 4GB+ RAM
- 20GB+ disk alanı
- Git
- İnternet bağlantısı

## 🚀 Hızlı Kurulum

### 1. Otomatik Deployment (Önerilen)

```bash
# Repository'yi clone edin
git clone https://github.com/FreeFrontendTeam/atos-be.git
cd atos-be

# Deploy script'ini çalıştırın
chmod +x deploy.sh
./deploy.sh
```

### 2. Manuel Kurulum

#### Docker Kurulumu

```bash
# Docker kurulumu (Ubuntu için)
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# Logout/login yapın veya şu komutu çalıştırın:
newgrp docker
```

#### Uygulama Kurulumu

```bash
# Deployment dizinini oluşturun
sudo mkdir -p /opt/atos-app
sudo chown $USER:$USER /opt/atos-app
cd /opt/atos-app

# Repository'yi clone edin
git clone https://github.com/FreeFrontendTeam/atos-be.git .

# Environment dosyasını oluşturun
cp .env.production .env
nano .env  # Gerçek değerlerle düzenleyin

# Uygulamayı başlatın
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Konfigürasyon

### Environment Variables (.env)

```bash
# Veritabanı
DB_PASSWORD=güçlü-veritabanı-şifresi
DB_USER=atos_user
DB_NAME=atos_db

# JWT
JWT_SECRET=256-bit-jwt-secret-key

# Redis
REDIS_PASSWORD=güçlü-redis-şifresi

# Domain
CORS_ORIGIN=https://yourdomain.com
```

## 🛠️ Jenkins Konfigürasyonu

### 1. Jenkins Plugin'leri

Gerekli plugin'leri yükleyin:

- Docker Pipeline
- Blue Ocean
- Slack Notification
- Git

### 2. Credentials Ekleme

Jenkins > Credentials > Global > Add Credentials:

```
docker-registry: Docker Hub credentials
production-server: SSH private key for production server
slack-webhook: Slack notification webhook
```

### 3. Pipeline Oluşturma

1. Jenkins > New Item > Pipeline
2. Pipeline script from SCM seçin
3. Repository URL'yi girin
4. Script Path: `Jenkinsfile`

### 4. Webhook Kurulumu (Otomatik Deployment)

GitHub/GitLab'da webhook ekleyin:

- URL: `http://jenkins-server/github-webhook/`
- Events: Push to main/master branch

## 📊 Monitoring ve Yönetim

### Konteyner Durumu

```bash
cd /opt/atos-app
docker-compose -f docker-compose.prod.yml ps
```

### Log'ları İnceleme

```bash
# Tüm servisler
docker-compose -f docker-compose.prod.yml logs -f

# Sadece API
docker-compose -f docker-compose.prod.yml logs -f api

# Sadece Web
docker-compose -f docker-compose.prod.yml logs -f web
```

### Restart

```bash
# Tüm servisleri yeniden başlat
docker-compose -f docker-compose.prod.yml restart

# Sadece API'yi yeniden başlat
docker-compose -f docker-compose.prod.yml restart api
```

### Health Check

```bash
# API health check
curl http://localhost:8080/health

# Web health check
curl http://localhost:8081/
```

## 🔄 Deployment Akışı

### 1. Development Branch

```bash
git checkout develop
git add .
git commit -m "feature: yeni özellik"
git push origin develop
```

→ Jenkins staging environment'a deploy eder

### 2. Production Deployment

```bash
git checkout main
git merge develop
git push origin main
```

→ Jenkins production'a deploy eder

### 3. Rollback

```bash
# Jenkins pipeline'dan otomatik rollback
# veya manuel:
cd /opt/atos-app
docker-compose -f docker-compose.prod.yml down
tar -xzf /opt/backups/backup-YYYYMMDD-HHMMSS.tar.gz
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Güvenlik

### SSL/TLS Sertifikası

```bash
# Let's Encrypt ile ücretsiz SSL
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com

# Nginx config'ini güncelle
sudo nano /etc/nginx/sites-available/atos
```

### Firewall

```bash
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 8080/tcp  # API
sudo ufw allow 8081/tcp  # Web
sudo ufw allow 443/tcp   # HTTPS
```

### Database Backup

```bash
# Otomatik backup script oluşturun
cat > /opt/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/db"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec atos-app_postgres_1 pg_dump -U atos_user atos_db > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# 30 günden eski backupları sil
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x /opt/backup-db.sh

# Crontab'a ekle (günlük backup)
echo "0 2 * * * /opt/backup-db.sh" | sudo crontab -
```

## 📝 Troubleshooting

### Port Çakışması

```bash
# Kullanılan portları kontrol et
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :8081

# Çakışan servisi durdur
sudo systemctl stop nginx  # Eğer nginx çalışıyorsa
```

### Disk Alanı

```bash
# Docker images temizleme
docker system prune -af

# Log dosyalarını temizle
sudo journalctl --vacuum-time=7d
```

### Memory Issues

```bash
# Container memory kullanımı
docker stats

# Memory limit ekle (docker-compose.yml)
services:
  api:
    mem_limit: 512m
  web:
    mem_limit: 256m
```

## 🆘 Destek

### Log Dosyaları

- Application logs: `/var/log/atos/`
- Docker logs: `docker-compose logs`
- System logs: `/var/log/syslog`

### Monitoring Endpoints

- API Health: `http://server-ip:8080/health`
- Web Status: `http://server-ip:8081/`
- Docker Stats: `docker stats`

### Yaygın Problemler

1. **Port 8080/8081 kullanımda**: `sudo netstat -tulpn | grep :8080` ile kontrol et ve çakışan servisi durdur
2. **Docker permission error**: `sudo usermod -aG docker $USER && newgrp docker`
3. **Database connection error**: `.env` dosyasında DB credentials'ları kontrol edin
4. **Memory issues**: `docker system prune -f` ve sunucuyu restart edin

Bu deployment konfigürasyonu production-ready olup, security best practices'lerini takip eder.
