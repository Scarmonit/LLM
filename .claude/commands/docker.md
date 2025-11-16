# Docker Operations Helper

Quick Docker operations and diagnostics.

## Parse User Intent

The user will say something like:
- "show containers" / "ps" / "list"
- "restart [container]"
- "logs [container]"
- "stop [container]"
- "start [container]"
- "stats" / "performance"
- "clean" / "cleanup"
- "images"

## Actions

### List Containers
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Show Specific Container
```bash
docker ps --filter "name=<container_name>"
docker inspect <container_name> --format='{{json .State}}' | jq
```

### Logs
```bash
docker logs <container_name> --tail 50 --timestamps
```

### Restart Container
```bash
docker restart <container_name>
docker ps --filter "name=<container_name>"
```

### Container Stats
```bash
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

### Cleanup
```bash
docker system prune -f
docker volume prune -f
docker image prune -f
```

### Show Images
```bash
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

## Instructions

1. **Parse what the user wants** from their request
2. **Execute the appropriate Docker command** using Bash
3. **Show clear, formatted output**
4. **Suggest related actions** if relevant

Be fast and concise. No fluff.
