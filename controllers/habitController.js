const Habit = require('../models/Habit');

/**
 * Detect suspicious behavior patterns in habit completion
 * @param {Array} datesCompleted - Array of dates when habit was completed
 * @returns {Array} - Array of warning objects
 */
const detectSuspiciousBehavior = (datesCompleted) => {
  const warnings = [];
  
  if (!datesCompleted || datesCompleted.length === 0) {
    return warnings;
  }

  // Convert to sorted array of timestamps
  const timestamps = datesCompleted
    .map(date => new Date(date).getTime())
    .sort((a, b) => a - b);

  // 1. Detect too many updates within a short time (rapid-fire completions)
  const TIME_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  const MAX_UPDATES_IN_WINDOW = 5;

  for (let i = 0; i < timestamps.length; i++) {
    let count = 1;
    for (let j = i + 1; j < timestamps.length; j++) {
      if (timestamps[j] - timestamps[i] <= TIME_WINDOW_MS) {
        count++;
      } else {
        break;
      }
    }
    if (count >= MAX_UPDATES_IN_WINDOW) {
      warnings.push({
        type: 'RAPID_UPDATES',
        message: `Detected ${count} completions within ${TIME_WINDOW_MS / 60000} minutes. This is unusual behavior.`,
        severity: 'HIGH',
      });
      break;
    }
  }

  // 2. Detect unrealistic streaks (no missed days)
  if (timestamps.length >= 7) {
    let consecutiveDays = 1;
    let maxConsecutiveDays = 1;
    const DAY_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    const TOLERANCE_MS = 2 * 60 * 60 * 1000; // 2 hours tolerance

    for (let i = 1; i < timestamps.length; i++) {
      const dayDifference = (timestamps[i] - timestamps[i - 1]) / DAY_MS;
      
      // If the gap is approximately 1 day (within tolerance), it's a consecutive day
      if (dayDifference >= 0.9 && dayDifference <= 1.1) {
        consecutiveDays++;
        maxConsecutiveDays = Math.max(maxConsecutiveDays, consecutiveDays);
      } else {
        consecutiveDays = 1;
      }
    }

    // If more than 30 consecutive perfect days
    if (maxConsecutiveDays > 30) {
      warnings.push({
        type: 'UNREALISTIC_STREAK',
        message: `Detected ${maxConsecutiveDays} consecutive perfect days with no missed dates. This is statistically unlikely.`,
        severity: 'MEDIUM',
      });
    }
  }

  // 3. Detect same timestamp patterns
  const timestampCounts = {};
  for (const ts of timestamps) {
    timestampCounts[ts] = (timestampCounts[ts] || 0) + 1;
  }

  const duplicateTimestamps = Object.values(timestampCounts).filter(count => count > 1);
  if (duplicateTimestamps.length > 0) {
    const maxDuplicates = Math.max(...duplicateTimestamps);
    if (maxDuplicates > 2) {
      warnings.push({
        type: 'DUPLICATE_TIMESTAMPS',
        message: `Detected multiple completions with identical timestamps (${maxDuplicates} times). This suggests data manipulation.`,
        severity: 'HIGH',
      });
    }
  }

  // 4. Detect unusual time-of-day patterns
  const hours = timestamps.map(ts => new Date(ts).getHours());
  const hourCounts = {};
  hours.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const uniqueHours = Object.keys(hourCounts).length;
  const averagePerHour = timestamps.length / uniqueHours;

  if (uniqueHours <= 2 && timestamps.length > 5) {
    warnings.push({
      type: 'UNUSUAL_TIME_PATTERN',
      message: `All ${timestamps.length} completions happened at approximately ${uniqueHours} specific time(s). This suggests automated or suspicious completion.`,
      severity: 'MEDIUM',
    });
  }

  return warnings;
};

/**
 * Add a new habit
 * @route POST /api/habits
 */
const addHabit = async (req, res) => {
  try {
    const { 
      title, 
      userId, 
      category, 
      goalDuration, 
      reminderTime, 
      startDate, 
      targetDate 
    } = req.body;

    if (!title || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and userId',
      });
    }

    const habit = new Habit({
      title,
      userId,
      category: category || 'Other',
      goalDuration: goalDuration || 0,
      reminderTime: reminderTime || '',
      startDate: startDate || new Date(),
      targetDate: targetDate || null,
      datesCompleted: [],
      suspiciousActivities: [],
    });

    const savedHabit = await habit.save();

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: savedHabit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating habit',
      error: error.message,
    });
  }
};

/**
 * Get all habits for a user
 * @route GET /api/habits/:userId
 */
const getAllHabits = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId',
      });
    }

    const habits = await Habit.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Habits retrieved successfully',
      count: habits.length,
      data: habits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving habits',
      error: error.message,
    });
  }
};

/**
 * Get a single habit by ID
 * @route GET /api/habits/detail/:habitId
 */
const getHabitById = async (req, res) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findById(habitId);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Habit retrieved successfully',
      data: habit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving habit',
      error: error.message,
    });
  }
};

/**
 * Mark habit as completed (add date to datesCompleted array)
 * @route POST /api/habits/:habitId/complete
 */
const markHabitComplete = async (req, res) => {
  try {
    const { habitId } = req.params;
    const completionDate = req.body.completionDate || new Date();

    const habit = await Habit.findById(habitId);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    // Add the completion date
    habit.datesCompleted.push(new Date(completionDate));

    // Detect suspicious behavior
    const suspiciousWarnings = detectSuspiciousBehavior(habit.datesCompleted);

    // Store warnings in the habit document
    if (suspiciousWarnings.length > 0) {
      suspiciousWarnings.forEach(warning => {
        habit.suspiciousActivities.push({
          type: warning.type,
          message: warning.message,
          detectedAt: new Date(),
        });
      });
    }

    const updatedHabit = await habit.save();

    res.status(200).json({
      success: true,
      message: 'Habit marked as completed',
      warnings: suspiciousWarnings,
      data: updatedHabit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking habit as completed',
      error: error.message,
    });
  }
};

