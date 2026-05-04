const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    default: 'user123'
  },
  category: {
    type: String,
    enum: ['Fitness', 'Study', 'Health', 'Other'],
    default: 'Other'
  },
  goalDuration: {
    type: Number, // in minutes
    default: 0
  },
  reminderTime: {
    type: String, // HH:mm
    default: ''
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date
  },
  datesCompleted: {
    type: [Date],
    default: [],
  },
  suspiciousActivities: [
    {
      type: { type: String },
      message: String,
      detectedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Habit', HabitSchema);
