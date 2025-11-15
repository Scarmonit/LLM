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
        """Internal run loop for the continuous agent - ALWAYS BUSY with real tasks."""
        while self.is_running:
            # Check if we've hit max iterations
            if self.max_iterations and self.iteration_count >= self.max_iterations:
                self.is_running = False
                break

            # ALWAYS add a new task to keep agent continuously busy (never idle)
            self._generate_task()

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

            # Minimal wait before next iteration (always busy)
            time.sleep(self.interval)
    
    def _generate_task(self):
        """Generate a new task based on agent type to keep it busy."""
        agent_name = self.agent.config.name.lower()
        
        # Task templates based on agent type
        if "research" in agent_name:
            tasks = [
                "Analyze current trends in artificial intelligence",
                "Research the latest developments in machine learning",
                "Investigate best practices for AI model deployment",
                "Study the impact of AI on various industries",
                "Examine emerging AI technologies and their applications"
            ]
        elif "coding" in agent_name:
            tasks = [
                "Design a function for data processing",
                "Optimize an algorithm for better performance",
                "Create a code structure for a web service",
                "Develop a solution for error handling",
                "Implement a pattern for asynchronous operations"
            ]
        elif "writing" in agent_name:
            tasks = [
                "Compose a technical blog post introduction",
                "Write about the future of autonomous systems",
                "Create content about AI innovation",
                "Draft an article on technology trends",
                "Develop messaging for AI-powered solutions"
            ]
        else:
            tasks = [
                "Analyze a complex problem",
                "Provide insights on current technology",
                "Explore innovative solutions"
            ]
        
        # Rotate through tasks
        import random
        task = random.choice(tasks)
        self.task_queue.append(task)

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
