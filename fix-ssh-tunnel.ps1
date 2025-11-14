# Fix SSH Tunnel Missing Fields Error
# Run this in PowerShell (not Git Bash)

Write-Host "Diagnosing SSH tunnel errors..." -ForegroundColor Cyan

# Check extension containers
Write-Host "`nExtension containers:" -ForegroundColor Yellow
docker ps --filter "label=com.docker.extension.api-version" --format "{{.ID}} {{.Names}}"

# Restart Remote Docker extension container
Write-Host "`nRestarting Remote Docker extension..." -ForegroundColor Yellow
$remoteContainer = docker ps -q --filter "name=remote-docker"
if ($remoteContainer) {
    docker restart $remoteContainer
    Write-Host "Remote Docker extension restarted" -ForegroundColor Green
} else {
    Write-Host "Remote Docker extension container not found" -ForegroundColor Red
}

# Restart Telepresence extension
Write-Host "`nRestarting Telepresence extension..." -ForegroundColor Yellow
$telepresenceContainer = docker ps -q --filter "name=telepresence"
if ($telepresenceContainer) {
    docker restart $telepresenceContainer
    Write-Host "Telepresence extension restarted" -ForegroundColor Green
} else {
    Write-Host "Telepresence container not found" -ForegroundColor Red
}

# Restart ngrok extension
Write-Host "`nRestarting ngrok extension..." -ForegroundColor Yellow
$ngrokContainer = docker ps -q --filter "name=ngrok"
if ($ngrokContainer) {
    docker restart $ngrokContainer
    Write-Host "ngrok extension restarted" -ForegroundColor Green
} else {
    Write-Host "ngrok container not found" -ForegroundColor Red
}

# Wait for containers to restart
Write-Host "`nWaiting 5 seconds for containers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check for tunnel errors after restart
Write-Host "`nChecking for tunnel errors in logs (last 10):" -ForegroundColor Yellow
docker ps -q | ForEach-Object {
    docker logs $_ 2>&1 | Select-String -Pattern "tunnel" | Select-Object -Last 5
}

Write-Host "`nFix attempt complete. Check logs above for tunnel status." -ForegroundColor Cyan
Write-Host "If errors persist, open Docker Desktop > Extensions > Remote Docker > Settings" -ForegroundColor Yellow
