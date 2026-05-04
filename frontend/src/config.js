// Configuration settings for the frontend

// The base URL for our API.
// Uses environment variable in production, falls back to localhost for development.
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