/**
 * Update habit title
 * @route PUT /api/habits/:habitId
 */
const updateHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title',
      });
    }

    const habit = await Habit.findByIdAndUpdate(
      habitId,
      { title },
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Habit updated successfully',
      data: habit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating habit',
      error: error.message,
    });
  }
};

/**
 * Delete a habit
 * @route DELETE /api/habits/:habitId
 */
const deleteHabit = async (req, res) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findByIdAndDelete(habitId);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully',
      data: habit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting habit',
      error: error.message,
    });
  }
};

/**
 * Get suspicious activity report for a habit
 * @route GET /api/habits/:habitId/suspicious-activities
 */
const getSuspiciousActivities = async (req, res) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findById(habitId);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Suspicious activities retrieved',
      data: {
        habitTitle: habit.title,
        totalCompletions: habit.datesCompleted.length,
        suspiciousActivities: habit.suspiciousActivities,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving suspicious activities',
      error: error.message,
    });
  }
};

/**
 * Generate insights for a habit
 * @param {Array} datesCompleted - Array of completion dates
 * @param {Date} createdAt - Habit creation date
 * @returns {Object} - Insights object
 */
const generateInsights = (datesCompleted, createdAt) => {
  const insights = {
    totalCompletions: datesCompleted.length,
    consistencyScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageCompletionsPerWeek: 0,
    weeklyStats: {
      thisWeekCount: 0,
      bestDay: 'N/A'
    },
    suggestion: '',
  };

  if (!datesCompleted || datesCompleted.length === 0) {
    insights.suggestion = 'Start tracking by marking your first completion!';
    return insights;
  }

  const timestamps = datesCompleted
    .map(date => new Date(date).getTime())
    .sort((a, b) => a - b);

  const now = new Date();
  const nowMs = now.getTime();
  const daysSinceCreation = Math.floor((nowMs - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000)) + 1;

  // Calculate consistency score (0-100)
  insights.consistencyScore = Math.min(100, Math.round((insights.totalCompletions / Math.max(daysSinceCreation, 1)) * 100));

  // Calculate current streak
  const DAY_MS = 24 * 60 * 60 * 1000;
  
  let currentStreak = 0;
  const uniqueDates = [...new Set(datesCompleted.map(d => new Date(d).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
  
  if (uniqueDates.length > 0) {
    const lastDate = new Date(uniqueDates[0]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    
    const diff = (today - lastDate) / DAY_MS;
    
    if (diff <= 1) { // Today or yesterday
      currentStreak = 1;
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const d1 = new Date(uniqueDates[i]);
        const d2 = new Date(uniqueDates[i+1]);
        d1.setHours(0,0,0,0);
        d2.setHours(0,0,0,0);
        if ((d1 - d2) / DAY_MS === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }
  insights.currentStreak = currentStreak;

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedUniqueDates = [...new Set(datesCompleted.map(d => new Date(d).toDateString()))].sort((a, b) => new Date(a) - new Date(b));

  if (sortedUniqueDates.length > 0) {
    tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < sortedUniqueDates.length; i++) {
      const d1 = new Date(sortedUniqueDates[i-1]);
      const d2 = new Date(sortedUniqueDates[i]);
      d1.setHours(0,0,0,0);
      d2.setHours(0,0,0,0);
      if ((d2 - d1) / DAY_MS === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
  }
  insights.longestStreak = longestStreak;

  // Calculate weekly stats
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const thisWeekDates = datesCompleted.filter(d => new Date(d) >= startOfWeek);
  insights.weeklyStats.thisWeekCount = thisWeekDates.length;
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = {};
  datesCompleted.forEach(d => {
    const day = dayNames[new Date(d).getDay()];
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  
  let bestDay = 'N/A';
  let maxCount = 0;
  for (const day in dayCounts) {
    if (dayCounts[day] > maxCount) {
      maxCount = dayCounts[day];
      bestDay = day;
    }
  }
  insights.weeklyStats.bestDay = bestDay;

  // Calculate average completions per week
  const weeksActive = Math.max(1, Math.ceil(daysSinceCreation / 7));
  insights.averageCompletionsPerWeek = Math.round((insights.totalCompletions / weeksActive) * 10) / 10;

  // Generate suggestion
  if (insights.consistencyScore >= 80) {
    insights.suggestion = '🎯 Excellent consistency! You\'re crushing your goals!';
  } else if (insights.consistencyScore >= 60) {
    insights.suggestion = '👍 Good progress! Keep up the momentum!';
  } else if (insights.consistencyScore >= 40) {
    insights.suggestion = '📈 You\'re doing okay. Try to be more consistent!';
  } else if (insights.currentStreak > 0) {
    insights.suggestion = `💪 You're on a ${insights.currentStreak} day streak! Keep going!`;
  } else {
    insights.suggestion = '🚀 Start building your streak today!';
  }

  return insights;
};

/**
 * Get insights for a habit
 * @route GET /api/habits/:habitId/insights
 */
const getHabitInsights = async (req, res) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findById(habitId);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    const insights = generateInsights(habit.datesCompleted, habit.createdAt);

    res.status(200).json({
      success: true,
      message: 'Insights retrieved successfully',
      data: insights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving insights',
      error: error.message,
    });
  }
};

module.exports = {
  addHabit,
  getAllHabits,
  getHabitById,
  markHabitComplete,
  updateHabit,
  deleteHabit,
  getSuspiciousActivities,
  detectSuspiciousBehavior,
  generateInsights,
  getHabitInsights,
};
