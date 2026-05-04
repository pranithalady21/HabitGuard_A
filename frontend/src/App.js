import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from './config';
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
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ category: 'All', status: 'All' });
  const [sort, setSort] = useState('Newest');
  const [activeTimers, setActiveTimers] = useState({});

  useEffect(() => {
    fetchHabits();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/habits`);
      const result = await response.json();
      if (result.success) {
        setHabits(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Backend is waking up, please wait...');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and Sort logic
  useEffect(() => {
    let result = [...habits];

    // Filter
    if (filter.category !== 'All') {
      result = result.filter(h => h.category === filter.category);
    }
    if (filter.status === 'Completed') {
      result = result.filter(h => h.isCompletedToday);
    } else if (filter.status === 'Pending') {
      result = result.filter(h => !h.isCompletedToday);
    }

    // Sort
    if (sort === 'Name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'Streak') {
      result.sort((a, b) => (b.streak || 0) - (a.streak || 0));
    } else if (sort === 'Consistency') {
      result.sort((a, b) => (b.consistency || 0) - (a.consistency || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredHabits(result);
  }, [habits, filter, sort]);

  // Reminder Checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      habits.forEach(habit => {
        if (habit.reminderTime === currentTime) {
          showNotification(habit.title, 'Time to crush your habit!');
        }
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [habits]);

  const showNotification = (title, message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/logo192.png' });
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.title.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newHabit, userId: 'user123' })
      });
      const result = await response.json();
      if (result.success) {
        setHabits([result.data, ...habits]);
        setNewHabit({
          title: '',
          category: 'Other',
          goalDuration: 0,
          reminderTime: '',
          startDate: new Date().toISOString().split('T')[0],
          targetDate: ''
        });
      }
    } catch (err) {
      setError('Failed to add habit.');
    }
  };

  const handleComplete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/habits/${id}/complete`, { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        setHabits(habits.map(h => h._id === id ? result.data : h));
        if (result.warnings?.length > 0) {
          setError(`Suspicious Behavior Detected: ${result.warnings[0].message}`);
          setTimeout(() => setError(''), 5000);
        }
      }
    } catch (err) {
      setError('Failed to complete habit.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/habits/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setHabits(habits.filter(h => h._id !== id));
      }
    } catch (err) {
      setError('Failed to delete.');
    }
  };

  const startTimer = (id, duration) => {
    if (activeTimers[id]) return;
    const timeLeft = duration * 60;
    setActiveTimers({ ...activeTimers, [id]: timeLeft });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTimers(prev => {
        const newTimers = { ...prev };
        Object.keys(newTimers).forEach(id => {
          if (newTimers[id] > 0) {
            newTimers[id] -= 1;
          } else {
            delete newTimers[id];
            showNotification('Timer Finished', 'Time is up! Great work.');
          }
        });
        return newTimers;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="title-container">
          <span className="logo-icon">🛡️</span>
          <h1>HabitGuard</h1>
        </div>
        <p className="subtitle">Master Your Consistency, Protect Your Progress</p>
      </header>

      {error && <div className="error-banner"><span>⚠️</span> {error}</div>}

      <div className="main-grid">
        {/* Sidebar Controls */}
        <aside className="sidebar">
          <div className="glass-panel add-section">
            <h3>New Habit</h3>
            <form onSubmit={handleAddHabit} className="stacked-form">
              <input 
                type="text" placeholder="Habit Title" 
                value={newHabit.title} 
                onChange={e => setNewHabit({...newHabit, title: e.target.value})} 
              />
              <select value={newHabit.category} onChange={e => setNewHabit({...newHabit, category: e.target.value})}>
                <option value="Other">Category: Other</option>
                <option value="Fitness">Fitness</option>
                <option value="Study">Study</option>
                <option value="Health">Health</option>
              </select>
              <div className="input-group">
                <label>Goal (mins)</label>
                <input type="number" value={newHabit.goalDuration} onChange={e => setNewHabit({...newHabit, goalDuration: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Reminder</label>
                <input type="time" value={newHabit.reminderTime} onChange={e => setNewHabit({...newHabit, reminderTime: e.target.value})} />
              </div>
              <button type="submit" className="primary-btn" disabled={!newHabit.title.trim()}>Create Habit</button>
            </form>
          </div>

          <div className="glass-panel filter-section">
            <h3>Filter & Sort</h3>
            <div className="stacked-form">
              <select value={filter.category} onChange={e => setFilter({...filter, category: e.target.value})}>
                <option value="All">All Categories</option>
                <option value="Fitness">Fitness</option>
                <option value="Study">Study</option>
                <option value="Health">Health</option>
              </select>
              <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
                <option value="All">All Status</option>
                <option value="Completed">Completed Today</option>
                <option value="Pending">Pending</option>
              </select>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="Newest">Sort: Newest</option>
                <option value="Name">Sort: Name</option>
                <option value="Streak">Sort: Streak</option>
                <option value="Consistency">Sort: Consistency</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Habits Feed */}
        <main className="content">
          {isLoading ? (
            <div className="loading-state"><div className="spinner"></div><p>Calculating insights...</p></div>
          ) : filteredHabits.length === 0 ? (
            <div className="empty-state"><h3>No habits found</h3><p>Adjust your filters or add a new habit!</p></div>
          ) : (
            <div className="habits-list">
              {filteredHabits.map(habit => (
                <div key={habit._id} className={`premium-card ${habit.isCompletedToday ? 'done' : ''}`}>
                  <div className="card-top">
                    <div className="title-area">
                      <span className="category-tag">{habit.category}</span>
                      <h3>{habit.title}</h3>
                    </div>
                    <div className="badges">
                      {habit.streak >= 3 && <span className="badge fire" title="3-day streak">🔥</span>}
                      {habit.streak >= 7 && <span className="badge star" title="7-day consistency">⭐</span>}
                      <span className="streak-count">{habit.streak || 0}d Streak</span>
                    </div>
                  </div>

                  <div className="insights-row">
                    <div className="insight-item">
                      <label>Consistency</label>
                      <div className="insight-value">{habit.consistency || 0}%</div>
                    </div>
                    <div className="insight-item">
                      <label>This Week</label>
                      <div className="insight-value">{habit.weeklyStats?.thisWeekCount || 0} / 7</div>
                    </div>
                    <div className="insight-item">
                      <label>Best Day</label>
                      <div className="insight-value">{habit.weeklyStats?.bestDay || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="suggestion">{habit.suggestion || 'Keep it up!'}</div>

                  {habit.goalDuration > 0 && (
                    <div className="timer-area">
                      <div className="timer-display">
                        {activeTimers[habit._id] ? formatTimer(activeTimers[habit._id]) : `${habit.goalDuration}:00`}
                      </div>
                      <button 
                        onClick={() => startTimer(habit._id, habit.goalDuration)} 
                        className="timer-btn"
                        disabled={activeTimers[habit._id]}
                      >
                        {activeTimers[habit._id] ? 'Running...' : 'Start Goal Timer'}
                      </button>
                    </div>
                  )}

                  <div className="card-footer">
                    <button 
                      onClick={() => handleComplete(habit._id)}
                      className={`main-action ${habit.isCompletedToday ? 'completed' : ''}`}
                      disabled={habit.isCompletedToday}
                    >
                      {habit.isCompletedToday ? 'Goal Achieved Today' : 'Complete Habit'}
                    </button>
                    <button onClick={() => handleDelete(habit._id)} className="delete-btn">🗑️</button>
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
