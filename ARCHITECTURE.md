# 🏛️ HabitGuard Architecture Guide (v1.2.0)

HabitGuard is built using a clean **MVC (Model-View-Controller)** pattern for scalability and maintainability.

---

## 📁 Project Structure

```
HabitGuard_A/
├── server.js              # Entry point - Express & Middleware setup
├── db/
│   └── connection.js      # MongoDB Atlas connection (Mongoose)
├── models/
│   └── Habit.js           # Habit Data Schema (Validation & Timestamps)
├── controllers/
│   └── habitController.js # The Brain: Analytics, CRUD & Detection Logic
├── routes/
│   └── habitRoutes.js     # API Route definitions
├── frontend/              # React Premium UI (Standalone Client)
│   ├── src/App.js         # Main UI Logic & State
│   └── src/App.css        # Premium Glassmorphism Styles
└── .env                   # Local Secrets (Port, DB URI)
```

---

## 🏗️ Core Components

### 1. The Controller (`habitController.js`)
This is where the magic happens. It handles:
- **Analytics**: Real-time calculation of streaks, longest streaks, and consistency scores.
- **Smart Suggestions**: Logic to provide user feedback based on performance.
- **Weekly Insights**: Aggregation of completion data by day of the week.
- **Security**: 4-layer Suspicious Behavior Detection.

### 2. The Schema (`Habit.js`)
Defined with Mongoose, ensuring data integrity:
- **Validation**: Title length limits, required fields.
- **Automated Timestamps**: Tracks `createdAt` and `updatedAt` for age-based consistency calculations.
- **Rich Data**: Stores categories, goal durations, and reminder times.

### 3. The Frontend (`App.js`)
A modern React application that:
- Connects to the backend via a configurable `API_BASE_URL`.
- Implements a **Goal Timer** with browser notification integration.
- Displays a **Summary Panel** for high-level progress tracking.

---

## 🛡️ Suspicious Behavior Detection

The system automatically scans every completion for:
1. **RAPID_UPDATES**: 5+ entries in 5 minutes.
2. **UNREALISTIC_STREAK**: 30+ days of perfect completion.
3. **DUPLICATE_TIMESTAMPS**: 3+ identical timestamps.
4. **UNUSUAL_TIME_PATTERN**: Completions consistently happening at the same 1-2 hours.

---

## 🔄 Data Flow

1. **User Action**: Clicks "Complete" in React UI.
2. **API Call**: `POST /api/habits/:id/complete` sent to port 3000.
3. **Routing**: `habitRoutes.js` passes request to `markHabitComplete`.
4. **Logic**:
   - Date added to `datesCompleted`.
   - `detectSuspiciousBehavior` scans for anomalies.
   - `enrichHabit` calculates new streaks & consistency.
5. **Storage**: Updated habit saved to MongoDB Atlas.
6. **Response**: UI receives updated data + any security warnings.

---

## 📈 Scalability Tips
- **Caching**: For high-volume users, add Redis to cache `enrichHabit` results.
- **Indexing**: MongoDB indexes are set on `userId` for lightning-fast lookups.
- **Auth**: Ready for JWT integration by adding an auth middleware to `habitRoutes.js`.

---
**Version**: 1.2.0 (MVC Premium)
**Last Updated**: May 5, 2026
