@echo off
REM MCP System Shutdown Script

echo.
echo ================================================================================
echo   Stopping MCP Dashboard System
echo ================================================================================
echo.

echo [%TIME%] Stopping all MCP processes...

REM Stop MCP Dashboard Server
taskkill /F /FI "WINDOWTITLE eq MCP Dashboard Server*" 2>nul

REM Stop MCP Proxy Integration
taskkill /F /FI "WINDOWTITLE eq MCP Proxy Integration*" 2>nul

REM Stop all node processes with MCP in window title
taskkill /F /IM node.exe /FI "WINDOWTITLE eq MCP*" 2>nul

echo.
echo [%TIME%] All MCP services stopped.
echo.

pause
