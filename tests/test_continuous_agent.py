"""Tests for continuous agent functionality."""

import pytest
import time
from src.llm_framework.continuous_agent import ContinuousAgent
from src.llm_framework.core.agent import Agent, AgentConfig
from tests.test_base_provider import MockProvider


def test_continuous_agent_initialization():
    """Test that continuous agent initializes correctly."""
    config = AgentConfig(name="Test")
    provider = MockProvider()
    agent = Agent(config, provider)
    
    cont_agent = ContinuousAgent(agent, interval=1)
    
    assert cont_agent.agent == agent
    assert cont_agent.interval == 1
    assert cont_agent.is_running is False
    assert len(cont_agent.task_queue) == 0


def test_continuous_agent_add_task():
    """Test adding tasks to the queue."""
    config = AgentConfig(name="Test")
    provider = MockProvider()
    agent = Agent(config, provider)
    cont_agent = ContinuousAgent(agent)
    
    cont_agent.add_task("Task 1")
    cont_agent.add_task("Task 2")
    
    assert len(cont_agent.task_queue) == 2
    assert cont_agent.task_queue[0] == "Task 1"
    assert cont_agent.task_queue[1] == "Task 2"


def test_continuous_agent_start_stop():
    """Test starting and stopping continuous agent."""
    config = AgentConfig(name="Test")
    provider = MockProvider()
    agent = Agent(config, provider)
    cont_agent = ContinuousAgent(agent, interval=0.1, max_iterations=1)
    
    cont_agent.add_task("Test task")
    cont_agent.start()
    
    assert cont_agent.is_running is True
    
    # Wait for task to complete
    time.sleep(0.5)
    
    cont_agent.stop()
    assert cont_agent.is_running is False


def test_continuous_agent_execution():
    """Test that continuous agent executes tasks."""
    config = AgentConfig(name="Test")
    provider = MockProvider()
    agent = Agent(config, provider)
    cont_agent = ContinuousAgent(agent, interval=0.1, max_iterations=2)
    
    cont_agent.add_task("Task 1")
    cont_agent.add_task("Task 2")
    
    cont_agent.start()
    
    # Wait for tasks to complete
    time.sleep(1)
    
    cont_agent.stop()
    
    results = cont_agent.get_results()
    assert len(results) == 2
    assert results[0]["task"] == "Task 1"
    assert results[1]["task"] == "Task 2"
    assert "result" in results[0]
    assert "result" in results[1]


def test_continuous_agent_callback():
    """Test that callback is called on task completion."""
    config = AgentConfig(name="Test")
    provider = MockProvider()
    agent = Agent(config, provider)
    cont_agent = ContinuousAgent(agent, interval=0.1, max_iterations=1)
    
    callback_calls = []
    
    def callback(task, result):
        callback_calls.append({"task": task, "result": result})
    
    cont_agent.on_result_callback = callback
    cont_agent.add_task("Test task")
    
    cont_agent.start()
    time.sleep(0.5)
    cont_agent.stop()
    
    assert len(callback_calls) == 1
    assert callback_calls[0]["task"] == "Test task"


def test_continuous_agent_get_status():
    """Test getting status of continuous agent."""
    config = AgentConfig(name="Test Agent")
    provider = MockProvider()
    agent = Agent(config, provider)
    cont_agent = ContinuousAgent(agent, interval=5, max_iterations=10)
    
    status = cont_agent.get_status()
    
    assert status["agent_name"] == "Test Agent"
    assert status["is_running"] is False
    assert status["iteration_count"] == 0
    assert status["tasks_pending"] == 0
    assert status["interval"] == 5
    assert status["max_iterations"] == 10


def test_continuous_agent_max_iterations():
    """Test that agent stops after max iterations."""
    config = AgentConfig(name="Test")
    provider = MockProvider()
    agent = Agent(config, provider)
    cont_agent = ContinuousAgent(agent, interval=0.1, max_iterations=2)
    
    # Add more tasks than max iterations
    cont_agent.add_task("Task 1")
    cont_agent.add_task("Task 2")
    cont_agent.add_task("Task 3")
    
    cont_agent.start()
    time.sleep(1)
    
    # Should have stopped after 2 iterations
    assert cont_agent.is_running is False
    assert cont_agent.iteration_count == 2
    # Note: task queue may have auto-generated tasks, just verify it stopped at 2 iterations
