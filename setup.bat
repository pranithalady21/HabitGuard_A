@echo off
REM Installation and Setup Script for HabitGuard (Windows)
REM Run this script to automatically set up the project

echo.
echo ================================
echo HabitGuard Setup Script (Windows)
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [X] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js is installed: %NODE_VERSION%
echo.

REM Install Backend dependencies
echo [*] Installing backend dependencies...
call npm install

REM Install Frontend dependencies
echo [*] Installing frontend dependencies...
cd frontend
call npm install
cd ..

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [X] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed successfully
echo.

REM Create .env if it doesn't exist
if not exist ".env" (
    echo [*] Creating .env file...
    (
        echo PORT=3000
        echo MONGODB_URI=mongodb://localhost:27017/habitguard_A
        echo NODE_ENV=development
    ) > .env
    echo [OK] .env file created
) else (
    echo [i] .env file already exists
)

echo.
echo ================================
echo Setup Complete! !!
echo ================================
echo.
echo Next steps:
echo 1. Ensure MongoDB is running (Local or Atlas)
echo 2. Start Backend: npm run dev
echo 3. Start Frontend: cd frontend && npm start
echo 4. Health Check: http://localhost:3000
echo.
echo Documentation:
echo - README.md - Overview
echo - GET_STARTED.md - Full Guide
echo - QUICK_START.md - 2-Min Setup
echo.
pause
