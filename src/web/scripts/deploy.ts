/**
 * Custom deployment script for the ParkHub Passes Creation Web Application.
 * Automates the process of deploying the built application to GitHub Pages or other static hosting platforms.
 * This script handles environment-specific configurations, build validation, and deployment tracking.
 */

import path from 'path'; // v18.15.11
import fs from 'fs-extra'; // v11.1.0
import chalk from 'chalk'; // v5.2.0
import { execa } from 'execa'; // v7.1.1
import dotenv from 'dotenv'; // v16.0.3
import ghPages from 'gh-pages'; // v5.0.0
import { build } from './build';
import { formatDateTime } from '../src/utils/date-helpers';

// Type definitions
interface DeployOptions {
  environment: 'development' | 'staging' | 'production';
  skipBuild: boolean;
  skipVerification: boolean;
  commitMessage: string;
  branch: string;
  dist: string;
  verify: boolean;
  [key: string]: any; // Allow additional properties
}

// GitHub Pages related domain configuration
interface DomainConfig {
  useCname: boolean;
  domain: string;
}

/**
 * Loads environment variables from the appropriate .env file based on the deployment environment
 * 
 * @param environment - The deployment environment (development, staging, production)
 */
function loadEnvironmentVariables(environment: string): void {
  // Path to the root directory
  const rootDir = path.resolve(__dirname, '../../');
  
  // Load variables from .env file
  const baseEnvPath = path.join(rootDir, '.env');
  if (fs.existsSync(baseEnvPath)) {
    console.log(chalk.blue(`Loading environment variables from ${baseEnvPath}`));
    dotenv.config({ path: baseEnvPath });
  }
  
  // Load variables from environment-specific .env file (.env.production)
  const envSpecificPath = path.join(rootDir, `.env.${environment}`);
  if (fs.existsSync(envSpecificPath)) {
    console.log(chalk.blue(`Loading environment variables from ${envSpecificPath}`));
    dotenv.config({ path: envSpecificPath, override: true }); // Override variables with environment-specific ones
  }
  
  console.log(chalk.green(`Environment configuration loaded for ${chalk.bold(environment)}`));
}

/**
 * Parses command line arguments to determine deployment options
 * 
 * @returns Object containing parsed deployment options
 */
function parseArguments(): DeployOptions {
  const args = process.argv.slice(2);
  const options: DeployOptions = {
    environment: (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production',
    skipBuild: false,
    skipVerification: false,
    commitMessage: `Deploy: ${new Date().toISOString()}`,
    branch: 'gh-pages',
    dist: 'dist',
    verify: true,
  };
  
  // Parse arguments in the format --key=value or --flag
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      
      if (value === undefined) {
        // Flag argument (--flag)
        options[key] = true;
      } else {
        // Key-value argument (--key=value)
        if (value === 'true') options[key] = true;
        else if (value === 'false') options[key] = false;
        else if (!isNaN(Number(value))) options[key] = Number(value);
        else options[key] = value;
      }
    }
  }
  
  // Allow environment override via command line
  if (options.env) {
    options.environment = options.env as 'development' | 'staging' | 'production';
  }
  
  // Update commit message with environment if not set explicitly
  if (options.commitMessage === `Deploy: ${new Date().toISOString()}`) {
    options.commitMessage = `Deploy to ${options.environment}: ${new Date().toISOString()}`;
  }
  
  console.log(chalk.blue('Deployment options:'), options);
  return options;
}

/**
 * Validates that the build output exists and contains all required files
 * 
 * @param distDir - Path to the distribution directory
 * @returns Promise that resolves to true if build output is valid, false otherwise
 */
async function validateBuildOutput(distDir: string): Promise<boolean> {
  console.log(chalk.blue('Validating build output...'));
  
  const absoluteDistDir = path.resolve(process.cwd(), distDir);
  
  // Check if distribution directory exists
  if (!fs.existsSync(absoluteDistDir)) {
    console.error(chalk.red(`Distribution directory does not exist: ${absoluteDistDir}`));
    return false;
  }
  
  // Check for essential files
  const essentialFiles = [
    'index.html',
    'build-info.json'
  ];
  
  const missingFiles = essentialFiles.filter(file => 
    !fs.existsSync(path.join(absoluteDistDir, file))
  );
  
  if (missingFiles.length > 0) {
    console.error(chalk.red(`Missing essential files: ${missingFiles.join(', ')}`));
    return false;
  }
  
  // Check for asset directories/files
  const hasAssets = fs.existsSync(path.join(absoluteDistDir, 'assets')) || 
                    fs.readdirSync(absoluteDistDir).some(file => 
                      file.endsWith('.js') || file.endsWith('.css')
                    );
  
  if (!hasAssets) {
    console.error(chalk.red('No assets found in build directory'));
    return false;
  }
  
  console.log(chalk.green('Build output validation successful.'));
  return true;
}

