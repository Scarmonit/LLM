#!/bin/bash
# Watch what agents are doing in real-time

echo "=============================================="
echo "LIVE AGENT WORK MONITOR"
echo "=============================================="
echo ""
echo "Watching: /tmp/llm_task_results.txt"
echo "Press Ctrl+C to stop"
echo ""
echo "=============================================="
echo ""

tail -f /tmp/llm_task_results.txt
