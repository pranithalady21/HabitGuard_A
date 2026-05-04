/**
 * Example API Test File
 * Use this with tools like Postman, curl, or any HTTP client
 * 
 * Replace HABIT_ID and USER_ID with actual values from your database
 */

// ============================================
// 1. CREATE A NEW HABIT
// ============================================
// POST http://localhost:3000/api/habits
// Content-Type: application/json

{
  "title": "Morning Jog",
  "userId": "user123",
  "category": "Fitness",
  "goalDuration": 20,
  "reminderTime": "07:00",
  "startDate": "2024-05-01"
}

// Expected Response:
// {
//   "success": true,
//   "message": "Habit created successfully",
//   "data": {
//     "_id": "507f1f77bcf86cd799439011",
//     "title": "Morning Jog",
//     "userId": "user123",
//     "datesCompleted": [],
//     "suspiciousActivities": [],
//     "createdAt": "2024-01-15T10:30:00Z"
//   }
// }

// ============================================
// 2. GET ALL HABITS FOR A USER
// ============================================
// GET http://localhost:3000/api/habits/user123

// Expected Response:
// {
//   "success": true,
//   "message": "Habits retrieved successfully",
//   "count": 1,
//   "data": [
//     {
//       "_id": "507f1f77bcf86cd799439011",
//       "title": "Morning Jog",
//       "userId": "user123",
//       "datesCompleted": [],
//       "createdAt": "2024-01-15T10:30:00Z"
//     }
//   ]
// }

// ============================================
// 3. GET SINGLE HABIT
// ============================================
// GET http://localhost:3000/api/habits/detail/507f1f77bcf86cd799439011

// ============================================
// 4. MARK HABIT AS COMPLETED (NORMAL)
// ============================================
// POST http://localhost:3000/api/habits/507f1f77bcf86cd799439011/complete
// Content-Type: application/json

{
  "completionDate": "2024-01-15T08:00:00Z"
}

// Expected Response:
// {
//   "success": true,
//   "message": "Habit marked as completed",
//   "warnings": [],
//   "data": {
//     "_id": "507f1f77bcf86cd799439011",
//     "title": "Morning Jog",
//     "datesCompleted": ["2024-01-15T08:00:00Z"],
//     "suspiciousActivities": []
//   }
// }

// ============================================
// 5. TEST RAPID_UPDATES DETECTION
// ============================================
// Scenario: Mark habit as completed 5+ times in 5 minutes
// POST http://localhost:3000/api/habits/507f1f77bcf86cd799439011/complete
// Content-Type: application/json

// Call 1: Base time
{ "completionDate": "2024-01-15T08:00:00Z" }

// Call 2: +1 minute
{ "completionDate": "2024-01-15T08:01:00Z" }

// Call 3: +2 minutes
{ "completionDate": "2024-01-15T08:02:00Z" }

// Call 4: +3 minutes
{ "completionDate": "2024-01-15T08:03:00Z" }

// Call 5: +4 minutes (SHOULD TRIGGER WARNING)
{ "completionDate": "2024-01-15T08:04:00Z" }

// Expected Response:
// {
//   "success": true,
//   "message": "Habit marked as completed",
//   "warnings": [
//     {
//       "type": "RAPID_UPDATES",
//       "message": "Detected 5 completions within 5 minutes. This is unusual behavior.",
//       "severity": "HIGH"
//     }
//   ],
//   "data": { ... }
// }

// ============================================
// 6. TEST DUPLICATE_TIMESTAMPS DETECTION
// ============================================
// Scenario: Mark habit with same exact timestamp 3+ times
// POST http://localhost:3000/api/habits/507f1f77bcf86cd799439011/complete
// Content-Type: application/json

// Same timestamp for all calls (SHOULD TRIGGER WARNING)
{ "completionDate": "2024-01-15T09:00:00.000Z" }
{ "completionDate": "2024-01-15T09:00:00.000Z" }
{ "completionDate": "2024-01-15T09:00:00.000Z" }

// ============================================
// 7. TEST UNREALISTIC_STREAK DETECTION
// ============================================
// Scenario: Create 31+ consecutive daily completions
// POST http://localhost:3000/api/habits/507f1f77bcf86cd799439011/complete

// Simulate 31 days of perfect daily completions
// Day 1-31, each day at 08:00 with minimal time drift
{ "completionDate": "2024-01-01T08:00:00Z" }
{ "completionDate": "2024-01-02T08:05:00Z" }
{ "completionDate": "2024-01-03T07:55:00Z" }
// ... continue for 31 days
{ "completionDate": "2024-01-31T08:10:00Z" } // SHOULD TRIGGER WARNING

// ============================================
// 8. TEST UNUSUAL_TIME_PATTERN DETECTION
// ============================================
// Scenario: Multiple completions at same time of day
// POST http://localhost:3000/api/habits/507f1f77bcf86cd799439011/complete

// All at 09:00 (SHOULD TRIGGER WARNING after 5+ entries)
{ "completionDate": "2024-01-15T09:00:00Z" }
{ "completionDate": "2024-01-16T09:00:00Z" }
{ "completionDate": "2024-01-17T09:00:00Z" }
{ "completionDate": "2024-01-18T09:00:00Z" }
{ "completionDate": "2024-01-19T09:00:00Z" }

// ============================================
// 9. UPDATE HABIT TITLE
// ============================================
// PUT http://localhost:3000/api/habits/507f1f77bcf86cd799439011
// Content-Type: application/json

{
  "title": "Evening Jog"
}

// ============================================
// 10. GET SUSPICIOUS ACTIVITIES
// ============================================
// GET http://localhost:3000/api/habits/507f1f77bcf86cd799439011/suspicious-activities

// Expected Response:
// {
//   "success": true,
//   "message": "Suspicious activities retrieved",
//   "data": {
//     "habitTitle": "Morning Jog",
//     "totalCompletions": 35,
//     "suspiciousActivities": [
//       {
//         "type": "UNREALISTIC_STREAK",
//         "message": "Detected 31 consecutive perfect days...",
//         "detectedAt": "2024-01-15T09:00:00Z"
//       },
//       {
//         "type": "UNUSUAL_TIME_PATTERN",
//         "message": "All 5 completions happened at...",
//         "detectedAt": "2024-01-19T09:00:00Z"
//       }
//     ]
//   }
// }

// ============================================
// 11. DELETE A HABIT
// ============================================
// DELETE http://localhost:3000/api/habits/507f1f77bcf86cd799439011

// ============================================
// CURL EXAMPLES
// ============================================

// Create a habit
// curl -X POST http://localhost:3000/api/habits \
//   -H "Content-Type: application/json" \
//   -d '{"title":"Morning Jog","userId":"user123"}'

// Get all habits
// curl http://localhost:3000/api/habits/user123

// Mark as completed
// curl -X POST http://localhost:3000/api/habits/HABIT_ID/complete \
//   -H "Content-Type: application/json" \
//   -d '{"completionDate":"2024-01-15T08:00:00Z"}'

// Get suspicious activities
// curl http://localhost:3000/api/habits/HABIT_ID/suspicious-activities

// Delete habit
// curl -X DELETE http://localhost:3000/api/habits/HABIT_ID