/**
 * Creates a deployment record file with metadata about the deployment
 * 
 * @param options - Deployment options
 * @param distDir - Path to the distribution directory
 * @returns Promise that resolves when deployment record is created
 */
async function createDeploymentRecord(options: DeployOptions, distDir: string): Promise<void> {
  console.log(chalk.blue('Creating deployment record...'));
  
  const absoluteDistDir = path.resolve(process.cwd(), distDir);
  
  // Get package.json for version
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = await fs.readJSON(packageJsonPath);
  
  // Get git commit hash if available
  let commitHash = 'unknown';
  let lastCommitMessage = 'unknown';
  
  try {
    const hashResult = await execa('git', ['rev-parse', 'HEAD']);
    commitHash = hashResult.stdout.trim();
    
    const messageResult = await execa('git', ['log', '-1', '--pretty=%B']);
    lastCommitMessage = messageResult.stdout.trim();
  } catch (error) {
    console.log(chalk.yellow('Unable to get git information, using "unknown"'));
  }
  
  // Gather deployment information
  const deploymentInfo = {
    version: packageJson.version,
    deploymentTimestamp: new Date().toISOString(),
    environment: options.environment,
    commitHash,
    lastCommitMessage,
    branch: await getCurrentBranch(),
    deployedBy: process.env.USER || process.env.USERNAME || 'unknown',
    buildNumber: process.env.BUILD_NUMBER || 'local',
    nodeVersion: process.version,
  };
  
  // Create deployment-info.json file in the distribution directory
  const deploymentInfoPath = path.join(absoluteDistDir, 'deployment-info.json');
  await fs.writeJSON(deploymentInfoPath, deploymentInfo, { spaces: 2 });
  
  console.log(chalk.green(`Deployment record created at ${deploymentInfoPath}`));
}

/**
 * Helper function to get the current Git branch
 * 
 * @returns Promise resolving to current branch name
 */
