# Automated Multi-Claude Demo
# Shows parallel workflow in action

# Launch controller and send automated commands
$commands = @(
    "status",
    "1 Create a REST API endpoint POST /api/users with Express.js and TypeScript",
    "2 Create a React UserRegistration component with form validation",
    "3 Write integration tests for the user registration flow",
    "status"
)

# Create process for controller
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "powershell.exe"
$psi.Arguments = "-ExecutionPolicy", "Bypass", "-File", "C:\Users\scarm\multi-claude-controller.ps1"
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.CreateNoWindow = $false

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $psi
$process.Start() | Out-Null

Write-Host "=== Multi-Claude Demo Started ===" -ForegroundColor Magenta
Write-Host "Waiting for controller to initialize..." -ForegroundColor Yellow

# Wait for initialization
Start-Sleep -Seconds 15

# Send commands
foreach ($cmd in $commands) {
    Write-Host "`n>>> Sending: $cmd" -ForegroundColor Cyan
    $process.StandardInput.WriteLine($cmd)
    $process.StandardInput.Flush()
    Start-Sleep -Seconds 3
    
    # Read output
    while ($process.StandardOutput.Peek() -gt -1) {
        $line = $process.StandardOutput.ReadLine()
        Write-Host $line
    }
}

Write-Host "`n=== Letting instances work for 30 seconds ===" -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check status again
Write-Host "`n>>> Sending: status" -ForegroundColor Cyan
$process.StandardInput.WriteLine("status")
$process.StandardInput.Flush()
Start-Sleep -Seconds 2

# Read final output
while ($process.StandardOutput.Peek() -gt -1) {
    $line = $process.StandardOutput.ReadLine()
    Write-Host $line
}

# Quit
Write-Host "`n>>> Sending: quit" -ForegroundColor Cyan
$process.StandardInput.WriteLine("quit")
$process.StandardInput.Flush()
Start-Sleep -Seconds 2

Write-Host "`n=== Demo Complete ===" -ForegroundColor Magenta
