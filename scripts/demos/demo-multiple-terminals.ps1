# Demo: Launch 4 Separate Terminal Windows for Multiple Claude Instances
# This script opens 4 independent terminal windows, each ready to run Claude

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Launching 4 Independent Terminal Windows" -ForegroundColor Green
Write-Host "  Each window can run 'claude' independently" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Find bash executable
$bashPath = (Get-Command bash -ErrorAction SilentlyContinue).Source

if (-not $bashPath) {
    Write-Host "Error: bash not found in PATH!" -ForegroundColor Red
    exit 1
}

Write-Host "Using bash at: $bashPath" -ForegroundColor Yellow
Write-Host ""

# Launch 4 separate terminal windows
Write-Host "Launching Terminal 1..." -ForegroundColor Cyan
Start-Process -FilePath $bashPath -ArgumentList "-c", "echo '========================================'; echo 'CLAUDE TERMINAL 1'; echo '========================================'; echo 'Type: claude'; echo ''; exec bash"

Start-Sleep -Milliseconds 500

Write-Host "Launching Terminal 2..." -ForegroundColor Cyan
Start-Process -FilePath $bashPath -ArgumentList "-c", "echo '========================================'; echo 'CLAUDE TERMINAL 2'; echo '========================================'; echo 'Type: claude'; echo ''; exec bash"

Start-Sleep -Milliseconds 500

Write-Host "Launching Terminal 3..." -ForegroundColor Cyan
Start-Process -FilePath $bashPath -ArgumentList "-c", "echo '========================================'; echo 'CLAUDE TERMINAL 3'; echo '========================================'; echo 'Type: claude'; echo ''; exec bash"

Start-Sleep -Milliseconds 500

Write-Host "Launching Terminal 4..." -ForegroundColor Cyan
Start-Process -FilePath $bashPath -ArgumentList "-c", "echo '========================================'; echo 'CLAUDE TERMINAL 4'; echo '========================================'; echo 'Type: claude'; echo ''; exec bash"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  SUCCESS! 4 terminal windows are now open!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Look at the 4 terminal windows that just opened" -ForegroundColor White
Write-Host "2. Type 'claude' in any window to start Claude" -ForegroundColor White
Write-Host "3. Each window runs independently!" -ForegroundColor White
Write-Host ""
Write-Host "Taking screenshot in 3 seconds..." -ForegroundColor Cyan

Start-Sleep -Seconds 3
