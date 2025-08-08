# Type Trainer Testing Framework

This directory contains the comprehensive Jest testing framework for the Type Trainer application. The framework consolidates all previous testing functionality into a well-organized, maintainable structure.

## 🎯 Overview

### **What's New**
- **Jest Testing Framework**: Modern, fast, and feature-rich testing framework
- **Comprehensive Coverage**: Tests for utilities, components, integration, and server
- **TypeScript Support**: Full TypeScript support with proper type checking
- **Mocking Strategy**: Comprehensive mocking for external dependencies
- **Performance Testing**: Tests for large datasets and performance-critical code
- **Integration Tests**: End-to-end testing of the hash system and data management

### **Replaced Functionality**
- ✅ `test-hash-system.js` → `tests/integration/hash-system.test.ts`
- ✅ `test-category-filtering.js` → `tests/integration/hash-system.test.ts`
- ✅ `test-frontend-hash.js` → `tests/integration/hash-system.test.ts`
- ✅ `test-frontend-save.js` → `tests/utils/dataManager.test.ts`
- ✅ `test-new-system.js` → `tests/utils/dataManager.test.ts`

## 📁 Test Structure

```
tests/
├── README.md                    # This file
├── setup.ts                     # Jest setup and global mocks
├── env-setup.js                 # Environment setup for tests
├── run-tests.js                 # Test runner script
├── utils/                       # Utility tests
│   ├── hashUtils.test.ts        # Hash utility tests
│   └── dataManager.test.ts      # DataManager tests
├── components/                  # Component tests
│   └── TypingTestEngine.test.tsx # TypingTestEngine component tests
├── integration/                 # Integration tests
│   └── hash-system.test.ts      # Hash system integration tests
└── server/                      # Server tests
    └── api.test.ts              # API endpoint tests
```

## 🚀 Quick Start

### **Run All Tests**
```bash
npm test
```

### **Run Specific Test Categories**
```bash
# Utility tests (hashUtils, dataManager)
npm run test:utils

# Component tests (TypingTestEngine)
npm run test:components

# Integration tests (hash system, category filtering)
npm run test:integration

# Server tests (API endpoints)
npm run test:server
```

### **Run Tests with Coverage**
```bash
npm run test:coverage
```

### **Watch Mode (Development)**
```bash
npm run test:watch
```

### **CI Mode**
```bash
npm run test:ci
```

## 🧪 Test Categories

### **1. Utility Tests (`tests/utils/`)**

#### **hashUtils.test.ts**
- Hash generation consistency
- Duplicate detection
- Special character handling
- Performance with large datasets

#### **dataManager.test.ts**
- Data saving and retrieval
- Database integration
- localStorage fallback
- Error handling
- Duplicate prevention

### **2. Component Tests (`tests/components/`)**

#### **TypingTestEngine.test.tsx**
- Component rendering
- Typing functionality
- Error handling
- Test completion
- Virtual keyboard integration
- Performance calculations

### **3. Integration Tests (`tests/integration/`)**

#### **hash-system.test.ts**
- End-to-end hash system testing
- Category filtering
- Duplicate prevention
- Data synchronization
- Performance testing

### **4. Server Tests (`tests/server/`)**

#### **api.test.ts**
- API endpoint testing
- Request/response validation
- Error handling
- Database integration

## 🔧 Configuration

### **Jest Configuration (`jest.config.js`)**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testMatch: [
    '<rootDir>/tests/**/*.test.(js|jsx|ts|tsx)',
    '<rootDir>/src/**/*.test.(js|jsx|ts|tsx)',
    '<rootDir>/server/**/*.test.(js|jsx|ts|tsx)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'server/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!server/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### **Test Setup (`tests/setup.ts`)**
- Global mocks for localStorage, fetch, console
- Environment variable setup
- Test utilities and helpers
- Mock implementations for external dependencies

## 🎯 Test Coverage