async function getCurrentBranch(): Promise<string> {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    return stdout.trim();
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Configures the build output for the target environment
 * 
 * @param environment - Target deployment environment
 * @param distDir - Path to the distribution directory
 * @returns Promise that resolves when environment configuration is complete
 */
async function configureEnvironment(environment: string, distDir: string): Promise<void> {
  console.log(chalk.blue(`Configuring for ${environment} environment...`));
  
  const absoluteDistDir = path.resolve(process.cwd(), distDir);
  
  // Configure environment-specific settings
  const domainConfig: Record<string, DomainConfig> = {
    development: {
      useCname: false,
      domain: ''
    },
    staging: {
      useCname: false,
      domain: ''
    },
    production: {
      useCname: true,
      domain: process.env.PRODUCTION_DOMAIN || 'parkhub.example.com'
    }
  };
  
  const config = domainConfig[environment] || domainConfig.development;
  
  // Create CNAME file for custom domain if in production
  if (config.useCname && config.domain) {
    const cnamePath = path.join(absoluteDistDir, 'CNAME');
    await fs.writeFile(cnamePath, config.domain);
    console.log(chalk.green(`Created CNAME file with domain: ${config.domain}`));
  }
  
  // Create or modify robots.txt based on environment
  const robotsContent = environment === 'production'
    ? `User-agent: *\nAllow: /`
    : `User-agent: *\nDisallow: /`;
  
  await fs.writeFile(path.join(absoluteDistDir, 'robots.txt'), robotsContent);
  console.log(chalk.green(`Created robots.txt for ${environment} environment`));
  
  // Update environment indicator in index.html (optional)
  if (environment !== 'production') {
    try {
      const indexPath = path.join(absoluteDistDir, 'index.html');
      let indexContent = await fs.readFile(indexPath, 'utf8');
      
      // Add environment indicator as a data attribute and possibly a visual banner
      indexContent = indexContent.replace(
        '<html',
        `<html data-environment="${environment}"`
      );
      
      // Add a banner for non-production environments
      const banner = `
        <div style="position:fixed;top:0;left:0;right:0;background:${
          environment === 'staging' ? '#ff9800' : '#f44336'
        };color:white;text-align:center;font-size:14px;padding:5px;z-index:9999">
          ${environment.toUpperCase()} ENVIRONMENT
        </div>
      `;
      
      indexContent = indexContent.replace(
        '</body>',
        `${banner}</body>`
      );
      
      await fs.writeFile(indexPath, indexContent);
      console.log(chalk.green(`Updated index.html with ${environment} environment indicator`));
    } catch (error) {
      console.warn(chalk.yellow(`Couldn't update environment indicator: ${error.message}`));
    }
  }
  
  console.log(chalk.green(`Environment configuration for ${environment} completed`));
}

/**
 * Deploys the build output to GitHub Pages
 * 
 * @param options - Deployment options
 * @param distDir - Path to the distribution directory
 * @returns Promise that resolves when deployment is complete
 */
async function deployToGitHubPages(options: DeployOptions, distDir: string): Promise<void> {
  console.log(chalk.blue(`Deploying to GitHub Pages (branch: ${options.branch})...`));
  
  const absoluteDistDir = path.resolve(process.cwd(), distDir);
  
  return new Promise((resolve, reject) => {
    // Configure gh-pages options
    const ghPagesOptions = {
      branch: options.branch,
      message: options.commitMessage,
      repo: process.env.GITHUB_REPOSITORY_URL, // Allow custom repository URL
      user: {
        name: process.env.GIT_COMMITTER_NAME || 'Deployment Bot',
        email: process.env.GIT_COMMITTER_EMAIL || 'deploy@example.com'
      },
      dotfiles: true, // Include files starting with dot (like .nojekyll)
      silent: false, // Show output
    };
    
    // Create .nojekyll file to prevent GitHub Pages from ignoring files that begin with _ or .
    fs.writeFileSync(path.join(absoluteDistDir, '.nojekyll'), '');
    
    // Execute deployment using gh-pages library
    ghPages.publish(absoluteDistDir, ghPagesOptions, (err) => {
      if (err) {
        console.error(chalk.red('Deployment failed:', err));
        reject(err);
        return;
      }
      
      console.log(chalk.green(`Successfully deployed to ${options.branch} branch!`));
      resolve();
    });
  });
}

/**
 * Verifies that the deployment was successful
 * 
 * @param options - Deployment options
 * @returns Promise that resolves to true if deployment verification passes, false otherwise
 */
async function verifyDeployment(options: DeployOptions): Promise<boolean> {
  if (options.skipVerification) {
    console.log(chalk.yellow('Deployment verification skipped (disabled in options)'));
    return true;
  }
  
  console.log(chalk.blue('Verifying deployment...'));
  
  // Determine GitHub Pages URL based on repository and branch
  let deploymentUrl = '';
  
  try {
    // Get repository information
    const { stdout: remoteUrl } = await execa('git', ['config', '--get', 'remote.origin.url']);
    
    // Extract repo name from GitHub URL
    let repoName = '';
    if (remoteUrl.includes('github.com')) {
      repoName = remoteUrl
        .replace(/^.*github\.com[:/]/, '')
        .replace(/\.git$/, '');
    }
    
    if (options.environment === 'production' && process.env.PRODUCTION_DOMAIN) {
      // Use custom domain for production
      deploymentUrl = `https://${process.env.PRODUCTION_DOMAIN}`;
    } else if (repoName) {
      // Use GitHub Pages URL
      const { stdout: username } = await execa('git', ['config', '--get', 'user.name']);
      const owner = repoName.split('/')[0];
      const repo = repoName.split('/')[1];
      
      deploymentUrl = `https://${owner}.github.io/${repo}`;
    } else {
      console.warn(chalk.yellow('Could not determine deployment URL, skipping verification'));
      return true;
    }
    
    console.log(chalk.blue(`Deployment URL: ${deploymentUrl}`));
    
    // GitHub Pages can take some time to update after deployment
    console.log(chalk.blue('Waiting for GitHub Pages to update (this may take a few minutes)...'));
    
    // Implement a simple polling mechanism to check if the deployment is live
    const maxAttempts = 10;
    const delayBetweenAttempts = 30000; // 30 seconds
    
    const fetchWithTimeout = async (url: string, timeout: number) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    };
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(chalk.blue(`Verification attempt ${attempt}/${maxAttempts}...`));
        
        // Fetch with timeout to prevent hanging
        const response = await fetchWithTimeout(deploymentUrl, 10000);
        
        if (response.ok) {
          console.log(chalk.green('Deployment verification successful!'));
          return true;
        }
        
        console.log(chalk.yellow(`Received status ${response.status}, waiting for next attempt...`));
      } catch (error) {
        console.log(chalk.yellow(`Verification attempt failed: ${error.message}`));
      }
      
      if (attempt < maxAttempts) {
        console.log(chalk.blue(`Waiting ${delayBetweenAttempts / 1000} seconds before next attempt...`));
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      }
    }
    
    console.error(chalk.red('Deployment verification failed after maximum attempts'));
    return false;
  } catch (error) {
    console.error(chalk.red(`Deployment verification failed: ${error.message}`));
    return false;
  }
}

