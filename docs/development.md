# ParkHub Passes Creation Web Application Developer Guide

## Introduction

This document provides comprehensive development guidelines for the ParkHub Passes Creation Web Application, a frontend-only solution that enables Jump administrators to create and manage parking passes in the ParkHub system. It covers setup instructions, development workflows, coding standards, and best practices for contributing to the project.

## Getting Started

Instructions for setting up the development environment and getting started with the project.

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher) or Yarn (v1.22 or higher)
- Git
- A code editor (VS Code recommended)
- ParkHub API key (for testing with real API)

### Installation

```bash
# Clone the repository
git clone https://github.com/jump/parkhub-passes-creation.git

# Navigate to the project directory
cd parkhub-passes-creation/src/web

# Install dependencies
npm install
# or
yarn install
```

### Running the Application

```bash
# Start the development server
npm run dev
# or
yarn dev
```

This will start the Vite development server at http://localhost:3000 with hot module replacement enabled.

### Environment Configuration

The application uses environment variables for configuration. For local development, create a `.env.local` file in the `src/web` directory to override any settings from `.env.development`.

Key environment variables:

- `VITE_API_BASE_URL`: Base URL for the ParkHub API
- `VITE_API_LANDMARK_ID`: Landmark ID for ParkHub API requests
- `VITE_ENABLE_MOCK_API`: Enable/disable mock API responses

See `.env.development` for all available configuration options.

## Project Structure

Overview of the project's directory structure and organization.

### Directory Structure

```
src/web/
├── public/              # Static assets served as-is
├── src/                 # Source code
│   ├── assets/          # Static assets (images, fonts, styles)
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Basic UI components
│   │   ├── events/      # Event-related components
│   │   ├── passes/      # Pass-related components
│   │   ├── forms/       # Form components
│   │   ├── feedback/    # Feedback components (errors, notifications)
│   │   └── layout/      # Layout components
│   ├── constants/       # Application constants
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── router/          # Routing configuration
│   ├── services/        # API services
│   │   ├── api/         # API client and endpoints
│   │   └── storage/     # Storage services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main application component
│   └── index.tsx        # Application entry point
├── __tests__/           # Test files
├── .env                 # Base environment variables
├── .env.development     # Development environment variables
├── .env.production      # Production environment variables
├── .eslintrc.ts         # ESLint configuration
├── .prettierrc          # Prettier configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Project dependencies and scripts
```

### Key Files and Directories

