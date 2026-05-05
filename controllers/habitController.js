const Habit = require('../models/Habit');

// ─────────────────────────────────────────────
// HELPER: Calculate current streak
// ─────────────────────────────────────────────
const calculateStreak = (datesCompleted) => {
  if (!datesCompleted || datesCompleted.length === 0) return 0;

  const uniqueDates = [
    ...new Set(datesCompleted.map((d) => new Date(d).toDateString())),
  ]
    .map((d) => new Date(d))
    .sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(uniqueDates[0]);
  last.setHours(0, 0, 0, 0);

  const diffFromToday = (today - last) / (1000 * 60 * 60 * 24);
  if (diffFromToday > 1) return 0;

  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const diff =
      (uniqueDates[i] - uniqueDates[i + 1]) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
};

// ─────────────────────────────────────────────
// HELPER: Calculate longest streak
// ─────────────────────────────────────────────
const calculateLongestStreak = (datesCompleted) => {
  if (!datesCompleted || datesCompleted.length === 0) return 0;

  const sorted = [
    ...new Set(datesCompleted.map((d) => new Date(d).toDateString())),
  ]
    .map((d) => new Date(d))
    .sort((a, b) => a - b);

  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
};

// ─────────────────────────────────────────────
// HELPER: Calculate consistency score (0–100)
// ─────────────────────────────────────────────
const calculateConsistency = (datesCompleted, createdAt) => {
  if (!datesCompleted || datesCompleted.length === 0) return 0;
  const start = new Date(createdAt);
  const today = new Date();
  const totalDays = Math.max(
    1,
    Math.ceil((today - start) / (1000 * 60 * 60 * 24))
  );
  const uniqueDays = new Set(
    datesCompleted.map((d) => new Date(d).toDateString())
  ).size;
  return Math.min(100, Math.round((uniqueDays / totalDays) * 100));
};

// ─────────────────────────────────────────────
// HELPER: Calculate weekly stats
// ─────────────────────────────────────────────
const calculateWeeklyStats = (datesCompleted) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

  let thisWeekCount = 0;
  (datesCompleted || []).forEach((d) => {
    const date = new Date(d);
    dayCounts[dayNames[date.getDay()]]++;
    if (date >= startOfWeek) thisWeekCount++;
  });

  const bestEntry = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
  return {
    thisWeekCount,
    bestDay: bestEntry && bestEntry[1] > 0 ? bestEntry[0] : 'N/A',
  };
};

// ─────────────────────────────────────────────
// HELPER: Detect suspicious behavior
// ─────────────────────────────────────────────
const detectSuspiciousBehavior = (datesCompleted) => {
  const warnings = [];
  if (!datesCompleted || datesCompleted.length === 0) return warnings;

  const timestamps = datesCompleted
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);

  // 1. Rapid updates — 5+ completions within 5 minutes
  const TIME_WINDOW_MS = 5 * 60 * 1000;
  const MAX_UPDATES = 5;
  for (let i = 0; i <= timestamps.length - MAX_UPDATES; i++) {
    if (timestamps[i + MAX_UPDATES - 1] - timestamps[i] <= TIME_WINDOW_MS) {
      warnings.push({
        type: 'RAPID_UPDATES',
        message: `Detected ${MAX_UPDATES}+ completions within 5 minutes. This is unusual behavior.`,
        severity: 'HIGH',
      });
      break;
    }
  }

  // 2. Unrealistic streak — 30+ consecutive perfect days
  if (timestamps.length >= 7) {
    let consecutive = 1;
    let max = 1;
    const DAY_MS = 24 * 60 * 60 * 1000;
    for (let i = 1; i < timestamps.length; i++) {
      const diff = (timestamps[i] - timestamps[i - 1]) / DAY_MS;
      if (diff >= 0.9 && diff <= 1.1) {
        consecutive++;
        max = Math.max(max, consecutive);
      } else {
        consecutive = 1;
      }
    }
    if (max > 30) {
      warnings.push({
        type: 'UNREALISTIC_STREAK',
        message: `Detected ${max} consecutive perfect days with no missed dates. This is statistically unlikely.`,
        severity: 'MEDIUM',
      });
    }
  }

  // 3. Duplicate timestamps
  const tsCounts = {};
  timestamps.forEach((ts) => {
    tsCounts[ts] = (tsCounts[ts] || 0) + 1;
  });
  const maxDup = Math.max(...Object.values(tsCounts));
  if (maxDup >= 3) {
    warnings.push({
      type: 'DUPLICATE_TIMESTAMPS',
      message: `Detected ${maxDup} completions with identical timestamps. This suggests data manipulation.`,
      severity: 'HIGH',
    });
  }

  // 4. Unusual time-of-day pattern — all completions within 1–2 hours
  if (timestamps.length > 5) {
    const hours = [...new Set(timestamps.map((ts) => new Date(ts).getHours()))];
    if (hours.length <= 2) {
      warnings.push({
        type: 'UNUSUAL_TIME_PATTERN',
        message: `All ${timestamps.length} completions happened at only ${hours.length} unique hour(s). This suggests automated completion.`,
        severity: 'MEDIUM',
      });
    }
  }

  return warnings;
};

// ─────────────────────────────────────────────
// HELPER: Generate smart suggestion
// ─────────────────────────────────────────────
const generateSuggestion = (streak, consistency) => {
  if (consistency === 0) return '🚀 Start your journey today!';
  if (consistency >= 80) return "🏆 Outstanding! You're a habit champion!";
  if (consistency >= 60) return '🔥 Great consistency! Keep the momentum!';
  if (consistency >= 40) return "📈 You're improving! Aim for daily completion.";
  if (streak > 0) return `💪 ${streak}-day streak! Don't break the chain!`;
  return '📅 Try building a daily habit routine!';
};

