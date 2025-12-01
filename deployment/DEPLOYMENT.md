# Deployment Guide - Always Running LLM Agents

This guide provides multiple options to ensure your LLM agents are always running.

## Table of Contents
- [Docker (Recommended)](#docker-recommended)
- [systemd (Linux)](#systemd-linux)
- [PM2 (Cross-platform)](#pm2-cross-platform)
- [Supervisor](#supervisor)
- [Troubleshooting](#troubleshooting)

---

## Docker (Recommended)

Docker provides the easiest way to run agents in a containerized environment with automatic restarts.

### Quick Start

1. **Create environment file:**
```bash
cp .env.example .env
# Edit .env with your API keys
```

2. **Start with Docker Compose:**
```bash
docker-compose up -d
```

3. **View logs:**
```bash
docker-compose logs -f llm-agents
```

4. **Stop:**
```bash
docker-compose down
```

### Features
- ✅ Automatic restart on failure
- ✅ Isolated environment
- ✅ Includes Ollama server
- ✅ Easy configuration via environment variables

---

## systemd (Linux)

For production Linux servers, systemd ensures agents start on boot and restart on failure.

### Installation

1. **Run installation script:**
```bash
cd /path/to/LLM
sudo deployment/systemd/install.sh
```

2. **Configure environment:**
```bash
sudo nano /etc/llm-framework/env.conf
# Add your API keys and settings
```

3. **Enable and start service:**
```bash
sudo systemctl enable llm-agents
sudo systemctl start llm-agents
```

### Management

- **Status:** `sudo systemctl status llm-agents`
- **Logs:** `sudo journalctl -u llm-agents -f`
- **Restart:** `sudo systemctl restart llm-agents`
- **Stop:** `sudo systemctl stop llm-agents`

### Features
- ✅ Starts automatically on system boot
- ✅ Restarts on failure (10 second delay)
- ✅ Integrated with system logging
- ✅ Runs as dedicated user for security

---

## PM2 (Cross-platform)

PM2 is a Node.js-based process manager that works on Linux, macOS, and Windows.

### Installation

1. **Install PM2:**
```bash
npm install -g pm2
```

2. **Set environment variables:**
```bash
export ANTHROPIC_API_KEY=your_key
export GITHUB_TOKEN=your_token
export GITHUB_REPO_OWNER=your_username
export GITHUB_REPO_NAME=your_repo
```

3. **Start agents:**
```bash
cd /path/to/LLM
pm2 start deployment/pm2/ecosystem.config.json
```

4. **Enable auto-start on boot:**
```bash
pm2 save
pm2 startup
# Follow the instructions shown
```

### Management

- **Status:** `pm2 status llm-agents`
- **Logs:** `pm2 logs llm-agents`
- **Monitor:** `pm2 monit`
- **Restart:** `pm2 restart llm-agents`
- **Stop:** `pm2 stop llm-agents`

See [deployment/pm2/README.md](pm2/README.md) for details.

### Features
- ✅ Cross-platform support
- ✅ Automatic restart
- ✅ Built-in monitoring
- ✅ Log management

---

## Supervisor

Alternative process manager for Linux.

### Installation

1. **Install Supervisor:**
```bash
sudo apt-get install supervisor  # Ubuntu/Debian
# or
sudo yum install supervisor      # CentOS/RHEL
```

2. **Create configuration:**
```bash
sudo nano /etc/supervisor/conf.d/llm-agents.conf
```

Add:
```ini
[program:llm-agents]
command=/usr/bin/python3 /path/to/LLM/run_continuous.py --agent all --interval 60
directory=/path/to/LLM
user=your_user
autostart=true
autorestart=true
stderr_logfile=/var/log/llm-agents.err.log
stdout_logfile=/var/log/llm-agents.out.log
environment=ANTHROPIC_API_KEY="your_key",GITHUB_TOKEN="your_token"
```

3. **Start:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start llm-agents
```

### Management

- **Status:** `sudo supervisorctl status llm-agents`
- **Logs:** `sudo tail -f /var/log/llm-agents.out.log`
- **Restart:** `sudo supervisorctl restart llm-agents`

---

## Configuration

### Environment Variables

All deployment methods support these environment variables:

```bash
# Required for Claude
ANTHROPIC_API_KEY=your_anthropic_api_key

# Required for GitHub integration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO_OWNER=your_github_username
GITHUB_REPO_NAME=your_repository_name

# Optional
OLLAMA_BASE_URL=http://localhost:11434  # Default Ollama URL
```

### Agent Configuration

Customize which agents run and their interval:

```bash
# Run specific agent
python run_continuous.py --agent research --interval 30

# Run all agents with custom interval
python run_continuous.py --agent all --interval 120

# With GitHub issue integration
python run_continuous.py --agent coding --issue-number 123
```

---

## Monitoring

### Docker
```bash
docker-compose logs -f llm-agents
docker stats llm-agents
```

### systemd
```bash
sudo journalctl -u llm-agents -f
sudo systemctl status llm-agents
```

### PM2
```bash
pm2 logs llm-agents
pm2 monit
```

---

## Troubleshooting

### Agents not starting

1. **Check configuration:**
```bash
# Verify API keys are set
env | grep ANTHROPIC_API_KEY
env | grep GITHUB_TOKEN
```

2. **Check logs:**
```bash
# Docker
docker-compose logs llm-agents

# systemd
sudo journalctl -u llm-agents -n 50

# PM2
pm2 logs llm-agents --lines 50
```

3. **Test manually:**
```bash
python run_continuous.py --agent research --max-iterations 1
```

### Agents crashing

- Check available memory: `free -h`
- Check disk space: `df -h`
- Review error logs
- Ensure all dependencies are installed: `pip install -r requirements.txt`

### Provider issues

1. **Claude not available:**
   - Verify `ANTHROPIC_API_KEY` is set correctly
   - Test: `python -c "import os; print(os.getenv('ANTHROPIC_API_KEY'))"`

2. **Ollama not available:**
   - Ensure Ollama is running: `curl http://localhost:11434/api/tags`
   - Start Ollama: `ollama serve`

### GitHub integration issues

1. **Check token permissions:**
   - Token needs `repo` scope
   - Verify: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user`

2. **Rate limiting:**
   - GitHub API has rate limits
   - Check headers: `curl -I -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit`

---

## Security Best Practices

1. **Never commit API keys** - Use environment variables or config files
2. **Use dedicated service user** - Don't run as root
3. **Restrict file permissions** - `chmod 600` for config files
4. **Use HTTPS** - For GitHub integration
5. **Regular updates** - Keep dependencies updated
6. **Monitor logs** - Watch for suspicious activity

---

## Next Steps

After deployment:

1. ✅ Verify agents are running
2. ✅ Check logs for errors
3. ✅ Test GitHub integration (if configured)
4. ✅ Set up monitoring/alerts
5. ✅ Configure backups for important data

For questions or issues, see the main [README.md](../README.md) or create an issue on GitHub.
