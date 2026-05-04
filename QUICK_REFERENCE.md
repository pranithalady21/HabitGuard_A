# HabitGuard - Quick Reference Guide

## 🎯 One-Page Overview

### What is HabitGuard?
A full-stack habit tracking application that detects suspicious user behavior and provides actionable insights.

### Tech Stack
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Frontend**: React + Axios + CSS3
- **Deployment**: Cloud Hosting

---

## 📁 Project Structure

```
HabitGuard/
├── Backend (root)
│   ├── server.js                    ← Start here
│   ├── models/Habit.js              ← Data model
│   ├── controllers/                 ← Business logic
│   ├── routes/                      ← API endpoints
│   ├── db/                          ← Database
│   ├── config/                      ← Configuration
│   └── Docs                         ← 7 documentation files
│
└── frontend/                        ← React app
    ├── src/
    │   ├── App.js                   ← Main component
    │   ├── components/              ← UI components
    │   └── services/api.js          ← API client
    ├── public/index.html
    └── package.json
```

---

## ⚡ 5-Minute Quick Start

### Start Backend
```bash
npm install
npm start
# Open: http://localhost:3000
```

### Start Frontend
```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:3000/api" > .env
npm start
# Open: http://localhost:3000
```

---

## 🔌 API Endpoints (Quick Reference)

```
POST   /api/habits                          Create habit
GET    /api/habits/:userId                  Get all habits
GET    /api/habits/detail/:habitId          Get single habit
POST   /api/habits/:habitId/complete        Mark complete + check for warnings
PUT    /api/habits/:habitId                 Update habit
DELETE /api/habits/:habitId                 Delete habit
GET    /api/habits/:habitId/suspicious-activities   Get warnings
GET    /api/habits/:habitId/insights        Get insights (NEW!)
```

---

## 🚨 Detection Types

```
RAPID_UPDATES
└─ 5+ completions in 5 minutes

UNREALISTIC_STREAK  
└─ 30+ consecutive perfect days

DUPLICATE_TIMESTAMPS
└─ 3+ identical timestamps

UNUSUAL_TIME_PATTERN
└─ All at 1-2 specific hours
```

---

## 📊 Insights Provided

```javascript
{
  totalCompletions,           // Count
  consistencyScore,           // 0-100
  currentStreak,              // Days
  longestStreak,              // Days ever
  averageCompletionsPerWeek,  // Count
  suggestion                  // Motivational message
}
```

---

## 🧩 React Components

```
App.js
├── User ID input/display
├── AddHabit
│   └── Form to create habit
└── HabitList
    └── HabitCard (repeated)
        ├── Stats display
        ├── Insights viewer
        ├── Warning display
        └── Action buttons
```

---

### 1. Cloud Deployment
Push code to your preferred cloud hosting provider and configure environment variables.

### 3. Connect
Frontend API URL → Backend URL

---

## 🧪 Test Data

```javascript
// Create habit
{
  "title": "Morning Exercise",
  "userId": "demo_user_1"
}

// Mark complete
{
  "completionDate": "2024-01-15T08:00:00Z"  // optional
}
```

---

## 🛠️ Configuration

### Backend Environment (.env)
```
PORT=3000
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
```

### Frontend Environment (.env)
```
REACT_APP_API_URL=http://localhost:3000/api
```

---

## 🐛 Common Fixes

| Issue | Fix |
|-------|-----|
| API not connecting | Check REACT_APP_API_URL in .env |
| Habits not loading | Verify User ID is entered |
| Build fails | Delete node_modules, run npm install |
| Port in use | Change PORT or kill process |
| CORS error | Update CORS config in server.js |

---

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| README.md | Full API docs |
| QUICK_START.md | Local setup |
| ARCHITECTURE.md | Design & algorithms |
| API_EXAMPLES.md | Test cases |
| DEPLOYMENT_GUIDE.md | Production deploy |
| FULL_STACK_SUMMARY.md | Complete overview |

---

## 🎯 Key Files to Modify

| File | For |
|------|-----|
| controllers/habitController.js | Add detection logic |
| config/detectionConfig.js | Change detection thresholds |
| routes/habitRoutes.js | Add new endpoints |
| frontend/src/components/ | Modify UI |
| frontend/src/services/api.js | Change API calls |

---

## 🔧 Common Commands

```bash
# Backend
npm start           # Run server
npm run dev         # Dev with auto-reload
npm install         # Install deps

# Frontend
cd frontend
npm start           # Run app
npm run build       # Build for production
npm install         # Install deps

# Git
git push origin main  # Deploy (auto-deploys)
git status          # Check changes
git log             # View history
```

---

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can enter User ID
- [ ] Can create habit
- [ ] Can mark habit complete
- [ ] Insights display correctly
- [ ] Delete habit works
- [ ] API errors show user-friendly messages

---

## 🎓 Learning Order

1. Run locally (QUICK_START.md)
2. Test APIs (API_EXAMPLES.md)
3. Read architecture (ARCHITECTURE.md)
4. Modify code (controllers, components)
5. Deploy (DEPLOYMENT_GUIDE.md)
6. Monitor logs and metrics

---

## 💾 Database Schema

```javascript
Habit {
  _id: ObjectId,
  title: String,
  userId: String,
  datesCompleted: [Date],
  suspiciousActivities: [{
    type: String,
    message: String,
    detectedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌐 URLs (After Deployment)
Check your cloud provider dashboard for frontend and backend URLs.
Database:  MongoDB Atlas cloud

---

## 🎉 What You Get

✅ Production-ready habit tracker
✅ Fraud detection system
✅ Insights & analytics
✅ Beautiful responsive UI
✅ Automatic deployments
✅ Comprehensive documentation
✅ 30+ files of code
✅ Ready to scale

---

## 🚀 Next: Deploy!
Follow your cloud provider's instructions for deployment.

---

**Quick Links**
- [Backend Setup](QUICK_START.md)
- [Frontend Setup](frontend/README.md)
- [Deploy Now](README.md)
- [Test APIs](API_EXAMPLES.md)
- [Architecture](ARCHITECTURE.md)

---

**Version**: 1.0.0 | **Status**: Ready for Production | **Updated**: May 3, 2026
