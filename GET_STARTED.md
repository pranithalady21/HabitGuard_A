# 🎓 Complete Guide: Running HabitGuard Locally

This guide walks you through getting your complete habit tracking application up and running on your machine.

---

## 🏠 Local Development

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** installed locally (Community Edition) OR a **MongoDB Atlas** account
- **npm** (comes with Node.js)

### Step 1: Backend Setup

```bash
# 1. Navigate to project root
cd HabitGuard_A

# 2. Install dependencies
npm install

# 3. Configure environment
# Ensure .env has:
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/habitguard_A

# 4. Start backend server
npm run dev
```

The backend API will be available at: `http://localhost:3000`
**Health Check**: Open `http://localhost:3000` in your browser.

---

### Step 2: Frontend Setup

**Open a NEW terminal window**:

```bash
# 1. Navigate to frontend directory
cd HabitGuard_A/frontend

# 2. Install dependencies
npm install

# 3. Start React development server
npm start
```

> **Note**: If port 3000 is taken by the backend, React will ask: *"Something is already running on port 3000. Would you like to run the app on another port instead? (Y/n)"* 
> **Press Y**. The frontend will then run at `http://localhost:3001`.

---

### Step 3: Explore Features

1. **Dashboard**: View all your habits in a premium, glassmorphism UI.
2. **Real-time Analytics**:
   - **Consistency Score**: Calculated dynamically based on habit age and completion count.
   - **Streaks**: View your current "Fire" streak and all-time best streak.
   - **Weekly Stats**: See which day is your best and how many times you completed habits this week.
3. **Smart Suggestions**: Get AI-like feedback based on your performance.
4. **Goal Timer**: Set a duration (e.g., 30 mins) and use the interactive countdown timer.
5. **Security**: Suspicious behavior detection (RAPID_UPDATES, UNREALISTIC_STREAK) keeps your data honest.

---

## 🧪 Testing

### Test Scenario: Suspicious Behavior
1. Create a new habit.
2. Click "Complete Habit" 5 times very quickly (within 5 seconds).
3. A red warning banner will appear: *"🛡️ Suspicious Behavior Detected"*.

### Test Scenario: Goal Achievement
1. Create a habit with a 1-minute goal.
2. Click "Start Timer".
3. Wait for the countdown.
4. Receive a browser notification when finished!

---

## 🐛 Troubleshooting

### Port 3000 Conflict
If the backend fails to start, another app is using port 3000.
- **Fix**: Change `PORT=3001` in your `.env` file and restart.

### MongoDB Connection Error
Ensure MongoDB service is running on your PC.
- **Windows**: Search for "Services", find "MongoDB Server", and click "Start".
- **Atlas**: Ensure your IP address is whitelisted in the Atlas Network Access panel.

---

## ✅ Final Checklist
- [x] Backend running on port 3000
- [x] Frontend running on port 3001 (or 3000)
- [x] Database connected successfully
- [x] Can create and complete habits

**Enjoy masterng your consistency with HabitGuard! 🛡️**
