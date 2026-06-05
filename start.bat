@echo off
title MindForge AI Launcher
echo ============================================
echo   MindForge AI - Starting All Services
echo ============================================
echo.

set ROOT=%~dp0

:: ---- Backend ----
echo [1/2] Starting Backend (FastAPI) ...
start "MindForge-Backend" cmd /k "cd /d "%ROOT%backend" && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

:: Small delay so backend gets a head start
ping 127.0.0.1 -n 4 > nul

:: ---- Frontend ----
echo [2/2] Starting Frontend (Vite + React) ...
start "MindForge-Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev -- --host 127.0.0.1 --port 8080"

echo.
echo ============================================
echo   Both services are launching in new windows
echo.
echo   Frontend : http://localhost:8080
echo   Backend  : http://127.0.0.1:8000/api/health
echo   API Docs : http://127.0.0.1:8000/docs
echo ============================================
echo.
echo Press any key to close this launcher window...
pause > nul
