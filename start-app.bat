@echo off
setlocal
cd /d "%~dp0"

echo ===================================================
echo   AI Expense Tracker Setup and Start Script
echo ===================================================

echo.
echo [1/3] Checking Backend Environment...
if not exist "backend\.env" (
    echo [ERROR] backend\.env not found! 
    echo Please copy backend\.env.example or create one.
    goto :error
)

echo.
echo [2/3] Taking care of Database...
cd backend
echo Running Prisma DB Push...
call npx prisma db push
echo Running Prisma generation...
call npx prisma generate
cd ..

echo.
echo [3/3] Starting Services...
echo.
echo Starting Backend (Background)...
:: Open a new window for the backend
start "Backend Server" cmd /k "cd /d "%~dp0backend" && npm start"

echo Starting Frontend...
cd frontend
call npm run dev

goto :eof

:error
echo.
echo [FAILURE] Setup failed. Please check the errors above.
pause
