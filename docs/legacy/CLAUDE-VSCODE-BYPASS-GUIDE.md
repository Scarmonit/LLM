# Claude Code VS Code Permission Bypass Implementation Guide

## Status: Implemented Solutions for Auto-Approval

This guide provides all available methods to minimize or bypass permission prompts when using Claude Code with VS Code.

---

## Option 1: CLI in VS Code Terminal (RECOMMENDED & SAFEST)

This is the official and most reliable method.

### Quick Start

1. **Open VS Code integrated terminal** (Ctrl+` or View > Terminal)

2. **Launch Claude with bypass flag:**
   ```bash
   claude --dangerously-skip-permissions
   ```

3. **For specific directories:**
   ```bash
   cd your-project-folder
   claude --dangerously-skip-permissions
   ```

### Advantages
- ✅ Official Anthropic method
- ✅ Full permission bypass
- ✅ Works with all Claude Code features
- ✅ No extension modifications
- ✅ Easy to control and stop

### Helper Script Created
Use the script at: `C:/Users/scarm/launch-claude-bypass.sh`

---

## Option 2: VS Code Extension Auto-Accept Edits (PARTIAL)

The extension has limited auto-approval capabilities.

### What Works
- Auto-accepts file edits (Read/Write/Edit operations)
- Toggle with **Shift+Tab** in the Claude chat panel
- Or check "Edit automatically" checkbox

### What Doesn't Work
- ❌ Still prompts for Bash commands
- ❌ Still prompts for tool operations
- ❌ Still prompts for file operations outside project
- ❌ Cannot fully bypass permissions

### How to Enable
1. Open Claude Code extension in VS Code
2. Press **Shift+Tab** to toggle auto-accept edits mode
3. Look for "Edit automatically" indicator in UI

---

## Option 3: Extension Patcher (ADVANCED - USE AT YOUR RISK)

⚠️ **WARNING**: This modifies extension files. Use only if you understand the risks.

### Third-Party Tool
- Repository: https://github.com/seanGSISG/claude-code-extension-patcher
- Enables bypass mode by patching extension code
- Works with VS Code, Cursor, VS Code Insiders

### Installation Steps (if you choose this route)
```bash
# Clone the patcher
git clone https://github.com/seanGSISG/claude-code-extension-patcher.git
cd claude-code-extension-patcher

# Follow repository instructions to patch
# This will modify your Claude Code extension files
```

### Risks
- ⚠️ Breaks extension integrity
- ⚠️ May stop working after extension updates
- ⚠️ Not officially supported
- ⚠️ Could introduce security issues

---

## Option 4: Configure Trusted Tools (LIMITED SUPPORT)

The extension has limited support for settings-based permissions.

### Edit Settings
File: `C:/Users/scarm/.claude/settings.json`

```json
{
  "autoApproveTools": [
    "Read",
    "Write",
    "Edit",
    "Glob",
    "Grep"
  ],
  "autoApproveGlobs": [
    "**/*.js",
    "**/*.ts",
    "**/*.md",
    "**/*.json"
  ],
  "neverApprovePatterns": [
    "**/.env*",
    "**/.git/**",
    "**/.ssh/**"
  ]
}
```

**Note**: Extension support for these settings is limited compared to CLI.

---

## Recommended Setup: Hybrid Approach

### For Maximum Productivity

1. **Use CLI for autonomous work:**
   - Run `./launch-claude-bypass.sh` for complex multi-step tasks
   - Full permission bypass for uninterrupted work

2. **Use Extension for quick edits:**
   - Enable auto-accept edits (Shift+Tab)
   - Good for interactive coding with safety nets

3. **Configure VS Code workspace:**
   - Set up terminal profiles for quick Claude launch
   - See `vscode-workspace-setup.json` for configuration

---

## Safety Considerations

### When to Use `--dangerously-skip-permissions`

✅ **SAFE:**
- In isolated development environments
- On non-production code
- In Docker containers or VMs
- During rapid prototyping
- When you trust the codebase

❌ **AVOID:**
- On production servers
- With untrusted code
- With sensitive credentials in environment
- In directories with critical system files
- When you're unsure what Claude will do

### Best Practices

1. **Use version control** - Commit before running autonomous sessions
2. **Review changes** - Always review what Claude did after completion
3. **Scope the work** - Start Claude in the specific project directory
4. **Use containers** - Run in Docker/devcontainer for isolation
5. **Backup regularly** - Keep backups of important work

---

## Troubleshooting

### CLI Not Found in VS Code Terminal
```bash
# Check if Claude is in PATH
which claude

# If not found, add to PATH or use full path
/c/Users/scarm/.local/bin/claude --dangerously-skip-permissions
```

### Extension Still Prompting
- The extension **cannot** be fully bypassed - this is by design
- Use CLI method instead for full auto-approval

### Permission Denied Errors
```bash
# Check permissions on Claude binary
ls -la $(which claude)

# Ensure execution permissions
chmod +x ~/.local/bin/claude
```

---

## Quick Reference Commands

```bash
# Launch Claude with full bypass in current directory
claude --dangerously-skip-permissions

# Launch in specific directory
claude --dangerously-skip-permissions /c/Users/scarm/your-project

# Check Claude version
claude --version

# List available MCP servers
claude mcp list

# Run diagnostics
claude doctor
```

---

## VS Code Terminal Integration

### Create Terminal Profile (optional)

Add to VS Code settings.json:
```json
{
  "terminal.integrated.profiles.windows": {
    "Claude Bypass": {
      "path": "C:\\Program Files\\Git\\bin\\bash.exe",
      "args": ["-c", "claude --dangerously-skip-permissions"]
    }
  }
}
```

Then select "Claude Bypass" from terminal dropdown.

---

## Conclusion

**Best Solution**: Use the CLI method (`claude --dangerously-skip-permissions`) in VS Code's integrated terminal. This gives you the full power of Claude Code without extension limitations, while keeping you in your familiar VS Code environment.

**For Safety**: Enable auto-accept edits in the extension (Shift+Tab) for a balance between convenience and safety.

**Avoid**: The extension patcher unless you really understand the risks and are willing to maintain it through extension updates.

---

*Last Updated: 2025-11-09*
*Claude Code Version: 2.0.36*