### **Current Coverage Targets**
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### **Coverage Report**
Run `npm run test:coverage` to generate a detailed coverage report:
- HTML report in `coverage/` directory
- Console output with coverage summary
- Coverage thresholds enforcement

## 🔍 Testing Patterns

### **1. Mocking Strategy**
```typescript
// Mock external dependencies
jest.mock('../../src/utils/dataManager', () => ({
  DataManager: {
    saveResult: jest.fn(),
    getResults: jest.fn(),
    getUserStats: jest.fn(),
    clearAllData: jest.fn(),
    init: jest.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

### **2. Async Testing**
```typescript
it('should handle async operations', async () => {
  const result = await DataManager.saveResult(mockResult);
  expect(result.success).toBe(true);
});
```

### **3. Component Testing**
```typescript
it('should render component correctly', () => {
  render(<TypingTestEngine test={mockTest} onComplete={mockOnComplete} />);
  expect(screen.getByTestId('typing-test-area')).toBeInTheDocument();
});
```

### **4. Integration Testing**
```typescript
it('should handle end-to-end workflow', async () => {
  // Setup
  const mockResult = createMockTypingResult();
  
  // Execute
  const result = await DataManager.saveResult(mockResult);
  
  // Verify
  expect(result.success).toBe(true);
  expect(localStorage.getItem).toHaveBeenCalled();
});
```

## 🚨 Error Handling

### **Test Failures**
- Clear error messages with context
- Stack traces for debugging
- Coverage reporting on failures
- CI/CD integration support

### **Common Issues**
1. **Mock not working**: Check mock implementation and imports
2. **Async test failures**: Ensure proper `await` usage
3. **Component not rendering**: Check test environment setup
4. **Coverage thresholds**: Review uncovered code paths

## 📊 Performance Testing

### **Large Dataset Testing**
```typescript
it('should handle large datasets efficiently', () => {
  const largeResults = Array.from({ length: 1000 }, (_, i) => ({
    // ... mock data
  }));

  const startTime = Date.now();
  const uniqueResults = removeDuplicates(largeResults);
  const endTime = Date.now();

  expect(endTime - startTime).toBeLessThan(100);
});
```

### **Memory Usage**
- Tests designed to avoid memory leaks
- Proper cleanup in `beforeEach` and `afterEach`
- Mock cleanup after tests

## 🔄 Continuous Integration

### **CI/CD Integration**
```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm run test:ci
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

### **Pre-commit Hooks**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:ci"
    }
  }
}
```

## 🎉 Benefits

### **1. Maintainability**
- Organized test structure
- Clear separation of concerns
- Reusable test utilities
- Comprehensive documentation

### **2. Reliability**
- Automated testing
- Coverage enforcement
- Error detection
- Performance validation

### **3. Developer Experience**
- Fast test execution
- Clear error messages
- Watch mode for development
- Intuitive test organization

### **4. Quality Assurance**
- Comprehensive coverage
- Integration testing
- Performance testing
- Error handling validation

## 🚀 Future Enhancements

### **Planned Improvements**
1. **E2E Testing**: Cypress or Playwright integration
2. **Visual Testing**: Screenshot comparison tests
3. **Load Testing**: Performance under stress
4. **Accessibility Testing**: A11y compliance
5. **Mobile Testing**: Responsive design validation

### **Test Expansion**
1. **More Components**: Additional React component tests
2. **API Testing**: More comprehensive server tests
3. **Database Testing**: SQLite integration tests
4. **User Flow Testing**: Complete user journey tests

## 📝 Contributing

### **Adding New Tests**
1. Follow existing patterns and structure
2. Use descriptive test names
3. Include proper mocking
4. Add coverage for new functionality
5. Update documentation

### **Test Guidelines**
- Write tests before or alongside code
- Aim for high coverage
- Use meaningful assertions
- Keep tests focused and isolated
- Document complex test scenarios

---

**🎯 The testing framework is now production-ready and provides comprehensive coverage for the Type Trainer application!**
