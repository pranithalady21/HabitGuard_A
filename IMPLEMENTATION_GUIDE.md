# 🚀 HabitGuard - Complete Implementation Guide

Welcome to **HabitGuard**, a sophisticated habit tracking system with intelligent suspicious behavior detection!

## 📋 Quick Overview

HabitGuard is a Node.js Express server with MongoDB integration that:
- ✅ Tracks user habits with completion dates
- ✅ Detects suspicious behavior patterns (4 types of anomalies)
- ✅ Provides RESTful CRUD APIs
- ✅ Stores warning data for audit trails
- ✅ Highly configurable detection thresholds

## 🎯 Key Features

### 1. Complete CRUD Operations
- **Create** new habits
- **Read** habits for specific users
- **Update** habit information
- **Delete** habits
- Get suspicious activity reports

### 2. Suspicious Behavior Detection (4 Types)
- **RAPID_UPDATES**: 5+ completions in 5 minutes
- **UNREALISTIC_STREAK**: 30+ consecutive perfect days
- **DUPLICATE_TIMESTAMPS**: 3+ identical timestamps
- **UNUSUAL_TIME_PATTERN**: All completions at same hour

### 3. Production-Ready Setup
- Error handling and validation
- Proper HTTP status codes
- Consistent response format
- MongoDB persistence
- Environment configuration

## 📁 Complete Project Structure

```
HabitGuard/
├── 📁 config/
│   └── detectionConfig.js           ⚙️ Detection thresholds (customizable)
├── 📁 db/
│   └── connection.js                🗄️ MongoDB connection setup
├── 📁 models/
│   └── Habit.js                     📊 Mongoose schema (title, dates, activities)
├── 📁 controllers/
│   └── habitController.js           🧠 CRUD + detection logic (700+ lines)
├── 📁 routes/
│   └── habitRoutes.js               🛣️ 7 API endpoints
├── server.js                        🚀 Express app startup
├── package.json                     📦 Dependencies
├── .env                             🔐 Config (PORT, MONGODB_URI)
├── .gitignore                       📝 Git ignore rules
├── setup.sh                         🔧 Linux/Mac setup script
├── setup.bat                        🔧 Windows setup script
├── README.md                        📖 Full API documentation
├── QUICK_START.md                   ⚡ Setup & testing guide
├── API_EXAMPLES.md                  🧪 Complete test cases
├── ARCHITECTURE.md                  🏗️ Design & algorithms
└── IMPLEMENTATION_GUIDE.md          📚 This file
```

## ⚡ 5-Minute Quick Start

### Step 1: Install Dependencies
```bash
cd HabitGuard
npm install
```

### Step 2: Ensure MongoDB is Running
```bash
# Windows: MongoDB service should be running
# Mac/Linux: brew services start mongodb-community
# Cloud: Update MONGODB_URI in .env
```

### Step 3: Start the Server
```bash
npm start
# Output: Server is running on port 3000
```

### Step 4: Test an API Endpoint
```bash
curl http://localhost:3000/api/health
# Response: {"status":"Server is running"}
```

### Step 5: Create Your First Habit
```bash
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -d '{"title":"Morning Jog","userId":"user123"}'
```

## 🔗 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/habits` | Create new habit |
| GET | `/api/habits/:userId` | Get all user habits |
| GET | `/api/habits/detail/:habitId` | Get single habit |
| POST | `/api/habits/:habitId/complete` | Mark as completed (+ detection) |
| PUT | `/api/habits/:habitId` | Update habit |
| DELETE | `/api/habits/:habitId` | Delete habit |
| GET | `/api/habits/:habitId/suspicious-activities` | Get warning report |

See [API_EXAMPLES.md](API_EXAMPLES.md) for detailed request/response examples.

## 🔍 Suspicious Behavior Detection Details

### Detection Flow
```
User marks habit complete
    ↓
4 detection algorithms run simultaneously:
├─ Rapid-fire completion check (5 in 5 mins)
├─ Unrealistic streak check (30+ perfect days)
├─ Duplicate timestamp check (same exact time)
└─ Time pattern check (all at same hour)
    ↓
Warnings generated and stored
    ↓
Response includes warnings
    ↓
User can view full warning history
```

### Example Detection Response
```json
{
  "success": true,
  "message": "Habit marked as completed",
  "warnings": [
    {
      "type": "RAPID_UPDATES",
      "message": "Detected 5 completions within 5 minutes. This is unusual.",
      "severity": "HIGH"
    }
  ]
}
```

## 🛠️ Customizing Detection Thresholds

Edit `config/detectionConfig.js`:

```javascript
rapidUpdates: {
  timeWindowMs: 5 * 60 * 1000,    // 5 minutes
  maxUpdatesInWindow: 5,           // Change to 10 for more lenient
}

unrealisticStreak: {
  minConsecutiveDays: 30,          // Change to 60 for stricter
}

duplicateTimestamps: {
  minDuplicates: 3,                // Change to 5 for more lenient
}

unusualTimePattern: {
  maxUniqueHours: 2,               // Change to 3
  minCompletions: 5,               // Change to 10
}
```

Changes take effect on next API call (no restart needed if using app.use()).

## 📊 Data Model

### Habit Document (MongoDB)
```javascript
{
  _id: ObjectId,
  title: "Morning Exercise",      // User-friendly name
  userId: "user123",              // Link to user
  datesCompleted: [               // All completion timestamps
    "2024-01-15T08:00:00Z",
    "2024-01-15T08:05:00Z",
    ...
  ],
  suspiciousActivities: [         // Warning history
    {
      type: "RAPID_UPDATES",
      message: "Detected 5 completions within 5 minutes...",
      detectedAt: "2024-01-15T08:10:00Z"
    }
  ],
  createdAt: "2024-01-15T10:30:00Z",  // Auto-generated
  updatedAt: "2024-01-15T10:35:00Z"   // Auto-updated
}
```

