# ParkHub Passes Creation Web Application

## Business Problem
Current parking ticket validation is non-functional; scanners are configured to accept any barcode without actual validation. This application bridges the gap between Jump's ticketing system and ParkHub's validation system, enabling legitimate parking validation.

This web-based tool allows Jump administrators to create and manage parking passes in the ParkHub system. As a frontend-only solution, it directly interfaces with ParkHub APIs to create valid passes that can be properly scanned and validated at stadium entrances.

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
- React Router for navigation
- Jest and React Testing Library for testing

## Project Structure
```
/
├── .github/            # GitHub Actions workflows
├── docs/               # Project documentation
│   ├── api-integration.md  # API integration details
│   ├── deployment.md       # Deployment guide
│   └── ...                 # Other documentation
├── infrastructure/     # Infrastructure configuration
│   ├── config/            # Configuration files
│   └── scripts/           # Infrastructure scripts
└── src/                # Source code
    └── web/               # Frontend application
        ├── public/           # Static public assets
        ├── src/              # Application source code
        │   ├── assets/          # Static assets
        │   ├── components/      # React components
        │   ├── constants/       # Application constants
        │   ├── context/         # React context providers
        │   ├── hooks/           # Custom React hooks
        │   ├── pages/           # Page components
        │   ├── router/          # Routing configuration
        │   ├── services/        # API services
        │   ├── types/           # TypeScript type definitions
        │   ├── utils/           # Utility functions
        │   ├── App.tsx          # Main application component
        │   └── index.tsx        # Application entry point
        ├── __tests__/        # Test files
        ├── package.json      # Dependencies and scripts
        └── ...               # Configuration files
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher) or Yarn (v1.22 or higher)
- ParkHub API key

### Installation
```bash
# Clone the repository
git clone https://github.com/jump/parkhub-passes-creation.git
cd parkhub-passes-creation

# Install dependencies
cd src/web
npm install
# or
yarn install
```

### Running the Application
```bash
# Start development server
npm run start
# or
yarn start
```

The application will be available at http://localhost:5173

## Available Scripts
- `npm run start` - Start the development server
- `npm run build` - Build the application for production
- `npm run serve` - Preview the production build locally
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint the codebase
- `npm run lint:fix` - Lint and fix issues automatically
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types
- `npm run deploy` - Deploy to GitHub Pages

## API Integration

The application integrates with the ParkHub API for all data operations. API authentication is handled using an API key that must be provided by the user.

### API Key Management
The API key is stored securely in the browser's localStorage and is used to authenticate all requests to the ParkHub API.

### Available Endpoints

#### Events API
- `GET /events/{landMarkId}?dateFrom={dateFrom}` - Retrieve all game events

#### Passes API
- `GET /passes?landMarkId={landMarkId}&eventId={eventId}` - Retrieve passes for a specific event
- `POST /passes` - Create a new parking pass

For detailed API documentation, see [API Integration Guide](docs/api-integration.md).

## Deployment

The application is designed to be deployed as a static website. The recommended deployment platform is GitHub Pages.

### Automated Deployment
The repository includes GitHub Actions workflows for automated deployment to GitHub Pages:

1. For development deployment:
   - Push changes to the `main` branch
   - The workflow automatically builds and deploys to the development environment

2. For staging or production deployment:
   - Go to the Actions tab in the GitHub repository
   - Select the "Deploy" workflow
   - Click "Run workflow"
   - Select the target environment (staging or production)
   - Click "Run workflow" to start the deployment

For detailed deployment instructions, see [Deployment Guide](docs/deployment.md).

## Environment Strategy

The application uses a three-environment promotion strategy:

| Environment | Purpose | URL | Access Control |
| --- | --- | --- | --- |
| Development | Active development and testing | https://jump.github.io/parkhub-passes-creation/dev | Development team |
| Staging | Pre-production validation | https://jump.github.io/parkhub-passes-creation/staging | Internal stakeholders |
| Production | Live application | https://parkhub-passes.jump.com | Jump administrators |

Each environment uses environment-specific configuration variables to connect to the appropriate ParkHub API endpoints.

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

## Documentation

Additional documentation is available in the `docs` directory:

- [API Integration Guide](docs/api-integration.md) - Detailed information about the ParkHub API integration
- [Deployment Guide](docs/deployment.md) - Instructions for deploying the application
- [User Guide](docs/user-guide.md) - Guide for end users of the application

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For questions or support, please contact the Jump Development Team.