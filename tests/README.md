# Type Trainer Testing Framework

This directory contains the comprehensive Jest testing framework for the Type Trainer application. The framework follows standardized testing practices and consolidates all previous testing functionality into a well-organized, maintainable structure.

## 🎯 Overview

### **What's New**
- **Standardized Testing Framework**: Consistent patterns and practices across all tests
- **Jest Testing Framework**: Modern, fast, and feature-rich testing framework
- **Comprehensive Coverage**: Tests for utilities, components, integration, and server
- **TypeScript Support**: Full TypeScript support with proper type checking
- **Mocking Strategy**: Comprehensive mocking for external dependencies
- **Performance Testing**: Tests for large datasets and performance-critical code
- **Integration Tests**: End-to-end testing of the hash system and data management
- **Test Utilities**: Reusable test helpers and mock data generators

### **Replaced Functionality**
- ✅ `test-hash-system.js` → `tests/integration/hash-system.test.ts`
- ✅ `test-category-filtering.js` → `tests/integration/hash-system.test.ts`
- ✅ `test-frontend-hash.js` → `tests/integration/hash-system.test.ts`
- ✅ `test-frontend-save.js` → `tests/utils/dataManager.test.ts`
- ✅ `test-new-system.js` → `tests/utils/dataManager.test.ts`

## 📁 Test Structure

```
tests/
├── README.md                    # This file - testing documentation
├── STANDARDS.md                 # Testing standards and conventions
├── setup.ts                     # Jest setup and global mocks
├── env-setup.js                 # Environment setup for tests
├── run-tests.js                 # Standardized test runner script
├── utils/                       # Testing utilities
│   └── testHelpers.ts          # Standardized test helpers and utilities
├── templates/                   # Test templates
│   └── standardTestTemplate.ts # Standard test template
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
# Using npm scripts
npm test

# Using test runner
node tests/run-tests.js all
```

### **Run Specific Test Categories**
```bash
# Utility tests (hashUtils, dataManager)
npm run test:utils
node tests/run-tests.js utils

# Component tests (TypingTestEngine)
npm run test:components
node tests/run-tests.js components

# Integration tests (hash system, category filtering)
npm run test:integration
node tests/run-tests.js integration

# Server tests (API endpoints)
npm run test:server
node tests/run-tests.js server
```

### **Run Tests with Coverage**
```bash
npm run test:coverage
node tests/run-tests.js coverage
```

### **Watch Mode (Development)**
```bash
npm run test:watch
node tests/run-tests.js watch
```

### **CI Mode**
```bash
npm run test:ci
node tests/run-tests.js ci
```

## 🧪 Test Categories

### **1. Utility Tests (`tests/utils/`)**

#### **hashUtils.test.ts**
- Hash generation consistency
- Duplicate detection
- Special character handling
- Performance with large datasets
- Edge case handling

#### **dataManager.test.ts**
- Data saving and retrieval
- Database integration
- localStorage fallback
- Error handling
- Duplicate prevention
- Performance with large datasets

### **2. Component Tests (`tests/components/`)**

#### **TypingTestEngine.test.tsx**
- Component rendering
- Typing functionality
- Error handling
- User interactions
- State management

### **3. Integration Tests (`tests/integration/`)**

#### **hash-system.test.ts**
- End-to-end hash system testing
- Data flow between modules
- Category filtering
- Performance testing

### **4. Server Tests (`tests/server/`)**

#### **api.test.ts**
- API endpoint testing
- Request/response handling
- Error scenarios
- Data validation

## 🎨 Standardized Testing

### **Test Structure**
All tests follow a standardized structure:

```typescript
/**
 * Tests for [ModuleName]
 * 
 * This file tests the [ModuleName] module/component.
 * 
 * @see [ModuleName] - The module being tested
 * @see [RelatedModule] - Related modules
 */

import { 
  setupTestEnvironment,
  createMockTypingResult,
  // ... other helpers
} from '../utils/testHelpers';

// ============================================================================
// IMPORTS AND MOCKS
// ============================================================================

// ============================================================================
// TEST SUITE
// ============================================================================

describe('YourModule', () => {
  // ============================================================================
  // SETUP AND TEARDOWN
  // ============================================================================

  beforeEach(() => {
    setupTestEnvironment();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // TEST GROUPS
  // ============================================================================

  describe('Initialization', () => {
    it('should initialize correctly', () => {
      // Test implementation
    });
  });

  describe('Core Functionality', () => {
    it('should perform main function correctly', async () => {
      // Test implementation
    });
  });

  describe('Edge Cases', () => {
    it('should handle edge cases', () => {
      // Test implementation
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      // Test implementation
    });
  });
});
```

### **Test Helpers**
The framework provides standardized test helpers in `tests/utils/testHelpers.ts`:

