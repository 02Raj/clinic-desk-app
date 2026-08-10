@echo off
setlocal
echo ========================================
echo  Clinic Desk - Deploy clinicSignup
echo ========================================
echo.

where firebase >nul 2>&1
if errorlevel 1 (
  echo ERROR: Firebase CLI not found. Install: npm install -g firebase-tools
  echo Then run: firebase login
  pause
  exit /b 1
)

set "ROOT=%~dp0.."
set "ROOT=%ROOT:~0,-1%"

echo Project: clinic-desk-os
echo Function: clinicSignup
echo Login URL: https://clinic-desk-app.vercel.app
echo.

cd /d "%ROOT%\functions"
if errorlevel 1 (
  echo ERROR: Could not open functions folder
  pause
  exit /b 1
)

echo Deploying...
call firebase deploy --only functions:clinicSignup --project clinic-desk-os
if errorlevel 1 (
  echo.
  echo DEPLOY FAILED. Try: firebase login
  pause
  exit /b 1
)

echo.
echo ========================================
echo  Deploy OK
echo ========================================
echo.
echo IMPORTANT - do this once in Firebase Console if not done:
echo   1. https://console.firebase.google.com/project/clinic-desk-os/authentication/settings
echo   2. Authorized domains - Add: clinic-desk-app.vercel.app
echo.
pause
