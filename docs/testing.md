# Testing Strategy for ParkHub Passes Creation Web Application

## Introduction

This document outlines the comprehensive testing strategy for the ParkHub Passes Creation Web Application. As a frontend-only application that interfaces directly with the ParkHub API, effective testing is critical to ensure reliability, maintainability, and a positive user experience.

### Purpose and Scope

The testing strategy aims to:

- Ensure all application features work as expected
- Validate integration with ParkHub API endpoints
- Prevent regressions when making changes
- Maintain high code quality and test coverage
- Provide confidence in application reliability

This document covers all aspects of testing including unit testing, integration testing, component testing, and end-to-end testing approaches tailored to a React frontend application.

### Testing Philosophy

Our testing approach follows these key principles:

- **Shift Left**: Tests are written early in the development process
- **Comprehensive Coverage**: Critical paths and edge cases are tested
- **Automation First**: Automated testing is prioritized to enable CI/CD
- **User-Centric**: Tests focus on validating real user workflows
- **Maintainability**: Tests are structured for clarity and maintainability

## Testing Approach

### Unit Testing

Unit tests validate the smallest testable parts of the application in isolation, typically individual functions, hooks, and utilities.

#### Testing Scope

Unit tests cover:

- Utility functions (validation, formatting, transformations)
- Custom React hooks
- API service functions
- State management logic

#### Mocking Strategy

For unit testing, we use Jest's mocking capabilities to isolate the unit under test:

- API calls are mocked using Mock Service Worker or jest.mock
- Component dependencies are mocked using jest.mock
- External services are mocked to prevent actual API calls

#### Code Coverage Requirements

Unit tests aim for high code coverage:

| Component Type | Coverage Target | Critical Areas |
| --- | --- | --- |
| Utility Functions | 95% | Data transformation, validation functions |
| Custom Hooks | 90% | State management, side effects |
| API Services | 90% | Request formatting, error handling |
| State Management | 85% | State updates, derived state calculations |

Example unit test for a utility function:

```typescript
// Example unit test for a utility function
describe('validateEventId', () => {
  it('should return true for valid event ID', () => {
    expect(validateEventId('EV12345')).toBe(true);
  });

  it('should return false for invalid event ID', () => {
    expect(validateEventId('invalid')).toBe(false);
  });
});
```

### Integration Testing

Integration tests validate the interaction between multiple units, ensuring they work together correctly.

#### Testing Scope

Integration tests cover:

- API service integration with context providers
- Form submission workflows
- Component interaction with state management
- Validation and error handling flows

#### API Mocking

We use Mock Service Worker (MSW) to intercept and mock API requests:

```typescript
// Example of API mocking with MSW
const getEventsHandler = rest.get(
  `${API_BASE_URL}/${ENDPOINTS.EVENTS}`,
  (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json(createAuthenticationError())
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(createMockEventResponse())
    );
  }
);
```

#### Data Flow Testing

Integration tests validate the complete data flow through the application:

- Data fetching from APIs
- State updates
- UI rendering based on state
- User interactions triggering state changes

Example integration test for API service:

```typescript
// Example integration test for API service
describe('passesApi', () => {
  describe('getPassesForEvent', () => {
    it('should retrieve passes for a specific event', async () => {
      const mockResponse = createSuccessResponse(mockParkHubPasses);
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await passesApi.getPassesForEvent({ eventId: 'EV12345' });
      
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('eventId=EV12345'),
        expect.any(Object)
      );
      expect(result.data).toEqual(mockParkHubPasses);
      expect(result.success).toBe(true);
    });
  });
});
```

### Component Testing

Component tests validate React components in isolation and with their dependencies.

#### Testing Scope

Component tests cover:

- Component rendering with different props
- User interaction handling
- Conditional rendering
- State changes within components
- Component interactions with context providers

#### Testing Approach

We use React Testing Library to test components from a user perspective:

- Focus on testing user-visible behavior, not implementation details
- Query elements by accessible attributes
- Interact with components the way users would
- Verify correct rendering and behavior

