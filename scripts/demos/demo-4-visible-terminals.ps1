# Demo: Launch 4 Visibly Arranged Terminal Windows
# Each CMD window runs bash with a clear identifier

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Launching 4 CMD Windows with Bash" -ForegroundColor Green
Write-Host "  Each window has a unique title" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing bash processes from previous runs to start fresh
Write-Host "Cleaning up previous bash processes..." -ForegroundColor Yellow
Get-Process bash -ErrorAction SilentlyContinue | Where-Object { $_.StartTime -lt (Get-Date).AddMinutes(-1) } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Launch 4 CMD windows, each with a unique title and running bash
Write-Host "Launching Claude Terminal 1..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList "/k", "title CLAUDE TERMINAL 1 && bash -c `"echo '==================================='; echo 'CLAUDE TERMINAL 1'; echo '==================================='; echo 'Type: claude'; echo ''; exec bash`""

Start-Sleep -Seconds 1

Write-Host "Launching Claude Terminal 2..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList "/k", "title CLAUDE TERMINAL 2 && bash -c `"echo '==================================='; echo 'CLAUDE TERMINAL 2'; echo '==================================='; echo 'Type: claude'; echo ''; exec bash`""

Start-Sleep -Seconds 1

Write-Host "Launching Claude Terminal 3..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList "/k", "title CLAUDE TERMINAL 3 && bash -c `"echo '==================================='; echo 'CLAUDE TERMINAL 3'; echo '==================================='; echo 'Type: claude'; echo ''; exec bash`""

Start-Sleep -Seconds 1

Write-Host "Launching Claude Terminal 4..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList "/k", "title CLAUDE TERMINAL 4 && bash -c `"echo '==================================='; echo 'CLAUDE TERMINAL 4'; echo '==================================='; echo 'Type: claude'; echo ''; exec bash`""

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  SUCCESS! 4 CMD windows launched!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Each window has a title: CLAUDE TERMINAL 1, 2, 3, 4" -ForegroundColor Yellow
Write-Host ""
Write-Host "Waiting 3 seconds before taking screenshot..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "Taking screenshot now..." -ForegroundColor Green
