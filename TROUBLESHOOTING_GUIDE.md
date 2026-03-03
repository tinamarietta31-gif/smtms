# Build & Deployment Troubleshooting Guide

## Common Issues & Solutions

---

## 🔴 Issue 1: npm error notarget - No matching version found

### Error Message:
```
npm error notarget No matching version found for jsonwebtoken^9.1.2
npm error notarget In most cases you or one of your dependencies are requesting
npm error notarget a package version that doesn't exist.
```

### ✅ Solutions:

**Solution A: Clean Install (Best)**
```bash
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Solution B: Update package.json**
- We've already updated it - just pull the latest version

**Solution C: Use Legacy Peer Deps**
```bash
cd backend
npm install --legacy-peer-deps
```

---

## 🔴 Issue 2: ETARGET - Exited with status 1

### Error Message:
```
npm error code ETARGET
npm error Exited with status 1 while building your code.
```

### ✅ Solutions:

```bash
# 1. Clear cache
npm cache clean --force

# 2. Remove node_modules
rm -rf node_modules package-lock.json

# 3. Install fresh
npm install

# 4. Check Node version
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 8.0.0

# 5. Upgrade if needed
npm install -g npm@latest
```

---

## 🔴 Issue 3: Port Already in Use

### Error Message:
```
Error: listen EADDRINUSE: address already in use :::5000
```

### ✅ Solutions:

**Find and Kill Process:**
```bash
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Use Different Port:**
```bash
# Edit backend/.env
PORT=5001

# Then start
npm run dev
```

---

## 🔴 Issue 4: MongoDB Connection Failed

### Error Message:
```
MongooseError: Cannot connect to mongodb://localhost:27017
```

### ✅ Solutions:

**Check MongoDB Running:**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker start smtms-mongodb

# Verify
mongosh
```

**Update Connection String:**
```bash
# Edit backend/.env
MONGODB_URI=mongodb://localhost:27017/smtms
# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/smtms
```

---

## 🔴 Issue 5: JWT_SECRET Not Set

### Error Message:
```
Error: JWT_SECRET is required
```

### ✅ Solutions:

```bash
# Edit backend/.env
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Restart server
npm run dev
```

---

## 🔴 Issue 6: CORS Error

### Error Message:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

### ✅ Solutions:

**Backend .env:**
```bash
CORS_ORIGIN=http://localhost:3000
```

**OR in app.js - add explicit CORS:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

**Frontend - verify API URL:**
```bash
# Edit frontend/.env
REACT_APP_API_URL=http://localhost:5000
```

---

## 🔴 Issue 7: Frontend Can't Connect to Backend

### Error Message:
```
Failed to fetch
Network error
API not responding
```

### ✅ Solutions:

**Check Backend Running:**
```bash
# Terminal 1: Backend
cd backend
npm run dev
# Should show: Server running on port 5000

# Terminal 2: Test
curl http://localhost:5000/api/auth/login
# Should respond with JSON (even if 400 error)
```

**Check Frontend Config:**
```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:5000

# Restart frontend
npm start
```

**Check Firewall:**
```bash
# macOS
# System Preferences > Security & Privacy > Firewall
# Allow Node.js

# Linux
sudo ufw allow 5000
```

---

## 🔴 Issue 8: Login Not Working

### Error Message:
```
Invalid credentials
User not found
Authentication failed
```

### ✅ Solutions:

**Verify Database Seeded:**
```bash
# Check if default user exists
mongosh
use smtms
db.users.find({ email: 'admin@smtms.gov.in' })

# If not, seed:
cd backend
node scripts/seedDatabase.js
```

**Check Credentials:**
```
Email: admin@smtms.gov.in
Password: admin123
```

**Enable Debug Logging:**
```bash
# backend/.env
LOG_LEVEL=debug

# Restart and check logs
npm run dev
```

---

## 🔴 Issue 9: Dependencies Won't Install

### Error Message:
```
npm ERR! code E...
npm ERR! npm ERR! node_modules...
```

### ✅ Solutions:

```bash
# Nuclear option - complete cleanup
cd backend

# Remove everything
rm -rf node_modules package-lock.json .npm

# Clear npm cache
npm cache clean --force
npm cache verify

# Clear Node cache
rm -rf ~/.npm

# Fresh install
npm install

# If still failing, try:
npm install --no-optional --legacy-peer-deps
```

---

## 🔴 Issue 10: Role Management Not Showing

### Error Message:
```
404 Not Found
Cannot GET /roles
```

### ✅ Solutions:

**Backend - Verify Routes:**
```bash
# Check app.js has:
const roleRoutes = require('./routes/roleRoutes');
app.use('/api/roles', roleRoutes);

# Restart backend
npm run dev
```

**Frontend - Verify Routes:**
```bash
# Check App.js or Router has:
<Route path="/roles" element={<RoleManagement />} />

# Clear browser cache
# Restart frontend
npm start
```

---

## 🔴 Issue 11: Database Seeding Fails

### Error Message:
```
DatabaseError
Connection timeout
Authentication failed
```

### ✅ Solutions:

```bash
# 1. Verify MongoDB running
mongosh

# 2. Check credentials in .env
cat backend/.env | grep MONGODB

# 3. Run seed with debug
node --inspect scripts/seedDatabase.js

# 4. Manual seed
mongosh
use smtms
db.roles.insertOne({
  name: "SUPER_ADMIN",
  description: "Full system control",
  permissions: [...]
})
```

---

## 🟡 Issue 12: Slow Performance

### Symptoms:
```
Slow API responses
High memory usage
Database timeouts
```

### ✅ Solutions:

```bash
# 1. Check Node memory
node --max-old-space-size=4096 app.js

# 2. Monitor processes
# macOS
top -o RES -S

# Linux
top

# 3. Check database indexes
mongosh
use smtms
db.users.getIndexes()

# 4. Add indexes if missing
db.users.createIndex({ email: 1 })
db.vehicles.createIndex({ registrationNumber: 1 })
```

---

## ✅ Verification Checklist

After fixing issues, verify:

- [ ] Node >= 18 installed
- [ ] npm >= 8 installed
- [ ] MongoDB running
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] npm dependencies installed
- [ ] Database seeded
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login with admin credentials
- [ ] Can access role management
- [ ] API responds to requests

---

## 🔧 Quick Reset Commands

### Complete Fresh Start:
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm run seed
npm run dev

# Frontend (new terminal)
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start

# Access: http://localhost:3000
# Login: admin@smtms.gov.in / admin123
```

---

## 📞 Still Having Issues?

### Check These Resources:
1. **DEPENDENCY_FIX.md** - Dependency issues
2. **SETUP_AND_DEPLOYMENT.md** - Setup guide
3. **API_REFERENCE.md** - API troubleshooting
4. **Code logs** - Check console for errors

### Debug Commands:
```bash
# Backend logs
npm run dev 2>&1 | tee debug.log

# Frontend logs
npm start 2>&1 | tee debug.log

# MongoDB logs
mongosh --verbose

# Network debugging
curl -v http://localhost:5000/api/auth/login
```

---

## 🚀 If All Else Fails

```bash
# Backup current state (if needed)
tar -czf backup.tar.gz niral/

# Start completely fresh
rm -rf niral/backend/node_modules
rm -rf niral/frontend/node_modules
rm -rf ~/.npm

# Reinstall everything
cd niral/backend && npm install
cd ../frontend && npm install

# Seed database
cd ../backend && node scripts/seedDatabase.js

# Start fresh
npm run dev
```

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Comprehensive troubleshooting guide
