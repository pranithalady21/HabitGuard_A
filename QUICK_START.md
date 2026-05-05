# 🚀 HabitGuard Quick Start

Get your professional habit tracker up and running in under 2 minutes.

### 1️⃣ Install Everything
Open your terminal in the project root and run:
```bash
npm install
cd frontend && npm install
cd ..
```

### 2️⃣ Configure Database
Open `.env` in the root folder and ensure it has:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/habitguard_A
```

### 3️⃣ Start the App
You need **two** terminals running:

**Terminal A (Backend):**
```bash
npm run dev
```

**Terminal B (Frontend):**
```bash
cd frontend
npm start
```
*Press 'Y' if it asks to use a different port.*

### 4️⃣ Use the App
- Open `http://localhost:3000` (API)
- Open `http://localhost:3001` (Frontend UI) 🛡️

---

### 🛠️ API Shortcuts
- **Health Check**: `GET /`
- **All Habits**: `GET /api/habits/user123`
- **Create**: `POST /api/habits`
- **Complete**: `POST /api/habits/:id/complete`

### 🛡️ Detection Settings
Adjust thresholds in `controllers/habitController.js`:
- **Rapid Updates**: 5 completions / 5 mins
- **Unrealistic Streak**: 30+ perfect days
- **Unusual Pattern**: 5+ entries at same hour

---
**Happy Tracking!**
