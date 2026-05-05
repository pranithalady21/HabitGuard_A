# 🛡️ HabitGuard Quick Reference (v1.2.0)

### 🎯 Overview
HabitGuard is a premium habit tracker with **Suspicious Behavior Detection**, **Interactive Goal Timers**, and **Smart Insights**.

### ⚡ Quick Run
- **Backend (Port 3000)**: `npm run dev`
- **Frontend (Port 3001)**: `cd frontend && npm start`
- **Database**: MongoDB Atlas (Cloud)

---

### 🔌 API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/` | Health Check |
| **GET** | `/api/habits/:userId` | Fetch all user habits |
| **POST** | `/api/habits` | Create a new habit |
| **POST** | `/api/habits/:id/complete` | Mark complete + Security scan |
| **GET** | `/api/habits/:id/insights` | Get streaks & analytics |
| **DELETE**| `/api/habits/:id` | Remove habit |

---

### 🛡️ Security Engine
The system detects 4 suspicious patterns:
1. **RAPID_UPDATES**: 5+ completions in 5 minutes.
2. **UNREALISTIC_STREAK**: 30+ consecutive days.
3. **DUPLICATE_TIMESTAMPS**: 3+ entries at exact same second.
4. **UNUSUAL_TIME_PATTERN**: All entries at the same hour.

---

### 📊 Real-time Stats
- **Consistency Score**: Percentage of days active since habit creation.
- **Current Streak**: Consecutive days completed up to today.
- **Longest Streak**: All-time record for the habit.
- **Weekly Stats**: Completion count for the current week + Best Day.

---

### 📁 Key Files
- `server.js`: API configuration.
- `controllers/habitController.js`: Analytics & Detection logic.
- `models/Habit.js`: Data schema.
- `frontend/src/App.js`: Main UI component.

---
**Status**: MVC Premium | **Updated**: May 5, 2026
