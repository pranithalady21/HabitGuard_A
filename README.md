# HabitGuard - Habit Tracking with Suspicious Behavior Detection

A Node.js Express server with MongoDB and Mongoose for tracking habits while detecting suspicious user behavior patterns.

## Features

- **CRUD Operations**: Create, read, update, and delete habits
- **Advanced Completion Tracking**: Mark habits as completed with timestamp tracking and streak calculation
- **🔥 Streaks & Consistency**: Real-time current/best streaks and consistency percentage scores
- **🎯 Goal Tracking & Timer**: Set time goals (mins) and use an interactive countdown timer
- **🛡️ Suspicious Behavior Detection**: Identifies anomalies (rapid updates, unrealistic streaks, etc.)
- **🔔 Reminders**: Integrated Browser Notification API for habit alerts
- **🔍 Organization**: Filter and sort habits by category (Fitness, Study, Health, Other) and status
- **📊 Weekly Insights**: Dynamic performance summaries and smart suggestions
- **MongoDB Integration**: Persistent data storage using Mongoose ODM

## Project Structure

```
HabitGuard/
├── db/
│   └── connection.js          # MongoDB connection configuration
├── models/
│   └── Habit.js               # Mongoose schema for Habit model
├── controllers/
│   └── habitController.js     # Business logic and CRUD operations
├── routes/
│   └── habitRoutes.js         # Express route definitions
├── server.js                  # Main Express application
├── .env                       # Environment variables
├── package.json               # Project dependencies
└── README.md                  # Documentation
```

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd HabitGuard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure MongoDB connection**
   - Update `.env` file with your MongoDB URI
   - Default: `mongodb://localhost:27017/habitguard`

4. **Start the server**
   ```bash
   npm start          # Production
   npm run dev        # Development with auto-reload (requires nodemon)
   ```

## API Endpoints

### 1. Create a New Habit
**POST** `/api/habits`

Request body:
```json
{
  "title": "Study Algorithm",
  "userId": "user123",
  "category": "Study",
  "goalDuration": 45,
  "reminderTime": "09:00",
  "startDate": "2024-05-01"
}
```

Response:
```json
{
  "success": true,
  "message": "Habit created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Morning Exercise",
    "userId": "user123",
    "datesCompleted": [],
    "suspiciousActivities": [],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get All Habits for a User
**GET** `/api/habits/:userId`

Example: `GET /api/habits/user123`

Response:
```json
{
  "success": true,
  "message": "Habits retrieved successfully",
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Morning Exercise",
      "userId": "user123",
      "datesCompleted": ["2024-01-15T08:00:00Z"],
      "suspiciousActivities": [],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 3. Get Single Habit by ID
**GET** `/api/habits/detail/:habitId`

Example: `GET /api/habits/detail/507f1f77bcf86cd799439011`

### 4. Mark Habit as Completed
**POST** `/api/habits/:habitId/complete`

Request body (optional - uses current date/time if not provided):
```json
{
  "completionDate": "2024-01-15T08:30:00Z"
}
```

Response includes warnings about suspicious behavior:
```json
{
  "success": true,
  "message": "Habit marked as completed",
  "warnings": [
    {
      "type": "RAPID_UPDATES",
      "message": "Detected 5 completions within 5 minutes. This is unusual behavior.",
      "severity": "HIGH"
    }
  ],
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Morning Exercise",
    "datesCompleted": ["2024-01-15T08:00:00Z", "2024-01-15T08:05:00Z"],
    "suspiciousActivities": [
      {
        "type": "RAPID_UPDATES",
        "message": "Detected 5 completions within 5 minutes.",
        "detectedAt": "2024-01-15T08:10:00Z"
      }
    ]
  }
}
```

### 5. Update Habit Title
**PUT** `/api/habits/:habitId`

Request body:
```json
{
  "title": "Evening Exercise"
}
```

### 6. Delete a Habit
**DELETE** `/api/habits/:habitId`

### 7. Get Suspicious Activities Report
**GET** `/api/habits/:habitId/suspicious-activities`

Response:
```json
{
  "success": true,
  "message": "Suspicious activities retrieved",
  "data": {
    "habitTitle": "Morning Exercise",
    "totalCompletions": 35,
    "suspiciousActivities": [
      {
        "type": "UNREALISTIC_STREAK",
        "message": "Detected 31 consecutive perfect days with no missed dates.",
        "detectedAt": "2024-01-15T09:00:00Z"
      }
    ]
  }
}
```

## Suspicious Behavior Detection

The system detects four types of suspicious patterns:

### 1. **RAPID_UPDATES** (HIGH Severity)
- **Condition**: 5+ habit completions within 5 minutes
- **Indicator**: Rapid-fire duplicate entries suggest automated or malicious activity
- **Example**: User completes same habit 5 times in 3 minutes

### 2. **UNREALISTIC_STREAK** (MEDIUM Severity)
- **Condition**: More than 30 consecutive perfect days (no missed days)
- **Indicator**: Perfect streaks without any gaps are statistically unlikely
- **Example**: 35 days of 100% completion with no interruptions
- **Logic**: Allows 2-hour tolerance for daily completions to account for timezone variations

### 3. **DUPLICATE_TIMESTAMPS** (HIGH Severity)
- **Condition**: 3+ completions with identical timestamps
- **Indicator**: Duplicate exact timestamps suggest data manipulation or backdating
- **Example**: Three entries all marked at exactly 08:00:00 on different "days"

### 4. **UNUSUAL_TIME_PATTERN** (MEDIUM Severity)
- **Condition**: 5+ completions all at 1-2 specific times of day
- **Indicator**: All completions at same hour suggest automated or scheduled completion
- **Example**: All 10 completions happen at exactly 9:00 AM

## Data Model

### Habit Schema

```javascript
{
  title: String (required),
  userId: String (required),
  category: String (Fitness, Study, Health, Other),
  goalDuration: Number (minutes),
  reminderTime: String (HH:mm),
  startDate: Date,
  targetDate: Date,
  datesCompleted: Array of Dates,
  suspiciousActivities: [
    {
      type: String,
      message: String,
      detectedAt: Date
    }
  ],
  createdAt: Date
}
```

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/habitguard
NODE_ENV=development
```

## Dependencies

- **express**: Web framework for building REST APIs
- **mongoose**: MongoDB object modeling
- **cors**: Enable cross-origin requests
- **dotenv**: Environment variable management
- **express-validator**: Input validation (optional for future use)
- **nodemon**: Development auto-reload (dev dependency)

## Usage Examples

### Complete Habit Setup

```bash
# 1. Create a habit
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -d '{"title":"Morning Run","userId":"user123"}'

# Response: {"_id": "507f1f77bcf86cd799439011", ...}

# 2. Mark it as completed
curl -X POST http://localhost:3000/api/habits/507f1f77bcf86cd799439011/complete \
  -H "Content-Type: application/json"

# 3. Get all habits
curl http://localhost:3000/api/habits/user123

# 4. View suspicious activities
curl http://localhost:3000/api/habits/507f1f77bcf86cd799439011/suspicious-activities
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Notes

- MongoDB must be running locally or the connection string in `.env` must be valid
- The server validates all required fields before processing requests
- Timestamps are stored in UTC format
- Suspicious behaviors are detected on every completion and stored in the habit document
- The detection logic is configurable - modify `detectSuspiciousBehavior()` in `habitController.js` to adjust thresholds

## Future Enhancements

- User authentication and authorization (JWT)
- Advanced data visualization charts
- Social features and habit sharing
- Mobile app integration (React Native)
- Cloud deployment optimizations