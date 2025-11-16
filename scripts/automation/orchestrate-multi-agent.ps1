# Multi-Agent Orchestrator for Claude Code CLI
# This script launches 4 coordinated Claude instances that work together

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " MULTI-AGENT ORCHESTRATION SYSTEM" -ForegroundColor Green
Write-Host " Claude Code CLI - Coordinated Agents" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$workspaceDir = "C:\Users\scarm\multi-agent-workspace"

# Verify workspace exists
if (-not (Test-Path $workspaceDir)) {
    Write-Host "Error: Workspace not found at $workspaceDir" -ForegroundColor Red
    exit 1
}

Write-Host "Workspace: $workspaceDir" -ForegroundColor Yellow
Write-Host ""

# Create output directories
$agentDirs = @("backend", "frontend", "testing", "documentation")
foreach ($dir in $agentDirs) {
    $path = Join-Path $workspaceDir "agent-outputs\$dir"
    New-Item -ItemType Directory -Force -Path $path | Out-Null
}

Write-Host "Agent roles loaded:" -ForegroundColor Cyan
Write-Host "  Agent 1: Frontend Developer" -ForegroundColor White
Write-Host "  Agent 2: Backend Developer" -ForegroundColor White
Write-Host "  Agent 3: Test Engineer" -ForegroundColor White
Write-Host "  Agent 4: Documentation Specialist" -ForegroundColor White
Write-Host ""

# Initialize coordination status
$statusFile = Join-Path $workspaceDir "coordination-status.json"
$initialStatus = @{
    started = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    agents = @{
        "agent-1" = @{ status = "waiting"; started = $null; completed = $null }
        "agent-2" = @{ status = "ready"; started = $null; completed = $null }
        "agent-3" = @{ status = "waiting"; started = $null; completed = $null }
        "agent-4" = @{ status = "waiting"; started = $null; completed = $null }
    }
}
$initialStatus | ConvertTo-Json -Depth 10 | Set-Content $statusFile

Write-Host "Launching coordinated agents..." -ForegroundColor Green
Write-Host ""

# Agent 2: Backend Developer (Starts First)
Write-Host "[Agent 2] Launching Backend Developer..." -ForegroundColor Magenta
$agent2Prompt = @"
cd $workspaceDir

You are Agent 2: Backend Developer in a multi-agent system.
Your role: Design and implement backend APIs

IMPORTANT: You are part of a coordinated team!
- Agent 1 (Frontend) will READ your API specs
- Agent 3 (Testing) will test your code
- Agent 4 (Documentation) will document your work

Task: Read 'shared-context/project-task.md' and create:
1. API specification in 'agent-outputs/backend/api-spec.md'
2. Python backend code in 'agent-outputs/backend/api-code.py'

Make sure your API spec is clear so Frontend can use it!
"@

Start-Process cmd.exe -ArgumentList "/k", "title AGENT-2-BACKEND && cd /d $workspaceDir && bash -c `"echo '$agent2Prompt' && exec bash`""

Start-Sleep -Seconds 2

# Agent 1: Frontend Developer (Waits for Backend)
Write-Host "[Agent 1] Launching Frontend Developer..." -ForegroundColor Yellow
$agent1Prompt = @"
cd $workspaceDir

You are Agent 1: Frontend Developer in a multi-agent system.
Your role: Build user interfaces

IMPORTANT: You work WITH other agents!
- Wait for Agent 2 (Backend) to create API specs
- Agent 3 (Testing) will test your components
- Agent 4 (Documentation) will document your work

Task:
1. READ 'agent-outputs/backend/api-spec.md' (wait if not ready)
2. Create React component in 'agent-outputs/frontend/TodoApp.jsx'
3. Use the API endpoints from backend spec

Your code must match the backend API!
"@

Start-Process cmd.exe -ArgumentList "/k", "title AGENT-1-FRONTEND && cd /d $workspaceDir && bash -c `"echo '$agent1Prompt' && exec bash`""

Start-Sleep -Seconds 2

# Agent 3: Test Engineer (Waits for Both)
Write-Host "[Agent 3] Launching Test Engineer..." -ForegroundColor Cyan
$agent3Prompt = @"
cd $workspaceDir

You are Agent 3: Test Engineer in a multi-agent system.
Your role: Write comprehensive tests

IMPORTANT: You test OTHER AGENTS' code!
- Wait for Agent 2 (Backend) code
- Wait for Agent 1 (Frontend) code
- Agent 4 (Documentation) will document your tests

Task:
1. READ 'agent-outputs/backend/api-code.py'
2. READ 'agent-outputs/frontend/TodoApp.jsx'
3. Write tests in 'agent-outputs/testing/test-backend.py'
4. Write tests in 'agent-outputs/testing/test-frontend.js'

Reference actual implementation code in your tests!
"@

Start-Process cmd.exe -ArgumentList "/k", "title AGENT-3-TESTING && cd /d $workspaceDir && bash -c `"echo '$agent3Prompt' && exec bash`""

Start-Sleep -Seconds 2

# Agent 4: Documentation Specialist (Waits for All)
Write-Host "[Agent 4] Launching Documentation Specialist..." -ForegroundColor Green
$agent4Prompt = @"
cd $workspaceDir

You are Agent 4: Documentation Specialist in a multi-agent system.
Your role: Document the complete system

IMPORTANT: You document EVERYONE'S work!
- Read Agent 2 (Backend) outputs
- Read Agent 1 (Frontend) outputs
- Read Agent 3 (Testing) outputs
- Create comprehensive documentation

Task:
1. READ all files in 'agent-outputs/backend/', 'agent-outputs/frontend/', 'agent-outputs/testing/'
2. Write complete documentation in 'agent-outputs/documentation/README.md'
3. Include architecture, API docs, and testing guide

Your docs must show understanding of ALL agents' work!
"@

Start-Process cmd.exe -ArgumentList "/k", "title AGENT-4-DOCUMENTATION && cd /d $workspaceDir && bash -c `"echo '$agent4Prompt' && exec bash`""

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " ALL 4 AGENTS LAUNCHED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Agents are now aware of each other and will coordinate work:" -ForegroundColor Yellow
Write-Host "  1. Backend creates API spec" -ForegroundColor White
Write-Host "  2. Frontend reads backend spec and builds UI" -ForegroundColor White
Write-Host "  3. Testing reads both and writes tests" -ForegroundColor White
Write-Host "  4. Documentation reads all and creates docs" -ForegroundColor White
Write-Host ""
Write-Host "Monitor progress in: $workspaceDir\agent-outputs\" -ForegroundColor Cyan
Write-Host ""
Write-Host "Type 'claude' in each agent terminal to start their work!" -ForegroundColor Green
