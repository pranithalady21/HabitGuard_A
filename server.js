const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db/connection');
const habitRoutes = require('./routes/habitRoutes');

const app = express();

// ── Middleware ──────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());

// ── Database ────────────────────────────────────────
connectDB();

// ── Health Check ────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HabitGuard API is running 🚀',
    version: '1.2.0',
    database: 'MongoDB Atlas (habitguard_A)',
  });
});

// ── Routes ──────────────────────────────────────────
app.use('/api/habits', habitRoutes);

// ── 404 Handler ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// ── Start Server ────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/habits`);
});
