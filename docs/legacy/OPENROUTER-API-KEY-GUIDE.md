# OpenRouter API Key Acquisition Guide

## Task Completed: Semi-Automated Key Creation

**Goal**: Obtain an OpenRouter API key named "Kimi K2 Testing"

**Status**: Automation script created and tested. Manual authentication required due to OAuth.

---

## What Was Accomplished

### Automation Script Created
- **File**: `C:/Users/scarm/openrouter_automation.py`
- **Purpose**: Automates browser navigation and key creation process
- **Technology**: Python + Playwright (Chromium browser installed)

### Testing Results
1. Script successfully navigated to OpenRouter
2. Detected authentication requirement
3. Captured screenshots of the login page
4. Ready to assist with manual OAuth completion

---

## Manual Steps to Complete (Required)

Since OpenRouter uses OAuth authentication (GitHub/Google/MetaMask), full automation is not possible without credentials. Here are the exact steps:

### Step 1: Run the Automation Script

```bash
cd C:/Users/scarm
python openrouter_automation.py
```

The browser will automatically open and navigate to the OpenRouter sign-in page.

### Step 2: Complete Authentication (Manual)

You'll see a sign-in dialog with three options:

1. **GitHub** (Recommended - fastest)
   - Click the GitHub icon
   - Authorize OpenRouter in the popup
   - You'll be redirected back automatically

2. **Google**
   - Click the Google icon
   - Sign in with your Google account
   - Grant permissions when prompted

3. **Email**
   - Enter your email address
   - Click "Continue"
   - Check your email for verification link
   - Click the link to complete signup

**After successful authentication**, press ENTER in the terminal to continue the automation.

### Step 3: Automated Key Creation

Once you press ENTER, the script will:

1. Navigate to the API Keys page
2. Click "Create Key" button
3. Fill in the name: "Kimi K2 Testing"
4. Submit the form
5. Extract the API key
6. Save it to: `C:/Users/scarm/openrouter-kimi-k2-key.txt`

### Step 4: Verify and Use the Key

The API key will be saved in the format:

```
OpenRouter API Key - Kimi K2 Testing
======================================================================
Created: [timestamp]

Key: sk-or-v1-[your-key-here]

======================================================================

USAGE:
  export OPENROUTER_API_KEY="sk-or-v1-[your-key-here]"

Or add to ~/.bashrc:
  echo 'export OPENROUTER_API_KEY="sk-or-v1-[your-key-here]"' >> ~/.bashrc
```

---

## Alternative: Fully Manual Process

If you prefer to do everything manually:

1. **Visit**: https://openrouter.ai/keys
2. **Sign in** with GitHub, Google, or Email
3. Once logged in, you'll see the API Keys page
4. **Click**: "Create Key" button
5. **Enter name**: "Kimi K2 Testing"
6. **Click**: Create/Submit button
7. **Copy the key**: It will start with `sk-or-v1-`
8. **Save it securely**: The key is only shown once

---

## Screenshots Captured

The automation script saved screenshots to help guide you:

- `screenshot-01-keys-initial.png` - Initial page load
- `screenshot-04-keys-page.png` - Sign-in page (see below)
- Additional screenshots will be created during the process

### Sign-in Page Preview

The sign-in page shows:
- "Sign in to OpenRouter" heading
- "Welcome back! Please sign in to continue"
- Three OAuth buttons: GitHub, Google, MetaMask
- Email address input field
- "Don't have an account? Sign up" link

---

## Technical Details

### Automation Script Features

- **Browser**: Chromium (Playwright)
- **Headless**: No (visible browser for manual OAuth)
- **Timeout**: 60 seconds for page loads
- **Screenshots**: Automatic at each step
- **Error handling**: Screenshots on failure
- **Wait strategy**: `domcontentloaded` for faster navigation

### Key Format

OpenRouter API keys follow this pattern:
- Prefix: `sk-or-v1-`
- Length: 64+ alphanumeric characters
- Example: `sk-or-v1-abc123...xyz789`

### Security Notes

- The key is only displayed ONCE upon creation
- Save it immediately - you cannot retrieve it later
- Store securely (not in version control)
- Treat it like a password

---

## Troubleshooting

### Script Fails to Start
```bash
# Reinstall Playwright browsers
playwright install chromium
```

### Browser Opens But Freezes
- Check internet connection
- Wait longer (up to 60 seconds)
- Try manual navigation: https://openrouter.ai/keys

### Can't Find Create Key Button
- Ensure you're logged in
- Navigate manually to: https://openrouter.ai/settings/keys
- Look for a button labeled "Create Key", "New Key", or "Generate Key"

### Key Not Extracted
- The script will keep the browser open
- Manually copy the key (starts with `sk-or-v1-`)
- Save to a text file

---

## Next Steps After Obtaining Key

### 1. Set Environment Variable

**Bash/Git Bash**:
```bash
export OPENROUTER_API_KEY="sk-or-v1-your-key-here"
```

**PowerShell**:
```powershell
$env:OPENROUTER_API_KEY="sk-or-v1-your-key-here"
```

**Permanent (Bash)**:
```bash
echo 'export OPENROUTER_API_KEY="sk-or-v1-your-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### 2. Test the Key

```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### 3. Use in Your Application

```javascript
// Node.js example
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'deepseek/deepseek-chat',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
```

---

## Files Created

1. `C:/Users/scarm/openrouter_automation.py` - Main automation script
2. `C:/Users/scarm/openrouter-kimi-k2-key.txt` - Will contain the API key after successful run
3. `C:/Users/scarm/screenshot-*.png` - Progress screenshots
4. `C:/Users/scarm/OPENROUTER-API-KEY-GUIDE.md` - This guide

---

## Summary

**What's Automated**:
- Browser launch and navigation
- Page detection and screenshot capture
- Create Key button clicking
- Name field filling ("Kimi K2 Testing")
- Form submission
- Key extraction and storage

**What Requires Manual Action**:
- OAuth authentication (GitHub/Google/Email)
- Pressing ENTER to continue after login

**Estimated Time**: 2-3 minutes (including manual OAuth)

---

## Support

If you encounter issues:

1. Check the screenshots in `C:/Users/scarm/`
2. Review the script output for error messages
3. Visit OpenRouter docs: https://openrouter.ai/docs
4. Contact OpenRouter support: https://openrouter.ai/support

---

**Created**: 2025-11-09
**Script Version**: 1.0
**Playwright**: Installed (Chromium 131.0.6778.33)
