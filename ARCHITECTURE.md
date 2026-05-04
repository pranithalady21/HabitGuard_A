# HabitGuard - Complete Setup & Architecture Guide

## 📁 Project Structure

```
HabitGuard/
├── config/
│   └── detectionConfig.js          # Configuration for detection thresholds
├── db/
│   └── connection.js               # MongoDB connection setup
├── models/
│   └── Habit.js                    # Mongoose Habit schema
├── controllers/
│   └── habitController.js          # CRUD operations & detection logic
├── routes/
│   └── habitRoutes.js              # API route definitions
├── server.js                       # Express app & server setup
├── README.md                       # Complete documentation
├── QUICK_START.md                  # Setup instructions
├── API_EXAMPLES.md                 # Test cases
└── ARCHITECTURE.md                 # This file
```

## 🏗️ Architecture Overview

### Data Flow

```
User Request
    ↓
Express Middleware (CORS, JSON parsing)
    ↓
Route Handler (habitRoutes.js)
    ↓
Controller Method (habitController.js)
    ↓
Mongoose Model (Habit.js)
    ↓
MongoDB Database
    ↓
Response with Suspicious Behavior Detection
```

### Module Dependencies

```
server.js
├── express (web framework)
├── cors (cross-origin requests)
├── mongoose (ODM)
├── dotenv (environment variables)
├── routes/habitRoutes.js
│   └── controllers/habitController.js
│       ├── models/Habit.js
│       │   └── mongoose
│       └── config/detectionConfig.js
└── db/connection.js
    └── mongoose
```

## 🔍 Suspicious Behavior Detection Logic

### Detection Flow

```
User marks habit complete
    ↓
habitController.markHabitComplete()
    ↓
Add date to datesCompleted array
    ↓
detectSuspiciousBehavior(datesCompleted)
    ├── Check RAPID_UPDATES
    │   └── 5+ completions in 5 minute window?
    │
    ├── Check UNREALISTIC_STREAK
    │   └── 30+ consecutive perfect days?
    │
    ├── Check DUPLICATE_TIMESTAMPS
    │   └── 3+ identical timestamps?
    │
    └── Check UNUSUAL_TIME_PATTERN
        └── All completions at 1-2 hours of day?
    ↓
Return warnings array
    ↓
Store warnings in suspiciousActivities
    ↓
Return response with warnings
```

## 📊 Data Model

### Habit Schema

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  title: String,                    // Habit name (required)
  userId: String,                   // User identifier (required)
  category: String,                 // Fitness, Study, Health, Other
  goalDuration: Number,             // Target time in minutes
  reminderTime: String,             // HH:mm reminder format
  startDate: Date,                  // Start tracking date
  targetDate: Date,                 // Completion goal date
  datesCompleted: [Date],           // Array of completion timestamps
  suspiciousActivities: [           // Array of detected anomalies
    {
      type: String,                 // Warning type
      message: String,              // Human-readable message
      detectedAt: Date              // When warning was triggered
    }
  ],
  createdAt: Date,                  // Habit creation time (auto)
  updatedAt: Date                   // Last update time (auto)
}
```

## 🔄 API Endpoint Flow

### Create Habit (POST /api/habits)
```
Request: {title, userId, category, goalDuration, reminderTime, startDate, targetDate}
    ↓
Validation (title & userId required)
    ↓
Create Habit document with categorization and goals
    ↓
Save to MongoDB
    ↓
Response: Created habit object with default insights
```

### Mark Complete (POST /api/habits/:habitId/complete)
```
Request: {completionDate} (optional)
    ↓
Find habit in database
    ↓
Add date to datesCompleted array
    ↓
Run detectSuspiciousBehavior()
    ↓
Store warnings if detected
    ↓
Save updated habit
    ↓
Response: Updated habit + warnings
```

### Get Suspicious Activities (GET /api/habits/:habitId/suspicious-activities)
```
Request: habitId
    ↓
Find habit by ID
    ↓
Extract suspiciousActivities array
    ↓
Response: Activity report
```

## 🎯 Detection Algorithms

### 1. RAPID_UPDATES Detection
```
Input: Array of timestamps
Process:
  - Sort timestamps chronologically
  - For each timestamp, count how many completions 
    happen within next 5 minutes
  - If count ≥ 5, flag as RAPID_UPDATES
Output: Warning if suspicious
```

### 2. UNREALISTIC_STREAK Detection
```
Input: Array of timestamps
Process:
  - Calculate day-by-day gaps between completions
  - Count consecutive days with ~1 day gap (±2 hours tolerance)
  - If streak > 30 days, flag as UNREALISTIC_STREAK
