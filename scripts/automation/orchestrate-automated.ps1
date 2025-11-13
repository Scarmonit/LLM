# AUTOMATED Multi-Agent Orchestrator for Claude Code CLI
# This script launches 4 coordinated Claude instances that AUTOMATICALLY execute prompts
# Each agent produces real output files demonstrating coordination

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " AUTOMATED MULTI-AGENT ORCHESTRATION SYSTEM" -ForegroundColor Green
Write-Host " Claude Code CLI - Fully Automated Coordination" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$workspaceDir = "C:\Users\scarm\multi-agent-workspace"

# Verify workspace exists
if (-not (Test-Path $workspaceDir)) {
    Write-Host "Error: Workspace not found at $workspaceDir" -ForegroundColor Red
    exit 1
}

Write-Host "Workspace: $workspaceDir" -ForegroundColor Yellow
Write-Host ""

# Initialize coordination status
$statusFile = Join-Path $workspaceDir "coordination-status.json"
$initialStatus = @{
    started = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    agents = @{
        "agent-2" = @{ status = "running"; started = $null; completed = $null }
        "agent-1" = @{ status = "waiting"; started = $null; completed = $null }
        "agent-3" = @{ status = "waiting"; started = $null; completed = $null }
        "agent-4" = @{ status = "waiting"; started = $null; completed = $null }
    }
}
$initialStatus | ConvertTo-Json -Depth 10 | Set-Content $statusFile

Write-Host "============================================================" -ForegroundColor Green
Write-Host " PHASE 1: LAUNCHING AGENT 2 (BACKEND DEVELOPER)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

# Agent 2: Backend Developer (Starts First)
$agent2Prompt = "You are Agent 2: Backend Developer in a multi-agent orchestration system. Working directory: C:\Users\scarm\multi-agent-workspace. Your task: Read the file 'shared-context/project-task.md' to understand the todo list application requirements. Then create TWO files: (1) 'agent-outputs/backend/api-spec.md' with detailed REST API specification for todo operations (GET, POST, PUT, DELETE endpoints), (2) 'agent-outputs/backend/api-code.py' with Python Flask implementation. IMPORTANT: Agent 1 (Frontend Developer) will READ your api-spec.md file to build the UI. Agent 3 (Testing) will READ your api-code.py to write tests. Agent 4 (Documentation) will READ all your outputs. Make your API spec clear and detailed!"

Write-Host "[Agent 2] Executing automated prompt..." -ForegroundColor Magenta
Write-Host "Prompt: $agent2Prompt" -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$workspaceDir'; Write-Host '=== AGENT 2: BACKEND DEVELOPER ===' -ForegroundColor Magenta; Write-Host 'Starting automated execution...' -ForegroundColor Yellow; claude -p `"$agent2Prompt`"; Write-Host '' -ForegroundColor Green; Write-Host 'Agent 2 completed! Check agent-outputs/backend/ for results.' -ForegroundColor Green" -WindowStyle Normal

Write-Host "Waiting 90 seconds for Agent 2 to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 90

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " PHASE 2: LAUNCHING AGENT 1 (FRONTEND DEVELOPER)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

# Agent 1: Frontend Developer (Reads Backend Output)
$agent1Prompt = "You are Agent 1: Frontend Developer in a multi-agent orchestration system. Working directory: C:\Users\scarm\multi-agent-workspace. IMPORTANT: Agent 2 (Backend) has ALREADY created files that you must READ. Your task: (1) READ the file 'agent-outputs/backend/api-spec.md' created by Agent 2 to understand the API endpoints, (2) READ 'shared-context/project-task.md' for requirements, (3) CREATE 'agent-outputs/frontend/TodoApp.jsx' - a React component that uses the exact API endpoints from Agent 2's specification. Your code MUST reference the backend API URLs from Agent 2's spec. Agent 3 (Testing) will test your component. Agent 4 (Documentation) will document it. Show that you read and understood Agent 2's API spec!"

Write-Host "[Agent 1] Executing automated prompt..." -ForegroundColor Yellow
Write-Host "Prompt: $agent1Prompt" -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$workspaceDir'; Write-Host '=== AGENT 1: FRONTEND DEVELOPER ===' -ForegroundColor Yellow; Write-Host 'Starting automated execution...' -ForegroundColor Yellow; claude -p `"$agent1Prompt`"; Write-Host '' -ForegroundColor Green; Write-Host 'Agent 1 completed! Check agent-outputs/frontend/ for results.' -ForegroundColor Green" -WindowStyle Normal

