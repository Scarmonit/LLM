#!/bin/bash
# Health Check Monitor Script
# Monitors critical Docker containers and logs issues

LOG_FILE="/var/log/container-health.log"
ALERT_THRESHOLD=3  # Number of consecutive failures before alert

# Initialize counters file
COUNTER_FILE="/tmp/health-counters.txt"
touch "$COUNTER_FILE"

echo "=== Container Health Check: $(date) ===" | tee -a "$LOG_FILE"

# Critical containers to monitor
CRITICAL_CONTAINERS=(
    "aws-mcp-server"
    "terraform-mcp-server"
    "playwright-mcp-server"
    "claude-postgres"
    "claude-mysql"
    "claude-mongodb"
    "newfolder2-redis-1"
    "newfolder2-postgres-1"
    "open-webui-custom"
)

check_container() {
    local container=$1
    local status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null)
    local health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' "$container" 2>/dev/null)

    if [ -z "$status" ]; then
        echo "⚠️  $container: NOT FOUND" | tee -a "$LOG_FILE"
        return 1
    fi

    if [ "$status" != "running" ]; then
        echo "❌ $container: $status" | tee -a "$LOG_FILE"
        increment_counter "$container"
        return 1
    fi

    if [ "$health" != "N/A" ] && [ "$health" != "healthy" ]; then
        echo "⚠️  $container: $status but $health" | tee -a "$LOG_FILE"
        increment_counter "$container"
        return 1
    fi

    echo "✅ $container: $status $([ "$health" != "N/A" ] && echo "($health)" || echo "")" | tee -a "$LOG_FILE"
    reset_counter "$container"
    return 0
}

increment_counter() {
    local container=$1
    local current=$(grep "^$container:" "$COUNTER_FILE" | cut -d: -f2)
    current=${current:-0}
    new_count=$((current + 1))

    sed -i "/^$container:/d" "$COUNTER_FILE"
    echo "$container:$new_count" >> "$COUNTER_FILE"

    if [ "$new_count" -ge "$ALERT_THRESHOLD" ]; then
        echo "🚨 ALERT: $container has failed $new_count consecutive checks!" | tee -a "$LOG_FILE"
        # TODO: Send alert notification (email, Slack, etc.)
    fi
}

reset_counter() {
    local container=$1
    sed -i "/^$container:/d" "$COUNTER_FILE"
}

# Check all critical containers
failed_count=0
for container in "${CRITICAL_CONTAINERS[@]}"; do
    if ! check_container "$container"; then
        ((failed_count++))
    fi
done

# Summary
echo "---" | tee -a "$LOG_FILE"
echo "Total Checks: ${#CRITICAL_CONTAINERS[@]}, Failed: $failed_count" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Exit with status code
exit $failed_count
