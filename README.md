# 🛡️ HabitGuard - Premium Habit Tracker

**HabitGuard** is a sophisticated full-stack habit tracking application that combines a stunning modern UI with powerful analytics and data integrity protection.

---

## ✨ Key Features

- **📊 Advanced Analytics**: Real-time tracking of streaks, longest streaks, and consistency scores.
- **🛡️ Security Engine**: Detects suspicious behavior (rapid updates, unrealistic streaks, etc.) to keep you honest.
- **🎯 Goal Timer**: Integrated interactive countdown timers for time-based habits.
- **🔔 Smart Reminders**: Built-in browser notification system for habit alerts.
- **📈 Weekly Insights**: Performance summaries and AI-driven motivational suggestions.
- **💎 Premium UI**: Modern glassmorphism dashboard with smooth animations.

---

## 🏗️ Tech Stack

- **Backend**: Node.js, Express (MVC Architecture)
- **Database**: MongoDB Atlas (Cloud) via Mongoose
- **Frontend**: React 18, CSS3 (Glassmorphism)
- **Security**: Custom pattern-recognition algorithms

---

## 📁 Project Structure

```
HabitGuard_A/
├── server.js              # API Entry Point
├── db/                    # DB Connection
├── models/                # Data Schema
├── controllers/           # Analytics & Logic
├── routes/                # API Endpoints
├── frontend/              # React UI
└── .env                   # Configuration
```

---

## 🚀 Quick Start

### 1. Backend
```bash
npm install
npm run dev
```
*API running at http://localhost:3000*

### 2. Frontend
```bash
cd frontend
npm install
npm start
```
*UI running at http://localhost:3001*

---

## 🔌 API Quick Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/habits/:userId` | Get all habits + stats |
| POST | `/api/habits` | Create a new habit |
| POST | `/api/habits/:id/complete` | Mark complete + Scan |
| GET | `/api/habits/:id/insights` | Get deep analytics |

---

## 📚 Detailed Documentation

- [🚀 Quick Start](QUICK_START.md) - Get up and running in 2 minutes.
- [🎓 Get Started](GET_STARTED.md) - Full local setup guide.
- [🏗️ Architecture](ARCHITECTURE.md) - Design & algorithms explained.
- [🧪 API Examples](API_EXAMPLES.md) - Test cases & cURL commands.
- [📍 Quick Reference](QUICK_REFERENCE.md) - One-page cheat sheet.
- [🛠️ Implementation](IMPLEMENTATION_GUIDE.md) - Technical deep-dive.
- [📄 Full Summary](FULL_STACK_SUMMARY.md) - Project overview.

---
**Version**: 1.2.0 | **Status**: Production Ready ✅