Example component test:

```typescript
// Example component test
describe('EventsList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockApiKey();
    (useEvents as jest.Mock).mockImplementation(createMockUseEventsImplementation({}));
  });

  it('renders loading state when events are loading', async () => {
    (useEvents as jest.Mock).mockImplementation(
      createMockUseEventsImplementation({ loading: true })
    );
    
    renderWithProviders(<EventsList />);
    
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(screen.queryByTestId('events-table')).not.toBeInTheDocument();
  });
});
```

### End-to-End Testing

End-to-end tests validate complete user workflows across the entire application.

#### Testing Scope

E2E tests cover critical user journeys:

- Viewing events list
- Viewing passes for an event
- Creating single and multiple passes
- Handling error states
- Navigation between views

#### Testing Tools

For E2E testing, we use Cypress to automate browser-based testing:

- Simulate real user interactions
- Test against a fully integrated application
- Verify integration with mocked ParkHub API endpoints
- Capture screenshots and videos for debugging

## Test Environment Setup

### Jest Configuration

Our Jest configuration in `jest.config.ts` is set up with the following key features:

- TypeScript support via ts-jest
- JSDOM environment for simulating browser
- Module name mappings for simplified imports
- Coverage thresholds configured by module type
- File transformations for non-JS assets

Key configuration settings:

```typescript
// From jest.config.ts
export default (): Config.InitialOptions => {
  return {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src', '<rootDir>/__tests__'],
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
    
    // Coverage thresholds
    coverageThreshold: {
      global: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      },
      './src/components/': {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85
      },
      './src/services/': {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90
      }
    }
  };
};
```

### Test Setup

The `setupTests.ts` file configures the test environment:

- Imports Jest DOM matchers for DOM element assertions
- Sets up Mock Service Worker
- Configures React Testing Library
- Mocks browser APIs not available in JSDOM (like matchMedia and ResizeObserver)

```typescript
// From setupTests.ts
import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { configure } from '@testing-library/react';
import { handlers } from './__tests__/__mocks__/handlers';

// Configure Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000
});

// Create MSW server with handlers
const server = setupServer(...handlers);

// Set up server lifecycle hooks
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Mock Service Worker

MSW is used to intercept and mock API requests during tests:

- Handlers are defined for each API endpoint
- Different response scenarios can be simulated (success, error, validation failure)
- Realistic API behavior is maintained in tests

The handler files define mock implementations for the ParkHub API endpoints:

- Events endpoint
- Passes endpoint
- Pass creation endpoint
- Batch pass creation endpoint

### Test Data Management

Test data is managed using:

- Mock factories to generate test data
- Fixtures for commonly used test data
- Helper functions to create custom test scenarios

Example from mock data files:

```typescript
// From eventsMock.ts
export function createMockEvent(overrides: Partial<Event> = {}): Event {
  const id = overrides.id || `EV${Math.floor(10000 + Math.random() * 90000)}`;
  const date = overrides.date || new Date(2023, 9, 15, 19, 0);
  
  const defaultEvent: Event = {
    id,
    name: 'Football vs. Rivals',
    date,
    formattedDate: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    formattedTime: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    venue: 'Stadium1',
    status: EventStatus.ACTIVE,
  };

  return { ...defaultEvent, ...overrides };
}
```

## Writing Tests

### Unit Test Examples

Unit tests focus on testing individual functions and hooks:

```typescript
// Example unit test for a utility function
import { validateBarcode } from '../utils/validation';

describe('validateBarcode', () => {
  it('should return true for valid barcode format', () => {
    expect(validateBarcode('BC123456')).toBe(true);
  });

  it('should return false for invalid barcode format', () => {
    expect(validateBarcode('invalid')).toBe(false);
    expect(validateBarcode('BC1234')).toBe(false); // Too short
    expect(validateBarcode('XC123456')).toBe(false); // Wrong prefix
  });
});

// Example unit test for a custom hook
import { renderHook, act } from '@testing-library/react-hooks';
import { useApiKey } from '../hooks/useApiKey';

