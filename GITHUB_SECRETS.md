# GitHub Secrets Configuration Guide

This document lists all the GitHub Secrets that need to be configured for the LLM repository workflows to function properly.

## Required Secrets

Navigate to: **Settings** > **Secrets and variables** > **Actions** > **New repository secret**

### 1. ANTHROPIC_API_KEY
- **Description**: API key for Anthropic Claude AI service
- **Used in**: `auto-review.yml`
- **Purpose**: Enables AI-powered code reviews using Claude
- **How to obtain**: Get from https://console.anthropic.com/
- **Format**: `sk-ant-...`

### 2. OLLAMA_BASE_URL
- **Description**: Base URL for Ollama LLM service
- **Used in**: `auto-review.yml`
- **Purpose**: Local or hosted Ollama endpoint for LLM operations
- **How to obtain**: Your Ollama server URL
- **Format**: `http://localhost:11434` or `https://your-ollama-server.com`

### 3. CLAUDE_API_KEY
- **Description**: API key for Claude AI service (webhook integration)
- **Used in**: `ai-review.yml`
- **Purpose**: Enables Claude webhook integration for AI code reviews
- **How to obtain**: Get from https://console.anthropic.com/
- **Format**: `sk-ant-...`

### 4. GITHUB_TOKEN
- **Description**: GitHub Personal Access Token for API access
- **Used in**: `auto-review.yml`, `ai-review.yml`
- **Purpose**: Authenticate GitHub API calls for PR operations
- **How to obtain**: 
  - Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
  - Generate new token with `repo`, `workflow`, `write:packages` scopes
- **Format**: `ghp_...`
- **Note**: `${{ secrets.GITHUB_TOKEN }}` is auto-provided by GitHub Actions for basic operations, but a PAT may be needed for advanced use cases

## Repository Variables (Not Secrets)

Navigate to: **Settings** > **Secrets and variables** > **Actions** > **Variables** tab

### 1. CLAUDE_WEBHOOK_URL
- **Description**: Webhook URL for Claude AI integration
- **Used in**: `ai-review.yml`
- **Purpose**: External Claude webhook endpoint
- **Format**: `https://your-webhook-url.com/claude`

### 2. GEMINI_WEBHOOK_URL
- **Description**: Webhook URL for Gemini AI integration
- **Used in**: `ai-review.yml`
- **Purpose**: External Gemini webhook endpoint
- **Format**: `https://your-webhook-url.com/gemini`

## Setup Instructions

1. **Navigate to Repository Settings**:
   - Go to https://github.com/Scarmonit/LLM/settings/secrets/actions

2. **Add Each Secret**:
   - Click "New repository secret"
   - Enter the secret name exactly as listed above
   - Paste the secret value
   - Click "Add secret"

3. **Add Variables** (if using webhook integrations):
   - Click the "Variables" tab
   - Click "New repository variable"
   - Enter the variable name and value
   - Click "Add variable"

4. **Verify Configuration**:
   - Check that all secrets show in the list (values are hidden)
   - Trigger a workflow run to test the configuration

## Security Best Practices

- **Never commit secrets** to the repository
- **Rotate keys regularly** for enhanced security
- **Use minimum required scopes** for tokens
- **Monitor secret usage** in workflow logs
- **Keep this document updated** when workflows change

## Current Status

✅ 

✅ **Configured:**
- DOCKER_PASSWORD
- DOCKER_USERNAME

⚠️ **Needs Configuration:**

These secrets must be added in GitHub Settings > Secrets and variables > Actions:

1. **ANTHROPIC_API_KEY** - For AI cod
- ANTHROPIC_API_KEY ✅ (using GitHub_Actions_LLM_Workflows key)
- CLAUDE_API_KEY ✅
- OLLAMA_BASE_URL ✅

**Variables Configured:**
- CLAUDE_WEBHOOK_URL ✅
- GEMINI_WEBHOOK_URL ✅

---

**All Required Configuration Complete! ✅**

The following secrets and variables are now configured and ready for use:

1. ✅ **ANTHROPIC_API_KEY** - GitHub_Actions_LLM_Workflows key created Nov 20, 2025
2. ✅ **OLLAMA_BASE_URL** - Configured for Ollama operations
3. ✅ **CLAUDE_API_KEY** - Configured for Claude webhook integration
4. ✅ **CLAUDE_WEBHOOK_URL** - Repository variable for external Claude webhook
5. ✅ **GEMINI_WEBHOOK_URL** - Repository variable for external Gemini webhook
6. ✅ **DOCKER_PASSWORD** - For Docker operations
7. ✅ **DOCKER_USERNAME** - For Docker operations

**Workflows Status:**
- ✅ AI Code Review workflow: 26 runs
- ✅ Auto Review PR workflow: 32 runs
- ✅ All workflows active and operational

## Workflow Files Reference

- `.github/workflows/auto-review.yml` - Auto-review with AI
- `.github/workflows/ai-review.yml` - AI code review system
- `.github/workflows/auto-merge.yml` - Automated PR merging

**Last Updated**: November 20, 2025  
**Repository**: Scarmonit/LLM
