# Monitoring Dashboard Access

Quick access to your monitoring stack and live system metrics.

## Available Dashboards

Your system has these monitoring tools:
- **Portainer**: http://localhost:9000 (Container management)
- **Dozzle**: http://localhost:8889 (Live logs)

## What to Do

1. **Check if monitoring containers are running**:
   ```bash
   docker ps --filter 'name=portainer' --filter 'name=dozzle' --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
   ```

2. **If user wants to open dashboards**, provide clickable links:
   - Portainer: http://localhost:9000
   - Dozzle: http://localhost:8889

3. **If user wants current metrics**, show:
   ```bash
   docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
   ```

4. **If user wants to see what's being monitored**:
   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E 'portainer|dozzle|postgres|mongo|mysql|redis'
   ```

## Response Format

```
🖥️  MONITORING DASHBOARD ACCESS

Portainer (Container Management): http://localhost:9000
  Status: [✅ Running / ❌ Down]

Dozzle (Live Logs): http://localhost:8889
  Status: [✅ Running / ❌ Down]

Current Resource Usage:
[Show top 5 containers by CPU/Memory]

Click the links above to open dashboards in your browser.
```

Be fast. Just show the info and links.
