# Quick Start: Claude Code Bypass Mode in VS Code

## 🚀 Fastest Way to Get Started

### Method 1: Use Helper Script (Recommended)

```bash
# In VS Code terminal (Ctrl+`)
cd your-project
~/launch-claude-bypass.sh
```

Or from PowerShell:
```powershell
cd your-project
C:\Users\scarm\launch-claude-bypass.bat
```

### Method 2: Direct Command

```bash
# In VS Code terminal
claude --dangerously-skip-permissions
```

---

## ⚡ One-Time Setup (Optional)

### Add Terminal Profile to VS Code

1. Press `Ctrl+,` to open Settings
2. Search for "terminal profiles"
3. Click "Edit in settings.json"
4. Copy settings from `vscode-claude-settings.json`

Now you can select "Claude Bypass Mode" from the terminal dropdown!

### Add Keyboard Shortcut (Optional)

1. Press `Ctrl+K Ctrl+S` to open keyboard shortcuts
2. Click the file icon (top right) to edit JSON
3. Copy shortcuts from `vscode-claude-keybindings.json`

Now press `Ctrl+Shift+Alt+C` to launch Claude in bypass mode!

### Add Tasks (Optional)

1. In your project, create `.vscode/tasks.json`
2. Copy from `vscode-claude-tasks.json`
3. Press `Ctrl+Shift+P` > "Tasks: Run Task" > "Launch Claude (Bypass Mode)"

---

## 📝 Files Created

| File | Purpose |
|------|---------|
| `CLAUDE-VSCODE-BYPASS-GUIDE.md` | Complete implementation guide |
| `launch-claude-bypass.sh` | Bash launcher script |
| `launch-claude-bypass.bat` | Windows CMD launcher script |
| `vscode-claude-settings.json` | VS Code settings template |
| `vscode-claude-tasks.json` | VS Code tasks template |
| `vscode-claude-keybindings.json` | VS Code keyboard shortcuts |
| `QUICK-START-BYPASS.md` | This file |

---

## ⚠️ Important Notes

### Extension Limitation
The Claude Code VS Code **extension** cannot be configured to bypass permissions. The only option is:
- Press `Shift+Tab` in Claude chat to auto-accept **file edits only**

For **full bypass**, use the CLI in the terminal (methods above).

### Safety First
```bash
# Before running bypass mode:
git status           # Check what files might be affected
git add -A           # Stage your work
git commit -m "Pre-Claude checkpoint"  # Save a checkpoint
```

### When Bypass Mode is Running
- Claude will execute all commands without asking
- Watch the terminal output
- Press `Ctrl+C` to stop if needed
- Review changes after completion with `git diff`

---

## 🎯 Example Workflow

```bash
# 1. Start in your project
cd ~/my-project

# 2. Make sure git is clean
git status
git commit -am "Checkpoint before Claude"

# 3. Launch Claude in bypass mode
~/launch-claude-bypass.sh

# 4. Give Claude your task
# Claude will work autonomously until done

# 5. Review changes
git diff
git status

# 6. Commit Claude's changes
git add -A
git commit -m "feat: implemented feature via Claude"
```

---

## 🔧 Troubleshooting

### "claude: command not found"
```bash
# Check PATH
echo $PATH | grep .local/bin

# Add to PATH if needed
export PATH="$HOME/.local/bin:$PATH"

# Or use full path
~/.local/bin/claude --dangerously-skip-permissions
```

### Extension still asking for permissions
- **This is expected** - the extension cannot bypass permissions
- Use the CLI method in terminal instead

### Script won't run
```bash
# Make executable
chmod +x ~/launch-claude-bypass.sh

# Test it
~/launch-claude-bypass.sh
```

---

## 📚 Next Steps

- Read [CLAUDE-VSCODE-BYPASS-GUIDE.md](CLAUDE-VSCODE-BYPASS-GUIDE.md) for detailed information
- Configure your VS Code settings for optimal experience
- Set up keyboard shortcuts for quick access
- Review safety best practices before using bypass mode

---

## ✅ Ready to Go!

You now have everything set up to use Claude Code with minimal permission prompts in VS Code.

**Quick command to remember:**
```bash
claude --dangerously-skip-permissions
```

That's it! 🎉
