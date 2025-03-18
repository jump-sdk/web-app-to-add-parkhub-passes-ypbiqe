/**
 * Custom build script for the ParkHub Passes Creation Web Application.
 * Enhances the standard Vite build process with additional functionality such as
 * environment configuration, build optimization, and artifact management.
 * This script is executed as part of the CI/CD pipeline to create production-ready static files.
 */

import path from 'path'; // v18.15.11
import fs from 'fs-extra'; // v11.1.0
import chalk from 'chalk'; // v5.2.0
import { execa } from 'execa'; // v7.1.1
import dotenv from 'dotenv'; // v16.0.3
import { build as viteBuild } from 'vite'; // v4.2.1
import { formatDateTime } from '../src/utils/date-helpers';

// Type for build options
interface BuildOptions {
  mode: string;
  outDir: string;
  minify: boolean;
  sourcemap: boolean;
  optimize: boolean;
  validate: boolean;
  [key: string]: any; // Allow additional properties
}

/**
 * Loads environment variables from the appropriate .env file based on the build environment
 */
function loadEnvironmentVariables(): void {
  // Determine current build environment (development, production)
  const env = process.env.NODE_ENV || 'development';
  
  // Path to the root directory
  const rootDir = path.resolve(__dirname, '../../');
  
  // Load variables from .env file
  const baseEnvPath = path.join(rootDir, '.env');
  if (fs.existsSync(baseEnvPath)) {
    console.log(chalk.blue(`Loading environment variables from ${baseEnvPath}`));
    dotenv.config({ path: baseEnvPath });
  }
  
  // Load variables from environment-specific .env file (.env.production)
  const envSpecificPath = path.join(rootDir, `.env.${env}`);
  if (fs.existsSync(envSpecificPath)) {
    console.log(chalk.blue(`Loading environment variables from ${envSpecificPath}`));
    dotenv.config({ path: envSpecificPath });
  }
  
  console.log(chalk.green(`Environment configuration loaded for ${chalk.bold(env)}`));
}

/**
 * Parses command line arguments to determine build options
 * @returns Object containing parsed build options
 */
