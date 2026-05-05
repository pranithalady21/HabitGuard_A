const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Habit = require('./models/Habit');

const app = express();

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'HabitGuard API is running 🚀' });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitguard')
  .then(() => console.log('MongoDB Connected successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  const uniqueDates = [...new Set(dates.map(d => new Date(d).toDateString()))];
  const sortedDates = uniqueDates.map(d => new Date(d)).sort((a, b) => b - a);
  const today = new Date(new Date().toDateString());
  const lastDate = new Date(sortedDates[0].toDateString());
  const diffFromToday = (today - lastDate) / (1000 * 60 * 60 * 24);
  if (diffFromToday > 1) return 0;
  let streak = 1;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const diff = (sortedDates[i] - sortedDates[i + 1]) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++; else break;
  }
  return streak;
}

function calculateConsistency(dates, createdAt) {
  if (!dates || dates.length === 0) return 0;
  const start = new Date(createdAt);
  const today = new Date();
  const totalDays = Math.max(1, Math.ceil((today - start) / (1000 * 60 * 60 * 24)));
  const uniqueDays = new Set(dates.map(d => new Date(d).toDateString())).size;
  return Math.min(100, Math.round((uniqueDays / totalDays) * 100));
}

function calculateWeeklyStats(dates) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const dayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let thisWeekCount = 0;
  (dates || []).forEach(d => {
    const date = new Date(d);
    const dayName = dayNames[date.getDay()];
    dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    if (date >= startOfWeek) thisWeekCount++;
  });

  const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
  return {
    thisWeekCount,
    bestDay: bestDay && bestDay[1] > 0 ? bestDay[0] : 'N/A'
  };
}

function detectSuspiciousActivity(dates) {
  if (!dates || dates.length < 3) return null;
  const warnings = [];
  for (let i = 0; i < dates.length - 3; i++) {
    const diff = (new Date(dates[i + 3]) - new Date(dates[i])) / 1000;
    if (diff < 60 && diff >= 0) { warnings.push('Too many updates in short time'); break; }
  }
  const uniqueTimes = new Set(dates.map(d => new Date(d).getTime()));
  if (uniqueTimes.size !== dates.length) warnings.push('Repeated timestamps detected');
  return warnings.length > 0 ? warnings : null;
}

function generateSuggestion(streak, consistency) {
  if (consistency === 0) return 'Start your journey today! 🚀';
  if (consistency > 80) return 'Outstanding consistency! You\'re a habit master 🔥';
  if (consistency > 60) return 'Great work! Keep building momentum 💪';
  if (streak > 3) return `${streak}-day streak! Don't break the chain 🔗`;
  return 'Try to build a daily habit routine 📅';
}

function enrichHabit(habit) {
  const dates = habit.datesCompleted || [];
  const streak = calculateStreak(dates);
  const consistency = calculateConsistency(dates, habit.createdAt);
  const weeklyStats = calculateWeeklyStats(dates);
  const warnings = detectSuspiciousActivity(dates);
  const suggestion = generateSuggestion(streak, consistency);
  const isCompletedToday = dates.some(d => new Date(d).toDateString() === new Date().toDateString());
  return { ...habit.toObject(), streak, consistency, weeklyStats, warnings, suggestion, isCompletedToday };
}

// ==========================================
// API ROUTES
// ==========================================

// GET all habits (enriched with analytics)
app.get('/api/habits', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
    res.json({ success: true, data: habits.map(enrichHabit) });
  } catch (error) {
    console.error('GET /api/habits error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// POST create a new habit
app.post('/api/habits', async (req, res) => {
  try {
    const { title, category, goalDuration, reminderTime, startDate, targetDate } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });
    const newHabit = new Habit({
      title,
      userId: req.body.userId || 'user123',
      category: category || 'Other',
      goalDuration: goalDuration || 0,
      reminderTime: reminderTime || '',
      startDate: startDate || Date.now(),
      targetDate: targetDate || undefined
    });
    await newHabit.save();
    res.status(201).json({ success: true, data: enrichHabit(newHabit) });
  } catch (error) {
    console.error('POST /api/habits error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST mark habit as complete
app.post('/api/habits/:id/complete', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    habit.datesCompleted.push(new Date());
    await habit.save();
    const enriched = enrichHabit(habit);
    res.json({
      success: true,
      data: enriched,
      warnings: enriched.warnings ? enriched.warnings.map(w => ({ message: w })) : []
    });
  } catch (error) {
    console.error('POST /api/habits/:id/complete error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// PUT update habit
app.put('/api/habits/:id', async (req, res) => {
  try {
    const { title, category, goalDuration, reminderTime, targetDate } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (goalDuration !== undefined) updates.goalDuration = goalDuration;
    if (reminderTime !== undefined) updates.reminderTime = reminderTime;
    if (targetDate !== undefined) updates.targetDate = targetDate;
    const habit = await Habit.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, data: enrichHabit(habit) });
  } catch (error) {
    console.error('PUT /api/habits/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// DELETE a habit
app.delete('/api/habits/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/habits/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
