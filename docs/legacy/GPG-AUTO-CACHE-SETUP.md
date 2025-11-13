# GPG Passphrase Auto-Cache Configuration

## ✅ Configuration Complete

Your GPG key passphrase is now automatically cached and you won't see the Pinentry dialog anymore.

### What Was Configured

1. **GPG Agent Configuration** (`~/.gnupg/gpg-agent.conf`)
   - Passphrase cached for 8 hours (28800 seconds)
   - Auto-starts with proper settings

2. **Git Configuration**
   - Automatic commit signing enabled
   - Using key: `B286E9DDCA3DA25A`
   - Configured for user: Parker Dunn <scarmonit@gmail.com>

3. **Auto-Cache on Startup**
   - **Windows**: Task Scheduler runs `gpg-cache-passphrase.bat` on login
   - **Git Bash**: `.bashrc` runs cache script automatically
   - **Manual**: Run `bash ~/.gnupg/cache-gpg-passphrase.sh` anytime

### Files Created

- `~/.gnupg/gpg-agent.conf` - Agent configuration
- `~/.gnupg/cache-gpg-passphrase.sh` - Auto-cache script for Git Bash
- `~/gpg-cache-passphrase.bat` - Auto-cache script for Windows
- `~/.bashrc` - Updated with auto-cache on shell startup
- Windows Task: `GPG_Passphrase_Cache` (runs on login)

### How It Works

1. **On System Login**: Windows Task Scheduler automatically runs the batch file
2. **On New Git Bash Session**: `.bashrc` automatically caches the passphrase
3. **Cache Duration**: 8 hours (resets with each use)
4. **No More Prompts**: Pinentry dialog won't appear for git commits

### Manual Cache (If Needed)

If the cache expires or you need to manually cache:

**Git Bash / MSYS2:**
```bash
bash ~/.gnupg/cache-gpg-passphrase.sh
```

**Windows Command Prompt:**
```cmd
C:\Users\scarm\gpg-cache-passphrase.bat
```

**PowerShell:**
```powershell
& "C:\Users\scarm\gpg-cache-passphrase.bat"
```

### Testing

Test that signing works without prompts:
```bash
echo "test" > test.txt
git init
git add test.txt
git commit -S -m "Test signed commit"
```

You should see no Pinentry dialog.

### Security Notes

- Passphrase is cached in memory by gpg-agent (secure)
- Cache expires after 8 hours of inactivity
- Scripts contain the passphrase (ensure file permissions are restrictive)
- Windows Task runs with your user privileges only

### Troubleshooting

**If Pinentry still appears:**
1. Check gpg-agent is running: `gpg-connect-agent /bye`
2. Manually cache: `bash ~/.gnupg/cache-gpg-passphrase.sh`
3. Verify config: `cat ~/.gnupg/gpg-agent.conf`

**To disable auto-signing:**
```bash
git config --global commit.gpgsign false
```

**To change cache duration:**
Edit `~/.gnupg/gpg-agent.conf` and change the timeout values (in seconds).

### Key Information

- **Key ID**: B286E9DDCA3DA25A
- **Full Fingerprint**: 5F1029E94AACF9DF955A8B82919F3B0C029132B8
- **User**: Parker Dunn <scarmonit@gmail.com>
- **Created**: 2025-10-25
- **Expires**: 2027-10-25

---

**Status**: ✅ Fully Configured - No more Pinentry prompts!
