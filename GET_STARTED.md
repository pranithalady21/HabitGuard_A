# 🎓 Complete Guide: Running Your Full-Stack HabitGuard App

This guide walks you through getting your complete habit tracking application up and running.

---

## 📋 Table of Contents

1. [Local Development](#local-development)
2. [Testing](#testing)
3. [Production Deployment](#production-deployment)
4. [Troubleshooting](#troubleshooting)

---

## 🏠 Local Development

### Prerequisites

- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Git installed
- Code editor (VS Code recommended)

### Step 1: Backend Setup (5 minutes)

```bash
# 1. Navigate to project root
cd HabitGuard

# 2. Install dependencies
npm install

# 3. Start backend server
npm start

# Expected output:
# Server is running on port 5000
# MongoDB Connected: localhost
```

The backend will be available at: `http://localhost:5000`

**Test it**:
```bash
curl http://localhost:5000/
# Response: "HabitGuard API Running"
```

### Step 2: Frontend Setup (5 minutes)

**In a new terminal**:

```bash
# 1. Navigate to frontend directory
cd HabitGuard/frontend

# 2. Install dependencies
npm install

# 3. Create .env file
echo REACT_APP_API_URL=http://localhost:5000/api > .env

# 4. Start React development server
npm start

# The app will open at http://localhost:3000
```

### Step 3: Test the Application

1. **Open browser**: http://localhost:3000

2. **You should see**:
   - HabitGuard header
   - User ID input form
   - "Get Started" section

3. **Try it out**:
   - Enter User ID: `demo_user_1`
   - Click "Continue"
   - Click "Add New Habit"
   - Enter habit title: `Morning Exercise`
   - Click "Add Habit"
   - You should see the habit in the list
   - Click "Mark Complete"
   - Habit completion count should increase

4. **Test Insights**:
   - Click "Show Insights" on a habit
   - You should see consistency score, streak, and suggestions

5. **Test Suspicious Behavior Detection**:
   - Quickly click "Mark Complete" 5+ times in 5 seconds
   - You should see a warning alert about "RAPID_UPDATES"

**Congratulations! Your full-stack app is working! 🎉**

---

## 🧪 Testing

### Test Data

```javascript
// User ID
demo_user_1

// Habits to create
- Morning Exercise
- Read a Book
- Meditation
- Drink Water
- Study Programming
```

### Test Scenarios

#### Scenario 1: Normal Usage
```
1. Create a habit
2. Mark complete once daily for 5 days
3. Check insights show consistency improving
4. No warnings should appear
```

#### Scenario 2: Rapid Completion
```
1. Create a habit
2. Click "Mark Complete" 5+ times quickly
3. Watch for RAPID_UPDATES warning
4. Warning should show in red alert box
```

#### Scenario 3: Perfect Streak
```
1. Create a habit
2. Mark complete for 31 consecutive days
   - Use dev tools to modify timestamps
   - Or write a test script
3. Unrealistic streak warning should appear
```

#### Scenario 4: Error Handling
```
1. Stop backend server
2. Try to create habit
3. Should show: "Failed to create habit"
4. Restart backend - works again
```

### Manual API Testing

Use curl or Postman:

```bash
# Create habit
curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Habit","userId":"demo_user_1"}'

# Get all habits
curl http://localhost:5000/api/habits/demo_user_1

# Mark complete
curl -X POST http://localhost:5000/api/habits/{habitId}/complete \
  -H "Content-Type: application/json" \
  -d '{}'

# Get insights
curl http://localhost:5000/api/habits/{habitId}/insights
```

---

## 🚀 Production Deployment

Prepare your backend and frontend for production by pushing to a cloud provider and setting the necessary environment variables.

**Step-by-step**:

1. **Go to**: https://railway.app

2. **Sign in** with GitHub

3. **Create new project**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your `habitguard` repository

4. **Configure environment**
   - Go to "Variables" tab
   - Add:
   ```
   PORT=3000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/habitguard?retryWrites=true&w=majority
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for completion (~2-5 minutes)

6. **Get URL**
   - Go to "Settings" → "Domains"
   - Copy your Railway URL
   - Format: `https://habitguard-production-xxxx.railway.app`
   - Save for next step ⭐

### Phase 3: Deploy Frontend on Netlify

**Step-by-step**:

1. **Go to**: https://app.netlify.com

2. **Sign in** with GitHub

3. **Deploy from Git**
   - Click "Add new site"
   - Select "Import an existing project"
   - Choose `habitguard` repository

4. **Configure settings**
   - **Base directory**: `frontend` ⭐ (IMPORTANT!)
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

5. **Add environment variables**
   - Before deploying, click "Advanced"
   - Add new variable:
   ```
   REACT_APP_API_URL = https://your-railway-url/api
   ```
   (Use your Railway URL from Phase 2)

6. **Deploy**
   - Click "Deploy site"
   - Wait for completion (~3-5 minutes)
   - Netlify will assign a domain

7. **Get URL**
   - Format: `https://habitguard.netlify.app`
   - Or your custom domain

### Phase 4: Verify Deployment

```bash
# Test backend
curl https://your-railway-url/

# Test API
curl https://your-railway-url/api/habits/test-user

# Open frontend
https://habitguard.netlify.app
```

**Everything should work!** 🎉

### Continuous Deployment

Now when you push changes:

```bash
git add .
git commit -m "Feature: Add new detection type"
git push origin main

# Automatic:
# 1. Railway rebuilds and deploys backend
# 2. Netlify rebuilds and deploys frontend
# 3. Changes go live in ~5 minutes
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: "Cannot find module 'express'"

```bash
# Solution: Install dependencies
npm install

# Or clear and reinstall
rm -rf node_modules
npm install
```

**Error**: "Port 3000 already in use"

```bash
# Solution 1: Kill process on port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID {PID} /F

# Solution 2: Change port in .env
PORT=5001
```

**Error**: "MongoDB connection failed"

```bash
# Solution 1: Ensure local MongoDB is running
# Windows:
net start MongoDB

# Mac:
brew services start mongodb-community

# Solution 2: Use MongoDB Atlas connection string in .env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/habitguard
```

### Frontend Won't Start

**Error**: "Cannot find module 'react'"

```bash
cd frontend
npm install
```

**Error**: "REACT_APP_API_URL is not set"

```bash
# Create .env file
echo REACT_APP_API_URL=http://localhost:3000/api > .env

# Or on Windows:
echo REACT_APP_API_URL=http://localhost:3000/api > .env
```

### API Connection Issues

**Error**: "Network error" or "CORS error"

```bash
# 1. Verify backend is running
curl http://localhost:3000/

# 2. Check API URL is correct
# frontend/.env should have:
REACT_APP_API_URL=http://localhost:3000/api

# 3. For production, update to:
REACT_APP_API_URL=https://your-railway-url/api

# 4. If deploying, update Netlify env variables
```

**Error**: "Failed to fetch API"

```bash
# Open browser DevTools (F12)
# Go to Network tab
# Try creating a habit
# Check request shows correct API URL
# Check response status (should be 200/201)
```

### Data Not Showing

**Error**: "Habits list is empty" or "Page says no habits"

```bash
# 1. Verify User ID is entered
# 2. Check if habits exist:
curl http://localhost:3000/api/habits/demo_user_1

# 3. If no response, create a habit:
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","userId":"demo_user_1"}'
```

**Error**: "Insights not showing"

```bash
# 1. Verify habit has completions
# 2. Click "Show Insights" button
# 3. If still blank, check browser console for errors
# 4. Try refreshing page
```

### Deployment Issues

**Railway deployment failed**

```bash
# 1. Check Railway logs:
# Go to Project → Settings → Logs

# 2. Verify .env variables are set:
PORT=3000
NODE_ENV=production
MONGODB_URI=...

# 3. Test locally first:
npm start

# 4. Check package.json has correct "main" and "scripts"
```

**Netlify deployment failed**

```bash
# 1. Check Netlify logs in Dashboard
# 2. Verify build settings:
#    Base: frontend
#    Build: npm run build
#    Publish: frontend/build
#
# 3. Test build locally:
cd frontend
npm run build

# 4. Verify environment variable is set
```

---

## 📊 Monitoring & Logs

### View Backend Logs

**Local**:
- Terminal where you ran `npm start`
- Shows real-time server activity

**Production (Railway)**:
- Go to Project → Logs tab
- Shows last 100 lines of output
- Helpful for debugging issues

### View Frontend Logs

**Local**:
- Browser DevTools Console (F12)
- Shows React errors and API calls

**Production (Netlify)**:
- Go to Site → Deploys
- Click deploy to see build logs
- Check "Deploy Log" tab

---

## ✅ Final Checklist

- [ ] Backend runs locally without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can create habit via web UI
- [ ] Can mark habit complete
- [ ] Insights display correctly
- [ ] Rapid complete test shows warning
- [ ] Delete habit works
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully

---

## 🎓 Next Steps

1. **Customize Detection**:
   - Edit `config/detectionConfig.js`
   - Adjust thresholds to your liking
   - Redeploy

2. **Add Features**:
   - Add habit categories
   - Add streak freezes
   - Add social sharing
   - See FULL_STACK_SUMMARY.md for ideas

3. **Improve UI**:
   - Customize colors
   - Add dark mode
   - Improve mobile design

4. **Scale Up**:
   - Add user authentication
   - Add email notifications
   - Integrate with mobile apps

---

## 🤝 Support

**Still stuck?**

1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. Check [API_EXAMPLES.md](API_EXAMPLES.md)
4. Look at [ARCHITECTURE.md](ARCHITECTURE.md)
5. Review browser console and server logs

---

## 🎉 Success!

You now have a fully functional, production-ready habit tracking application!

```
Frontend: Cloud URL
Backend:  Cloud URL
Database: MongoDB (Cloud or Local)
```

**Enjoy tracking habits! 🎯**

---

**Version**: 1.0.0
**Last Updated**: May 3, 2026
**Status**: Production Ready ✅
