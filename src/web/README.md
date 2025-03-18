# ParkHub Passes Creation Web Application

## Project Overview
A web-based tool for Jump administrators to create and manage parking passes in the ParkHub system. This frontend-only application directly interfaces with ParkHub APIs to enable legitimate parking validation by creating valid passes that can be properly scanned and validated at stadium entrances.

## Features
- View all game events from the ParkHub system
- View all parking passes for a specific event
- Create multiple new parking passes for an event

## Technology Stack
- React.js (v18)
- TypeScript
- Material UI (v5)
- React Query for data fetching
- Axios for API requests
- React Hook Form for form handling
- Jest and React Testing Library for testing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher) or Yarn (v1.22 or higher)
- ParkHub API key

### Installation
```bash
# Clone the repository
git clone https://github.com/jump/parkhub-passes-creation.git
cd parkhub-passes-creation/src/web

# Install dependencies
npm install
# or
yarn install
```

### Running the Application
```bash
# Start development server
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:5173

## Available Scripts
- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint the codebase
- `npm run lint:fix` - Lint and fix issues automatically
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types

## Project Structure
```
src/
├── assets/         # Static assets (images, fonts, styles)
├── components/     # Reusable UI components
│   ├── ui/         # Basic UI components
│   ├── events/     # Event-related components
│   ├── passes/     # Pass-related components
│   ├── forms/      # Form components
│   ├── feedback/   # Feedback components (errors, notifications)
│   └── layout/     # Layout components
├── constants/      # Application constants
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── router/         # Routing configuration
├── services/       # API services
│   ├── api/        # API client and endpoints
│   └── storage/    # Storage services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── App.tsx         # Main application component
└── index.tsx       # Application entry point
```

## API Integration

The application integrates with the ParkHub API for all data operations. API authentication is handled using an API key that must be provided by the user.

### API Key Management

The API key is stored securely in the browser's localStorage and is used to authenticate all requests to the ParkHub API.

```typescript
// Example of setting up the API key
import { useApiKey } from './hooks/useApiKey';

const { setApiKey } = useApiKey();
setApiKey('your-api-key-here');
```

### Available Endpoints

#### Events API
- `GET /events` - Retrieve all game events

#### Passes API
- `GET /passes?eventId={id}` - Retrieve passes for a specific event
- `POST /passes` - Create a new parking pass

## Development Guidelines

### Code Style

The project uses ESLint and Prettier for code formatting and linting. Configuration is provided in `.eslintrc.ts` and `.prettierrc`.

### Commit Guidelines

Please follow conventional commit messages for all commits:

```
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code refactoring without functionality changes
test: add or update tests
chore: update build tasks, package manager configs, etc.
```

### Pull Request Process

1. Ensure all tests pass and code is properly formatted
2. Update documentation if necessary
3. Create a pull request with a clear description of changes
4. Request review from a team member

## Testing

The application uses Jest and React Testing Library for testing. Tests are located in the `__tests__` directory.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Deployment

The application is designed to be deployed as a static website. The build process generates static files that can be hosted on any web server or CDN.

```bash
# Build for production
npm run build

# The build output will be in the dist/ directory
```

### Deployment to GitHub Pages

The repository includes GitHub Actions workflows for automated deployment to GitHub Pages.

## Troubleshooting

### API Connection Issues

If you're experiencing issues connecting to the ParkHub API:

1. Verify that your API key is correct and has the necessary permissions
2. Check that the API endpoints are accessible from your network
3. Look for CORS issues in the browser console

### Build Issues

If you encounter build issues:

1. Ensure you have the correct Node.js version installed
2. Clear the node_modules directory and reinstall dependencies
3. Check for TypeScript errors using `npm run typecheck`

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For questions or support, please contact the Jump Development Team.