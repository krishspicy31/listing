# Playwright Tests for Story 1.3: Create Public API for Approved Events

This directory contains comprehensive Playwright tests for validating the Events API endpoint created in Story 1.3.

## 📋 Test Coverage

### 🔐 Authentication & Authorization
- Public access without authentication
- Invalid authentication headers handling
- HTTP method restrictions (GET only)

### 📊 Event Data Validation
- Response structure with required fields
- Nested category object validation
- ISO 8601 date format verification
- Data type validation

### 🔍 Filtering Functionality
- City filtering (case-insensitive)
- Category filtering (case-insensitive)
- Combined filtering
- Non-existent filter handling

### 📄 Pagination
- Pagination metadata structure
- Page navigation
- Invalid page number handling (404 errors)

### 🔒 Security
- XSS prevention in query parameters
- SQL injection prevention
- Null byte injection handling

### ⚡ Performance
- Response time validation
- Concurrent request handling
- Caching verification

### 🚨 Error Handling
- Invalid query parameters
- Proper error response formats
- HTTP status code validation

### 🌐 Browser Integration
- Direct API access in browser
- Frontend JavaScript integration
- CORS handling
- Mobile/tablet viewport testing
- Real-time API interaction
- User experience testing

## 🚀 Setup and Installation

### Prerequisites
- Node.js 16+ installed
- Django backend server running on localhost:8000
- Test data available in the database

### Installation
```bash
# Navigate to playwright directory
cd playwright

# Install dependencies
npm install

# Install Playwright browsers
npm run install
```

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# API tests only
npm run test:api

# Browser tests only
npm run test:browser

# Run with browser UI visible
npm run test:headed

# Debug mode (step through tests)
npm run test:debug

# Interactive UI mode
npm run test:ui
```

### Run Specific Test Files
```bash
# API endpoint tests
npx playwright test story-1.3-events-api.spec.js

# Browser integration tests
npx playwright test story-1.3-browser.spec.js
```

### Run Tests with Specific Browser
```bash
# Chrome only
npx playwright test --project="Chrome Browser Tests"

# Firefox only
npx playwright test --project="Firefox Browser Tests"

# Safari only
npx playwright test --project="Safari Browser Tests"
```

## 📊 Test Reports

### View HTML Report
```bash
npm run report
```

### Test Artifacts
Test results are saved in the following locations:
- `test-results/html-report/` - Interactive HTML report
- `test-results/results.json` - JSON test results
- `test-results/junit.xml` - JUnit XML for CI/CD
- `test-results/artifacts/` - Screenshots, videos, traces
- `test-results/test-summary.json` - Test execution summary

## 🔧 Configuration

### Environment Variables
- `CI=true` - Enables CI mode with retries and single worker
- `BASE_URL` - Override default backend URL (default: http://localhost:8000)

### Custom Configuration
Edit `playwright.config.js` to modify:
- Test timeouts
- Browser configurations
- Reporter settings
- Retry policies

## 📝 Test Structure

### API Tests (`story-1.3-events-api.spec.js`)
- Pure API testing using Playwright's request context
- No browser required
- Fast execution
- Comprehensive endpoint validation

### Browser Tests (`story-1.3-browser.spec.js`)
- Full browser integration testing
- Frontend JavaScript interaction
- CORS and network testing
- User experience validation

## 🎯 Acceptance Criteria Validation

| AC# | Requirement | Test Coverage |
|-----|-------------|---------------|
| 1 | GET endpoint at `/api/events/` | ✅ API access tests |
| 2 | Returns only approved events | ✅ Data validation tests |
| 3 | Exact JSON fields | ✅ Response structure tests |
| 4 | City filtering | ✅ Filtering functionality tests |
| 5 | Category filtering | ✅ Filtering functionality tests |
| 6 | Proper HTTP status codes | ✅ Error handling tests |
| 7 | Pagination support | ✅ Pagination tests |

## 🐛 Troubleshooting

### Common Issues

**Backend server not running:**
```bash
# Start Django server
cd ../culturalite-backend
python manage.py runserver 8000
```

**No test data:**
```bash
# Create test data
cd ../culturalite-backend
python create_test_data.py
```

**Browser installation issues:**
```bash
# Reinstall browsers
npx playwright install --force
```

**Permission errors:**
```bash
# Install system dependencies (Linux/Mac)
npx playwright install-deps
```

### Debug Mode
For detailed debugging, run tests with:
```bash
# Step-by-step debugging
npm run test:debug

# Verbose output
npx playwright test --reporter=line

# Trace viewer for failed tests
npx playwright show-trace test-results/trace.zip
```

## 📈 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Playwright Tests
  run: |
    cd playwright
    npm ci
    npm run install
    npm test
  env:
    CI: true
```

### Test Results in CI
- JUnit XML output for test result integration
- HTML reports for detailed analysis
- Screenshots and videos for failure investigation

## 🔄 Maintenance

### Updating Tests
When API changes are made:
1. Update test expectations in spec files
2. Verify test data requirements
3. Update documentation
4. Run full test suite to ensure compatibility

### Performance Monitoring
Tests include performance assertions:
- Response time < 2000ms (generous for CI)
- Concurrent request handling
- Caching effectiveness validation

## 📞 Support

For issues with these tests:
1. Check the troubleshooting section
2. Review test logs in `test-results/`
3. Run tests in debug mode for detailed analysis
4. Verify backend server and test data setup
