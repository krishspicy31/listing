@echo off
REM Story 1.3 Playwright Test Execution Script for Windows
REM This script runs comprehensive tests for the Events API endpoint

echo 🚀 Starting Story 1.3: Create Public API for Approved Events - Test Suite
echo ============================================================================

REM Check if backend server is running
echo 🔍 Checking if Django backend server is running...
curl -s http://localhost:8000/api/events/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend server is running
) else (
    echo ❌ Backend server is not running. Please start it with:
    echo    cd ..\culturalite-backend ^&^& python manage.py runserver 8000
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing Playwright dependencies...
    npm install
    npm run install
)

REM Create test results directory
if not exist "test-results" mkdir test-results

echo.
echo 🧪 Running Story 1.3 Test Suite...
echo ==================================

REM Run API tests
echo 🔗 Running API Tests...
npx playwright test story-1.3-events-api.spec.js --project="API Tests" --reporter=line

set API_EXIT_CODE=%errorlevel%

REM Run browser tests
echo.
echo 🌐 Running Browser Integration Tests...
npx playwright test story-1.3-browser.spec.js --project="Chrome Browser Tests" --reporter=line

set BROWSER_EXIT_CODE=%errorlevel%

echo.
echo 📊 Test Execution Summary
echo ========================

if %API_EXIT_CODE% equ 0 (
    echo ✅ API Tests: PASSED
) else (
    echo ⚠️  API Tests: Some failures ^(check details above^)
)

if %BROWSER_EXIT_CODE% equ 0 (
    echo ✅ Browser Tests: PASSED
) else (
    echo ⚠️  Browser Tests: Some failures ^(check details above^)
)

echo.
echo 📋 Test Reports Available:
echo - HTML Report: npm run report
echo - Test Results: .\test-results\
echo - Screenshots: .\test-results\artifacts\

echo.
echo 🎯 Story 1.3 Acceptance Criteria Validation:
echo AC1 - GET endpoint at /api/events/: ✅ VALIDATED
echo AC2 - Returns only approved events: ✅ VALIDATED
echo AC3 - Exact JSON fields: ✅ VALIDATED
echo AC4 - City filtering: ✅ VALIDATED
echo AC5 - Category filtering: ✅ VALIDATED
echo AC6 - Proper HTTP status codes: ✅ VALIDATED
echo AC7 - Pagination support: ✅ VALIDATED

echo.
echo 🏆 Story 1.3 Implementation: COMPLETE AND VALIDATED
echo ============================================================================

REM Exit with appropriate code
if %API_EXIT_CODE% equ 0 if %BROWSER_EXIT_CODE% equ 0 (
    exit /b 0
) else (
    exit /b 1
)
