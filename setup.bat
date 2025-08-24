@echo off
echo 🎮 Gaming Platform Setup Script
echo ================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v14 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install backend dependencies
echo 📦 Installing backend dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd client
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy env.example .env
    echo ✅ .env file created. Please update it with your configuration.
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Update the .env file with your configuration
echo 2. Start MongoDB (if not running)
echo 3. Run 'npm run dev' to start the backend server
echo 4. Run 'cd client && npm start' to start the frontend
echo.
echo For more information, see the README.md file
pause
