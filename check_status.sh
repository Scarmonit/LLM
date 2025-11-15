#!/bin/bash
# Script to verify agents are actively running

echo "==================================="
echo "LLM Agents Status Verification"
echo "==================================="
echo ""

# Check if process is running
PID=$(ps aux | grep "run_production.py" | grep -v grep | awk '{print $2}')

if [ -z "$PID" ]; then
    echo "❌ Agents are NOT running"
    echo ""
    echo "To start agents:"
    echo "  python run_production.py --agent all --interval 15 &"
    exit 1
else
    echo "✅ Agents are RUNNING (PID: $PID)"
    echo ""
fi

# Check log file
LOG_FILE="/tmp/llm_production_v2.log"
if [ ! -f "$LOG_FILE" ]; then
    LOG_FILE="/tmp/llm_production.log"
fi

if [ -f "$LOG_FILE" ]; then
    echo "Recent activity:"
    echo "----------------"
    tail -15 "$LOG_FILE" | grep -E "(INFO|Status|Running|Iterations)" | tail -10
    echo ""
    
    # Check for agent status
    if grep -q "Agent Status" "$LOG_FILE"; then
        echo "✅ Agents are actively processing tasks"
        echo ""
        echo "Latest status:"
        grep "Agent Status" "$LOG_FILE" -A 5 | tail -6
    else
        echo "⏳ Waiting for first status update..."
    fi
else
    echo "⚠️  Log file not found: $LOG_FILE"
fi

echo ""
echo "==================================="
echo "To view live logs:"
echo "  tail -f $LOG_FILE"
echo ""
echo "To stop agents:"
echo "  kill $PID"
echo "==================================="