/**
 * Main function that orchestrates the deployment process
 * 
 * @param options - Deployment options
 * @returns Promise that resolves when the deployment process is complete
 */
export async function deploy(options: DeployOptions): Promise<void> {
  const startTime = new Date();
  console.log(chalk.bold.blue('===================================='));
  console.log(chalk.bold.blue('  ParkHub Passes Deployment Process'));
  console.log(chalk.bold.blue(`  Started at: ${formatDateTime(startTime)}`));
  console.log(chalk.bold.blue(`  Environment: ${options.environment}`));
  console.log(chalk.bold.blue('===================================='));
  
  try {
    // Load environment variables for target environment
    loadEnvironmentVariables(options.environment);
    
    // Build application if not already built and not skipped
    if (!options.skipBuild) {
      console.log(chalk.blue('Building application...'));
      await build({
        mode: options.environment,
        outDir: options.dist,
        minify: true,
        sourcemap: options.environment !== 'production',
        optimize: options.environment === 'production',
        validate: true
      });
    } else {
      console.log(chalk.yellow('Build step skipped (disabled in options)'));
    }
    
    // Validate build output exists and contains required files
    const isValid = await validateBuildOutput(options.dist);
    if (!isValid) {
      throw new Error('Build output validation failed. Ensure the application is built correctly.');
    }
    
    // Configure environment-specific settings
    await configureEnvironment(options.environment, options.dist);
    
    // Create deployment record
    await createDeploymentRecord(options, options.dist);
    
    // Deploy to GitHub Pages
    await deployToGitHubPages(options, options.dist);
    
    // Verify deployment if option is enabled
    if (options.verify) {
      const isVerified = await verifyDeployment(options);
      if (!isVerified && options.environment === 'production') {
        throw new Error('Production deployment verification failed. Please check deployment status manually.');
      } else if (!isVerified) {
        console.warn(chalk.yellow('Deployment verification failed but continuing as this is not a production environment.'));
      }
    }
    
    // Calculate total deployment time
    const endTime = new Date();
    const deploymentTime = (endTime.getTime() - startTime.getTime()) / 1000;
    
    // Log deployment process completion with summary
    console.log(chalk.bold.green('===================================='));
    console.log(chalk.bold.green('  Deployment Process Completed Successfully'));
    console.log(chalk.bold.green(`  Total time: ${deploymentTime.toFixed(2)} seconds`));
    console.log(chalk.bold.green(`  Environment: ${options.environment}`));
    console.log(chalk.bold.green(`  Branch: ${options.branch}`));
    console.log(chalk.bold.green('===================================='));
  } catch (error) {
    // Handle any errors during the deployment process
    console.error(chalk.bold.red('===================================='));
    console.error(chalk.bold.red('  Deployment Process Failed'));
    console.error(chalk.bold.red(`  Error: ${error.message || 'Unknown error'}`));
    console.error(chalk.bold.red('===================================='));
    throw error;
  }
}

/**
 * Entry point function that starts the deployment process
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const options = parseArguments();
    
    // Call deploy function with parsed options
    await deploy(options);
    
    // Handle success with exit code 0
    process.exit(0);
  } catch (error) {
    // Handle errors with error message and non-zero exit code
    console.error(chalk.red('Deployment failed with error:'), error);
    process.exit(1);
  }
}

// Execute main function if this script is run directly
if (require.main === module) {
  main();
}