"""Tests for the orchestrator."""

import pytest
from src.llm_framework.orchestrator import AgentOrchestrator
from src.llm_framework.core.agent import Agent, AgentConfig
from src.llm_framework.config import Config
from tests.test_base_provider import MockProvider


def test_orchestrator_initialization():
    """Test that orchestrator initializes correctly."""
    orchestrator = AgentOrchestrator()
    assert len(orchestrator.providers) == 0
    assert len(orchestrator.agents) == 0
    assert orchestrator.config is not None  # Config should always be present


def test_orchestrator_initialization_with_config():
    """Test that orchestrator can be initialized with custom config."""
    config = Config()
    orchestrator = AgentOrchestrator(config=config)
    assert orchestrator.config is config


def test_orchestrator_add_provider():
    """Test adding providers to orchestrator."""
    orchestrator = AgentOrchestrator()
    provider = MockProvider()

    orchestrator.add_provider("mock", provider)
    assert "mock" in orchestrator.providers
    assert orchestrator.get_provider("mock") == provider


def test_orchestrator_add_agent():
    """Test adding agents to orchestrator."""
    orchestrator = AgentOrchestrator()
    provider = MockProvider()
    config = AgentConfig(name="Test")
    agent = Agent(config, provider)

    orchestrator.add_agent("test", agent)
    assert "test" in orchestrator.agents
    assert orchestrator.get_agent("test") == agent


def test_orchestrator_list_providers():
    """Test listing providers."""
    orchestrator = AgentOrchestrator()
    orchestrator.add_provider("mock1", MockProvider())
    orchestrator.add_provider("mock2", MockProvider())

    providers = orchestrator.list_providers()
    assert len(providers) == 2
    assert "mock1" in providers
    assert "mock2" in providers


def test_orchestrator_list_agents():
    """Test listing agents."""
    orchestrator = AgentOrchestrator()
    provider = MockProvider()

    orchestrator.add_agent("agent1", Agent(AgentConfig(name="A1"), provider))
    orchestrator.add_agent("agent2", Agent(AgentConfig(name="A2"), provider))

    agents = orchestrator.list_agents()
    assert len(agents) == 2
    assert "agent1" in agents
    assert "agent2" in agents


def test_orchestrator_setup_default_agents():
    """Test setting up default agents."""
    orchestrator = AgentOrchestrator()
    orchestrator.add_provider("mock", MockProvider())

    orchestrator.setup_default_agents("mock")

    agents = orchestrator.list_agents()
    assert "research" in agents
    assert "coding" in agents
    assert "writing" in agents


def test_orchestrator_get_system_status():
    """Test getting system status."""
    orchestrator = AgentOrchestrator()
    provider = MockProvider()
    orchestrator.add_provider("mock", provider)

    config = AgentConfig(name="Test")
    agent = Agent(config, provider)
    orchestrator.add_agent("test", agent)

    status = orchestrator.get_system_status()

    assert "providers" in status
    assert "agents" in status
    assert "mock" in status["providers"]
    assert "test" in status["agents"]
    assert status["providers"]["mock"]["available"] is True


def test_orchestrator_setup_default_agents_no_provider():
    """Test that setup_default_agents raises error without providers."""
    orchestrator = AgentOrchestrator()

    with pytest.raises(RuntimeError, match="No REAL LLM providers available"):
        orchestrator.setup_default_agents()
