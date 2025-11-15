#!/usr/bin/env python3
"""
Simple file-based task queue that YOU can add tasks to.
Agents pull from this queue and process YOUR tasks.
"""
import json
import os
from datetime import datetime
from typing import List, Dict, Optional

QUEUE_FILE = '/tmp/agent_task_queue.json'
RESULTS_FILE = '/tmp/agent_task_results.json'

def load_queue() -> List[Dict]:
    """Load task queue from file"""
    if not os.path.exists(QUEUE_FILE):
        return []
    try:
        with open(QUEUE_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_queue(queue: List[Dict]):
    """Save task queue to file"""
    with open(QUEUE_FILE, 'w') as f:
        json.dump(queue, f, indent=2)

def load_results() -> List[Dict]:
    """Load completed results"""
    if not os.path.exists(RESULTS_FILE):
        return []
    try:
        with open(RESULTS_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_results(results: List[Dict]):
    """Save completed results"""
    with open(RESULTS_FILE, 'w') as f:
        json.dump(results, f, indent=2)

def add_task(agent_type: str, task: str, priority: int = 0) -> int:
    """
    Add a task to the queue for an agent to process.
    
    Args:
        agent_type: 'research', 'coding', or 'writing'
        task: The task description
        priority: Higher priority tasks are processed first (default 0)
    
    Returns:
        Task ID
    """
    queue = load_queue()
    task_id = len(queue) + 1
    
    task_entry = {
        'id': task_id,
        'agent_type': agent_type,
        'task': task,
        'priority': priority,
        'status': 'pending',
        'submitted_at': datetime.now().isoformat(),
        'result': None,
        'completed_at': None
    }
    
    queue.append(task_entry)
    save_queue(queue)
    
    print(f"✓ Task #{task_id} added to queue for {agent_type} agent")
    print(f"  Task: {task}")
    return task_id

def get_next_task(agent_type: str) -> Optional[Dict]:
    """Get the next pending task for a specific agent type"""
    queue = load_queue()
    
    # Filter for this agent type and pending status
    pending_tasks = [t for t in queue 
                    if t['agent_type'] == agent_type 
                    and t['status'] == 'pending']
    
    if not pending_tasks:
        return None
    
    # Sort by priority (highest first)
    pending_tasks.sort(key=lambda x: x['priority'], reverse=True)
    
    # Mark as in-progress
    task = pending_tasks[0]
    for t in queue:
        if t['id'] == task['id']:
            t['status'] = 'in-progress'
            break
    
    save_queue(queue)
    return task

def complete_task(task_id: int, result: str):
    """Mark a task as completed with its result"""
    queue = load_queue()
    results = load_results()
    
    for task in queue:
        if task['id'] == task_id:
            task['status'] = 'completed'
            task['result'] = result
            task['completed_at'] = datetime.now().isoformat()
            
            # Add to results
            results.append(task.copy())
            break
    
    save_queue(queue)
    save_results(results)

def view_queue():
    """View all tasks in queue"""
    queue = load_queue()
    
    if not queue:
        print("Queue is empty")
        return
    
    print(f"\n{'='*80}")
    print("TASK QUEUE")
    print(f"{'='*80}\n")
    
    for task in queue:
        print(f"ID: {task['id']}")
        print(f"Agent: {task['agent_type']}")
        print(f"Status: {task['status']}")
        print(f"Priority: {task['priority']}")
        print(f"Task: {task['task']}")
        print(f"Submitted: {task['submitted_at']}")
        if task['result']:
            print(f"Result: {task['result'][:100]}...")
        print(f"{'-'*80}\n")

def view_results():
    """View completed tasks"""
    results = load_results()
    
    if not results:
        print("No completed tasks yet")
        return
    
    print(f"\n{'='*80}")
    print("COMPLETED TASKS")
    print(f"{'='*80}\n")
    
    for task in results:
        print(f"ID: {task['id']}")
        print(f"Agent: {task['agent_type']}")
        print(f"Task: {task['task']}")
        print(f"Completed: {task['completed_at']}")
        print(f"\nResult:\n{task['result']}\n")
        print(f"{'='*80}\n")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Add task:     python task_queue.py add <agent_type> <task>")
        print("  View queue:   python task_queue.py queue")
        print("  View results: python task_queue.py results")
        print("\nAgent types: research, coding, writing")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == 'add' and len(sys.argv) >= 4:
        agent_type = sys.argv[2]
        task = ' '.join(sys.argv[3:])
        add_task(agent_type, task)
    elif cmd == 'queue':
        view_queue()
    elif cmd == 'results':
        view_results()
    else:
        print("Invalid command")
        sys.exit(1)
