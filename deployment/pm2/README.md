# PM2 Deployment Guide for LLM Agents

## Prerequisites

Install PM2 (Node.js process manager):
```bash
npm install -g pm2
```

## Quick Start

1. Navigate to the project directory:
```bash
cd /path/to/LLM
```

2. Set up environment variables:
```bash
export ANTHROPIC_API_KEY=your_key
export GITHUB_TOKEN=your_token
export GITHUB_REPO_OWNER=your_username
export GITHUB_REPO_NAME=your_repo
```

3. Start the agents with PM2:
```bash
pm2 start deployment/pm2/ecosystem.config.json
```

## Management Commands

- **Start agents:** `pm2 start llm-agents`
- **Stop agents:** `pm2 stop llm-agents`
- **Restart agents:** `pm2 restart llm-agents`
- **View logs:** `pm2 logs llm-agents`
- **Monitor:** `pm2 monit`
- **List processes:** `pm2 list`

## Auto-start on System Boot

Save the PM2 process list and configure auto-start:
```bash
pm2 save
pm2 startup
```

This will generate a command to run (with sudo) to enable PM2 on system startup.

## View Status

```bash
pm2 status llm-agents
```

## Logs

Logs are stored in `./logs/` directory:
- `err.log` - Error logs
- `out.log` - Standard output logs

View real-time logs:
```bash
pm2 logs llm-agents --lines 100
```
