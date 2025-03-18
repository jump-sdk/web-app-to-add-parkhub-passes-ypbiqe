/**
 * Custom test script for the ParkHub Passes Creation Web Application.
 * Enhances the standard Jest test runner with additional functionality
 * such as test filtering, coverage reporting, and watch mode configuration.
 *
 * This script is executed as part of the development workflow and CI/CD pipeline
 * to ensure code quality and functionality.
 */

import path from 'path'; // ^18.15.11
import fs from 'fs-extra'; // ^11.1.0
import chalk from 'chalk'; // ^5.2.0
import { execa } from 'execa'; // ^7.1.1
import minimist from 'minimist'; // ^1.2.8
import { formatDateTime } from '../src/utils/date-helpers';

/**
 * Interface for test options parsed from command line arguments
 */
interface TestOptions {
  watch: boolean;
  coverage: boolean;
  updateSnapshots: boolean;
  testPathPattern: string;
  ci: boolean;
  verbose: boolean;
  silent: boolean;
  clearCache: boolean;
  generateReport: boolean;
  bail: boolean;
  passWithNoTests: boolean;
  [key: string]: any; // For any additional options
}

/**
 * Interface for test results returned by Jest
 */
interface TestResults {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  coverage: boolean;
  [key: string]: any; // For any additional results
}

/**
 * Parses command line arguments to determine test options
 * 
 * @returns Object containing parsed test options
 */
function parseArguments(): TestOptions {
  const args = minimist(process.argv.slice(2));
  
  return {
    watch: args.watch || args.w || false,
    coverage: args.coverage || args.c || false,
    updateSnapshots: args.updateSnapshot || args.u || false,
    testPathPattern: args.testPathPattern || args._ && args._.length > 0 ? args._[0] : '',
    ci: args.ci || process.env.CI === 'true' || false,
    verbose: args.verbose || args.v || false,
    silent: args.silent || args.s || false,
    clearCache: args.clearCache || false,
    generateReport: args.report || args.r || false,
    bail: args.bail || args.b || false,
    passWithNoTests: args.passWithNoTests || true,
  };
}

/**
 * Resolves the path to the Jest configuration file
 * 
 * @returns Absolute path to the Jest configuration file
 */
function getJestConfigPath(): string {
  const rootDir = process.cwd();
  const tsConfigPath = path.join(rootDir, 'jest.config.ts');
  const jsConfigPath = path.join(rootDir, 'jest.config.js');
  
  if (fs.existsSync(tsConfigPath)) {
    return tsConfigPath;
  }
  
  if (fs.existsSync(jsConfigPath)) {
    return jsConfigPath;
  }
  
  throw new Error('Jest configuration file not found. Please create either jest.config.ts or jest.config.js');
}

/**
 * Builds the Jest command with appropriate arguments based on options
 * 
 * @param options - Test options parsed from command line arguments
 * @returns Object containing command and arguments for execa
 */
function buildJestCommand(options: TestOptions): { command: string; args: string[] } {
  const jestBin = path.join(process.cwd(), 'node_modules', '.bin', 'jest');
  const args: string[] = [];
  
  // Add config path
  args.push('--config', getJestConfigPath());
  
  // Add watch mode if enabled and not in CI
  if (options.watch && !options.ci) {
    args.push('--watch');
  }
  
  // Add coverage if enabled
  if (options.coverage) {
    args.push('--coverage');
  }
  
  // Add update snapshot if enabled
  if (options.updateSnapshots) {
    args.push('--updateSnapshot');
  }
  
  // Add test path pattern if specified
  if (options.testPathPattern) {
    args.push('--testPathPattern', options.testPathPattern);
  }
  
  // Add verbose mode if enabled
  if (options.verbose) {
    args.push('--verbose');
  }
  
  // Add silent mode if enabled
  if (options.silent) {
    args.push('--silent');
  }
  
  // Add clear cache option if enabled
  if (options.clearCache) {
    args.push('--clearCache');
  }
  
  // Add bail if enabled
  if (options.bail) {
    args.push('--bail');
  }
  
  // Add pass with no tests option
  if (options.passWithNoTests) {
    args.push('--passWithNoTests');
  }
  
  // Run in band for CI environments
  if (options.ci) {
    args.push('--runInBand');
  }
  
  return { command: jestBin, args };
}