## 🧪 Testing Workflow

### Test 1: Normal Usage
```bash
# Create habit
POST /api/habits {"title":"Morning Jog","userId":"user123"}
# Mark as completed once per day for 5 days
POST /api/habits/{habitId}/complete {"completionDate":"2024-01-15T08:00:00Z"}
# Check: No warnings should appear
```

### Test 2: Rapid Updates Detection
```bash
# Mark habit as completed 5 times rapidly
POST /api/habits/{habitId}/complete {"completionDate":"2024-01-15T08:00:00Z"}
POST /api/habits/{habitId}/complete {"completionDate":"2024-01-15T08:01:00Z"}
POST /api/habits/{habitId}/complete {"completionDate":"2024-01-15T08:02:00Z"}
POST /api/habits/{habitId}/complete {"completionDate":"2024-01-15T08:03:00Z"}
POST /api/habits/{habitId}/complete {"completionDate":"2024-01-15T08:04:00Z"}
# Check: RAPID_UPDATES warning should appear
```

### Test 3: Unrealistic Streak Detection
```bash
# Mark habit as completed 31 consecutive days at same time
for day in {1..31}; do
  POST /api/habits/{habitId}/complete {"completionDate":"2024-01-${day}T08:00:00Z"}
done
# Check: UNREALISTIC_STREAK warning should appear on day 31
```

### Test 4: Duplicate Timestamps Detection
```bash
# Mark habit with same timestamp 3 times
POST /api/habits/{habitId}/complete {"completionDate":"2024-01-15T09:00:00.000Z"}
POST /api/habits/{habitId}/complete {"completionDate":"2024-01-15T09:00:00.000Z"}
POST /api/habits/{habitId}/complete {"completionDate":"2024-01-15T09:00:00.000Z"}
# Check: DUPLICATE_TIMESTAMPS warning should appear
```

See [API_EXAMPLES.md](API_EXAMPLES.md) for complete test cases with curl commands.

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check if MongoDB is running, verify MONGODB_URI in .env |
| Port 3000 already in use | Change PORT in .env or kill process on port 3000 |
| Cannot find module 'express' | Run `npm install` |
| No detection warnings appearing | Check detection thresholds in config/detectionConfig.js |
| Suspicious activities not saved | Verify MongoDB connection and database permissions |

## 🚀 Deployment Options

### Heroku
```bash
# Add MongoDB Atlas connection string to Heroku config
heroku config:set MONGODB_URI=mongodb+srv://...
git push heroku main
```

### AWS/DigitalOcean
```bash
# Set environment variables on server
export PORT=3000
export MONGODB_URI=mongodb://...
npm start
```

### Docker
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [README.md](README.md) | Complete API documentation with examples |
| [QUICK_START.md](QUICK_START.md) | Step-by-step setup and configuration |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Design patterns, algorithms, data flow |
| [API_EXAMPLES.md](API_EXAMPLES.md) | Complete test cases and curl examples |
| [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) | This file (overview) |

## 🔧 Key Files Explained

### server.js (20 lines)
Main Express application. Sets up middleware, routes, and error handling.

### models/Habit.js (35 lines)
Mongoose schema definition with validation and default values.

### controllers/habitController.js (500+ lines)
- CRUD operations (add, get, update, delete)
- Detection algorithms (4 types)
- Error handling
- Response formatting

### routes/habitRoutes.js (30 lines)
Maps HTTP methods and endpoints to controller functions.

### config/detectionConfig.js (40 lines)
Centralized configuration for all detection thresholds (customizable).

## 🎓 Learning Resources

### Understanding the Code
1. Start with [ARCHITECTURE.md](ARCHITECTURE.md) for overview
2. Read controller comments for algorithm details
3. Check [API_EXAMPLES.md](API_EXAMPLES.md) for usage patterns

### Modifying Behavior
1. Detection thresholds → `config/detectionConfig.js`
2. API endpoints → `routes/habitRoutes.js`
3. Data model → `models/Habit.js`
4. Business logic → `controllers/habitController.js`

### Adding Features
1. Add new routes in `routes/habitRoutes.js`
2. Add controller methods in `controllers/habitController.js`
3. Update Habit schema in `models/Habit.js` if needed
4. Test with curl or Postman

## 🤝 Contributing

To extend HabitGuard:

1. **Add detection type**:
   - Edit `config/detectionConfig.js`
   - Add algorithm to `detectSuspiciousBehavior()`

2. **Add API endpoint**:
   - Add route in `routes/habitRoutes.js`
   - Add controller method in `controllers/habitController.js`

3. **Modify data model**:
   - Update `models/Habit.js` schema
   - Migrate existing data if needed

## 📞 Support & Help

- Check [QUICK_START.md](QUICK_START.md) for setup issues
- Review [API_EXAMPLES.md](API_EXAMPLES.md) for usage examples
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for design questions
- Enable logging in `server.js` for debugging

## ✨ Next Steps

1. ✅ Run setup: `npm install`
2. ✅ Start server: `npm start`
3. ✅ Test health: `curl http://localhost:3000/api/health`
4. ✅ Create habit: See API_EXAMPLES.md
5. ✅ Mark as completed: Test detection features
6. ✅ Customize thresholds: Edit config/detectionConfig.js
7. ✅ Deploy: Use Heroku, AWS, or Docker

## 📈 Version

**HabitGuard v1.0.0**
- Created: May 3, 2026
- Status: Production Ready
- Dependencies: Express, Mongoose, Node.js 14+

---

**Happy Tracking! 🎯**

For detailed information, see the comprehensive documentation files included in this project.