describe('useApiKey', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should return null if no API key is stored', () => {
    const { result } = renderHook(() => useApiKey());
    expect(result.current.apiKey).toBeNull();
  });

  it('should set and retrieve an API key', () => {
    const { result } = renderHook(() => useApiKey());
    
    act(() => {
      result.current.setApiKey('test-api-key');
    });
    
    expect(result.current.apiKey).toBe('test-api-key');
    expect(localStorage.getItem).toHaveBeenCalledWith('apiKey');
    expect(localStorage.setItem).toHaveBeenCalledWith('apiKey', expect.any(String));
  });
});
```

### Component Test Examples

Component tests verify rendering and behavior of UI components:

```typescript
// Example component test using React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '../components/EventCard';
import { createMockEvent } from '../../__tests__/__mocks__/eventsMock';

describe('EventCard', () => {
  const mockEvent = createMockEvent();
  const mockOnSelect = jest.fn();

  it('renders event details correctly', () => {
    render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);
    
    expect(screen.getByText(mockEvent.name)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.formattedDate)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.venue)).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(<EventCard event={mockEvent} onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByTestId('event-card'));
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockEvent.id);
  });

  it('applies selected styling when selected', () => {
    render(<EventCard event={mockEvent} onSelect={mockOnSelect} isSelected={true} />);
    
    const card = screen.getByTestId('event-card');
    expect(card).toHaveClass('selected');
  });
});
```

### Integration Test Examples

Integration tests verify interactions between components and services:

```typescript
// Example integration test for a page component
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PassesView } from '../pages/PassesView';
import { AppContextProvider } from '../context/AppContext';
import { server } from '../../__tests__/__mocks__/server';
import { rest } from 'msw';
import { API_BASE_URL, ENDPOINTS, LANDMARK_ID } from '../constants/apiEndpoints';
import { createMockPassesResponse } from '../../__tests__/__mocks__/passesMock';

describe('PassesView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays passes when event ID is submitted', async () => {
    // Set up custom handler for this test
    server.use(
      rest.get(
        `${API_BASE_URL}${ENDPOINTS.PASSES.replace('{landMarkId}', LANDMARK_ID)}`,
        (req, res, ctx) => {
          const eventId = req.url.searchParams.get('eventId');
          if (eventId === 'EV12345') {
            return res(ctx.status(200), ctx.json(createMockPassesResponse()));
          }
          return res(ctx.status(400), ctx.json({ error: 'Invalid event ID' }));
        }
      )
    );

    render(
      <AppContextProvider>
        <PassesView />
      </AppContextProvider>
    );
    
    // Enter event ID and submit
    fireEvent.change(screen.getByLabelText(/event id/i), {
      target: { value: 'EV12345' }
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Wait for passes to load
    await waitFor(() => {
      expect(screen.getByText(/showing \d+ passes/i)).toBeInTheDocument();
    });
    
    // Verify passes are displayed
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('BC100001')).toBeInTheDocument();
  });
});
```

### Test Naming Conventions

We follow these naming conventions for tests:

1. Test files should be named after the module they test with `.test.ts` or `.test.tsx` suffix
2. Test descriptions should clearly state what is being tested
3. Test assertions should follow the pattern:
   - `it('should [expected behavior] when [condition]')`
   - `it('renders [component] correctly with [props]')`
   - `it('handles [event] by [expected outcome]')`

### Test Data Management

Test data management strategies:

1. **Factory Functions**: Create reusable factory functions that generate test data with customizable properties
2. **Mock Fixtures**: Use static fixtures for standard test cases
3. **Context Providers**: Wrap components in test providers to simulate application state
4. **MSW Handlers**: Create handlers that return appropriate test data for API calls

## Test Automation

### CI/CD Integration

Our testing is integrated into GitHub Actions workflows to ensure continuous testing:

- `ci.yml`: Main CI pipeline that runs on pushes and pull requests
- `test.yml`: Specialized test workflow that separates unit, component, and integration tests

The CI workflow includes:

1. Linting and type checking
2. Unit and integration tests
3. Coverage reporting
4. Build validation
5. Security scanning

Key sections from the CI workflow:

```yaml
# From ci.yml
jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
          cache-dependency-path: 'src/web/package-lock.json'
      
      - name: Install dependencies
        working-directory: src/web
        run: npm ci
      
      - name: Run tests with coverage
        working-directory: src/web
        run: npm run test:coverage
      
      - name: Check coverage thresholds
        working-directory: src/web
        run: npx jest --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":85,"statements":85}}' --passWithNoTests
      
      - name: Upload coverage report
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: src/web/coverage
          retention-days: 14