// ─────────────────────────────────────────────
// HELPER: Enrich a single habit with analytics
// ─────────────────────────────────────────────
const enrichHabit = (habit) => {
  const dates = habit.datesCompleted || [];
  const streak = calculateStreak(dates);
  const longestStreak = calculateLongestStreak(dates);
  const consistency = calculateConsistency(dates, habit.createdAt);
  const weeklyStats = calculateWeeklyStats(dates);
  const warnings = detectSuspiciousBehavior(dates);
  const suggestion = generateSuggestion(streak, consistency);
  const isCompletedToday = dates.some(
    (d) => new Date(d).toDateString() === new Date().toDateString()
  );
  return {
    ...habit.toObject(),
    streak,
    longestStreak,
    consistency,
    weeklyStats,
    warnings,
    suggestion,
    isCompletedToday,
  };
};

// ═══════════════════════════════════════════════
// ROUTE HANDLERS
// ═══════════════════════════════════════════════

// POST /api/habits — Create a new habit
const addHabit = async (req, res) => {
  try {
    const { title, userId, category, goalDuration, reminderTime, startDate, targetDate } =
      req.body;

    if (!title || !userId) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide title and userId' });
    }

    const habit = await new Habit({
      title,
      userId,
      category: category || 'Other',
      goalDuration: goalDuration || 0,
      reminderTime: reminderTime || '',
      startDate: startDate || new Date(),
      targetDate: targetDate || null,
      datesCompleted: [],
      suspiciousActivities: [],
    }).save();

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: enrichHabit(habit),
    });
  } catch (error) {
    console.error('addHabit error:', error.message);
    res.status(500).json({ success: false, message: 'Error creating habit', error: error.message });
  }
};

// GET /api/habits/:userId — Get all habits for a user
const getAllHabits = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Please provide userId' });
    }
    const habits = await Habit.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Habits retrieved successfully',
      count: habits.length,
      data: habits.map(enrichHabit),
    });
  } catch (error) {
    console.error('getAllHabits error:', error.message);
    res.status(500).json({ success: false, message: 'Error retrieving habits', error: error.message });
  }
};

// GET /api/habits/detail/:habitId — Get single habit
const getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.habitId);
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }
    res.status(200).json({ success: true, data: enrichHabit(habit) });
  } catch (error) {
    console.error('getHabitById error:', error.message);
    res.status(500).json({ success: false, message: 'Error retrieving habit', error: error.message });
  }
};

// POST /api/habits/:habitId/complete — Mark habit complete
const markHabitComplete = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.habitId);
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const completionDate = req.body.completionDate
      ? new Date(req.body.completionDate)
      : new Date();
    habit.datesCompleted.push(completionDate);

    // Detect and store suspicious warnings
    const suspiciousWarnings = detectSuspiciousBehavior(habit.datesCompleted);
    suspiciousWarnings.forEach((w) => {
      habit.suspiciousActivities.push({
        type: w.type,
        message: w.message,
        detectedAt: new Date(),
      });
    });

    await habit.save();
    const enriched = enrichHabit(habit);

    res.status(200).json({
      success: true,
      message: 'Habit marked as completed',
      warnings: suspiciousWarnings,
      data: enriched,
    });
  } catch (error) {
    console.error('markHabitComplete error:', error.message);
    res.status(500).json({ success: false, message: 'Error completing habit', error: error.message });
  }
};

// PUT /api/habits/:habitId — Update habit fields
const updateHabit = async (req, res) => {
  try {
    const { title, category, goalDuration, reminderTime, targetDate } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (goalDuration !== undefined) updates.goalDuration = goalDuration;
    if (reminderTime !== undefined) updates.reminderTime = reminderTime;
    if (targetDate !== undefined) updates.targetDate = targetDate;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update' });
    }

    const habit = await Habit.findByIdAndUpdate(
      req.params.habitId,
      updates,
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Habit updated successfully',
      data: enrichHabit(habit),
    });
  } catch (error) {
    console.error('updateHabit error:', error.message);
    res.status(500).json({ success: false, message: 'Error updating habit', error: error.message });
  }
};

// DELETE /api/habits/:habitId — Delete a habit
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.habitId);
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }
    res.status(200).json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('deleteHabit error:', error.message);
    res.status(500).json({ success: false, message: 'Error deleting habit', error: error.message });
  }
};

// GET /api/habits/:habitId/suspicious-activities
const getSuspiciousActivities = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.habitId);
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
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
    console.error('getSuspiciousActivities error:', error.message);
    res.status(500).json({ success: false, message: 'Error retrieving activities', error: error.message });
  }
};

// GET /api/habits/:habitId/insights
const getHabitInsights = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.habitId);
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }
    const enriched = enrichHabit(habit);
    res.status(200).json({
      success: true,
      message: 'Insights retrieved successfully',
      data: {
        totalCompletions: (habit.datesCompleted || []).length,
        consistencyScore: enriched.consistency,
        currentStreak: enriched.streak,
        longestStreak: enriched.longestStreak,
        weeklyStats: enriched.weeklyStats,
        suggestion: enriched.suggestion,
      },
    });
  } catch (error) {
    console.error('getHabitInsights error:', error.message);
    res.status(500).json({ success: false, message: 'Error retrieving insights', error: error.message });
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
  getHabitInsights,
};