function parseArguments(): BuildOptions {
  const args = process.argv.slice(2);
  const options: BuildOptions = {
    mode: process.env.NODE_ENV || 'production',
    outDir: 'dist',
    minify: true,
    sourcemap: false,
    optimize: true,
    validate: true,
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
  
  console.log(chalk.blue('Build options:'), options);
  return options;
}

/**
 * Cleans the distribution directory before building
 * @param outDir - Output directory path
 */
async function cleanDistDirectory(outDir: string): Promise<void> {
  const absoluteOutDir = path.resolve(process.cwd(), outDir);
  
  console.log(chalk.blue(`Cleaning output directory: ${absoluteOutDir}`));
  
  // Check if output directory exists
  if (fs.existsSync(absoluteOutDir)) {
    // Remove directory contents if it exists
    await fs.emptyDir(absoluteOutDir);
    console.log(chalk.green(`Cleared existing contents from ${absoluteOutDir}`));
  } else {
    // Create fresh directory
    await fs.mkdirp(absoluteOutDir);
    console.log(chalk.green(`Created new directory at ${absoluteOutDir}`));
  }
  
  console.log(chalk.green('Output directory prepared successfully'));
}

/**
 * Builds the application using Vite with the specified options
 * @param options - Build options
 */
async function buildApplication(options: BuildOptions): Promise<void> {
  const startTime = new Date();
  console.log(chalk.blue(`Starting build at ${formatDateTime(startTime)}`));
  
  try {
    // Configure Vite build options based on parameters
    const buildOptions = {
      root: process.cwd(),
      mode: options.mode,
      build: {
        outDir: options.outDir,
        emptyOutDir: false, // We already cleaned it manually
        minify: options.minify,
        sourcemap: options.sourcemap,
        reportCompressedSize: true,
      },
    };
    
    // Execute Vite build command
    console.log(chalk.blue('Building application with Vite...'));
    await viteBuild(buildOptions);
    
    const endTime = new Date();
    const buildTime = (endTime.getTime() - startTime.getTime()) / 1000;
    
    // Handle build completion with success message
    console.log(chalk.green(`Build completed successfully in ${buildTime.toFixed(2)} seconds`));
  } catch (error) {
    // Handle build failures with error message
    console.error(chalk.red('Build failed:'), error);
    throw error;
  }
}

/**
 * Generates a build-info.json file with metadata about the build
 * @param options - Build options
 */
async function generateBuildInfo(options: BuildOptions): Promise<void> {
  console.log(chalk.blue('Generating build information...'));
  
  // Path to the output directory
  const outDir = path.resolve(process.cwd(), options.outDir);
  
  // Get package.json for version
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = await fs.readJSON(packageJsonPath);
  
  // Get git commit hash if available
  let commitHash = 'unknown';
  try {
    const { stdout } = await execa('git', ['rev-parse', 'HEAD']);
    commitHash = stdout.trim();
  } catch (error) {
    console.log(chalk.yellow('Unable to get git commit hash, using "unknown"'));
  }
  
  // Gather build information (timestamp, version, environment, commit hash)
  const buildInfo = {
    version: packageJson.version,
    timestamp: new Date().toISOString(),
    environment: options.mode,
    commitHash,
    buildNumber: process.env.BUILD_NUMBER || 'local',
    nodeVersion: process.version,
  };
  
  // Create build-info.json file in the output directory
  const buildInfoPath = path.join(outDir, 'build-info.json');
  await fs.writeJSON(buildInfoPath, buildInfo, { spaces: 2 });
  
  // Log successful creation of build info
  console.log(chalk.green(`Build information saved to ${buildInfoPath}`));
}

/**
 * Helper function to walk a directory recursively and find files
 * @param dir - Directory to walk
 * @param fileList - Accumulator for file paths
 */
async function walkDirectory(dir: string, fileList: string[] = []): Promise<string[]> {
  const files = await fs.readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    
    if (stat.isDirectory()) {
      fileList = await walkDirectory(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

/**
 * Performs additional optimization on build assets
 * @param outDir - Output directory path
 */
async function optimizeAssets(outDir: string): Promise<void> {
  console.log(chalk.blue('Optimizing build assets...'));
  
  const absoluteOutDir = path.resolve(process.cwd(), outDir);
  
  // Generate gzip/brotli versions of assets for CDN
  console.log(chalk.blue('Creating compressed versions of assets...'));
  
  try {
    // Find all files in the output directory
    const allFiles = await walkDirectory(absoluteOutDir);
    
    // Filter for compressible file types
    const compressibleExtensions = ['.html', '.js', '.css', '.json', '.svg', '.txt'];
    const compressibleFiles = allFiles.filter(file => {
      const ext = path.extname(file);
      return compressibleExtensions.includes(ext);
    });
    
    // Optimize images if present
    const imageFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });
    
    if (imageFiles.length > 0) {
      console.log(chalk.blue(`Optimizing ${imageFiles.length} images...`));
      // This could be expanded with image optimization libraries
    }
    
    // Create gzip versions
    for (const file of compressibleFiles) {
      try {
        await execa('gzip', ['-c', file], { 
          stdout: fs.createWriteStream(`${file}.gz`) 
        });
      } catch (error) {
        console.warn(chalk.yellow(`Failed to gzip ${path.basename(file)}: ${error.message}`));
      }
    }
    
    console.log(chalk.green(`Created gzip versions of ${compressibleFiles.length} files`));
    
    // Try to create brotli versions
    let brotliCount = 0;
    for (const file of compressibleFiles) {
      try {
        await execa('brotli', ['-c', file], { 
          stdout: fs.createWriteStream(`${file}.br`) 
        });
        brotliCount++;
      } catch (error) {
        // Quietly skip - brotli might not be installed
        if (brotliCount === 0 && compressibleFiles.indexOf(file) === compressibleFiles.length - 1) {
          console.warn(chalk.yellow('Brotli compression not available. Install the brotli command-line tool for better compression.'));
        }
      }
    }
    
    if (brotliCount > 0) {
      console.log(chalk.green(`Created brotli versions of ${brotliCount} files`));
    }
    
  } catch (error) {
    console.warn(chalk.yellow(`Asset compression failed: ${error.message}`));
    console.warn(chalk.yellow('Continuing build process without compression.'));
  }
  
  console.log(chalk.green('Asset optimization completed'));
}

/**
 * Validates the build output to ensure all required files are present
 * @param outDir - Output directory path
 */
async function validateBuild(outDir: string): Promise<boolean> {
  console.log(chalk.blue('Validating build output...'));
  
  const absoluteOutDir = path.resolve(process.cwd(), outDir);
  
  // Check for essential files (index.html, main JS bundle, CSS)
  const essentialFiles = [
    'index.html',
    'build-info.json',
  ];
  
  // Check for essential files
  const missingFiles: string[] = [];
  
  for (const file of essentialFiles) {
    const filePath = path.join(absoluteOutDir, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  }
  
  // Check for JS and CSS assets
  const files = await walkDirectory(absoluteOutDir);
  const hasJsAssets = files.some(file => file.endsWith('.js'));
  const hasCssAssets = files.some(file => file.endsWith('.css'));
  
  if (!hasJsAssets) {
    missingFiles.push('JavaScript assets');
  }
  
  if (!hasCssAssets) {
    missingFiles.push('CSS assets');
  }
  
  // Log validation results
  if (missingFiles.length > 0) {
    console.error(chalk.red(`Build validation failed. Missing files: ${missingFiles.join(', ')}`));
    return false;
  }
  
  // Verify file sizes are within acceptable limits
  let largeFiles: string[] = [];
  const maxFileSizeMB = 2; // 2MB limit for individual files
  
  for (const file of files) {
    try {
      const stats = await fs.stat(file);
      if (stats.isFile() && stats.size > maxFileSizeMB * 1024 * 1024) {
        largeFiles.push(`${path.relative(absoluteOutDir, file)} (${(stats.size / (1024 * 1024)).toFixed(2)}MB)`);
      }
    } catch (error) {
      console.warn(chalk.yellow(`Could not check size of ${path.relative(absoluteOutDir, file)}: ${error.message}`));
    }
  }
  
  if (largeFiles.length > 0) {
    console.warn(chalk.yellow(`Warning: These files exceed the recommended size limit of ${maxFileSizeMB}MB:`));
    largeFiles.forEach(file => console.warn(chalk.yellow(`  - ${file}`)));
    // Don't fail the build for large files, just warn
  }
  
  console.log(chalk.green('Build validation successful. All required files are present.'));
  return true;
}

/**
 * Main function that orchestrates the entire build process
 * @param options - Build options
 */
async function build(options: BuildOptions): Promise<void> {
  const startTime = new Date();
  console.log(chalk.bold.blue('===================================='));
  console.log(chalk.bold.blue('  ParkHub Passes Build Process'));
  console.log(chalk.bold.blue(`  Started at: ${formatDateTime(startTime)}`));
  console.log(chalk.bold.blue('===================================='));
  
  try {
    // Load environment variables
    loadEnvironmentVariables();
    
    // Clean distribution directory
    await cleanDistDirectory(options.outDir);
    
    // Build application with specified options
    await buildApplication(options);
    
    // Generate build information file
    await generateBuildInfo(options);
    
    // Optimize assets if enabled in options
    if (options.optimize) {
      await optimizeAssets(options.outDir);
    } else {
      console.log(chalk.yellow('Asset optimization skipped (disabled in options)'));
    }
    
    // Validate build output
    if (options.validate) {
      const isValid = await validateBuild(options.outDir);
      if (!isValid) {
        throw new Error('Build validation failed');
      }
    } else {
      console.log(chalk.yellow('Build validation skipped (disabled in options)'));
    }
    
    // Calculate total build time
    const endTime = new Date();
    const buildTime = (endTime.getTime() - startTime.getTime()) / 1000;
    
    // Log build process completion with summary
    console.log(chalk.bold.green('===================================='));
    console.log(chalk.bold.green('  Build Process Completed Successfully'));
    console.log(chalk.bold.green(`  Total time: ${buildTime.toFixed(2)} seconds`));
    console.log(chalk.bold.green(`  Output directory: ${path.resolve(process.cwd(), options.outDir)}`));
    console.log(chalk.bold.green('===================================='));
  } catch (error) {
    // Handle any errors during the build process
    console.error(chalk.bold.red('===================================='));
    console.error(chalk.bold.red('  Build Process Failed'));
    console.error(chalk.bold.red(`  Error: ${error.message || 'Unknown error'}`));
    console.error(chalk.bold.red('===================================='));
    throw error;
  }
}

/**
 * Entry point function that starts the build process
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const options = parseArguments();
    
    // Call build function with parsed options
    await build(options);
    
    // Handle success with exit code 0
    process.exit(0);
  } catch (error) {
    // Handle errors with error message and non-zero exit code
    console.error(chalk.red('Build failed with error:'), error);
    process.exit(1);
  }
}

// Execute main function if this script is run directly
if (require.main === module) {
  main();
}

// Export for testing or programmatic use
export { build, parseArguments, loadEnvironmentVariables };