- **components/**: Reusable UI components organized by domain and purpose
- **services/api/**: API client and service modules for ParkHub integration
- **hooks/**: Custom React hooks for state management and API interactions
- **pages/**: Top-level page components corresponding to routes
- **types/**: TypeScript type definitions for the application
- **utils/**: Utility functions for common operations
- **context/**: React context providers for global state management

### Component Organization

Components are organized into several categories:

- **UI Components**: Basic, reusable UI elements (buttons, inputs, etc.)
- **Domain Components**: Components specific to events, passes, etc.
- **Form Components**: Components for form handling and validation
- **Feedback Components**: Error displays, notifications, loading indicators
- **Layout Components**: Page layout, navigation, header, footer

Each component should be in its own file with a corresponding test file in the `__tests__` directory.

## Development Workflow

Guidelines for the development workflow, including branching, commits, and pull requests.

### Branching Strategy

We follow a simplified Git Flow workflow:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Urgent fixes for production

Always branch from `develop` for new features and bug fixes.

### Commit Guidelines

Follow conventional commit messages for all commits:

```
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code refactoring without functionality changes
test: add or update tests
chore: update build tasks, package manager configs, etc.
```

This helps with automated changelog generation and versioning.

### Pull Request Process

1. Create a feature or bugfix branch from `develop`
2. Implement your changes with appropriate tests
3. Ensure all tests pass and code is properly formatted
4. Create a pull request to merge back into `develop`
5. Request review from at least one team member
6. Address any feedback from code review
7. Once approved, merge the pull request

Pull requests should be focused on a single feature or bug fix to facilitate review.

### Code Review Guidelines

When reviewing code, focus on:

- Functionality: Does the code work as expected?
- Code quality: Is the code clean, maintainable, and following best practices?
- Test coverage: Are there appropriate tests for the changes?
- Performance: Are there any performance concerns?
- Security: Are there any security implications?

Provide constructive feedback and suggest improvements rather than just pointing out issues.

## Coding Standards

Coding standards and best practices for the project.

### TypeScript Guidelines

- Use TypeScript for all new code
- Define explicit types for function parameters and return values
- Use interfaces for object shapes and types for unions/primitives
- Avoid using `any` type; use `unknown` if type is truly unknown
- Use type guards to narrow types when necessary
- Leverage TypeScript's utility types (Partial, Pick, Omit, etc.)
- Use readonly for immutable properties

### React Best Practices

- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use React Context for global state that doesn't change frequently
- Memoize expensive calculations with useMemo
- Memoize callback functions with useCallback when passed as props
- Use React.memo for components that render often but with the same props
- Avoid direct DOM manipulation; use refs when necessary

### State Management

- Use local component state (useState) for component-specific state
- Use React Context for global state shared across components
- Use custom hooks to encapsulate and reuse stateful logic
- Keep state as close as possible to where it's used
- Avoid prop drilling by using Context or composition
- Use React Query for server state management

### Code Formatting

The project uses ESLint and Prettier for code formatting and linting. Configuration is provided in `.eslintrc.ts` and `.prettierrc`.

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

VS Code users should install the ESLint and Prettier extensions and enable format on save for the best experience.

## API Integration

Guidelines for integrating with the ParkHub API.

### API Client

The application uses a custom API client built on top of Axios for communicating with the ParkHub API. The client handles authentication, error handling, and request/response transformation.

```typescript
import { apiClient } from '../services/api/apiClient';

// Making API requests
const response = await apiClient.get('/events');
const response = await apiClient.post('/passes', passData);
```

See `src/services/api/apiClient.ts` for implementation details.

### API Services

Domain-specific API services are built on top of the API client:

```typescript
import { eventsApi } from '../services/api/eventsApi';
import { passesApi } from '../services/api/passesApi';

// Get events
const events = await eventsApi.getEvents();

// Get passes for an event
const passes = await passesApi.getPassesForEvent({ eventId: 'EV12345' });

// Create a pass
const result = await passesApi.createPass(passData);
```

These services provide type-safe methods for interacting with specific API endpoints.

### React Hooks for API

The application provides custom hooks for data fetching and mutations:

```typescript
import { useEvents } from '../hooks/useEvents';
import { usePasses } from '../hooks/usePasses';

// Using hooks in components
function EventsPage() {
  const { events, isLoading, error, refetchEvents } = useEvents();
  // Component implementation
}

function PassesPage() {
  const { passes, isLoading, error, createPass } = usePasses('EV12345');
  // Component implementation
}
```

These hooks handle loading states, error handling, and caching.

### Mock API

For development without a real ParkHub API, the application supports mock API responses. Enable mock API in `.env.local`:

```
VITE_ENABLE_MOCK_API=true
```

Mock handlers are defined in `src/mocks/handlers.ts`. Add or modify mock responses as needed for development.

## Testing

Guidelines for testing the application.

### Testing Approach

The application uses Jest and React Testing Library for testing. Tests are located in the `__tests__` directory, mirroring the structure of the `src` directory.

We follow a testing pyramid approach:
- Many unit tests for individual components and functions
- Fewer integration tests for component interactions
- A few end-to-end tests for critical user flows

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Tests are also run automatically in CI for all pull requests.

### Writing Tests

When writing tests, focus on user behavior rather than implementation details:

```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventsList from '../components/events/EventsList';

describe('EventsList', () => {
  it('displays events when provided', () => {
    render(<EventsList events={mockEvents} />);
    expect(screen.getByText(mockEvents[0].name)).toBeInTheDocument();
  });

  it('calls onSelect when an event is clicked', async () => {
    const handleSelect = jest.fn();
    render(<EventsList events={mockEvents} onSelect={handleSelect} />);
    await userEvent.click(screen.getByText(mockEvents[0].name));
    expect(handleSelect).toHaveBeenCalledWith(mockEvents[0].id);
  });
});
```

See `docs/testing.md` for more detailed testing guidelines.

### Mocking API Requests

Use Mock Service Worker (MSW) to mock API requests in tests:

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('*/events', (req, res, ctx) => {
    return res(ctx.json(mockEvents));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

This allows testing components that make API requests without hitting real endpoints.

## Building and Deployment

Guidelines for building and deploying the application.

### Building for Production

```bash
# Build for production
npm run build
# or
yarn build
```

This will create a production-ready build in the `dist` directory. The build process:

1. Compiles TypeScript to JavaScript
2. Bundles modules with Vite
3. Minifies and optimizes code
4. Generates assets with content hashes
5. Creates a static site ready for deployment

### Environment-Specific Builds

The build process uses environment-specific configuration files:

- `.env`: Base environment variables
- `.env.development`: Development-specific variables
- `.env.production`: Production-specific variables

You can create additional environment files (e.g., `.env.staging`) and specify the environment during build:

```bash
# Build for staging
npm run build -- --mode staging
```

### Deployment Options

The application is designed to be deployed as a static website. Deployment options include:

- **GitHub Pages**: Automated deployment via GitHub Actions
- **Netlify**: Simple deployment with continuous integration
- **AWS S3 + CloudFront**: Enterprise-grade hosting with CDN
- **Azure Static Web Apps**: Microsoft Azure hosting option

See `docs/deployment.md` for detailed deployment instructions.

### Continuous Integration

The repository includes GitHub Actions workflows for continuous integration:

