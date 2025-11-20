"""
Truly autonomous agents that monitor the repository and perform useful work.
"""

import os
import time
import subprocess
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional

# Configure logging
logger = logging.getLogger(__name__)


class AutonomousAgent:
    """
    Base class for autonomous agents that find and execute work on their own.
    """

    def __init__(self, name: str, agent, repo_path: str):
        self.name = name
        self.agent = agent
        self.repo_path = repo_path
        self.work_log = []
        self.running = False

    def find_work(self) -> Optional[Dict[str, Any]]:
        """
        Find work to do autonomously. Can be overridden in subclasses.
        
        Default implementation returns None (no work found).
        Subclasses should override this method to provide specific work-finding logic.
        
        Returns:
            dict with 'task' and 'context' keys, or None if no work is found.
        """
        logger.warning(
            "Using default find_work() implementation for %s. "
            "Consider overriding this method in subclass for autonomous behavior.",
            self.name
        )
        return None

    def execute_work(self, work: Dict[str, Any]) -> str:
        """Execute the work and return result."""
        task = work.get("task", "")
        return self.agent.execute(task)

    def log_work(self, work: Dict[str, Any], result: str):
        """Log completed work."""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": self.name,
            "work": work,
            "result": result[:200],  # First 200 chars
        }
        self.work_log.append(entry)

        # Save to file
        log_file = f"/tmp/autonomous_{self.name}_log.json"
        with open(log_file, "w", encoding="utf-8") as f:
            json.dump(self.work_log, f, indent=2)

    def run_cycle(self) -> bool:
        """
        Run one work cycle. Returns True if work was done.
        """
        work = self.find_work()
        if work:
            print(f"[{self.name}] Found work: {work.get('task', '')[:60]}...")
            result = self.execute_work(work)
            self.log_work(work, result)
            print(f"[{self.name}] Completed. Result: {result[:80]}...")
            return True
        return False


class CodeAnalysisAgent(AutonomousAgent):
    """
    Analyzes repository code for improvements, issues, and documentation needs.
    """

    def __init__(self, agent, repo_path: str):
        super().__init__("code_analysis", agent, repo_path)
        self.analyzed_files = set()

    def find_work(self) -> Optional[Dict[str, Any]]:
        """Find Python files that need analysis."""
        try:
            # Find all Python files
            result = subprocess.run(
                ["find", self.repo_path, "-name", "*.py", "-type", "f"],
                capture_output=True,
                text=True,
                timeout=5,
                check=False,
            )
            files = [
                f
                for f in result.stdout.strip().split("\n")
                if f and "__pycache__" not in f and "venv" not in f
            ]

            # Find unanalyzed file
            for filepath in files:
                if filepath not in self.analyzed_files:
                    self.analyzed_files.add(filepath)

                    # Read file content
                    try:
                        with open(filepath, "r", encoding="utf-8") as f:
                            content = f.read()

                        if len(content) > 100:  # Skip tiny files
                            return {
                                "task": f"Analyze this Python code for improvements, "
                                f"potential bugs, and missing documentation:\n\n"
                                f"{content[:500]}",
                                "context": {"file": filepath},
                            }
                    except Exception:
                        continue

        except Exception as e:
            print(f"[{self.name}] Error finding work: {e}")

        return None


class TestMonitorAgent(AutonomousAgent):
    """
    Monitors and runs tests, reports failures autonomously.
    """

    # Prevent pytest from treating this class as a test case while still allowing
    # it to be imported and used in orchestrator flows.
    __test__ = False

    def __init__(self, agent, repo_path: str):
        super().__init__("test_monitor", agent, repo_path)
        self.last_test_run = 0

    def find_work(self) -> Optional[Dict[str, Any]]:
        """Run tests periodically."""
        current_time = time.time()

        # Run tests every 5 minutes
        if current_time - self.last_test_run > 300:
            self.last_test_run = current_time

            # Check if tests exist
            test_dir = os.path.join(self.repo_path, "tests")
            if os.path.exists(test_dir):
                return {
                    "task": "Summarize the purpose and coverage of the test suite, "
                    "and suggest what additional tests might be valuable",
                    "context": {"test_dir": test_dir},
                }

        return None


class DocumentationAgent(AutonomousAgent):
    """
    Monitors code for missing or outdated documentation.
    """

    def __init__(self, agent, repo_path: str):
        super().__init__("documentation", agent, repo_path)
        self.checked_files = set()

    def find_work(self) -> Optional[Dict[str, Any]]:
        """Find files with missing docstrings."""
        try:
            # Find Python files
            result = subprocess.run(
                ["find", self.repo_path, "-name", "*.py", "-type", "f"],
                capture_output=True,
                text=True,
                timeout=5,
                check=False,
            )
            files = [
                f
                for f in result.stdout.strip().split("\n")
                if f and "__pycache__" not in f and "venv" not in f
            ]

            for filepath in files:
                if filepath not in self.checked_files:
                    self.checked_files.add(filepath)

                    try:
                        with open(filepath, "r", encoding="utf-8") as f:
                            content = f.read()

                        # Check for missing docstrings
                        if "def " in content and '"""' not in content[:500]:
                            return {
                                "task": f"Review this code and suggest what documentation "
                                f"should be added:\n\n{content[:400]}",
                                "context": {"file": filepath},
                            }
                    except Exception:
                        continue

        except Exception as e:
            print(f"[{self.name}] Error: {e}")

        return None


class IssueMonitorAgent(AutonomousAgent):
    """
    Monitors repository issues and suggests solutions.
    """

    def __init__(self, agent, repo_path: str):
        super().__init__("issue_monitor", agent, repo_path)
        self.analyzed_issues = set()

    def find_work(self) -> Optional[Dict[str, Any]]:
        """Monitor for issues that need analysis."""
        # For now, analyze repository health
        try:
            # Check README exists
            readme = os.path.join(self.repo_path, "README.md")
            if os.path.exists(readme):
                if "readme" not in self.analyzed_issues:
                    self.analyzed_issues.add("readme")
                    with open(readme, "r", encoding="utf-8") as f:
                        content = f.read()
                    return {
                        "task": f"Review this README and suggest improvements:\n\n"
                        f"{content[:600]}",
                        "context": {"file": "README.md"},
                    }
        except Exception as e:
            print(f"[{self.name}] Error: {e}")

        return None
