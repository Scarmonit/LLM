@echo off
REM MCP System Unified Startup Script
REM Starts all MCP services in production mode

echo.
echo ================================================================================
echo   MCP Dashboard System - Production Startup
echo ================================================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "MCP_DIR=%SCRIPT_DIR%src\mcp"
set "LOG_DIR=%SCRIPT_DIR%.logs"

REM Create logs directory
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo [%TIME%] Creating logs directory: %LOG_DIR%

REM Kill any existing MCP processes
echo [%TIME%] Stopping existing MCP processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq MCP*" 2>nul

REM Wait for processes to terminate
timeout /t 2 /nobreak >nul

echo.
echo ================================================================================
echo   Starting MCP Services
echo ================================================================================
echo.

REM Start MCP Dashboard Server (HTTP + WebSocket)
echo [%TIME%] Starting MCP Dashboard Server (ports 65030, 65031)...
start "MCP Dashboard Server" /MIN cmd /c "node "%MCP_DIR%\mcp-dashboard-server.js" > "%LOG_DIR%\dashboard-server.log" 2>&1"
timeout /t 3 /nobreak >nul

REM Start MCP Proxy Integration (with authentication)
echo [%TIME%] Starting MCP Proxy Integration (port 65032)...
start "MCP Proxy Integration" /MIN cmd /c "node "%MCP_DIR%\mcp-proxy-auth-integration.js" > "%LOG_DIR%\proxy-integration.log" 2>&1"
timeout /t 2 /nobreak >nul

REM Start Unified Inspector (combines all dashboards)
echo [%TIME%] Starting Unified Inspector (port 65033)...
start "MCP Unified Inspector" /MIN cmd /c "node "%SCRIPT_DIR%serve-unified-inspector.js" > "%LOG_DIR%\unified-inspector.log" 2>&1"
timeout /t 2 /nobreak >nul

echo.
echo ================================================================================
echo   Verifying Services
echo ================================================================================
echo.

REM Wait for services to initialize
echo [%TIME%] Waiting for services to initialize...
timeout /t 5 /nobreak >nul

REM Check if ports are listening
echo [%TIME%] Checking service ports...

netstat -an | findstr ":65030" >nul
if %errorlevel% equ 0 (
    echo    [OK] WebSocket server listening on port 65030
) else (
    echo    [ERROR] WebSocket server NOT listening on port 65030
)

netstat -an | findstr ":65031" >nul
if %errorlevel% equ 0 (
    echo    [OK] HTTP dashboard server listening on port 65031
) else (
    echo    [ERROR] HTTP dashboard server NOT listening on port 65031
)

netstat -an | findstr ":65032" >nul
if %errorlevel% equ 0 (
    echo    [OK] Proxy integration server listening on port 65032
) else (
    echo    [ERROR] Proxy integration server NOT listening on port 65032
)

netstat -an | findstr ":65033" >nul
if %errorlevel% equ 0 (
    echo    [OK] Unified inspector server listening on port 65033
) else (
    echo    [ERROR] Unified inspector server NOT listening on port 65033
)

echo.
echo ================================================================================
echo   Testing API Endpoints
echo ================================================================================
echo.

REM Test dashboard health endpoint
echo [%TIME%] Testing dashboard health endpoint...
curl -s http://localhost:65031/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] Dashboard health endpoint responding
) else (
    echo    [ERROR] Dashboard health endpoint NOT responding
)

REM Test proxy status endpoint
echo [%TIME%] Testing proxy status endpoint...
curl -s "http://localhost:65032/api/status?MCP_PROXY_AUTH_TOKEN=8da7833da35869ec27ce9eb13a1b4926d98a6802303e60cfb6185780ba6eb74c" >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] Proxy status endpoint responding
) else (
    echo    [ERROR] Proxy status endpoint NOT responding
)

echo.
echo ================================================================================
echo   System URLs
echo ================================================================================
echo.
echo    🎯 MAIN INTERFACE:
echo    Unified Inspector:  http://localhost:65033  [RECOMMENDED]
echo.
echo    📊 INDIVIDUAL DASHBOARDS:
echo    Dashboard:          http://localhost:65031
echo    Enhanced Dashboard: http://localhost:65031/enhanced
echo    MCP Inspector:      http://localhost:6274?MCP_PROXY_AUTH_TOKEN=...
echo.
echo    🔌 API ENDPOINTS:
echo    Health API:         http://localhost:65031/api/health
echo    Metrics API:        http://localhost:65031/api/metrics
echo    Proxy API:          http://localhost:65032/api/status?MCP_PROXY_AUTH_TOKEN=...
echo    WebSocket:          ws://localhost:65030
echo.
echo ================================================================================
echo   Logs Location
echo ================================================================================
echo.
echo    %LOG_DIR%\dashboard-server.log
echo    %LOG_DIR%\proxy-integration.log
echo.
echo ================================================================================
echo   MCP System Started Successfully
echo ================================================================================
echo.
echo Press any key to open the dashboard in your browser...
pause >nul

REM Open dashboard in default browser
start http://localhost:65031

echo.
echo Dashboard opened. Press any key to exit (services will continue running)...
pause >nul