/**
 * Sets up the test environment before running tests
 * 
 * @param options - Test options parsed from command line arguments
 * @returns Promise that resolves when setup is complete
 */
async function setupEnvironment(options: TestOptions): Promise<void> {
  // Set NODE_ENV to test
  process.env.NODE_ENV = 'test';
  
  // Create coverage directory if coverage reporting is enabled
  if (options.coverage) {
    const coverageDir = path.join(process.cwd(), 'coverage');
    await fs.ensureDir(coverageDir);
  }
  
  // Clear previous test results if needed
  if (options.clearCache) {
    console.log(chalk.yellow('🧹 Clearing Jest cache...'));
    const jestCacheDir = path.join(process.cwd(), 'node_modules', '.cache', 'jest');
    if (fs.existsSync(jestCacheDir)) {
      await fs.remove(jestCacheDir);
    }
  }
  
  // Log test start with configuration details
  console.log('\n');
  console.log(chalk.blue('==================================='));
  console.log(chalk.blue(`🧪 Starting tests at ${formatDateTime(new Date())}`));
  console.log(chalk.blue('==================================='));
  console.log('');
  
  // Log configuration
  console.log(chalk.cyan('Configuration:'));
  console.log(chalk.cyan(`- Watch mode: ${options.watch ? 'enabled' : 'disabled'}`));
  console.log(chalk.cyan(`- Coverage: ${options.coverage ? 'enabled' : 'disabled'}`));
  console.log(chalk.cyan(`- CI mode: ${options.ci ? 'enabled' : 'disabled'}`));
  console.log(chalk.cyan(`- Update snapshots: ${options.updateSnapshots ? 'enabled' : 'disabled'}`));
  if (options.testPathPattern) {
    console.log(chalk.cyan(`- Test pattern: ${options.testPathPattern}`));
  }
  console.log('');
}

/**
 * Runs the Jest tests with the specified options
 * 
 * @param options - Test options parsed from command line arguments
 * @returns Promise that resolves with test results
 */
async function runTests(options: TestOptions): Promise<TestResults> {
  try {
    const { command, args } = buildJestCommand(options);
    
    // Log the command being executed if verbose mode is enabled
    if (options.verbose) {
      console.log(chalk.gray(`Executing: ${command} ${args.join(' ')}`));
      console.log('');
    }
    
    // Execute Jest using execa
    const subprocess = execa(command, args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        FORCE_COLOR: 'true', // Ensure colors are preserved in output
      }
    });
    
    const result = await subprocess;
    
    return {
      success: true,
      exitCode: result.exitCode,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      coverage: options.coverage,
    };
  } catch (error: any) {
    // Jest will throw an error if tests fail, but we want to handle this gracefully
    return {
      success: false,
      exitCode: error.exitCode || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      coverage: options.coverage,
    };
  }
}

/**
 * Processes and validates coverage results against thresholds
 * 
 * @param options - Test options parsed from command line arguments
 * @param results - Results from Jest test execution
 * @returns Promise that resolves to true if coverage meets thresholds, false otherwise
 */
async function processCoverageResults(
  options: TestOptions,
  results: TestResults
): Promise<boolean> {
  if (!options.coverage) {
    return true;
  }
  
  try {
    console.log('');
    console.log(chalk.blue('==================================='));
    console.log(chalk.blue('📊 Coverage Results'));
    console.log(chalk.blue('==================================='));
    
    // Read coverage summary JSON
    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
    if (!fs.existsSync(coveragePath)) {
      console.log(chalk.yellow('No coverage report found. Skipping coverage validation.'));
      return true;
    }
    
    const coverage = await fs.readJson(coveragePath);
    
    // Extract total coverage
    const total = coverage.total || {};
    
    // Define thresholds (could be read from jest config in a more advanced version)
    const thresholds = {
      lines: 85,
      statements: 85,
      functions: 85,
      branches: 75
    };
    
    // Check if coverage meets thresholds
    const lines = total.lines?.pct || 0;
    const statements = total.statements?.pct || 0;
    const functions = total.functions?.pct || 0;
    const branches = total.branches?.pct || 0;
    
    console.log(chalk.cyan(`- Lines: ${formatCoverage(lines, thresholds.lines)}`));
    console.log(chalk.cyan(`- Statements: ${formatCoverage(statements, thresholds.statements)}`));
    console.log(chalk.cyan(`- Functions: ${formatCoverage(functions, thresholds.functions)}`));
    console.log(chalk.cyan(`- Branches: ${formatCoverage(branches, thresholds.branches)}`));
    console.log('');
    
    // Determine if all thresholds are met
    const thresholdsMet = 
      lines >= thresholds.lines &&
      statements >= thresholds.statements &&
      functions >= thresholds.functions &&
      branches >= thresholds.branches;
    
    if (thresholdsMet) {
      console.log(chalk.green('✅ All coverage thresholds are met!'));
    } else {
      console.log(chalk.red('❌ Some coverage thresholds are not met!'));
    }
    
    return thresholdsMet;
  } catch (error) {
    console.error(chalk.red('Error processing coverage results:'), error);
    return false;
  }
  
  // Helper function to format coverage with colors
  function formatCoverage(actual: number, threshold: number): string {
    const formattedValue = `${actual.toFixed(2)}%`;
    if (actual >= threshold) {
      return chalk.green(formattedValue);
    } else if (actual >= threshold * 0.9) {
      return chalk.yellow(formattedValue);
    } else {
      return chalk.red(formattedValue);
    }
  }
}

