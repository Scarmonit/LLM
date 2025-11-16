# System Health Check

Run a comprehensive health check of your Docker/WSL infrastructure.

## What to Check

Use MCPs to check:
1. **Docker containers** - Get status of all containers
2. **Critical services** - Portainer, Dozzle, databases
3. **Disk usage** - Check available space
4. **Recent logs** - Any errors or warnings

## Instructions

You MUST use MCPs for this check:

1. **Use Bash** to check Docker container status:
   ```
   docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
   ```

2. **Use Bash** to check specific services:
   ```
   docker ps --filter 'name=portainer' --filter 'name=dozzle' --filter 'name=postgres' --filter 'name=mongo'
   ```

3. **Use Bash** to check disk space:
   ```
   df -h | grep -E '(Filesystem|/$|/mnt/)'
   ```

4. **Use Bash** to check for container errors (last 30 minutes):
   ```
   docker ps -a --filter "status=exited" --filter "status=dead"
   ```

5. **Report findings** in a clear table format:
   - ✅ Healthy services (green)
   - ⚠️ Warning conditions (yellow)
   - ❌ Failed services (red)

## Output Format

```
=== SYSTEM HEALTH CHECK ===

🐳 Docker Containers: XX running
📊 Monitoring: Portainer ✅ | Dozzle ✅
💾 Databases: PostgreSQL ✅ | MongoDB ✅ | MySQL ✅ | Redis ✅
💿 Disk Usage: XX% used (XXX GB free)
⚠️ Issues: None / [List any issues]

Status: HEALTHY / DEGRADED / CRITICAL
```

Be concise. Only show problems if they exist.