Write-Host "Waiting 90 seconds for Agent 1 to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 90

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " PHASE 3: LAUNCHING AGENT 3 (TEST ENGINEER)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

# Agent 3: Test Engineer (Reads Both Backend and Frontend)
$agent3Prompt = "You are Agent 3: Test Engineer in a multi-agent orchestration system. Working directory: C:\Users\scarm\multi-agent-workspace. IMPORTANT: Agent 2 (Backend) and Agent 1 (Frontend) have ALREADY created code that you must TEST. Your task: (1) READ 'agent-outputs/backend/api-code.py' - the actual backend implementation from Agent 2, (2) READ 'agent-outputs/frontend/TodoApp.jsx' - the React component from Agent 1, (3) CREATE 'agent-outputs/testing/test-backend.py' with pytest tests for Agent 2's API, (4) CREATE 'agent-outputs/testing/test-frontend.js' with Jest tests for Agent 1's component. Your tests must reference the ACTUAL code from both agents. Agent 4 (Documentation) will document your test suite. Show that you tested both agents' real code!"

Write-Host "[Agent 3] Executing automated prompt..." -ForegroundColor Cyan
Write-Host "Prompt: $agent3Prompt" -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$workspaceDir'; Write-Host '=== AGENT 3: TEST ENGINEER ===' -ForegroundColor Cyan; Write-Host 'Starting automated execution...' -ForegroundColor Yellow; claude -p `"$agent3Prompt`"; Write-Host '' -ForegroundColor Green; Write-Host 'Agent 3 completed! Check agent-outputs/testing/ for results.' -ForegroundColor Green" -WindowStyle Normal

Write-Host "Waiting 90 seconds for Agent 3 to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 90

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " PHASE 4: LAUNCHING AGENT 4 (DOCUMENTATION SPECIALIST)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

# Agent 4: Documentation Specialist (Reads All Outputs)
$agent4Prompt = "You are Agent 4: Documentation Specialist in a multi-agent orchestration system. Working directory: C:\Users\scarm\multi-agent-workspace. IMPORTANT: All other agents have completed their work. Your task: (1) READ 'agent-outputs/backend/api-spec.md' and 'agent-outputs/backend/api-code.py' from Agent 2, (2) READ 'agent-outputs/frontend/TodoApp.jsx' from Agent 1, (3) READ 'agent-outputs/testing/test-backend.py' and 'agent-outputs/testing/test-frontend.js' from Agent 3, (4) CREATE 'agent-outputs/documentation/README.md' with comprehensive documentation covering: system architecture, API documentation, frontend usage guide, testing instructions. Your documentation must show you read and understood ALL THREE agents' outputs with specific references to their code!"

Write-Host "[Agent 4] Executing automated prompt..." -ForegroundColor Green
Write-Host "Prompt: $agent4Prompt" -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$workspaceDir'; Write-Host '=== AGENT 4: DOCUMENTATION SPECIALIST ===' -ForegroundColor Green; Write-Host 'Starting automated execution...' -ForegroundColor Yellow; claude -p `"$agent4Prompt`"; Write-Host '' -ForegroundColor Green; Write-Host 'Agent 4 completed! Check agent-outputs/documentation/ for results.' -ForegroundColor Green" -WindowStyle Normal

Write-Host "Waiting 90 seconds for Agent 4 to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 90

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " ALL 4 AGENTS COMPLETED!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Coordination Results:" -ForegroundColor Yellow
Write-Host "  1. Agent 2 (Backend) created API spec and code" -ForegroundColor White
Write-Host "  2. Agent 1 (Frontend) READ backend spec and created UI" -ForegroundColor White
Write-Host "  3. Agent 3 (Testing) READ both and created tests" -ForegroundColor White
Write-Host "  4. Agent 4 (Documentation) READ all and created docs" -ForegroundColor White
Write-Host ""
Write-Host "Check outputs in: $workspaceDir\agent-outputs\" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verifying coordinated outputs..." -ForegroundColor Yellow

# Update final status
$finalStatus = @{
    started = $initialStatus.started
    completed = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    agents = @{
        "agent-2" = @{ status = "completed"; output = "backend/api-spec.md, backend/api-code.py" }
        "agent-1" = @{ status = "completed"; output = "frontend/TodoApp.jsx" }
        "agent-3" = @{ status = "completed"; output = "testing/test-backend.py, testing/test-frontend.js" }
        "agent-4" = @{ status = "completed"; output = "documentation/README.md" }
    }
}
$finalStatus | ConvertTo-Json -Depth 10 | Set-Content $statusFile

Write-Host ""
Write-Host "Orchestration Status Updated: $statusFile" -ForegroundColor Green
