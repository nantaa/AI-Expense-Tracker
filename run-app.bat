@echo off
echo Starting AI Expense Tracker...

:: Start Backend
start "Backend" cmd /k "cd backend && npm start"

:: Start Frontend
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application started!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
pause
