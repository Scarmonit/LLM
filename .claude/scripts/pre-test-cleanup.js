#!/usr/bin/env node
/**
 * Pre-test cleanup script
 * Kills orphaned processes and cleans up test artifacts
 */

import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';

console.log('🧹 Pre-test cleanup starting...');

// Kill orphaned node processes on common test ports
const testPorts = [8080, 8081, 4567, 4568];

testPorts.forEach(port => {
  try {
    if (process.platform === 'win32') {
      // Windows: Find and kill process using port
      try {
        const result = execSync(`powershell.exe -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`, { encoding: 'utf8' });
        const pids = result.trim().split('\n').filter(Boolean);
        pids.forEach(pid => {
          try {
            execSync(`taskkill.exe /F /PID ${pid}`, { stdio: 'ignore' });
            console.log(`✓ Killed process ${pid} using port ${port}`);
          } catch (e) {
            // Process might already be gone
          }
        });
      } catch (e) {
        // Port not in use
      }
    } else {
      // Unix: Find and kill process using port
      try {
        const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8' });
        const pids = result.trim().split('\n').filter(Boolean);
        pids.forEach(pid => {
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            console.log(`✓ Killed process ${pid} using port ${port}`);
          } catch (e) {
            // Process might already be gone
          }
        });
      } catch (e) {
        // Port not in use
      }
    }
  } catch (error) {
    // Ignore errors - port might not be in use
  }
});

// Remove git lock files if they exist
const lockFiles = [
  '.git/index.lock',
  '.git/HEAD.lock',
  '.git/refs/heads/main.lock'
];

lockFiles.forEach(file => {
  if (existsSync(file)) {
    try {
      unlinkSync(file);
      console.log(`✓ Removed ${file}`);
    } catch (e) {
      console.warn(`⚠ Could not remove ${file}`);
    }
  }
});

console.log('✅ Pre-test cleanup completed\n');
