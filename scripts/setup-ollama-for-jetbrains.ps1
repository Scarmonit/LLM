# JetBrains AI Assistant - Ollama Setup Script for Windows
# Run with: powershell -ExecutionPolicy Bypass -File setup-ollama-for-jetbrains.ps1

param(
    [switch]$InstallOllama,
    [switch]$PullModels,
    [switch]$StartServer,
    [switch]$All
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JetBrains AI Assistant - Ollama Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

function Install-Ollama {
    Write-Host "[1/4] Checking Ollama installation..." -ForegroundColor Yellow
    
    $ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue
    
    if ($ollamaPath) {
        Write-Host "  Ollama is already installed at: $($ollamaPath.Source)" -ForegroundColor Green
        $version = & ollama --version 2>&1
        Write-Host "  Version: $version" -ForegroundColor Green
    } else {
        Write-Host "  Ollama not found. Installing via winget..." -ForegroundColor Yellow
        
        try {
            winget install Ollama.Ollama --accept-package-agreements --accept-source-agreements
            Write-Host "  Ollama installed successfully!" -ForegroundColor Green
            
            # Refresh PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        } catch {
            Write-Host "  winget failed. Downloading directly..." -ForegroundColor Yellow
            
            $installerUrl = "https://ollama.com/download/OllamaSetup.exe"
            $installerPath = "$env:TEMP\OllamaSetup.exe"
            
            Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
            Start-Process -FilePath $installerPath -Wait
            
            Write-Host "  Please restart PowerShell after installation completes." -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

function Pull-Models {
    Write-Host "[2/4] Pulling recommended models for JetBrains AI Assistant..." -ForegroundColor Yellow
    Write-Host ""
    
    $models = @(
        @{Name="qwen2.5-coder:7b"; Description="Best for code completion and generation"},
        @{Name="deepseek-coder:6.7b"; Description="Excellent for code understanding"},
        @{Name="codellama:7b"; Description="Meta's code-specialized model"},
        @{Name="llama3.1:8b"; Description="General purpose chat and reasoning"}
    )
    
    foreach ($model in $models) {
        Write-Host "  Pulling $($model.Name)..." -ForegroundColor Cyan
        Write-Host "    ($($model.Description))" -ForegroundColor Gray
        
        try {
            & ollama pull $model.Name
            Write-Host "    Downloaded successfully!" -ForegroundColor Green
        } catch {
            Write-Host "    Failed to download. Error: $_" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    Write-Host "  Available models:" -ForegroundColor Yellow
    & ollama list
    Write-Host ""
}

function Start-OllamaServer {
    Write-Host "[3/4] Starting Ollama server..." -ForegroundColor Yellow
    
    $ollamaProcess = Get-Process ollama -ErrorAction SilentlyContinue
    
    if ($ollamaProcess) {
        Write-Host "  Ollama server is already running (PID: $($ollamaProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "  Starting Ollama service..." -ForegroundColor Yellow
        Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 2
        
        $ollamaProcess = Get-Process ollama -ErrorAction SilentlyContinue
        if ($ollamaProcess) {
            Write-Host "  Ollama server started successfully (PID: $($ollamaProcess.Id))" -ForegroundColor Green
        } else {
            Write-Host "  Warning: Could not verify Ollama server start" -ForegroundColor Yellow
        }
    }
    
    # Test connection
    Write-Host "  Testing API connection..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 5
        Write-Host "  API is responding. Models available: $($response.models.Count)" -ForegroundColor Green
    } catch {
        Write-Host "  Warning: API not responding yet. It may take a moment to start." -ForegroundColor Yellow
    }
    Write-Host ""
}

function Show-JetBrainsConfig {
    Write-Host "[4/4] JetBrains AI Assistant Configuration" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  To configure Ollama in JetBrains IDE:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Open your JetBrains IDE (IntelliJ, PyCharm, etc.)" -ForegroundColor White
    Write-Host "  2. Click the JetBrains AI widget in the toolbar" -ForegroundColor White
    Write-Host "  3. Click 'Offline Mode'" -ForegroundColor White
    Write-Host "  4. Select 'Connect to Ollama'" -ForegroundColor White
    Write-Host "  5. Choose your model (recommended: qwen2.5-coder:7b)" -ForegroundColor White
    Write-Host ""
    Write-Host "  Ollama API Endpoint: http://localhost:11434" -ForegroundColor Green
    Write-Host ""
    Write-Host "  For LM Studio (alternative):" -ForegroundColor Cyan
    Write-Host "  - Download from: https://lmstudio.ai" -ForegroundColor White
    Write-Host "  - Start local server on port 1234" -ForegroundColor White
    Write-Host "  - Endpoint: http://localhost:1234/v1" -ForegroundColor White
    Write-Host ""
}

function Test-OllamaModel {
    param([string]$ModelName = "qwen2.5-coder:7b")
    
    Write-Host "Testing model: $ModelName" -ForegroundColor Yellow
    
    $prompt = "Write a Python function that calculates fibonacci numbers"
    
    try {
        $body = @{
            model = $ModelName
            prompt = $prompt
            stream = $false
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 60
        
        Write-Host "Response:" -ForegroundColor Green
        Write-Host $response.response -ForegroundColor White
    } catch {
        Write-Host "Error testing model: $_" -ForegroundColor Red
    }
}

# Main execution
if ($All -or (-not $InstallOllama -and -not $PullModels -and -not $StartServer)) {
    Install-Ollama
    Pull-Models
    Start-OllamaServer
    Show-JetBrainsConfig
} else {
    if ($InstallOllama) { Install-Ollama }
    if ($PullModels) { Pull-Models }
    if ($StartServer) { Start-OllamaServer }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open your JetBrains IDE" -ForegroundColor White
Write-Host "2. Configure Ollama in AI Assistant settings" -ForegroundColor White
Write-Host "3. Start coding with local AI assistance!" -ForegroundColor White
Write-Host ""
