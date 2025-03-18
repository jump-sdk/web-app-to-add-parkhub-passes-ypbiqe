# ParkHub Passes Creation Web Application Deployment Guide

This document provides comprehensive instructions for deploying the ParkHub Passes Creation Web Application to GitHub Pages. The application is a frontend-only solution that directly interfaces with ParkHub APIs, requiring no backend deployment.

## 1. Deployment Overview

The ParkHub Passes Creation Web Application follows a simple deployment model appropriate for a frontend-only application. This guide covers the deployment process using GitHub Pages as the recommended hosting platform.

### 1.1 Deployment Architecture

The application is built as a static web application using React and Vite, which generates optimized HTML, CSS, and JavaScript files that can be served by any static file hosting service. GitHub Pages was selected as the primary hosting platform due to its simplicity, zero cost, and tight integration with the GitHub repository.

The deployment architecture consists of the following components:

- **Source Repository**: GitHub repository containing the application source code
- **CI/CD Pipeline**: GitHub Actions workflow for automated building and deployment
- **Static Hosting**: GitHub Pages for hosting the built application
- **Environment Management**: Separate deployment targets for development, staging, and production

This frontend-only architecture eliminates the need for server-side components, databases, or complex infrastructure management.

### 1.2 Environment Strategy

The application uses a three-environment promotion strategy:

| Environment | Purpose | URL | Access Control |
| --- | --- | --- | --- |
| Development | Active development and testing | https://jump.github.io/parkhub-passes-creation/dev | Development team |
| Staging | Pre-production validation | https://jump.github.io/parkhub-passes-creation/staging | Internal stakeholders |
| Production | Live application | https://parkhub-passes.jump.com | Jump administrators |

Each environment uses environment-specific configuration variables to connect to the appropriate ParkHub API endpoints.

### 1.3 Deployment Process

The deployment process is automated using GitHub Actions workflows that handle building, testing, and deploying the application to the appropriate environment. The process follows these general steps:

1. Code changes are pushed to the repository
2. GitHub Actions workflow is triggered
3. Dependencies are installed and the application is built
4. Tests are run to validate the build
5. The application is deployed to the target environment
6. Post-deployment verification ensures the application is accessible

## 2. Prerequisites

Before deploying the application, ensure you have the following prerequisites in place:

### 2.1 Required Tools

- **Git**: Version control system
- **Node.js**: Version 16.x or higher
- **npm**: Version 7.x or higher
- **GitHub Account**: With appropriate permissions to the repository
- **GitHub CLI** (optional): For easier setup of GitHub Pages

### 2.2 Repository Access

You need appropriate access to the GitHub repository:

- **Read access**: To clone the repository
- **Write access**: To push changes and create branches
- **Admin access**: To configure GitHub Pages and environments (for initial setup only)

### 2.3 API Access

Ensure you have valid ParkHub API keys for each environment:

- Development API key
- Staging API key
- Production API key

These keys will be used by administrators when using the application, not during the deployment process itself.

## 3. Initial Setup

This section covers the one-time setup process for configuring GitHub Pages and deployment workflows.

### 3.1 GitHub Pages Configuration

To set up GitHub Pages for the repository:

1. Navigate to the repository settings
2. Go to the "Pages" section
3. Set the source to the `gh-pages` branch
4. (Optional) Configure a custom domain
5. Enable HTTPS enforcement

Alternatively, you can use the provided setup script:

```bash
./infrastructure/scripts/setup-github-pages.sh
```

This script automates the GitHub Pages setup process using the configuration defined in `infrastructure/config/github-pages-config.json`.

### 3.2 Environment Configuration

Configure GitHub environments for deployment protection and variables:

1. Navigate to the repository settings
2. Go to the "Environments" section
3. Create environments for `development`, `staging`, and `production`
4. Configure protection rules for the `production` environment
5. Set environment-specific secrets and variables

The environment variables are defined in the GitHub Pages configuration file and will be used during the build process to generate environment-specific builds.

### 3.3 Custom Domain Setup

For production deployment with a custom domain:

1. Add your custom domain in the GitHub Pages settings
2. Create a CNAME file in the repository with your domain name
3. Configure DNS settings with your domain provider:
   - For an apex domain: Create A records pointing to GitHub Pages IP addresses
   - For a subdomain: Create a CNAME record pointing to `<username>.github.io`
4. Wait for DNS propagation (may take up to 24 hours)
5. Verify the custom domain in GitHub Pages settings

The deployment workflow will automatically create the CNAME file during production deployment.

### 3.4 Workflow Setup

The GitHub Actions workflow for deployment is defined in `.github/workflows/deploy.yml`. This workflow is already configured in the repository and doesn't require manual setup. It includes jobs for:

- Building the application
- Validating the build
- Deploying to development, staging, or production environments
- Verifying the deployment
- Generating a deployment summary

The workflow is triggered automatically on pushes to the main branch or manually through the GitHub Actions interface.

## 4. Build Configuration

This section covers the build configuration for the application.

### 4.1 Build Process

