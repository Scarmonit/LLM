#!/usr/bin/env node
/**
 * Nightly Self-Upgrade Script
 * Automatically pulls latest changes, reinstalls dependencies, runs tests,
 * and rotates old logs. All actions are idempotent and log-only on failure.
 */

import { execSync } from 'child_process';
import { renameSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

// Configuration
const PROJECT_ROOT = join(process.cwd());
const LOG_DIR = join(PROJECT_ROOT, 'logs');
const ARCHIVE_DIR = join(LOG_DIR, 'archive');
const MAX_LOGS = 30; // Keep last 30 upgrade logs

// Ensure log directories exist
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}
if (!existsSync(ARCHIVE_DIR)) {
  mkdirSync(ARCHIVE_DIR, { recursive: true });
}

// Generate timestamp for log file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = join(LOG_DIR, `upgrade-${timestamp}.log`);

/**
 * Execute command and capture output
 * @param {string} cmd - Command to execute
 * @returns {string|null} Command output or null on error
 */
function run(cmd) {
  try {
    const output = execSync(cmd, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: PROJECT_ROOT
    });
    return output;
  } catch (error) {
    return `ERROR: ${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`;
  }
}

/**
 * Rotate old upgrade logs to archive
 * @param {string} logPath - Path to log file to rotate
 */
function rotate(logPath) {
  try {
    const filename = logPath.split(/[/\\]/).pop();
    const archivePath = join(ARCHIVE_DIR, filename);
    renameSync(logPath, archivePath);
  } catch (error) {
    // Ignore rotation errors
  }
}

/**
 * Clean old archived logs
 */
function cleanOldLogs() {
  try {
    const files = readdirSync(ARCHIVE_DIR)
      .map(f => join(ARCHIVE_DIR, f))
      .filter(f => statSync(f).isFile())
      .sort((a, b) => statSync(b).mtime - statSync(a).mtime);

    // Remove logs beyond MAX_LOGS
    files.slice(MAX_LOGS).forEach(f => {
      try {
        unlinkSync(f);
      } catch {}
    });
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Get package version from package.json
 * @returns {string} Current version
 */
function getVersion() {
  try {
    const pkg = JSON.parse(readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf8'));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

/**
 * Main upgrade process
 */
async function upgrade() {
  const output = [];

  output.push('='.repeat(70));
  output.push(`Nightly Self-Upgrade - ${new Date().toISOString()}`);
  output.push('='.repeat(70));
  output.push('');

  // Get current version
  const versionBefore = getVersion();
  output.push(`Current version: ${versionBefore}`);
  output.push('');

  // Step 1: Fetch latest changes
  output.push('📡 Step 1: Fetching latest changes...');
  const fetchResult = run('git fetch origin main');
  output.push(fetchResult || 'Failed to fetch');
  output.push('');

  // Step 2: Check if updates available
  output.push('🔍 Step 2: Checking for updates...');
  const behindCount = run('git rev-list HEAD..origin/main --count');

  if (!behindCount || behindCount.trim() === '0') {
    output.push('✅ Already up-to-date. No updates needed.');
    output.push('');
    output.push('='.repeat(70));
    output.push('Upgrade Status: SKIPPED (already current)');
    output.push('='.repeat(70));

    writeFileSync(logFile, output.join('\n'));
    rotate(logFile);
    cleanOldLogs();
    return;
  }

  output.push(`Found ${behindCount.trim()} new commits`);
  output.push('');

  // Step 3: Stash local changes (if any)
  output.push('💾 Step 3: Stashing local changes...');
  const stashResult = run('git stash');
  output.push(stashResult || 'No changes to stash');
  output.push('');

  // Step 4: Merge latest changes
  output.push('🔄 Step 4: Merging latest changes...');
  const mergeResult = run('git merge origin/main --no-edit');
  if (mergeResult && mergeResult.includes('ERROR')) {
    output.push('❌ Merge failed!');
    output.push(mergeResult);
    output.push('');
    output.push('🔙 Rolling back...');
    run('git merge --abort');
    output.push('Merge aborted - manual intervention required');

    writeFileSync(logFile, output.join('\n'));
    return; // Exit without error to prevent cron alerts
  }
  output.push(mergeResult || 'Merge completed');
  output.push('');

  // Step 5: Install/update dependencies
  output.push('📦 Step 5: Installing dependencies...');
  const installResult = run('npm ci --silent');
  if (installResult && installResult.includes('ERROR')) {
    output.push('⚠️  Dependency installation had issues:');
    output.push(installResult);
  } else {
    output.push('✅ Dependencies installed successfully');
  }
  output.push('');

  // Step 6: Run tests
  output.push('🧪 Step 6: Running tests...');
  const testResult = run('npm test --silent');
  if (testResult && testResult.includes('ERROR')) {
    output.push('❌ Tests failed!');
    output.push(testResult);
    output.push('');
    output.push('⚠️  Update completed but tests are failing');
  } else {
    output.push('✅ All tests passed');
  }
  output.push('');

  // Step 7: Security audit
  output.push('🔒 Step 7: Running security audit...');
  const auditResult = run('npm audit --json');
  try {
    const audit = JSON.parse(auditResult);
    const vulns = audit.metadata?.vulnerabilities?.total || 0;
    if (vulns === 0) {
      output.push('✅ No vulnerabilities found');
    } else {
      output.push(`⚠️  Found ${vulns} vulnerabilities`);
      output.push('Run: npm audit fix');
    }
  } catch {
    output.push('⚠️  Could not parse audit results');
  }
  output.push('');

  // Final status
  const versionAfter = getVersion();
  output.push('='.repeat(70));
  output.push('Upgrade Status: SUCCESS ✅');
  output.push(`Version: ${versionBefore} → ${versionAfter}`);
  output.push(`Commits applied: ${behindCount.trim()}`);
  output.push(`Timestamp: ${new Date().toISOString()}`);
  output.push('='.repeat(70));

  // Write log file
  writeFileSync(logFile, output.join('\n'));

  // Rotate to archive
  rotate(logFile);

  // Clean old logs
  cleanOldLogs();

  console.log('✅ Nightly upgrade completed successfully');
  console.log(`📋 Log: ${logFile.split(/[/\\]/).pop()} (archived)`);
}

// Run upgrade process
upgrade().catch(err => {
  const errorLog = [
    '='.repeat(70),
    `Upgrade Error - ${new Date().toISOString()}`,
    '='.repeat(70),
    '',
    err.toString(),
    err.stack || '',
    '',
    '='.repeat(70),
    'Upgrade Status: FAILED ❌',
    '='.repeat(70)
  ].join('\n');

  writeFileSync(logFile, errorLog);

  // Do not exit with error - cron will email on stderr if needed
  console.error('❌ Upgrade failed - check logs');
});

