# Multiple Claude Code Terminals Guide

This guide explains how to run multiple Claude Code instances in parallel using VS Code split terminal panes.

## 🎯 What This Does

Allows you to run 4 independent Claude Code CLI sessions simultaneously in VS Code split terminal panes. Each instance:
- Has its own separate context and memory
- Works independently without interfering with others
- Can handle different tasks in parallel
- Maintains its own conversation history

## 📋 Prerequisites

- VS Code installed
- Claude Code CLI installed (`claude` command available)
- Git Bash or similar bash shell configured in VS Code

## 🚀 Quick Start - VS Code Method (Recommended)

### Setup

The `tasks.json` file has already been created in `.vscode/tasks.json` with 4 Claude terminal configurations.

### Usage

1. **Open Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)

2. **Run Task**: Type and select `Tasks: Run Task`

3. **Select Task**: Choose `Launch All Claude Terminals`

4. **Result**: VS Code will open 4 split terminal panes, each showing:
   ```
   === Claude Terminal [1-4] === Type: claude
   ```

5. **Start Claude**: In each terminal pane, type:
   ```bash
   claude
   ```

6. **Work Independently**: Each Claude instance now runs separately!

### Manual Splitting (Alternative)

If you prefer manual control:

1. Open a terminal in VS Code (`Ctrl+``)
2. Click the split terminal icon or press `Ctrl+Shift+5`
3. Repeat to create more panes
4. Type `claude` in each pane

## 🪟 Alternative: Windows Terminal Method

If you prefer using Windows Terminal with split panes, use the PowerShell scripts provided:

### Option 1: Direct Launch Script
```powershell
.\launch-multi-claude-terminals.ps1
```

### Option 2: Manual Windows Terminal
```powershell
# Press Win+R and run:
wt -d C:\Users\scarm --title "Claude 1" bash ; split-pane -V -d C:\Users\scarm --title "Claude 2" bash ; split-pane -H -d C:\Users\scarm --title "Claude 3" bash
```

## ✅ Verifying Independence

To test that each Claude instance is truly independent:

### Test 1: Different Tasks
- **Terminal 1**: "Write a Python function to calculate fibonacci"
- **Terminal 2**: "Write a JavaScript REST API example"
- **Terminal 3**: "Explain quantum computing"
- **Terminal 4**: "Debug this code: [paste code]"

Each should maintain its own context without mixing information.

### Test 2: Context Memory
- Ask Terminal 1: "Remember: my favorite color is blue"
- Ask Terminal 2: "What's my favorite color?"
- Terminal 2 should NOT know (proving independence)

### Test 3: Parallel Work
- Have all 4 terminals working on different parts of a project simultaneously
- Example:
  - Terminal 1: Frontend component
  - Terminal 2: Backend API
  - Terminal 3: Database schema
  - Terminal 4: Documentation

## 📁 Files Created

- `.vscode/tasks.json` - VS Code task configuration for split terminals
- `launch-multi-claude-terminals.ps1` - PowerShell script for Windows Terminal
- `Take-Screenshot.ps1` - Utility to capture screenshots
- `MULTIPLE-CLAUDE-TERMINALS-GUIDE.md` - This guide

## 🔧 Troubleshooting

### Claude command not found
Add Claude to your PATH:
```powershell
# Check where claude is installed
Get-Command claude

# If not in PATH, add it (example)
$env:PATH += ";C:\Users\scarm\.local\bin"
```

### VS Code terminal not using bash
1. Open VS Code Settings (`Ctrl+,`)
2. Search for "terminal integrated shell"
3. Set default profile to Git Bash or your preferred bash

### Split terminals not appearing
- Ensure all tasks have matching `presentation.group` value
- Check that VS Code is up to date
- Try running tasks individually first

## 💡 Use Cases

### 1. **Parallel Feature Development**
- Terminal 1: Implementing authentication
- Terminal 2: Building dashboard UI
- Terminal 3: Writing API endpoints
- Terminal 4: Creating tests

### 2. **Code Review Workflow**
- Terminal 1: Writing new code
- Terminal 2: Reviewing and suggesting improvements
- Terminal 3: Writing tests
- Terminal 4: Updating documentation

### 3. **Multi-Language Projects**
- Terminal 1: Python backend
- Terminal 2: JavaScript frontend
- Terminal 3: SQL database
- Terminal 4: DevOps/deployment

### 4. **Learning & Research**
- Terminal 1: Learning new concept
- Terminal 2: Writing practice code
- Terminal 3: Debugging issues
- Terminal 4: Documenting learnings

## ⚠️ Important Notes

- Each Claude instance consumes API tokens independently
- Monitor your usage across all instances
- Close instances you're not actively using
- Each instance maintains separate conversation history

## 🎓 Tips

1. **Name Your Terminals**: Use `--title` flag to identify each pane's purpose
2. **Save Sessions**: Document what each terminal is working on
3. **Coordinate Work**: Use comments or a shared doc to track parallel progress
4. **Resource Management**: Don't run more instances than you need

## 📞 Support

For issues or questions:
- Claude Code docs: https://docs.claude.com
- Report issues: https://github.com/anthropics/claude-code/issues

---

**Created**: November 2025
**Updated**: Auto-generated by Claude Code