The application is built using Vite, which generates optimized static files for deployment. The build process is defined in the `package.json` file and includes:

- TypeScript compilation
- Bundling and optimization
- Environment variable injection
- Asset processing

The build command is:

```bash
npm run build
```

This generates the production-ready files in the `dist` directory.

### 4.2 Environment Variables

Environment-specific variables are defined in `.env` files:

- `.env`: Base environment variables shared across all environments
- `.env.development`: Development-specific variables
- `.env.production`: Production-specific variables

During the build process, the appropriate environment variables are injected based on the target environment. The GitHub Actions workflow generates the correct `.env.production` file with environment-specific values from the GitHub Pages configuration.

### 4.3 Build Optimization

The build is optimized for production with:

- Code splitting for improved loading performance
- Asset minification and compression
- Tree shaking to eliminate unused code
- Efficient chunk management

These optimizations are configured in the `vite.config.ts` file and are automatically applied during the build process.

## 5. Deployment Methods

This section covers the different methods for deploying the application.

### 5.1 Automated Deployment (Recommended)

The recommended deployment method is using the GitHub Actions workflow:

1. For development deployment:
   - Push changes to the `main` branch
   - The workflow automatically builds and deploys to the development environment

2. For staging or production deployment:
   - Go to the Actions tab in the GitHub repository
   - Select the "Deploy" workflow
   - Click "Run workflow"
   - Select the target environment (staging or production)
   - Click "Run workflow" to start the deployment

The workflow handles the entire deployment process, including building, testing, and deploying to the appropriate environment.

### 5.2 Manual Deployment

For manual deployment (not recommended for production):

1. Clone the repository
2. Install dependencies: `npm install`
3. Create appropriate `.env.production` file with environment variables
4. Build the application: `npm run build`
5. Deploy to GitHub Pages: `npm run deploy`

This method uses the `gh-pages` npm package to deploy the built files to the `gh-pages` branch. Note that this method doesn't include the environment-specific folder structure used by the automated workflow.

### 5.3 Deployment to Alternative Platforms

While GitHub Pages is the recommended hosting platform, the application can be deployed to any static hosting service:

1. **Netlify**:
   - Connect your GitHub repository to Netlify
   - Configure build settings: `npm run build`
   - Set the publish directory to `dist`
   - Configure environment variables in Netlify settings

2. **AWS S3 + CloudFront**:
   - Build the application locally
   - Upload the `dist` directory to an S3 bucket
   - Configure the bucket for static website hosting
   - Set up CloudFront distribution pointing to the S3 bucket
   - Configure custom domain and SSL certificate

3. **Azure Static Web Apps**:
   - Connect your GitHub repository to Azure Static Web Apps
   - Configure build settings: `npm run build`
   - Set the output location to `dist`
   - Configure environment variables in Azure settings

## 6. Environment Promotion

This section covers the process for promoting changes between environments.

### 6.1 Promotion Workflow

The application follows a structured promotion workflow:

1. **Development**: Changes are automatically deployed to the development environment when pushed to the main branch
2. **Staging**: Changes are manually promoted to staging after testing in development
3. **Production**: Changes are manually promoted to production after validation in staging

This controlled promotion process ensures that changes are thoroughly tested before reaching production.

### 6.2 Promotion Process

To promote changes between environments:

1. Verify the application in the current environment
2. Go to the Actions tab in the GitHub repository
3. Select the "Deploy" workflow
4. Click "Run workflow"
5. Select the target environment for promotion
6. Click "Run workflow" to start the deployment

For production deployments, additional approval may be required depending on the protection rules configured for the production environment.

### 6.3 Rollback Procedure

If issues are detected after deployment, you can roll back to a previous version:

1. Go to the Actions tab in the GitHub repository
2. Find the last successful deployment workflow run for the target environment
3. Click "Re-run jobs" to redeploy the previous version

Alternatively, you can manually deploy a specific version by checking out the corresponding commit and running the deployment workflow.

## 7. Post-Deployment Verification

After deploying the application, it's important to verify that it's functioning correctly.

### 7.1 Automated Verification

The deployment workflow includes automated verification steps:

1. Basic health check to ensure the application is accessible
2. Verification of critical resources (index.html, main JavaScript bundle)
3. HTTP status code check to confirm successful deployment

These automated checks provide basic assurance that the deployment was successful.

### 7.2 Manual Verification

After deployment, perform these manual verification steps:

1. Access the application URL for the target environment
2. Verify that the application loads correctly
3. Check that the correct environment is displayed (look for environment indicators)
4. Test critical functionality:
   - View events list
   - View passes for an event
   - Create new passes
5. Verify that API integration is working correctly
6. Check for any console errors or warnings

### 7.3 Performance Verification

Verify the performance of the deployed application:

1. Run Lighthouse tests to check performance metrics
2. Verify that page load time meets requirements (< 2 seconds)
3. Check that API operations complete within acceptable timeframes
4. Test on different devices and browsers to ensure responsive design works correctly

### 7.4 Post-Deployment Testing

Conduct the following post-deployment tests:

1. **Smoke Tests**: Verify basic functionality works in the deployed environment
   - Navigation between pages
   - API connectivity
   - Form submissions

2. **Integration Tests**: Verify the application integrates correctly with the ParkHub API
   - Event data retrieval
   - Pass data retrieval
   - Pass creation

3. **Cross-browser Testing**: Check functionality in supported browsers
   - Chrome
   - Firefox
   - Safari
   - Edge

4. **Responsive Design Testing**: Verify UI works on different screen sizes
   - Desktop
   - Tablet
   - Mobile

## 8. Troubleshooting

This section provides guidance for troubleshooting common deployment issues.

### 8.1 Common Issues

| Issue | Possible Causes | Resolution |
| --- | --- | --- |
| 404 Page Not Found | Incorrect branch configuration, Missing index.html | Verify GitHub Pages source branch, Check build output |
| Blank Page | JavaScript errors, Missing resources | Check browser console, Verify build includes all required files |
| API Connection Errors | CORS issues, Invalid API key, Wrong API endpoint | Check API configuration, Verify environment variables |
| Build Failures | Dependency issues, TypeScript errors | Check build logs, Resolve code issues |
| Custom Domain Not Working | DNS configuration, CNAME issues | Verify DNS settings, Check CNAME file |

### 8.2 Deployment Logs

When troubleshooting deployment issues, check the following logs:

1. GitHub Actions workflow logs for build and deployment errors
2. Browser console logs for JavaScript errors
3. Network requests in browser developer tools for API issues

These logs provide valuable information for diagnosing and resolving deployment problems.

### 8.3 Support Resources

If you encounter issues that you can't resolve, refer to these resources:

- GitHub Pages documentation: https://docs.github.com/en/pages
- GitHub Actions documentation: https://docs.github.com/en/actions
- Vite documentation: https://vitejs.dev/guide/
- Project-specific documentation in the `docs` directory
- Open an issue in the GitHub repository for project-specific problems

## 9. Maintenance

This section covers ongoing maintenance tasks for the deployed application.

### 9.1 Dependency Updates

Regularly update dependencies to ensure security and performance:

1. Check for updates: `npm outdated`
2. Update dependencies: `npm update` or `npm install <package>@latest`
3. Run tests to verify compatibility: `npm test`
4. Build and test the application locally before committing updates

Consider using automated dependency update tools like Dependabot or Renovate.

### 9.2 Monitoring

Monitor the deployed application for issues:

1. Set up uptime monitoring to detect availability issues
2. Implement error tracking to capture JavaScript errors
3. Monitor performance metrics to identify degradation
4. Check API integration regularly to ensure continued functionality

These monitoring practices help identify and resolve issues before they impact users.

### 9.3 Security Updates

Maintain security of the deployed application:

1. Regularly scan for security vulnerabilities: `npm audit`
2. Apply security patches promptly
3. Review and update Content Security Policy as needed
4. Rotate API keys periodically
5. Keep GitHub Actions workflows updated to use the latest versions

## 10. Deployment Checklist

Use this checklist for each deployment to ensure all necessary steps are completed.

### 10.1 Pre-Deployment Checklist

- [ ] All tests are passing
- [ ] Code has been reviewed and approved
- [ ] Environment variables are correctly configured
- [ ] Dependencies are up to date
- [ ] Security vulnerabilities have been addressed
- [ ] Performance has been optimized
- [ ] Documentation has been updated

### 10.2 Deployment Checklist

- [ ] Select the correct target environment
- [ ] Initiate the deployment workflow
- [ ] Monitor the deployment process
- [ ] Verify automated checks pass
- [ ] Check deployment logs for warnings or errors

### 10.3 Post-Deployment Checklist

- [ ] Verify the application is accessible
- [ ] Test critical functionality
- [ ] Check API integration
- [ ] Verify performance metrics
- [ ] Monitor for errors after deployment
- [ ] Communicate deployment completion to stakeholders

## 11. References

Additional resources and references for deployment.

### 11.1 Internal Documentation

- [API Integration](api-integration.md): API integration details
- [Project Structure](../src/web/README.md): Project structure and development setup

### 11.2 External Documentation

- [GitHub Pages Documentation](https://docs.github.com/en/pages): Official GitHub Pages documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions): Official GitHub Actions documentation
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html): Vite static deployment guide
- [React Deployment](https://create-react-app.dev/docs/deployment/): React deployment best practices

### 11.3 Configuration Files

- `.github/workflows/deploy.yml`: GitHub Actions deployment workflow
- `infrastructure/config/github-pages-config.json`: GitHub Pages configuration
- `src/web/vite.config.ts`: Vite build configuration
- `src/web/package.json`: npm scripts and dependencies
- `src/web/.env.production`: Production environment variables

### 11.4 Post-Deployment Usage

After deploying the application, users will need to:

1. Access the appropriate environment URL
2. Enter their ParkHub API key when prompted
3. Use the application to view events, manage passes, and create new passes

The application will securely store the API key for future sessions. For security reasons, API keys should be rotated periodically according to your organization's security policies.