- **Mock Data Generators**: `createMockTypingResult`, `createMockTypingTest`, `createMockUser`
- **Test Utilities**: `setupTestEnvironment`, `waitFor`, `mockFetchResponse`
- **Assertion Helpers**: `expectToThrow`, `expectAsyncToThrow`, `expectValidDate`
- **Performance Helpers**: `measureExecutionTime`, `expectExecutionTime`

### **Naming Conventions**
- **Test Files**: Use `.test.ts` or `.test.tsx` extension, kebab-case
- **Test Suites**: Use PascalCase for describe blocks
- **Test Cases**: Use descriptive "should" statements
- **Variables**: Use camelCase, prefix mock data with `mock`

## 📊 Coverage Requirements

### **Minimum Coverage Thresholds**
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### **Coverage Reporting**
- Generate HTML coverage reports
- Include coverage in CI/CD pipeline
- Review coverage regularly
- Aim for 100% coverage on critical paths

## 🔧 Testing Patterns

### **1. Arrange-Act-Assert Pattern**
```typescript
it('should process input correctly', () => {
  // Arrange - Set up test data and mocks
  const input = 'test input';
  const expectedOutput = 'processed output';
  
  // Act - Execute the function being tested
  const result = processInput(input);
  
  // Assert - Verify the expected outcome
  expect(result).toBe(expectedOutput);
});
```

### **2. Async Testing Pattern**
```typescript
it('should handle async operations', async () => {
  // Arrange
  const mockData = createMockTypingResult();
  mockFetchResponse(mockData);
  
  // Act
  const result = await asyncFunction();
  
  // Assert
  expect(result).toEqual(mockData);
});
```

### **3. Error Testing Pattern**
```typescript
it('should throw error for invalid input', () => {
  // Arrange
  const invalidInput = null;
  
  // Act & Assert
  expectToThrow(() => processInput(invalidInput), 'Invalid input');
});
```

## 🚀 Test Runner

### **Standardized Test Runner**
The framework includes a comprehensive test runner (`tests/run-tests.js`) that provides:

- **Category-based testing**: Run specific test categories
- **Coverage reporting**: Generate detailed coverage reports
- **Watch mode**: Development-friendly watch mode
- **CI mode**: Optimized for continuous integration
- **Verbose output**: Detailed test output
- **Environment validation**: Ensure test environment is properly configured

### **Usage Examples**
```bash
# Run all tests
node tests/run-tests.js all

# Run utility tests with coverage
node tests/run-tests.js utils --coverage

# Run component tests in watch mode
node tests/run-tests.js components --watch

# Run tests in CI mode
node tests/run-tests.js ci

# Show help
node tests/run-tests.js help
```

## 🔍 Best Practices

### **Test Organization**
1. Group related tests using `describe` blocks
2. Use descriptive test names
3. Keep tests focused and specific
4. Avoid test interdependence

### **Mocking Strategy**
1. Mock external dependencies
2. Use consistent mock data
3. Reset mocks between tests
4. Verify mock calls when relevant

### **Assertions**
1. Use specific assertions
2. Test one thing per test
3. Use meaningful error messages
4. Avoid complex assertions

### **Performance**
1. Keep tests fast
2. Avoid unnecessary setup
3. Use efficient mocking
4. Batch similar tests

## 📝 Documentation

### **Test Documentation**
- Document complex test logic
- Explain test purpose
- Document test data
- Keep documentation up to date

### **Code Comments**
- Comment complex test logic
- Explain test setup
- Document edge cases
- Use clear, concise comments

## 🔄 Continuous Integration

### **CI/CD Integration**
- Run tests on every commit
- Enforce coverage thresholds
- Generate test reports
- Block merges on test failures

### **Test Automation**
- Automate test execution
- Automate coverage reporting
- Automate test result analysis
- Automate test environment setup

## 📚 Resources

### **Testing Libraries**
- [Jest](https://jestjs.io/) - Testing framework
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - React component testing
- [Testing Library](https://testing-library.com/) - Testing utilities

### **Documentation**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [TypeScript Testing](https://jestjs.io/docs/getting-started#using-typescript)

### **Best Practices**
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest Best Practices](https://jestjs.io/docs/best-practices)
- [React Testing Best Practices](https://testing-library.com/docs/guiding-principles)

## 🎯 Benefits

### **Maintainability**
- Consistent test structure
- Reusable test utilities
- Clear documentation
- Easy to understand and modify

### **Reliability**
- Comprehensive test coverage
- Deterministic test results
- Proper error handling
- Performance testing

### **Scalability**
- Modular test structure
- Easy to add new tests
- Efficient test execution
- CI/CD integration

### **Developer Experience**
- Fast test execution
- Clear error messages
- Helpful test utilities
- Comprehensive documentation