```

### Automated Test Triggers

Tests are automatically triggered by:

1. **Pull Requests**: All tests run when PRs are created or updated
2. **Pushes to Main/Develop**: Full test suite runs on push to main or develop branches
3. **Scheduled Runs**: Weekly scheduled runs to ensure continued functionality
4. **Manual Trigger**: Tests can be triggered manually via workflow_dispatch

### Test Reporting

Test results are reported through:

1. **GitHub Actions Summary**: Results are summarized in the workflow run
2. **Artifacts**: Coverage reports are uploaded as artifacts
3. **PR Comments**: Test failures are reported as comments on PRs
4. **Badge Status**: Repository includes testing status badge

The specialized test workflow (`test.yml`) provides detailed reporting by test type:

```yaml
# From test.yml
jobs:
  coverage_report:
    name: Coverage Report
    runs-on: ubuntu-latest
    needs: [unit_tests, component_tests, integration_tests]
    steps:
      # ... setup steps ...
      
      - name: Merge coverage reports
        run: nyc merge coverage coverage/merged-coverage.json
      
      - name: Generate HTML report
        run: nyc report --reporter=html --reporter=text --reporter=lcov --temp-dir coverage/merged-coverage.json
      
      - name: Upload merged coverage report
        uses: actions/upload-artifact@v3
        with:
          name: merged-coverage-report
          path: coverage/
          retention-days: 7
      
      - name: Check coverage thresholds
        run: |
          node -e "
            const fs = require('fs');
            const summary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json'));
            const total = summary.total;
            if (total.statements.pct < 80 || total.branches.pct < 75 || total.functions.pct < 80 || total.lines.pct < 80) {
              console.error('Coverage thresholds not met');
              process.exit(1);
            } else {
              console.log('Coverage thresholds met');
            }
          "
