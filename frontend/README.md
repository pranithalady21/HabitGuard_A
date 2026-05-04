# HabitGuard Frontend - Premium Habit Tracker

A modern, glassmorphism-inspired React application for tracking habits, visualizing insights, and protecting your progress.

## ✨ Features

- **🔥 Advanced Insights**: View consistency scores, current/best streaks, and weekly stats.
- **🛡️ Security Alerts**: Real-time notifications for suspicious behavior patterns.
- **🎯 Goal Management**: Set time-based goals with interactive countdown timers.
- **🔔 Smart Reminders**: Integrated browser notifications to keep you on track.
- **🔍 Organization**: Filter and sort habits by category, status, or performance metrics.
- **🎨 Premium UI**: Dark-mode aesthetic with smooth animations and responsive design.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend server running (default: http://localhost:5000)

### Installation
1. `cd frontend`
2. `npm install`

### Configuration
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Running Locally
```bash
npm start
```
The app will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Structure

- `src/App.js`: Main application logic and state management.
- `src/App.css`: Premium styling with glassmorphism and animations.
- `src/config.js`: API configuration.

## 🌐 Deployment
This frontend is configured for easy deployment on **Netlify**.
- Build Command: `npm run build`
- Publish Directory: `build`