/**
 * Generates a test report from the test results
 * 
 * @param options - Test options parsed from command line arguments
 * @param results - Results from Jest test execution
 * @returns Promise that resolves when report generation is complete
 */
async function generateTestReport(
  options: TestOptions,
  results: TestResults
): Promise<void> {
  if (!options.generateReport) {
    return;
  }
  
  try {
    console.log('');
    console.log(chalk.blue('==================================='));
    console.log(chalk.blue('📄 Generating Test Report'));
    console.log(chalk.blue('==================================='));
    
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'reports');
    await fs.ensureDir(reportsDir);
    
    // Generate a timestamp for the report filename
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const reportFilename = `test-report-${timestamp}.json`;
    const reportPath = path.join(reportsDir, reportFilename);
    
    // Create a simple report with the test results and metadata
    const report = {
      timestamp: new Date().toISOString(),
      success: results.success,
      exitCode: results.exitCode,
      coverage: results.coverage,
      options: {
        ...options,
        // Remove sensitive or non-serializable data
        _: undefined
      }
    };
    
    // Write the report to disk
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    console.log(chalk.green(`✅ Test report generated at: ${reportPath}`));
  } catch (error) {
    console.error(chalk.red('Error generating test report:'), error);
  }
}

/**
 * Main function that orchestrates the test execution process
 * 
 * @param options - Test options parsed from command line arguments
 * @returns Promise that resolves to exit code (0 for success, non-zero for failure)
 */
export async function test(options: TestOptions = parseArguments()): Promise<number> {
  console.log(chalk.blue(`🚀 Starting test process at ${formatDateTime(new Date())}`));
  
  try {
    // Setup environment before running tests
    await setupEnvironment(options);
    
    // Run the tests
    console.log(chalk.blue('Running tests...'));
    const results = await runTests(options);
    
    // Process coverage results if enabled
    const coveragePassed = await processCoverageResults(options, results);
    
    // Generate test report if enabled
    await generateTestReport(options, results);
    
    // Determine exit code
    let exitCode = results.exitCode;
    
    // If tests succeeded but coverage failed, still return a non-zero exit code
    if (results.success && !coveragePassed && options.coverage) {
      exitCode = 1;
      console.log(chalk.yellow('⚠️ Tests passed but coverage thresholds were not met'));
    }
    
    // Log final status
    console.log('');
    console.log(chalk.blue('==================================='));
    if (exitCode === 0) {
      console.log(chalk.green('✅ All tests passed!'));
    } else {
      console.log(chalk.red('❌ Tests failed!'));
    }
    console.log(chalk.blue(`🏁 Test process completed at ${formatDateTime(new Date())}`));
    console.log(chalk.blue('==================================='));
    
    return exitCode;
  } catch (error: any) {
    console.error(chalk.red('Error running tests:'), error);
    return 1;
  }
}

/**
 * Entry point function that starts the test process
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const options = parseArguments();
    
    // Run tests with parsed options
    const exitCode = await test(options);
    
    // Exit with appropriate code
    process.exit(exitCode);
  } catch (error: any) {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main();
}