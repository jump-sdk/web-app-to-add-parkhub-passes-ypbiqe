# ParkHub Passes Creation Web Application Infrastructure

## Overview

This directory contains infrastructure configuration and setup scripts for the ParkHub Passes Creation Web Application. The application is a frontend-only solution that directly interfaces with ParkHub APIs, requiring minimal infrastructure for deployment.

## Infrastructure Architecture

The application follows a simple infrastructure architecture appropriate for a frontend-only solution:

- **Static Web Hosting**: GitHub Pages for serving the application
- **CI/CD Pipeline**: GitHub Actions for automated deployment
- **Environment Management**: Three-environment strategy (development, staging, production)
- **Custom Domain** (optional): Configuration for production environment

This architecture eliminates the need for backend servers, databases, or complex infrastructure management.

## Directory Structure

```
infrastructure/
├── config/                  # Configuration files
│   ├── github-pages-config.json    # GitHub Pages configuration
│   ├── cloudfront-config.json      # CloudFront configuration (alternative deployment)
│   └── netlify.toml               # Netlify configuration (alternative deployment)
├── scripts/                 # Setup and deployment scripts
│   ├── setup-github-pages.sh      # GitHub Pages setup script
│   └── configure-custom-domain.sh # Custom domain configuration script
└── README.md               # This file
```

## Configuration Files

The infrastructure configuration is defined in the following files:

### github-pages-config.json

Configuration file for GitHub Pages deployment, including:

- Repository settings
- Branch configuration
- Custom domain options
- Environment-specific settings
- Build configuration
- Deployment options

This file is used by the setup scripts and GitHub Actions workflow to configure the deployment environment.

### cloudfront-config.json

Configuration file for AWS CloudFront deployment (alternative to GitHub Pages), including:

- Distribution settings
- Origin configuration
- Cache behavior
- SSL certificate settings
- Custom domain configuration

This file is provided as an alternative deployment option but is not used in the default setup.

### netlify.toml

Configuration file for Netlify deployment (alternative to GitHub Pages), including:

- Build settings
- Deploy contexts
- Redirect rules
- Headers configuration
- Environment variables

This file is provided as an alternative deployment option but is not used in the default setup.

## Setup Scripts

The following scripts automate the infrastructure setup process:

### setup-github-pages.sh

Script to set up GitHub Pages for the repository, including:

- Repository configuration
- Branch setup
- GitHub Pages settings
- Environment configuration
- Initial deployment structure

**Usage:**
```bash
./infrastructure/scripts/setup-github-pages.sh [--config <config_file>]
```

**Options:**
- `--config <config_file>`: Path to custom configuration file (default: ../config/github-pages-config.json)
- `--help`: Display help message

### configure-custom-domain.sh

Script to configure a custom domain for GitHub Pages, including:

- DNS verification
- CNAME file creation
- GitHub Pages settings configuration
- HTTPS enforcement

**Usage:**
```bash
./infrastructure/scripts/configure-custom-domain.sh [options] <domain-name>
```

**Options:**
- `--repo <repository>`: GitHub repository name (default: current git repository)
- `--user <username>`: GitHub username or organization (default: extracted from git config)
- `--config <config_file>`: Path to custom configuration file (default: ../config/github-pages-config.json)
- `--help`: Display help message

## Deployment Workflow

The application is deployed using a GitHub Actions workflow defined in `.github/workflows/deploy.yml`. This workflow automates the process of building, validating, and deploying the application to different environments.

**Workflow Features:**

- Automated deployment to development environment on push to main branch
- Manual deployment to staging and production environments
- Environment-specific configuration
- Build validation before deployment
- Post-deployment verification
- Support for custom domain in production

**Deployment Environments:**

| Environment | URL | Trigger | Approval |
| --- | --- | --- | --- |
| Development | https://jump.github.io/parkhub-passes-creation/dev | Automatic on push to main | None |
| Staging | https://jump.github.io/parkhub-passes-creation/staging | Manual workflow dispatch | None |
| Production | https://parkhub-passes.jump.com | Manual workflow dispatch | Required |

## Setup Instructions

Follow these steps to set up the infrastructure for the ParkHub Passes Creation Web Application:

### Prerequisites

