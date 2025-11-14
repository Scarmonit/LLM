# LM Studio CLI Quick Access

Launch the LM Studio CLI manager for comprehensive model management:

**Bash/WSL:**
```bash
bash ~/.claude/lmstudio-cli-manager.sh
```

**PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File $env:USERPROFILE\.claude\lmstudio-cli-manager.ps1
```

## Quick Commands

Use `lms` directly for specific tasks:

```bash
lms ls                  # List models
lms ps                  # Loaded models
lms load [model]        # Load model
lms get [model]         # Download model
lms server start        # Start server
lms chat                # Start chat
```

## Documentation

- Quick Reference: `~/.claude/LM-STUDIO-CLI-QUICK-REFERENCE.md`
- Complete Guide: `~/.claude/LM-STUDIO-CLI-COMPLETE-GUIDE.md`
