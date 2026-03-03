# Complete Setup & Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Configuration](#database-configuration)
4. [Backend Configuration](#backend-configuration)
5. [Frontend Configuration](#frontend-configuration)
6. [Running the Application](#running-the-application)
7. [Testing the System](#testing-the-system)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Performance Optimization](#performance-optimization)

---

## Prerequisites

### Required Software
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 or **yarn** >= 1.22.0
- **MongoDB** >= 5.0
- **Git** >= 2.0
- **Python** >= 3.9 (for ML model)

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 10GB free space
- **OS**: Linux, macOS, or Windows

### Installation Verification
```bash
node --version     # Should be >= 18.0.0
npm --version      # Should be >= 8.0.0
mongod --version   # Should be >= 5.0
python --version   # Should be >= 3.9
git --version      # Should be >= 2.0
```

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/niral.git
cd niral
```

### 2. Project Structure
```
niral/
├── backend/
├── frontend/
├── ml-model/
├── README.md
├── IMPLEMENTATION_GUIDE.md
├── RBAC_QUICK_REFERENCE.md
├── TESTING_GUIDE.md
├── API_REFERENCE.md
└── SETUP_AND_DEPLOYMENT.md (this file)
```

---

## Database Configuration

### MongoDB Local Setup

#### Option 1: Docker Installation (Recommended)
```bash
# Pull MongoDB image
docker pull mongo:latest

# Run MongoDB container
docker run -d \
  --name smtms-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -v mongodb_data:/data/db \
  mongo:latest

# Verify installation
mongo mongodb://admin:admin123@localhost:27017/
```

#### Option 2: Direct Installation (macOS with Homebrew)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Connect to MongoDB
mongosh
```

#### Option 3: Direct Installation (Ubuntu/Debian)
```bash
# Add MongoDB repository
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
apt-get update
apt-get install -y mongodb-org

# Start MongoDB service
systemctl start mongod

# Verify installation
mongosh
```

### PostGIS Extension Setup (Optional - for spatial queries)
```bash
# This is needed if you want full PostGIS support
# Note: SMTMS uses MongoDB with geospatial index support

# Create database
mongo
use smtms
db.createCollection("authorities")
```

### Database Initialization
```bash
# Navigate to backend
cd backend

# Run seed script to initialize roles and admin
node scripts/seedDatabase.js

# Expected output:
# Connected to MongoDB
# Roles created/updated
# Default authority created
# Default super admin created
# Database seeding completed successfully
```

---

## Backend Configuration

### 3. Backend Setup

#### Step 1: Install Dependencies
```bash
cd backend
npm install
```

#### Step 2: Environment Configuration
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# Use any text editor (nano, vim, VS Code, etc.)
nano .env
```

#### Step 3: Configure .env File
```env
# MongoDB Configuration
MONGODB_URI=mongodb://admin:admin123@localhost:27017/smtms?authSource=admin
MONGODB_USER=admin
MONGODB_PASSWORD=admin123

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# ECM Integration
ECM_API_URL=http://ecm-provider.com/api
ECM_API_KEY=your_ecm_key

# Logging
LOG_LEVEL=debug
LOG_DIR=./logs
```

#### Step 4: Install Packages
```bash
npm install express mongoose bcryptjs jsonwebtoken cors dotenv axios
npm install -D nodemon
```

#### Step 5: Start Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Expected output:
# Server running on port 5000
# Connected to MongoDB
# CORS enabled for http://localhost:3000
```

---

## Frontend Configuration

### 4. Frontend Setup

#### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

#### Step 2: Environment Configuration
```bash
# Copy example environment file
cp .env.example .env

# Edit .env
nano .env
```

#### Step 3: Configure .env File
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Application Configuration
REACT_APP_APP_NAME=SMTMS
REACT_APP_APP_VERSION=1.0.0

# Map Configuration
REACT_APP_MAP_PROVIDER=openstreetmap
REACT_APP_DEFAULT_LAT=28.6139
REACT_APP_DEFAULT_LON=77.2090
REACT_APP_DEFAULT_ZOOM=12

# Feature Flags
REACT_APP_ENABLE_VEHICLE_TRACKING=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_REMOTE_CONTROL=true
REACT_APP_ENABLE_CHALLAN_GENERATION=true

# Environment
REACT_APP_ENV=development
```

#### Step 4: Install Packages
```bash
npm install react react-dom react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npm install leaflet react-leaflet
```

#### Step 5: Start Frontend Server
```bash
# Development mode
npm start

# Expected output:
# webpack compiled
# Compiled successfully!
# Available at: http://localhost:3000
```

---

## Running the Application

### Start in Development Mode

#### Terminal 1: Start MongoDB
```bash
# Using Docker
docker start smtms-mongodb

# Using Homebrew (macOS)
brew services start mongodb-community

# Using systemctl (Linux)
systemctl start mongod
```

#### Terminal 2: Start Backend
```bash
cd backend
npm run dev
```

#### Terminal 3: Start Frontend
```bash
cd frontend
npm start
```

#### Terminal 4 (Optional): Start ML Model
```bash
cd ml-model
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **MongoDB**: mongodb://localhost:27017

### Default Credentials
- **Email**: admin@smtms.gov.in
- **Password**: admin123

---

## Testing the System

### 1. Backend API Testing

#### Using Postman
```
1. Open Postman
2. Create new collection "SMTMS"
3. Add requests from API_REFERENCE.md
4. Set authorization: Bearer {token}
5. Run requests
```

#### Using curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smtms.gov.in","password":"admin123"}'

# Get authorities
curl -X GET http://localhost:5000/api/authorities \
  -H "Authorization: Bearer {token}"
```

### 2. Frontend Testing
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- LoginPage.test.js
```

### 3. Run Test Suite
```bash
cd backend
npm test

# Expected output:
# PASS  tests/rbac.test.js
# ✓ Authentication tests (4)
# ✓ Authority tests (8)
# ✓ Member tests (11)
# ...
```

### 4. Manual Workflow Testing

#### Super Admin Workflow
```
1. Login as admin@smtms.gov.in
2. Create new authority
3. Create new super admin user
4. Create owner user
5. Create driver user
6. Verify permissions
```

#### Owner Workflow
```
1. Login as owner
2. View authority dashboard
3. Add driver
4. Add vehicle
5. Assign vehicle to driver
6. Monitor trips
```

#### Driver Workflow
```
1. Login as driver
2. View own profile
3. View assigned vehicle
4. Start trip
5. Monitor trip in real-time
6. End trip
```

---

## Production Deployment

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] SSL/TLS certificates obtained
- [ ] Domain configured
- [ ] CDN setup (optional)
- [ ] Monitoring configured
- [ ] Logging configured

### Deployment to AWS

#### 1. EC2 Instance Setup
```bash
# Launch EC2 instance (Ubuntu 22.04)
# Security group: Allow 80, 443, 22

# SSH into instance
ssh -i key.pem ubuntu@instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nodejs npm mongodb git nginx
```

#### 2. Deploy Backend
```bash
# Clone repository
git clone https://github.com/yourusername/niral.git
cd niral/backend

# Install dependencies
npm install

# Create .env with production values
nano .env

# Start with PM2 (process manager)
sudo npm install -g pm2
pm2 start app.js --name "smtms-backend"
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup -u ubuntu --hp /home/ubuntu
```

#### 3. Deploy Frontend
```bash
cd ../frontend

# Build production bundle
npm run build

# Move to nginx directory
sudo cp -r build/* /var/www/html/

# Configure nginx
sudo nano /etc/nginx/sites-available/smtms
```

#### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5. Enable HTTPS (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Deployment to Docker

#### 1. Create Dockerfile for Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "app.js"]
```

#### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    environment:
      MONGODB_URI: mongodb://admin:admin123@mongodb:27017/smtms
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### 3. Deploy with Docker
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump \
  -u admin \
  -p admin123 \
  --authenticationDatabase admin \
  -o "$BACKUP_DIR/backup_$TIMESTAMP"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" \
  "$BACKUP_DIR/backup_$TIMESTAMP"

# Remove old backups (keep last 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete
```

#### Schedule Backup (Crontab)
```bash
# Edit crontab
crontab -e

# Add: Run backup daily at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## Troubleshooting

### Backend Issues

#### Problem: "Cannot connect to MongoDB"
```
Solution:
1. Check MongoDB is running: mongosh
2. Verify MONGODB_URI in .env
3. Check MongoDB credentials
4. Verify network connectivity
```

#### Problem: "JWT token invalid"
```
Solution:
1. Verify JWT_SECRET in .env matches
2. Check token expiration
3. Ensure Authorization header format: "Bearer {token}"
4. Clear browser cache and login again
```

#### Problem: "CORS error"
```
Solution:
1. Verify CORS_ORIGIN in backend .env
2. Check frontend URL matches CORS_ORIGIN
3. Add credentials to frontend requests: 
   axios.defaults.withCredentials = true
```

### Frontend Issues

#### Problem: "Cannot fetch API"
```
Solution:
1. Verify backend is running on port 5000
2. Check REACT_APP_API_URL in .env
3. Verify network request in DevTools
4. Check CORS headers in backend response
```

#### Problem: "Login not working"
```
Solution:
1. Verify credentials: admin@smtms.gov.in / admin123
2. Check browser console for errors
3. Verify backend is responding to login request
4. Check token is saved in localStorage
```

#### Problem: "Components not rendering"
```
Solution:
1. Check React imports
2. Verify context providers in App.js
3. Check console for component errors
4. Verify route configuration
```

### Database Issues

#### Problem: "Duplicate key error"
```
Solution:
1. Drop conflicting collections: db.collection.drop()
2. Clear data: db.dropDatabase()
3. Re-seed: node scripts/seedDatabase.js
```

#### Problem: "Disk space full"
```
Solution:
1. Check usage: df -h
2. Clear logs: rm -rf logs/*.log
3. Remove old backups: find /backups -mtime +30 -delete
3. Clean npm cache: npm cache clean --force
```

---

## Performance Optimization

### Backend Optimization

#### 1. Database Indexing
```javascript
// Add to models
userSchema.index({ email: 1 });
vehicleSchema.index({ registrationNumber: 1 });
tripSchema.index({ driver: 1, startTime: -1 });
```

#### 2. Pagination Implementation
```javascript
const page = req.query.page || 1;
const limit = req.query.limit || 10;
const skip = (page - 1) * limit;

const data = await Model.find().skip(skip).limit(limit);
```

#### 3. Caching Strategy
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache authorities for 1 hour
const cacheKey = 'authorities:all';
const cached = await client.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### Frontend Optimization

#### 1. Code Splitting
```javascript
import React, { lazy, Suspense } from 'react';
const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<div>Loading...</div>}>
  <Dashboard />
</Suspense>
```

#### 2. Image Optimization
```bash
# Compress images
npm install -D image-webpack-loader

# Add to webpack config
{
  test: /\.(png|jpg|jpeg|gif)$/,
  use: ['image-webpack-loader']
}
```

#### 3. Bundle Analysis
```bash
npm install -D webpack-bundle-analyzer

# Analyze bundle size
npm run build -- --analyze
```

### Monitoring & Logging

#### 1. Application Monitoring
```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Monitor application
pm2 monit
```

#### 2. Error Tracking
```javascript
// Add Sentry for error tracking
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-dsn" });
```

#### 3. Performance Monitoring
```javascript
// Add New Relic
require('newrelic');
```

---

## Support & Resources

- **Documentation**: See README.md, IMPLEMENTATION_GUIDE.md
- **API Reference**: See API_REFERENCE.md
- **Testing**: See TESTING_GUIDE.md
- **Quick Reference**: See RBAC_QUICK_REFERENCE.md

---

*Last Updated: 2024*  
*Version: 1.0.0*  
*Status: Production Ready*