- Lint and test on pull requests
- Build and deploy to GitHub Pages on merge to main

These workflows ensure code quality and automate the deployment process.

## Performance Optimization

Guidelines for optimizing application performance.

### Code Splitting

The application uses code splitting to reduce the initial bundle size:

```typescript
// Lazy loading components
const EventsPage = React.lazy(() => import('./pages/EventsPage'));
const PassesPage = React.lazy(() => import('./pages/PassesPage'));

// In router
<Route path="/events" element={
  <Suspense fallback={<LoadingSpinner />}>
    <EventsPage />
  </Suspense>
} />
```

This loads components only when needed, improving initial load time.

### Memoization

Use memoization to prevent unnecessary re-renders and recalculations:

```typescript
// Memoize expensive calculations
const sortedEvents = useMemo(() => {
  return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
}, [events]);

// Memoize callback functions
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);

// Memoize components
const MemoizedComponent = React.memo(MyComponent);
```

### API Caching

The application uses React Query for efficient API caching:

```typescript
const { data, isLoading } = useQuery(['events'], fetchEvents, {
  staleTime: 60000, // 1 minute
  cacheTime: 3600000, // 1 hour
});
```

This reduces unnecessary API calls and improves perceived performance.

### Performance Monitoring

Use the React DevTools Profiler to identify and fix performance issues:

1. Open React DevTools in your browser
2. Go to the Profiler tab
3. Record a session while using the application
4. Analyze component render times and frequency
5. Optimize components that render too often or take too long to render

## Accessibility

Guidelines for ensuring the application is accessible.

### Accessibility Standards

The application aims to meet WCAG 2.1 AA standards. Key considerations include:

- Keyboard navigation for all interactive elements
- Proper use of semantic HTML elements
- ARIA attributes for complex components
- Sufficient color contrast (minimum 4.5:1 ratio)
- Text resizing without loss of functionality
- Focus indicators for all interactive elements

### Accessibility Testing

Use the following tools for accessibility testing:

- **axe DevTools**: Browser extension for automated accessibility testing
- **jest-axe**: Add accessibility tests to your Jest test suite
- **Keyboard testing**: Ensure all functionality is accessible via keyboard
- **Screen reader testing**: Test with VoiceOver (Mac) or NVDA (Windows)

```typescript
// Example accessibility test with jest-axe
import { axe } from 'jest-axe';

it('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Accessibility Best Practices

- Use semantic HTML elements (`<button>`, `<a>`, `<input>`, etc.)
- Provide labels for all form controls
- Ensure sufficient color contrast
- Add alt text to all images
- Use ARIA attributes only when necessary
- Ensure keyboard focus order matches visual order
- Provide visible focus indicators
- Test with screen readers and keyboard navigation

## Troubleshooting

Common issues and solutions for development.

### Development Server Issues

**Issue**: Development server fails to start

**Solutions**:
- Check if the port is already in use
- Verify Node.js version (should be v16+)
- Delete `node_modules` and reinstall dependencies
- Check for errors in configuration files

**Issue**: Hot reloading not working

**Solutions**:
- Check if you're modifying files outside the src directory
- Verify that the file being modified is properly imported
- Restart the development server

### API Connection Issues

**Issue**: Cannot connect to ParkHub API

**Solutions**:
- Verify API key is correctly set
- Check network connectivity
- Ensure API base URL is correct in environment variables
- Look for CORS issues in browser console
- Enable mock API for local development

**Issue**: API requests failing with authentication errors

**Solutions**:
- Verify API key format and validity
- Check if API key has necessary permissions
- Ensure API key is being included in request headers

### Build Issues

**Issue**: TypeScript compilation errors

**Solutions**:
- Run `npm run typecheck` to see all type errors
- Fix type issues one by one
- Check for missing type definitions

**Issue**: Build failing in CI but works locally

**Solutions**:
- Check for environment-specific code
- Verify CI environment variables
- Look for case sensitivity issues (local Windows vs CI Linux)
- Check for dependencies that work differently in CI

### Testing Issues

**Issue**: Tests failing with timeout errors

**Solutions**:
- Increase Jest timeout setting
- Check for unresolved promises or missing await
- Verify that async operations complete properly

**Issue**: Component tests failing with 'element not found'

**Solutions**:
- Use `screen.debug()` to see the rendered output
- Check if elements are conditionally rendered
- Verify that you're using the correct query method
- Ensure components have proper test IDs or accessible names

## Resources

Additional resources for development.

### Documentation

- [Architecture Overview](architecture.md)
- [API Integration Guide](api-integration.md)
- [Testing Guide](testing.md)
- [Deployment Guide](deployment.md)

### External Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### Tools and Extensions

**VS Code Extensions**:
- ESLint
- Prettier
- TypeScript Error Translator
- Jest Runner
- React Developer Tools

**Browser Extensions**:
- React Developer Tools
- Redux DevTools (if using Redux)
- Axe DevTools (accessibility testing)