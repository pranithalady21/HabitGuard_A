const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Habit title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      default: 'user123',
    },
    category: {
      type: String,
      enum: ['Fitness', 'Study', 'Health', 'Other'],
      default: 'Other',
    },
    goalDuration: {
      type: Number, // in minutes
      default: 0,
      min: [0, 'Goal duration cannot be negative'],
    },
    reminderTime: {
      type: String, // HH:mm format
      default: '',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    datesCompleted: {
      type: [Date],
      default: [],
    },
    suspiciousActivities: [
      {
        type: { type: String },
        message: String,
        detectedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Habit', HabitSchema);