```

### Failed Test Handling

Failed tests are handled through:

1. **Detailed Logs**: Test failures include detailed error information
2. **Screenshots**: E2E tests capture screenshots at failure points
3. **Retry Mechanism**: Flaky tests can be automatically retried
4. **PR Blocking**: PRs with test failures are blocked from merging
5. **Quick Feedback**: Fast-failing tests provide quick feedback to developers

## Quality Metrics

### Code Coverage

Our code coverage targets are:

| Component Type | Statement Coverage | Branch Coverage | Function Coverage | Line Coverage |
|----------------|-------------------|-----------------|-------------------|---------------|
| Global         | 80%               | 75%             | 80%               | 80%           |
| Components     | 85%               | 80%             | 85%               | 85%           |
| Services       | 90%               | 85%             | 90%               | 90%           |
| Utils          | 95%               | 90%             | 95%               | 95%           |

Coverage is enforced through Jest's coverage thresholds and verified in the CI pipeline.

### Quality Gates

The following quality gates must be passed before code can be merged:

1. **Linting**: Code must pass ESLint checks with no errors
2. **Type Checking**: TypeScript must compile without errors
3. **Unit Tests**: All unit tests must pass
4. **Integration Tests**: All integration tests must pass
5. **Coverage Thresholds**: Code coverage must meet minimum thresholds
6. **Security Scan**: Dependencies must pass security audit

### Performance Testing

Performance testing focuses on:

1. **Render Performance**: Components should render efficiently
2. **API Handling**: API requests should be handled efficiently
3. **Form Submission**: Forms should process input and validate efficiently
4. **Animation Smoothness**: UI animations should be smooth
5. **Load Time**: Initial load time should be under 2 seconds

## Specialized Testing

### Accessibility Testing

We ensure our application is accessible by:

1. **Automated Testing**: Using jest-axe to test for accessibility violations
2. **Keyboard Navigation**: Testing all features with keyboard-only navigation
3. **Screen Reader Compatibility**: Testing with screen readers
4. **Color Contrast**: Ensuring sufficient contrast for all text
5. **ARIA Attributes**: Verifying correct ARIA attributes

Example accessibility test:

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EventsList } from '../components/EventsList';

expect.extend(toHaveNoViolations);

describe('EventsList accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<EventsList events={mockEvents} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Security Testing

Security testing includes:

1. **Dependency Scanning**: Using npm audit to check for vulnerabilities
2. **Static Analysis**: Using ESLint security plugins to identify security issues
3. **API Key Handling**: Testing secure storage and usage of API keys
4. **Input Validation**: Testing validation of user input
5. **XSS Prevention**: Testing prevention of cross-site scripting vulnerabilities

The CI pipeline includes a security scan job:

```yaml
# From ci.yml
security_scan:
  name: Security Scan
  runs-on: ubuntu-latest
  needs: lint
  steps:
    # ... setup steps ...
    
    - name: Run npm audit
      working-directory: src/web
      run: npm audit --production
```

### Responsive Design Testing

We test responsive design across:

1. **Device Sizes**: Testing on mobile, tablet, and desktop sizes
2. **Orientation**: Testing in both portrait and landscape orientations
3. **Browser Compatibility**: Testing across multiple browsers
4. **Touch Interactions**: Testing touch-specific interactions
5. **Viewport Adaptations**: Testing how layout adapts to different viewports

## Troubleshooting

### Common Test Failures

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| API mocking fails | Incorrect API path or request format | Verify API path constants and request format match mock handlers |
| Component not found | Wrong query selector or component not rendering | Check component conditionals and use correct Testing Library queries |
| Async test timeout | API call or effect not resolving | Increase timeout, add proper await/waitFor, check promises are resolving |
| Test state pollution | Tests affecting each other | Add cleanup in afterEach, reset mocks between tests |
| Mock not working | Mock not set up correctly | Verify mock setup and implementation matches usage |

### Debugging Tests

Techniques for debugging failing tests:

1. **Console Logging**: Add console.logs to see values during test execution
2. **Debug Mode**: Run Jest in debug mode with `--debug` flag
3. **Testing Library Debug**: Use `screen.debug()` to output DOM state
4. **Snapshot Testing**: Take snapshots to see what's being rendered
5. **Isolate Tests**: Run single test with `--testNamePattern` flag

### Test Performance

Tips for improving test performance:

1. **Focused Tests**: Test only what needs to be tested
2. **Mocking Heavy Operations**: Mock expensive operations
3. **Reducing Test Redundancy**: Avoid duplicate test scenarios
4. **Parallelization**: Run tests in parallel with `--maxWorkers`
5. **Skip Unnecessary Tests**: Use `test.skip` for temporarily skipping tests

## Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro)
- [Mock Service Worker Documentation](https://mswjs.io/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Tutorials

- [Testing React Applications](https://reactjs.org/docs/testing.html)
- [Testing React Hooks](https://kentcdodds.com/blog/how-to-test-custom-react-hooks)
- [API Mocking with MSW](https://mswjs.io/docs/getting-started/mocks/rest-api)
- [Component Testing Best Practices](https://www.smashingmagazine.com/2020/07/react-apps-testing-library/)

### Best Practices

- [Testing Trophy](https://kentcdodds.com/blog/write-tests)
- [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- [React Testing Patterns](https://github.com/testing-library/react-testing-library/issues/281)
- [TDD with React](https://www.freecodecamp.org/news/tdd-with-react-and-typescript/)