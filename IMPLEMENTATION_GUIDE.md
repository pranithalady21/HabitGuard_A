# 🛠️ HabitGuard Implementation Guide (v1.2.0)

This guide documents the technical implementation details for developers extending the platform.

---

## 1. Unified Analytics Engine
All analytics are centralized in `controllers/habitController.js` inside the `enrichHabit()` helper. This ensures that every API response (GET, POST, PUT) always returns the latest computed stats:
- **Streak Calculation**: Uses `toDateString()` comparisons to handle timezone offsets and identify consecutive days.
- **Consistency Score**: Uses `(Unique Completion Days / Days Since Creation) * 100`.
- **Weekly Stats**: Filters completion array against `startOfWeek` (calculated dynamically).

## 2. Security Logic (The "Guard")
Security scans are run **synchronously** during the `markHabitComplete` process.
- **Data Persistence**: If an anomaly is detected, it is saved into the `suspiciousActivities` array in the Habit document.
- **Real-time Feedback**: The warning is sent back in the immediate API response so the UI can alert the user instantly.

## 3. Data Integrity
- **Mongoose Timestamps**: `createdAt` is used as the "Source of Truth" for consistency calculations.
- **Validation**: Strict validation in `models/Habit.js` prevents empty titles or negative goal durations from entering the DB.

## 4. Frontend-Backend Sync
- **Config**: `frontend/src/config.js` uses a single `API_BASE_URL` for easy environment switching.
- **State Management**: Uses React's `useState` and `useEffect` with clean dependency arrays. `useCallback` is recommended for high-frequency fetch operations.

## 5. UI/UX Principles
- **Glassmorphism**: Achieved via `backdrop-filter: blur(20px)` and subtle white borders.
- **Feedback Loops**: Success/Error banners use clear icons (✅/⚠️) and auto-dismiss logic to prevent UI clutter.

---
**Lead Architect Notes**: The shift to a clean MVC pattern (v1.2.0) significantly reduces technical debt by separating route logic from server configuration.
