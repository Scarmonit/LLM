"""Tests for the AutonomousAgent base class."""

import logging
from src.llm_framework.autonomous_agent import (
    AutonomousAgent,
    CodeAnalysisAgent,
    TestMonitorAgent,
    DocumentationAgent,
    IssueMonitorAgent,
)


class MockAgent:
    """Mock agent for testing."""

    def execute(self, task):
        """Mock execute method."""
        return f"Executed: {task[:50]}"


def test_autonomous_agent_initialization():
    """Test that AutonomousAgent initializes correctly."""
    mock_agent = MockAgent()
    agent = AutonomousAgent("test_agent", mock_agent, "/tmp/test")

    assert agent.name == "test_agent"
    assert agent.agent == mock_agent
    assert agent.repo_path == "/tmp/test"
    assert not agent.work_log
    assert agent.running is False


def test_autonomous_agent_default_find_work():
    """Test that default find_work() returns None."""
    mock_agent = MockAgent()
    agent = AutonomousAgent("test_agent", mock_agent, "/tmp/test")

    # Should return None and not raise NotImplementedError
    result = agent.find_work()
    assert result is None


def test_autonomous_agent_default_find_work_logs_warning(caplog):
    """Test that default find_work() logs a warning."""
    mock_agent = MockAgent()
    agent = AutonomousAgent("test_agent", mock_agent, "/tmp/test")

    with caplog.at_level(logging.WARNING):
        agent.find_work()

    # Check that a warning was logged
    assert len(caplog.records) == 1
    assert caplog.records[0].levelname == "WARNING"
    assert "test_agent" in caplog.records[0].message
    assert "default find_work()" in caplog.records[0].message.lower()


def test_autonomous_agent_execute_work():
    """Test that execute_work delegates to the agent."""
    mock_agent = MockAgent()
    agent = AutonomousAgent("test_agent", mock_agent, "/tmp/test")

    work = {"task": "Test task", "context": {"test": True}}
    result = agent.execute_work(work)

    assert result == "Executed: Test task"


def test_autonomous_agent_run_cycle_with_no_work():
    """Test run_cycle when no work is found."""
    mock_agent = MockAgent()
    agent = AutonomousAgent("test_agent", mock_agent, "/tmp/test")

    # Default find_work returns None, so run_cycle should return False
    result = agent.run_cycle()
    assert result is False


def test_autonomous_agent_can_be_subclassed():
    """Test that AutonomousAgent can be instantiated directly or subclassed."""
    mock_agent = MockAgent()

    # Base class can be instantiated
    base_agent = AutonomousAgent("base", mock_agent, "/tmp/test")
    assert base_agent.find_work() is None

    # Subclasses still work as before
    code_agent = CodeAnalysisAgent(mock_agent, "/tmp/test")
    assert code_agent.name == "code_analysis"

    test_agent = TestMonitorAgent(mock_agent, "/tmp/test")
    assert test_agent.name == "test_monitor"

    doc_agent = DocumentationAgent(mock_agent, "/tmp/test")
    assert doc_agent.name == "documentation"

    issue_agent = IssueMonitorAgent(mock_agent, "/tmp/test")
    assert issue_agent.name == "issue_monitor"


def test_subclass_find_work_override():
    """Test that subclasses can override find_work without warnings."""
    mock_agent = MockAgent()
    agent = CodeAnalysisAgent(mock_agent, "/tmp/test")

    # CodeAnalysisAgent overrides find_work, so it should not use the default
    # This will return None in test environment (no files), but won't raise NotImplementedError
    result = agent.find_work()
    # Result depends on file system, but should not raise an exception
    assert result is None or isinstance(result, dict)
