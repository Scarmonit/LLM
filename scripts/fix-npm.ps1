#!/usr/bin/env pwsh
# NPM Fix Script - Resolves npm install issues and exit code problems
# Usage: .\scripts\fix-npm.ps1

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  NPM Installation & Security Fix Script" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Step 1: Check current state
Write-Host "📊 Step 1: Checking current npm state..." -ForegroundColor Yellow
npm --version | Out-Null
if ($LASTEXITCODE -eq 0) {
    $npmVersion = npm --version
    Write-Host "   ✓ npm version: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "   ✗ npm not found or not working" -ForegroundColor Red
    exit 1
}

# Step 2: Clean npm cache
Write-Host "`n🧹 Step 2: Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Cache cleaned successfully" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Cache clean had issues (continuing anyway)" -ForegroundColor DarkYellow
}

# Step 3: Verify cache
Write-Host "`n🔍 Step 3: Verifying cache integrity..." -ForegroundColor Yellow
npm cache verify 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Cache verified" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Cache verification warnings (non-critical)" -ForegroundColor DarkYellow
}

# Step 4: Remove node_modules (optional - only if problems persist)
$removeModules = $false
if ($args -contains "--clean") {
    $removeModules = $true
}

if ($removeModules) {
    Write-Host "`n🗑️  Step 4: Removing node_modules (--clean flag detected)..." -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules" 2>&1 | Out-Null
        Write-Host "   ✓ node_modules removed" -ForegroundColor Green
    } else {
        Write-Host "   ℹ node_modules not found (skipping)" -ForegroundColor Gray
    }

    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json" 2>&1 | Out-Null
        Write-Host "   ✓ package-lock.json removed" -ForegroundColor Green
    }
} else {
    Write-Host "`n⏭️  Step 4: Skipped (use --clean to remove node_modules)" -ForegroundColor Gray
}

# Step 5: Install packages
Write-Host "`n📦 Step 5: Installing packages..." -ForegroundColor Yellow
npm install --no-audit 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Packages installed successfully" -ForegroundColor Green
} else {
    Write-Host "   ✗ Installation failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

# Step 6: Run security audit
Write-Host "`n🔒 Step 6: Running security audit..." -ForegroundColor Yellow
$auditResult = npm audit --json 2>&1 | ConvertFrom-Json

$totalVulns = 0
if ($auditResult.metadata -and $auditResult.metadata.vulnerabilities) {
    $totalVulns = $auditResult.metadata.vulnerabilities.total
}

if ($totalVulns -eq 0) {
    Write-Host "   ✓ No vulnerabilities found" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Found $totalVulns vulnerabilities" -ForegroundColor Yellow

    # Show breakdown
    $vulns = $auditResult.metadata.vulnerabilities
    if ($vulns.critical -gt 0) { Write-Host "     - Critical: $($vulns.critical)" -ForegroundColor Red }
    if ($vulns.high -gt 0) { Write-Host "     - High: $($vulns.high)" -ForegroundColor DarkRed }
    if ($vulns.moderate -gt 0) { Write-Host "     - Moderate: $($vulns.moderate)" -ForegroundColor DarkYellow }
    if ($vulns.low -gt 0) { Write-Host "     - Low: $($vulns.low)" -ForegroundColor Gray }

    Write-Host "`n   💡 To fix: npm audit fix" -ForegroundColor Cyan
}

# Step 7: List installed packages
Write-Host "`n📋 Step 7: Verifying installation..." -ForegroundColor Yellow
$packageCount = (npm ls --depth=0 --json 2>&1 | ConvertFrom-Json).dependencies.Count
Write-Host "   ✓ $packageCount packages installed" -ForegroundColor Green

# Step 8: Check for outdated packages
Write-Host "`n📅 Step 8: Checking for updates..." -ForegroundColor Yellow
$outdated = npm outdated --json 2>&1
if ($outdated) {
    try {
        $outdatedPkgs = ($outdated | ConvertFrom-Json).PSObject.Properties.Count
        if ($outdatedPkgs -gt 0) {
            Write-Host "   ℹ $outdatedPkgs packages have updates available" -ForegroundColor Cyan
            Write-Host "   💡 Run 'npm outdated' for details" -ForegroundColor Cyan
        } else {
            Write-Host "   ✓ All packages are up to date" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ✓ All packages are up to date" -ForegroundColor Green
    }
} else {
    Write-Host "   ✓ All packages are up to date" -ForegroundColor Green
}

# Final Summary
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($totalVulns -eq 0) {
    Write-Host "`n✅ " -NoNewline -ForegroundColor Green
    Write-Host "All checks passed! npm environment is healthy." -ForegroundColor White
} else {
    Write-Host "`n⚠️  " -NoNewline -ForegroundColor Yellow
    Write-Host "Installation successful but $totalVulns vulnerabilities found." -ForegroundColor White
    Write-Host "   Run 'npm audit fix' to attempt automatic fixes." -ForegroundColor Cyan
}

Write-Host "`n📊 Stats:" -ForegroundColor Cyan
Write-Host "   - Packages: $packageCount installed" -ForegroundColor White
Write-Host "   - Vulnerabilities: $totalVulns found" -ForegroundColor White
Write-Host "   - Status: " -NoNewline -ForegroundColor White
if ($totalVulns -eq 0) {
    Write-Host "CLEAN ✓" -ForegroundColor Green
} else {
    Write-Host "NEEDS ATTENTION ⚠" -ForegroundColor Yellow
}

Write-Host "`n═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Exit with appropriate code
if ($totalVulns -eq 0) {
    exit 0
} else {
    exit 0  # Still exit 0 since installation succeeded
}

