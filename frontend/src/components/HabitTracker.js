import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, DEFAULT_USER_ID } from '../config';
import './HabitTracker.css';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/habits/${DEFAULT_USER_ID}`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to fetch habits');
      setHabits(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newHabitTitle, userId: DEFAULT_USER_ID })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to create habit');
      setHabits(prevHabits => [...prevHabits, result.data]);
      setNewHabitTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteHabit = async (habitId) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/habits/${habitId}/complete`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to complete habit');
      if (result.warnings?.length > 0) alert(`Warning: ${result.warnings[0].message}`);
      setHabits(prevHabits => prevHabits.map(h => h._id === habitId ? result.data : h));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="habit-tracker-container">
      <div className="habit-tracker-card glass-panel">
        <header className="tracker-header">
          <h2>My Habits (Simple Mode)</h2>
          <p>Track your daily routines</p>
        </header>
        {error && <div className="error-message">⚠️ {error}</div>}
        <form onSubmit={handleAddHabit} className="add-habit-form">
          <input
            type="text"
            placeholder="New habit..."
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            disabled={actionLoading || isLoading}
            className="habit-input"
          />
          <button type="submit" disabled={!newHabitTitle.trim() || actionLoading || isLoading} className="add-button">
            {actionLoading ? 'Adding...' : 'Add Habit'}
          </button>
        </form>
        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <div className="habits-list">
            {habits.length === 0 ? (
              <p>No habits found.</p>
            ) : (
              habits.map((habit) => (
                <div key={habit._id} className="habit-item">
                  <div className="habit-info">
                    <h3>{habit.title}</h3>
                    <span>Completed {habit.datesCompleted?.length || 0} times</span>
                  </div>
                  <button onClick={() => handleCompleteHabit(habit._id)} disabled={actionLoading} className="complete-button">
                    Complete
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;
