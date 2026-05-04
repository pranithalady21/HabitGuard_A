const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Habit = require('./models/Habit');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Health check route (required for Railway)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'HabitGuard API is running 🚀' });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitguard')
  .then(() => console.log('MongoDB Connected successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// ==========================================
// UTILITY FUNCTIONS (Smart Logic)
// ==========================================

function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  const uniqueDates = [...new Set(dates.map(d => new Date(d).toDateString()))];
  const sortedDates = uniqueDates.map(d => new Date(d)).sort((a, b) => b - a);
  let streak = 1;
  const today = new Date(new Date().toDateString());
  const lastDate = new Date(sortedDates[0].toDateString());
  const diffFromToday = (today - lastDate) / (1000 * 60 * 60 * 24);
  if (diffFromToday > 1) return 0;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const diff = (sortedDates[i] - sortedDates[i + 1]) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++; else break;
  }
  return streak;
}

function detectSuspiciousActivity(dates) {
  if (!dates || dates.length < 3) return null;
  let warnings = [];
  for (let i = 0; i < dates.length - 3; i++) {
    const diff = (new Date(dates[i+3]) - new Date(dates[i])) / 1000;
    if (diff < 60 && diff >= 0) { warnings.push("Too many updates in short time"); break; }
  }
  const uniqueTimes = new Set(dates.map(d => new Date(d).getTime()));
  if (uniqueTimes.size !== dates.length) warnings.push("Repeated timestamps detected");
  return warnings.length > 0 ? warnings : null;
}

function generateSuggestion(streak, totalDays) {
  if (totalDays === 0) return "Start your journey today! 🚀";
  const consistency = (streak / totalDays) * 100;
  if (consistency > 80) return "Great job! Keep going 🔥";
  if (consistency > 50) return "You're doing well, try to be more consistent 💪";
  return "Try to build a daily habit routine 📅";
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Fetch all habits (Enriched)
app.get('/api/habits', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
    const enrichedHabits = habits.map(habit => {
      const dates = habit.datesCompleted;
      const streak = calculateStreak(dates);
      const warnings = detectSuspiciousActivity(dates);
      const suggestion = generateSuggestion(streak, dates.length);
      const isCompletedToday = dates.some(d => new Date(d).toDateString() === new Date().toDateString());
      return { ...habit.toObject(), streak, warnings, suggestion, isCompletedToday };
    });
    res.json({ success: true, data: enrichedHabits });
  } catch (error) {
    console.error('GET /api/habits error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// 2. Add habit
app.post('/api/habits', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });
    const newHabit = new Habit({ title, userId: 'user123' });
    await newHabit.save();
    res.status(201).json({ success: true, data: { ...newHabit.toObject(), streak: 0, warnings: null, suggestion: generateSuggestion(0, 0), isCompletedToday: false } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 3. Mark complete
app.post('/api/habits/:id/complete', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ success: false, message: 'Not found' });
    habit.datesCompleted.push(new Date());
    await habit.save();
    const streak = calculateStreak(habit.datesCompleted);
    const warnings = detectSuspiciousActivity(habit.datesCompleted);
    const suggestion = generateSuggestion(streak, habit.datesCompleted.length);
    res.json({ success: true, data: { ...habit.toObject(), streak, warnings, suggestion, isCompletedToday: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 4. Update habit title (Edit)
app.put('/api/habits/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const habit = await Habit.findByIdAndUpdate(req.params.id, { title }, { new: true });
    if (!habit) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: habit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 5. Delete habit
app.delete('/api/habits/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);
    if (!habit) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
