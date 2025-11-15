"""Continuous agent runner for autonomous operation."""

import time
from typing import Optional, Dict, Any, List, Callable
import threading
from datetime import datetime
from .core.agent import Agent


class ContinuousAgent:
    """Wrapper for agents that run continuously."""

    def __init__(
        self,
        agent: Agent,
        task_queue: Optional[List[str]] = None,
        interval: int = 60,
        max_iterations: Optional[int] = None
    ):
        """
        Initialize continuous agent.

        Args:
            agent: The agent to run continuously
            task_queue: List of tasks to execute (FIFO queue)
            interval: Time between task checks in seconds
            max_iterations: Maximum iterations before stopping (None for infinite)
        """
        self.agent = agent
        self.task_queue = task_queue or []
        self.interval = interval
        self.max_iterations = max_iterations
        self.is_running = False
        self.iteration_count = 0
        self.results_history: List[Dict[str, Any]] = []
        self._thread: Optional[threading.Thread] = None
        self.on_result_callback: Optional[Callable[[str, str], None]] = None

    def add_task(self, task: str):
        """
        Add a task to the queue.

        Args:
            task: Task description to add
        """
        self.task_queue.append(task)

    def start(self):
        """Start the continuous agent in a background thread."""
        if self.is_running:
            return

        self.is_running = True
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def stop(self):
        """Stop the continuous agent."""
        self.is_running = False
        if self._thread:
            self._thread.join(timeout=5)

    def _run(self):
        """Internal run loop for the continuous agent."""
        while self.is_running:
            # Check if we've hit max iterations
            if self.max_iterations and self.iteration_count >= self.max_iterations:
                self.is_running = False
                break

            # Process tasks from queue
            if self.task_queue:
                task = self.task_queue.pop(0)
                try:
                    result = self.agent.execute(task)

                    # Store result
                    self.results_history.append({
                        "timestamp": datetime.now().isoformat(),
                        "task": task,
                        "result": result,
                        "iteration": self.iteration_count
                    })

                    # Call callback if set
                    if self.on_result_callback:
                        self.on_result_callback(task, result)

                except Exception as e:
                    self.results_history.append({
                        "timestamp": datetime.now().isoformat(),
                        "task": task,
                        "error": str(e),
                        "iteration": self.iteration_count
                    })

                self.iteration_count += 1

            # Wait before next iteration
            time.sleep(self.interval)

    def get_results(self) -> List[Dict[str, Any]]:
        """
        Get all results history.

        Returns:
            List of result dictionaries
        """
        return self.results_history

    def get_status(self) -> Dict[str, Any]:
        """
        Get current status of the continuous agent.

        Returns:
            Status dictionary
        """
        return {
            "agent_name": self.agent.config.name,
            "is_running": self.is_running,
            "iteration_count": self.iteration_count,
            "tasks_pending": len(self.task_queue),
            "results_count": len(self.results_history),
            "max_iterations": self.max_iterations,
            "interval": self.interval
        }