- GitHub repository with admin access
- Git installed locally
- GitHub CLI (gh) installed (optional, for easier setup)
- Node.js and npm installed (for local development and testing)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/jump/parkhub-passes-creation.git
   cd parkhub-passes-creation
   ```

2. Review and customize the configuration in `infrastructure/config/github-pages-config.json`

3. Run the GitHub Pages setup script:
   ```bash
   ./infrastructure/scripts/setup-github-pages.sh
   ```

4. (Optional) Configure a custom domain for production:
   ```bash
   ./infrastructure/scripts/configure-custom-domain.sh parkhub-passes.jump.com
   ```

5. Verify the setup by checking the GitHub repository settings:
   - Go to Settings > Pages
   - Confirm that GitHub Pages is enabled and using the gh-pages branch
   - Verify that HTTPS is enforced
   - Check that the custom domain is configured (if applicable)

### Environment Setup

The setup script automatically creates the necessary environments in GitHub. To manually configure environments:

1. Go to the repository settings
2. Navigate to Environments
3. Create environments for `development`, `staging`, and `production`
4. Configure protection rules for the `production` environment:
   - Required reviewers
   - Wait timer
   - Environment-specific secrets

Each environment uses environment-specific variables defined in the GitHub Pages configuration file.

## Deployment Instructions

To deploy the application to different environments:

### Development Deployment

Development deployment is automatically triggered when changes are pushed to the main branch. To manually trigger a development deployment:

1. Go to the Actions tab in the GitHub repository
2. Select the "Deploy" workflow
3. Click "Run workflow"
4. Select "development" as the environment
5. Click "Run workflow"

The application will be deployed to https://jump.github.io/parkhub-passes-creation/dev/

### Staging Deployment

To deploy to the staging environment:

1. Go to the Actions tab in the GitHub repository
2. Select the "Deploy" workflow
3. Click "Run workflow"
4. Select "staging" as the environment
5. Click "Run workflow"

The application will be deployed to https://jump.github.io/parkhub-passes-creation/staging/

### Production Deployment

To deploy to the production environment:

1. Go to the Actions tab in the GitHub repository
2. Select the "Deploy" workflow
3. Click "Run workflow"
4. Select "production" as the environment
5. Click "Run workflow"
6. Approve the deployment when prompted (if protection rules are configured)

The application will be deployed to https://parkhub-passes.jump.com/ (or the GitHub Pages URL if no custom domain is configured)

## Alternative Deployment Options

While GitHub Pages is the recommended hosting platform, the application can be deployed to alternative platforms:

### AWS S3 + CloudFront

To deploy to AWS S3 with CloudFront:

1. Create an S3 bucket for hosting the application
2. Configure the bucket for static website hosting
3. Create a CloudFront distribution using the configuration in `infrastructure/config/cloudfront-config.json`
4. Set up a CI/CD pipeline to build and deploy the application to S3

Refer to AWS documentation for detailed instructions on setting up S3 and CloudFront for static website hosting.

### Netlify

To deploy to Netlify:

1. Connect your GitHub repository to Netlify
2. Use the configuration in `infrastructure/config/netlify.toml`
3. Configure environment variables in Netlify settings

Netlify automatically handles the build and deployment process based on the configuration file.

## Maintenance

Regular maintenance tasks for the infrastructure include:

### Monitoring

- Set up uptime monitoring for the deployed application
- Monitor GitHub Actions workflow runs for deployment issues
- Check GitHub Pages settings periodically to ensure correct configuration
- Verify custom domain and SSL certificate status (if applicable)

### Updates

- Keep GitHub Actions workflows updated to use the latest action versions
- Update configuration files when repository settings change
- Review and update infrastructure documentation as needed

### Security

- Enforce HTTPS for all environments
- Review and update environment protection rules
- Rotate API keys periodically (used by application users, not for deployment)
- Keep dependencies updated to address security vulnerabilities

## Troubleshooting

Common infrastructure issues and their solutions:

### GitHub Pages Issues

- **404 Page Not Found**: Verify that GitHub Pages is enabled and using the correct branch
- **Custom Domain Not Working**: Check DNS configuration and CNAME file
- **HTTPS Not Working**: Ensure HTTPS enforcement is enabled in GitHub Pages settings
- **Deployment Not Showing Changes**: Check that the workflow completed successfully and deployed to the correct environment

### Workflow Issues

- **Workflow Failing**: Check the workflow logs for error messages
- **Build Errors**: Verify that the application builds successfully locally
- **Deployment Errors**: Check permissions and environment configuration
- **Environment Variables**: Ensure environment variables are correctly configured in the workflow

## Additional Resources

For more detailed information, refer to the following resources:

### Internal Documentation

- [Deployment Guide](../docs/deployment.md): Comprehensive deployment documentation
- [API Integration](../docs/api-integration.md): API integration details
- [Architecture Overview](../docs/architecture.md): Application architecture documentation

### External Documentation

- [GitHub Pages Documentation](https://docs.github.com/en/pages): Official GitHub Pages documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions): Official GitHub Actions documentation
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html): Vite static deployment guide