@echo off
REM 🧪 CI/CD Local Testing Script (Windows)
REM ทดสอบ commands ที่ CI จะรันใน local

echo 🧪 Testing CI/CD locally...
echo ================================
echo.

REM Change to backend directory
cd backend

echo 📦 Step 1: Installing dependencies...
echo -----------------------------------
call npm ci
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b %errorlevel%
)
echo ✅ Dependencies installed successfully
echo.

echo 🔧 Step 2: Generating Prisma Client...
echo -----------------------------------
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma Client
    exit /b %errorlevel%
)
echo ✅ Prisma Client generated successfully
echo.

echo 🔍 Step 3: Running linter...
echo -----------------------------------
call npm run lint
if %errorlevel% neq 0 (
    echo ❌ Linter failed
    exit /b %errorlevel%
)
echo ✅ Linter passed
echo.

echo 🧪 Step 4: Running tests...
echo -----------------------------------
call npm run test
if %errorlevel% neq 0 (
    echo ❌ Tests failed
    exit /b %errorlevel%
)
echo ✅ Tests passed
echo.

echo ================================
echo ✅ All CI checks passed!
echo ================================
echo.
echo 💡 Next step: Push code to GitHub to test CI/CD in Actions
echo.
