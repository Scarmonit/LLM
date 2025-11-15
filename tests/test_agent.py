"""Tests for the agent implementation."""

import pytest
from src.llm_framework.core.agent import Agent, AgentConfig
from tests.test_base_provider import MockProvider


def test_agent_config_creation():
    """Test that agent config is created correctly."""
    config = AgentConfig(
        name="Test Agent",
        description="A test agent",
        system_prompt="You are a test agent",
        max_iterations=5,
        temperature=0.7
    )
    assert config.name == "Test Agent"
    assert config.description == "A test agent"
    assert config.max_iterations == 5
    assert config.temperature == 0.7


def test_agent_initialization():
    """Test that agent initializes correctly."""
    config = AgentConfig(name="Test", system_prompt="Test prompt")
    provider = MockProvider()
    agent = Agent(config, provider)

    assert agent.config == config
    assert agent.provider == provider
    assert len(agent.conversation_history) == 0


def test_agent_execute():
    """Test that agent can execute tasks."""
    config = AgentConfig(name="Test", system_prompt="You are helpful")
    provider = MockProvider()
    agent = Agent(config, provider)

    result = agent.execute("Solve this problem")
    assert result is not None
    assert len(agent.conversation_history) == 2


def test_agent_build_prompt():
    """Test that agent builds prompts correctly."""
    config = AgentConfig(name="Test", system_prompt="System instruction")
    provider = MockProvider()
    agent = Agent(config, provider)

    prompt = agent._build_prompt("Task", {"key": "value"})
    assert "System instruction" in prompt
    assert "Task" in prompt
    assert "Context" in prompt


def test_agent_reset_conversation():
    """Test that conversation history can be reset."""
    config = AgentConfig(name="Test")
    provider = MockProvider()
    agent = Agent(config, provider)

    agent.execute("Task 1")
    agent.execute("Task 2")
    assert len(agent.conversation_history) == 4

    agent.reset_conversation()
    assert len(agent.conversation_history) == 0


def test_agent_get_status():
    """Test that agent status is returned correctly."""
    config = AgentConfig(name="Test", max_iterations=5, temperature=0.7)
    provider = MockProvider()
    agent = Agent(config, provider)

    status = agent.get_status()
    assert status["name"] == "Test"
    assert status["provider"] == "Mock"
    assert status["provider_available"] is True
    assert status["config"]["max_iterations"] == 5
    assert status["config"]["temperature"] == 0.7


def test_agent_execute_with_unavailable_provider():
    """Test that agent raises error when provider is unavailable."""
    class UnavailableProvider(MockProvider):
        def is_available(self) -> bool:
            return False

    config = AgentConfig(name="Test")
    provider = UnavailableProvider()
    agent = Agent(config, provider)

    with pytest.raises(RuntimeError, match="is not available"):
        agent.execute("Task")
