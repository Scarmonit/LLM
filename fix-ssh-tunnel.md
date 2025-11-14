# SSH Tunnel Error Fix

## Error Analysis
```
POST /tunnel/open status:400 error:"Missing required fields"
```

**Root Cause:** Docker Extension attempting to create SSH tunnel without required parameters (username, hostname, port, host, or key).

## Fix Steps

### 1. Check Docker Extension Configuration
```bash
docker extension ls
docker extension inspect <extension-name>
```

### 2. Identify Tunnel Service
```bash
# Find the container with tunnel service
docker ps | grep tunnel
docker logs <container-id> | grep "tunnel/open"
```

### 3. Fix Missing Parameters

**Option A: Update Extension Configuration**
```bash
# If using Docker Extension API
docker extension update <extension-name> --config '{
  "tunnel": {
    "username": "docker",
    "hostname": "localhost",
    "port": 22,
    "host": "127.0.0.1"
  }
}'
```

**Option B: Restart Extension**
```bash
docker extension disable <extension-name>
docker extension enable <extension-name>
```

**Option C: Environment Variables**
```bash
# Set required environment variables
export SSH_TUNNEL_USERNAME="docker"
export SSH_TUNNEL_HOSTNAME="localhost"
export SSH_TUNNEL_PORT="22"
export SSH_TUNNEL_HOST="127.0.0.1"
```

### 4. Common Extensions with SSH Tunnels

- **Docker Desktop Extensions:**
  - Desktop Extensions UI
  - Remote Containers
  - Dev Environments

- **Telepresence:**
```bash
docker extension inspect docker/telepresence-docker-extension
```

- **Portainer:**
```bash
docker extension inspect portainer/portainer-docker-extension
```

### 5. Verify Fix
```bash
# Check logs for successful connection
docker logs $(docker ps -q) 2>&1 | grep "tunnel/open" | tail -5
```

## Quick Fix Script

```bash
#!/bin/bash
# fix-ssh-tunnel.sh

# Find problematic extension
EXTENSION=$(docker extension ls -q | head -1)

echo "Restarting extension: $EXTENSION"
docker extension disable $EXTENSION
docker extension enable $EXTENSION

echo "Checking tunnel status..."
docker logs $(docker ps -q) 2>&1 | grep tunnel | tail -10
```

## Prevention

Add to `.env`:
```env
SSH_TUNNEL_USERNAME=docker
SSH_TUNNEL_HOSTNAME=localhost
SSH_TUNNEL_PORT=22
SSH_TUNNEL_HOST=127.0.0.1
```

## References
- Docker Extension API: https://docs.docker.com/desktop/extensions-sdk/
- SSH Tunnel Configuration: Extension-specific documentation
