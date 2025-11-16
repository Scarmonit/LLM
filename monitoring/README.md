# MCP Unified Orchestrator - Monitoring Stack

Complete monitoring infrastructure for MCP servers using industry-standard tools.

## Stack Components

- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards
- **Elasticsearch** - Log storage and indexing
- **Kibana** - Log exploration and analysis
- **Logstash** - Log processing pipeline
- **Node Exporter** - System metrics

## Quick Start

### 1. Start the Monitoring Stack

```bash
cd monitoring
docker-compose up -d
```

### 2. Verify Services

```bash
docker-compose ps
```

All services should show as "Up":
- prometheus (port 9090)
- grafana (port 3000)
- elasticsearch (port 9200)
- kibana (port 5601)
- logstash (port 5044)
- node-exporter (port 9100)

### 3. Access Interfaces

**Prometheus**: http://localhost:9090
- Metrics browser
- Query interface
- Alerts dashboard

**Grafana**: http://localhost:3000
- Default credentials: `admin` / `admin`
- Pre-configured MCP dashboard
- Custom query builder

**Elasticsearch**: http://localhost:9200
- REST API endpoint
- Cluster health: `http://localhost:9200/_cluster/health`

**Kibana**: http://localhost:5601
- Log exploration
- Index management
- Visualizations

## Configuration

### Prometheus Setup

The `prometheus.yml` file includes:
- 15s scrape interval
- All MCP servers as targets
- Node exporter for system metrics
- File-based service discovery

To add a new MCP server:

```yaml
- job_name: 'my-new-server'
  static_configs:
    - targets: ['host.docker.internal:9007']
  metrics_path: '/metrics'
```

### Grafana Dashboard

Import the pre-built dashboard:

1. Open Grafana (http://localhost:3000)
2. Click **+** → **Import**
3. Upload `grafana-dashboard.json`
4. Select Prometheus data source
5. Click **Import**

The dashboard includes:
- Server status overview
- Request/error rates
- CPU/memory usage
- Response time percentiles
- Active connections
- Real-time logs

### Logstash Pipeline

The `logstash.conf` pipeline processes:
- File-based logs from `/var/log/mcp/*.log`
- Beats input on port 5044
- HTTP JSON input on port 8080
- Syslog on port 5000

Logs are indexed to:
- `mcp-logs-YYYY.MM.DD` - All logs
- `mcp-errors-YYYY.MM.DD` - Errors only
- `mcp-metrics-YYYY.MM.DD` - Metrics

### Elasticsearch Indices

Create index patterns in Kibana:

1. Open Kibana → **Management** → **Index Patterns**
2. Create pattern: `mcp-logs-*`
3. Select time field: `@timestamp`
4. Create pattern: `mcp-errors-*`
5. Create pattern: `mcp-metrics-*`

## Sending Data to the Stack

### From MCP CLI Tool

Export metrics to Prometheus:

```bash
node mcp-unified-orchestrator-cli.js export-metrics
```

This creates `mcp-metrics.json` that Prometheus scrapes every 30s.

### Direct HTTP Logging

Send logs directly to Logstash:

```bash
curl -X POST http://localhost:8080 \\
  -H "Content-Type: application/json" \\
  -d '{
    "timestamp": "'$(date -Iseconds)'",
    "level": "info",
    "server_name": "my-server",
    "message": "Server started successfully"
  }'
```

### File-Based Logging

Mount log directory in docker-compose.yml:

```yaml
logstash:
  volumes:
    - ./logs:/var/log/mcp:ro
```

Then write logs to `./logs/*.log`

## Metrics Reference

### Available Metrics

```
# Server status (0=offline, 1=online)
mcp_server_status{server_name="sequential-thinking"} 1

# Total requests processed
mcp_server_requests_total{server_name="sequential-thinking"} 1247

# Total errors
mcp_server_errors_total{server_name="sequential-thinking"} 3

# Server uptime in seconds
mcp_server_uptime_seconds{server_name="sequential-thinking"} 86400

# CPU usage percentage
mcp_server_cpu_percent{server_name="sequential-thinking"} 12.5

# Memory usage in bytes
mcp_server_memory_bytes{server_name="sequential-thinking"} 47185920

# Active connections
mcp_server_active_connections{server_name="sequential-thinking"} 5

# Response time histogram
mcp_server_response_time_bucket{le="50"} 1000
mcp_server_response_time_bucket{le="100"} 1200
mcp_server_response_time_bucket{le="200"} 1240

# Bytes transmitted
mcp_server_bytes_transmitted{server_name="sequential-thinking"} 1048576
```

## Alerting

### Prometheus Alert Rules

Create `alert_rules.yml`:

```yaml
groups:
  - name: mcp_alerts
    interval: 30s
    rules:
      - alert: MCPServerDown
        expr: mcp_server_status == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "MCP Server {{ $labels.server_name }} is down"

      - alert: HighErrorRate
        expr: (rate(mcp_server_errors_total[5m]) / rate(mcp_server_requests_total[5m])) > 0.05
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High error rate on {{ $labels.server_name }}"
```

## Troubleshooting

### Prometheus not scraping

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# View Prometheus logs
docker logs mcp-prometheus
```

### Elasticsearch connection issues

```bash
# Check Elasticsearch health
curl http://localhost:9200/_cluster/health

# View logs
docker logs mcp-elasticsearch
```

### Logstash not processing logs

```bash
# Check Logstash pipeline
docker logs mcp-logstash

# Test log ingestion
echo '2025-11-08T10:00:00Z [INFO] [test] Hello' | nc localhost 5000
```

### Grafana dashboard not loading data

1. Check Data Source connection
2. Verify Prometheus is scraping metrics
3. Check time range selection
4. View browser console for errors

## Stopping the Stack

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (destructive!)
docker-compose down -v
```

## Backup & Restore

### Backup Elasticsearch Data

```bash
docker exec mcp-elasticsearch \\
  curl -X PUT "localhost:9200/_snapshot/backup" \\
  -H 'Content-Type: application/json' \\
  -d '{"type": "fs", "settings": {"location": "/backup"}}'
```

### Backup Grafana Dashboards

```bash
docker exec mcp-grafana \\
  grafana-cli admin export-dashboard > dashboard-backup.json
```

## Performance Tuning

### Elasticsearch

Increase heap size for large datasets:

```yaml
elasticsearch:
  environment:
    - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
```

### Prometheus

Increase retention:

```yaml
prometheus:
  command:
    - '--storage.tsdb.retention.time=30d'
```

---

**For more information**: See main documentation at `MCP-UNIFIED-ORCHESTRATOR-DOCS.md`
