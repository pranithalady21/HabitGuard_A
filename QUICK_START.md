/**
 * QUICK START GUIDE
 * 
 * This file provides a step-by-step guide to set up and run HabitGuard
 */

// ============================================
// PREREQUISITES
// ============================================
// 1. Node.js installed (v14 or higher)
// 2. MongoDB installed and running locally OR
//    MongoDB Atlas account for cloud database
// 3. npm or yarn package manager
// 4. Postman, curl, or similar HTTP client for testing APIs

// ============================================
// STEP 1: INSTALL DEPENDENCIES
// ============================================
// Open terminal in project root directory and run:
npm install

// This will install all packages from package.json

// ============================================
// STEP 2: CONFIGURE ENVIRONMENT
// ============================================
// .env file is already created with default values:
// 
// PORT=3000
// MONGODB_URI=mongodb://localhost:27017/habitguard
// NODE_ENV=development
//
// For MongoDB Atlas (cloud):
// MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habitguard

// ============================================
// STEP 3: ENSURE MONGODB IS RUNNING
// ============================================
// Option 1: Local MongoDB
// Windows: MongoDB is typically a service, or run: mongod
// Mac: brew services start mongodb-community
// Linux: sudo systemctl start mongod

// Option 2: MongoDB Atlas (Cloud)
// Get connection string from MongoDB Atlas dashboard
// Update MONGODB_URI in .env with your connection string

// ============================================
// STEP 4: START THE SERVER
// ============================================
// Option 1: Production mode
npm start

// Option 2: Development mode with auto-reload
npm run dev

// You should see:
// Server is running on port 3000
// MongoDB Connected: localhost

// ============================================
// STEP 5: TEST THE API
// ============================================

// Test 1: Health check
// GET http://localhost:3000/api/health

// Test 2: Create a new habit
// POST http://localhost:3000/api/habits
// Body: {"title":"Morning Exercise","userId":"user123"}

// Test 3: Get all habits
// GET http://localhost:3000/api/habits/user123

// See API_EXAMPLES.md for more test cases

// ============================================
// PROJECT STRUCTURE EXPLAINED
// ============================================

// db/connection.js
// - Handles MongoDB connection setup
// - Initializes Mongoose with configuration
// - Handles connection errors and retries

// models/Habit.js
// - Defines the Habit schema using Mongoose
// - Fields: title, userId, category, goalDuration, reminderTime, datesCompleted, suspiciousActivities
// - Schema validation and default values

// controllers/habitController.js
// - Core business logic for all operations
// - detectSuspiciousBehavior() function analyzes completion patterns
// - Implements CRUD operations
// - Handles error responses

// routes/habitRoutes.js
// - Maps HTTP endpoints to controller methods
// - Defines all API routes
// - Middleware integration point

// server.js
// - Express application setup
// - Middleware configuration (CORS, JSON parsing, etc.)
// - Route registration
// - Global error handling

// ============================================
// CONFIGURING SUSPICIOUS BEHAVIOR DETECTION
// ============================================

// To adjust detection thresholds, edit controllers/habitController.js

// Current settings:
// 1. RAPID_UPDATES: 5+ completions in 5 minutes
//    Change: TIME_WINDOW_MS = 5 * 60 * 1000 (line ~33)
//            MAX_UPDATES_IN_WINDOW = 5 (line ~34)

// 2. UNREALISTIC_STREAK: 30+ consecutive perfect days
//    Change: maxConsecutiveDays > 30 (line ~62)

// 3. DUPLICATE_TIMESTAMPS: 3+ same exact timestamps
//    Change: maxDuplicates > 2 (line ~85)

// 4. UNUSUAL_TIME_PATTERN: 5+ completions at 1-2 specific hours
//    Change: uniqueHours <= 2 && timestamps.length > 5 (line ~100)

// ============================================
// COMMON ISSUES & SOLUTIONS
// ============================================

// Issue 1: "Cannot connect to MongoDB"
// Solution:
// - Check if MongoDB service is running
// - Verify MONGODB_URI in .env is correct
// - Try local: mongodb://localhost:27017/habitguard
// - Try cloud: Get URI from MongoDB Atlas dashboard

// Issue 2: "Port 3000 is already in use"
// Solution:
// - Change PORT in .env to different value (e.g., 5001, 3000)
// - Or kill process using port 3000

// Issue 3: "Cannot find module 'express'"
// Solution:
// - Run: npm install
// - Delete node_modules folder and reinstall: npm install

// Issue 4: "Suspicious activities not showing"
// Solution:
// - Mark habit as completed multiple times
// - Check if behavior matches detection criteria
// - View with: GET /api/habits/:habitId/suspicious-activities

// ============================================
// TESTING WORKFLOW
// ============================================

// 1. Create a habit
//    POST /api/habits -> Get habitId

// 2. Mark completed normally (1-2 times)
//    POST /api/habits/habitId/complete

// 3. Mark completed rapidly (5+ times in 5 minutes)
//    POST /api/habits/habitId/complete -> Check for RAPID_UPDATES warning

// 4. Create consecutive daily completions (31 days)
//    POST /api/habits/habitId/complete (31 times) -> Check for UNREALISTIC_STREAK

// 5. View suspicious activities
//    GET /api/habits/habitId/suspicious-activities

// ============================================
// NEXT STEPS
// ============================================

// 1. Explore categories and organization
// 2. Set habit goals (mins) and test the interactive timer
// 3. Test browser notifications for reminders
// 4. View consistency scores and weekly performance insights
// 5. Add user authentication (JWT tokens)
// 6. Deploy to production (Cloud Hosting)

// See README.md for detailed API documentation
// See API_EXAMPLES.md for complete test cases
