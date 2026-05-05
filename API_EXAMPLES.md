# 🧪 HabitGuard API Examples (v1.2.0)

Use these examples with **Postman**, **Insomnia**, or **cURL**.

---

### 1. Health Check
`GET http://localhost:3000/`
```json
{
  "status": "ok",
  "message": "HabitGuard API is running 🚀"
}
```

### 2. Create a Habit
`POST http://localhost:3000/api/habits`
**Body:**
```json
{
  "title": "Gym Session",
  "userId": "user123",
  "category": "Fitness",
  "goalDuration": 60,
  "reminderTime": "08:00"
}
```

### 3. Get All User Habits
`GET http://localhost:3000/api/habits/user123`
*Returns all habits with computed streaks and consistency scores.*

### 4. Mark Habit Complete
`POST http://localhost:3000/api/habits/:id/complete`
*Triggers suspicious behavior detection. Returns warnings if found.*

### 5. Get Insights & Analytics
`GET http://localhost:3000/api/habits/:id/insights`
**Response:**
```json
{
  "success": true,
  "data": {
    "totalCompletions": 12,
    "consistencyScore": 85,
    "currentStreak": 5,
    "longestStreak": 10,
    "weeklyStats": { "thisWeekCount": 4, "bestDay": "Monday" },
    "suggestion": "Outstanding consistency! 🔥"
  }
}
```

### 6. Get Security Report
`GET http://localhost:3000/api/habits/:id/suspicious-activities`
*Returns a list of all detected anomalies for this habit.*

---

### 💻 cURL Quick Commands

**Create Habit:**
```bash
curl -X POST http://localhost:3000/api/habits -H "Content-Type: application/json" -d '{"title":"Code","userId":"user123"}'
```

**Mark Complete:**
```bash
curl -X POST http://localhost:3000/api/habits/YOUR_HABIT_ID/complete
```

**Get Stats:**
```bash
curl http://localhost:3000/api/habits/user123
```
