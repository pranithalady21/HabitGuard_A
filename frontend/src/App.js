import React, { useState, useEffect } from 'react';
import { API_BASE_URL, DEFAULT_USER_ID } from './config';
import './App.css';

function App() {
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [newHabit, setNewHabit] = useState({
    title: '',
    category: 'Other',
    goalDuration: 0,
    reminderTime: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ category: 'All', status: 'All' });
  const [sort, setSort] = useState('Newest');
  const [activeTimers, setActiveTimers] = useState({});

  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/habits/${DEFAULT_USER_ID}`);
      const result = await res.json();
      if (result.success) setHabits(result.data);
      else showError(result.message);
    } catch {
      showError('Cannot connect to backend. Make sure the server is running on port 3000.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
    requestNotificationPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter & Sort effect
  useEffect(() => {
    let result = [...habits];
    if (filter.category !== 'All') result = result.filter(h => h.category === filter.category);
    if (filter.status === 'Completed') result = result.filter(h => h.isCompletedToday);
    else if (filter.status === 'Pending') result = result.filter(h => !h.isCompletedToday);
    if (sort === 'Name') result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'Streak') result.sort((a, b) => (b.streak || 0) - (a.streak || 0));
    else if (sort === 'Consistency') result.sort((a, b) => (b.consistency || 0) - (a.consistency || 0));
    else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredHabits(result);
  }, [habits, filter, sort]);

  // Reminder checker — runs every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      habits.forEach(habit => {
        if (habit.reminderTime === currentTime) {
          showNotification(habit.title, 'Time to crush your habit! 💪');
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [habits]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          if (updated[id] > 0) {
            updated[id] -= 1;
          } else {
            delete updated[id];
            showNotification('⏱️ Timer Done!', 'Great session! Habit goal complete.');
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const showNotification = (title, message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/logo192.png' });
    }
  };

  const showError = (msg, duration = 5000) => {
    setError(msg);
    setTimeout(() => setError(''), duration);
  };




  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.title.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newHabit, userId: DEFAULT_USER_ID })
      });
      const result = await res.json();
      if (result.success) {
        setHabits(prev => [result.data, ...prev]);
        setNewHabit({ title: '', category: 'Other', goalDuration: 0, reminderTime: '', startDate: new Date().toISOString().split('T')[0], targetDate: '' });
      } else {
        showError(result.message);
      }
    } catch {
      showError('Failed to add habit. Check your connection.');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/habits/${id}/complete`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        setHabits(prev => prev.map(h => h._id === id ? result.data : h));
        if (result.warnings?.length > 0) {
          showError(`🛡️ Suspicious Behavior: ${result.warnings[0].message}`);
        }
      }
    } catch {
      showError('Failed to mark habit as complete.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit permanently?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/habits/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) setHabits(prev => prev.filter(h => h._id !== id));
    } catch {
      showError('Failed to delete habit.');
    }
  };

  const startTimer = (id, duration) => {
    if (activeTimers[id] || !duration) return;
    setActiveTimers(prev => ({ ...prev, [id]: duration * 60 }));
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (cat) => {
    const icons = { Fitness: '🏋️', Study: '📚', Health: '💊', Other: '⭐' };
    return icons[cat] || '⭐';
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="title-container">
          <span className="logo-icon">🛡️</span>
          <h1>HabitGuard</h1>
        </div>
        <p className="subtitle">Master Your Consistency · Protect Your Progress</p>
      </header>

      {error && (
        <div className="error-banner" onClick={() => setError('')}>
          <span>⚠️</span> {error} <span className="close-btn">×</span>
        </div>
      )}

      <div className="main-grid">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Add Habit Form */}
          <div className="glass-panel add-section">
            <h3>➕ New Habit</h3>
            <form onSubmit={handleAddHabit} className="stacked-form">
              <input
                type="text"
                placeholder="Habit title..."
                value={newHabit.title}
                onChange={e => setNewHabit({ ...newHabit, title: e.target.value })}
                maxLength={100}
              />
              <select value={newHabit.category} onChange={e => setNewHabit({ ...newHabit, category: e.target.value })}>
                <option value="Other">⭐ Other</option>
                <option value="Fitness">🏋️ Fitness</option>
                <option value="Study">📚 Study</option>
                <option value="Health">💊 Health</option>
              </select>
              <div className="input-group">
                <label>🎯 Goal (mins)</label>
                <input
                  type="number"
                  min="0"
                  value={newHabit.goalDuration}
                  onChange={e => setNewHabit({ ...newHabit, goalDuration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="input-group">
                <label>🔔 Reminder Time</label>
                <input
                  type="time"
                  value={newHabit.reminderTime}
                  onChange={e => setNewHabit({ ...newHabit, reminderTime: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>📅 Start Date</label>
                <input
                  type="date"
                  value={newHabit.startDate}
                  onChange={e => setNewHabit({ ...newHabit, startDate: e.target.value })}
                />
              </div>
              <button type="submit" className="primary-btn" disabled={!newHabit.title.trim()}>
                Create Habit
              </button>
            </form>
          </div>

          {/* Filter & Sort */}
          <div className="glass-panel filter-section">
            <h3>🔍 Filter & Sort</h3>
            <div className="stacked-form">
              <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
                <option value="All">All Categories</option>
                <option value="Fitness">🏋️ Fitness</option>
                <option value="Study">📚 Study</option>
                <option value="Health">💊 Health</option>
                <option value="Other">⭐ Other</option>
              </select>
              <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
                <option value="All">All Status</option>
                <option value="Completed">✅ Completed Today</option>
                <option value="Pending">⏳ Pending</option>
              </select>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="Newest">🆕 Newest First</option>
                <option value="Name">🔤 By Name</option>
                <option value="Streak">🔥 By Streak</option>
                <option value="Consistency">📊 By Consistency</option>
              </select>
              <button className="secondary-btn" onClick={fetchHabits}>🔄 Refresh</button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="glass-panel stats-summary">
            <h3>📈 Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-num">{habits.length}</span>
                <span className="summary-label">Total</span>
              </div>
              <div className="summary-item">
                <span className="summary-num">{habits.filter(h => h.isCompletedToday).length}</span>
                <span className="summary-label">Done Today</span>
              </div>
              <div className="summary-item">
                <span className="summary-num">
                  {habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + (h.consistency || 0), 0) / habits.length) : 0}%
                </span>
                <span className="summary-label">Avg Consistency</span>
              </div>
              <div className="summary-item">
                <span className="summary-num">
                  {habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0}
                </span>
                <span className="summary-label">Best Streak</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="content">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your habits...</p>
            </div>
          ) : filteredHabits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌱</div>
              <h3>No habits found</h3>
              <p>Adjust your filters or add a new habit to get started!</p>
            </div>
          ) : (
            <div className="habits-list">
              {filteredHabits.map(habit => (
                <div key={habit._id} className={`premium-card ${habit.isCompletedToday ? 'done' : ''}`}>
                  {/* Card Header */}
                  <div className="card-top">
                    <div className="title-area">
                      <span className="category-tag">
                        {getCategoryIcon(habit.category)} {habit.category}
                      </span>
                      <h3>{habit.title}</h3>
                      {habit.reminderTime && (
                        <span className="reminder-badge">🔔 {habit.reminderTime}</span>
                      )}
                    </div>
                    <div className="badges">
                      {habit.streak >= 7 && <span className="badge star" title="7-day streak!">⭐</span>}
                      {habit.streak >= 3 && <span className="badge fire" title="3-day streak!">🔥</span>}
                      <span className="streak-count">{habit.streak || 0}d Streak</span>
                    </div>
                  </div>

                  {/* Insights Row */}
                  <div className="insights-row">
                    <div className="insight-item">
                      <label>Consistency</label>
                      <div className="insight-value">{habit.consistency || 0}%</div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${habit.consistency || 0}%` }}></div>
                      </div>
                    </div>
                    <div className="insight-item">
                      <label>This Week</label>
                      <div className="insight-value">{habit.weeklyStats?.thisWeekCount || 0} / 7</div>
                    </div>
                    <div className="insight-item">
                      <label>Best Day</label>
                      <div className="insight-value">{habit.weeklyStats?.bestDay || 'N/A'}</div>
                    </div>
                    <div className="insight-item">
                      <label>Total</label>
                      <div className="insight-value">{(habit.datesCompleted || []).length}</div>
                    </div>
                  </div>

                  {/* Suggestion */}
                  <div className="suggestion">💡 {habit.suggestion || 'Keep it up!'}</div>

                  {/* Suspicious Warning */}
                  {habit.warnings && habit.warnings.length > 0 && (
                    <div className="warning-banner">
                      🛡️ {habit.warnings[0]}
                    </div>
                  )}

                  {/* Timer Area */}
                  {habit.goalDuration > 0 && (
                    <div className="timer-area">
                      <div className="timer-display">
                        ⏱️ {activeTimers[habit._id] ? formatTimer(activeTimers[habit._id]) : `${habit.goalDuration}:00`}
                      </div>
                      <button
                        onClick={() => startTimer(habit._id, habit.goalDuration)}
                        className="timer-btn"
                        disabled={!!activeTimers[habit._id]}
                      >
                        {activeTimers[habit._id] ? '▶ Running...' : '▶ Start Timer'}
                      </button>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="card-footer">
                    <button
                      onClick={() => handleComplete(habit._id)}
                      className={`main-action ${habit.isCompletedToday ? 'completed' : ''}`}
                      disabled={habit.isCompletedToday}
                    >
                      {habit.isCompletedToday ? '✅ Completed Today' : '✔ Complete Habit'}
                    </button>
                    <button onClick={() => handleDelete(habit._id)} className="delete-btn" title="Delete habit">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