Output: Warning if suspicious
```

### 3. DUPLICATE_TIMESTAMPS Detection
```
Input: Array of timestamps
Process:
  - Create frequency map of timestamps
  - Find timestamps that appear 3+ times
  - If found, flag as DUPLICATE_TIMESTAMPS
Output: Warning if suspicious
```

### 4. UNUSUAL_TIME_PATTERN Detection
```
Input: Array of timestamps
Process:
  - Extract hour from each timestamp
  - Count unique hours
  - If unique hours ≤ 2 AND total completions > 5
    flag as UNUSUAL_TIME_PATTERN
Output: Warning if suspicious
```

## 🔐 Error Handling

### Request Validation
```
All endpoints validate:
- Required parameters present
- Parameter types correct
- ObjectId validity (for MongoDB queries)
```

### Response Format
```
Success:
{
  success: true,
  message: "Operation description",
  data: {...},
  warnings: [...]  // Only in completion endpoint
}

Error:
{
  success: false,
  message: "Error description",
  error: "Detailed error info"
}
```

## 🚀 Performance Considerations

### Detection Complexity
- **RAPID_UPDATES**: O(n) - single pass through timestamps
- **UNREALISTIC_STREAK**: O(n) - single pass through timestamps  
- **DUPLICATE_TIMESTAMPS**: O(n) - build frequency map
- **UNUSUAL_TIME_PATTERN**: O(n) - extract and count hours

Total detection time: O(n) where n = number of completions

### Scalability Tips

1. **For large timestamp arrays**:
   - Add index on userId + createdAt in MongoDB
   - Consider archiving old completions

2. **For high traffic**:
   - Use connection pooling (Mongoose default)
   - Add Redis caching for frequent reads
   - Implement rate limiting on endpoints

3. **Database optimization**:
   - Create index on `userId` for faster queries
   - Create index on `datesCompleted` for faster aggregations

## 🔧 Customization Points

### Adjusting Detection Thresholds

Edit `config/detectionConfig.js`:
```javascript
rapidUpdates: {
  timeWindowMs: 5 * 60 * 3000,  // Change to 10 minutes
  maxUpdatesInWindow: 5,         // Change to 10 updates
}

unrealisticStreak: {
  minConsecutiveDays: 30,        // Change to 60 days
}

duplicateTimestamps: {
  minDuplicates: 3,              // Change to 5
}

unusualTimePattern: {
  maxUniqueHours: 2,             // Change to 3
  minCompletions: 5,             // Change to 10
}
```

### Adding New Detection Types

1. Add to `config/detectionConfig.js`:
```javascript
newDetection: {
  enabled: true,
  threshold: someValue,
  severity: 'HIGH|MEDIUM',
}
```

2. Add detection function in `habitController.js`:
```javascript
// Inside detectSuspiciousBehavior()
if (yourCondition) {
  warnings.push({
    type: 'NEW_DETECTION',
    message: 'Your message',
    severity: 'HIGH',
  });
}
```

## 📈 Monitoring & Debugging

### Enable Logging
Add to `server.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### MongoDB Monitoring
```javascript
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
```

### Detection Debugging
Add to `detectSuspiciousBehavior()`:
```javascript
console.log(`Total timestamps: ${timestamps.length}`);
console.log(`Warnings detected: ${warnings.length}`);
```

## 🧪 Testing Strategy

### Unit Testing
```
Test each detection algorithm independently
- Test RAPID_UPDATES with various time windows
- Test UNREALISTIC_STREAK with different streak lengths
- Test DUPLICATE_TIMESTAMPS with varying duplicates
- Test UNUSUAL_TIME_PATTERN with different hour distributions
```

### Integration Testing
```
Test full API flows:
- Create habit → Mark complete → Get activities
- Multiple rapid completions
- Long consecutive daily completions
- Error handling for invalid inputs
```

### Load Testing
```
Simulate:
- Rapid API requests
- Large habit collections
- Large completion arrays
- Concurrent user operations
```

## 📚 Related Files

- [README.md](README.md) - Full API documentation
- [QUICK_START.md](QUICK_START.md) - Setup instructions
- [API_EXAMPLES.md](API_EXAMPLES.md) - Test cases and curl examples
- [package.json](package.json) - Dependencies
- [.env](.env) - Configuration

## 🔗 External Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

---

**Last Updated**: May 5, 2026
**Version**: 1.2.0 (Advanced Features Edition)
