"""Agent orchestrator for managing multiple agents and providers."""

from typing import Dict, List, Optional, Any
from .core.agent import Agent
from .core.base_provider import BaseProvider
from .providers.claude_provider import ClaudeProvider
from .providers.ollama_provider import OllamaProvider
from .providers.mock_provider import MockLLMProvider
from .providers.openai_compatible_provider import OpenAICompatibleProvider
from .agents.research_agent import ResearchAgent
from .agents.coding_agent import CodingAgent
from .agents.writing_agent import WritingAgent


class AgentOrchestrator:
    """Orchestrates multiple agents across different LLM providers."""

    def __init__(self):
        """Initialize the orchestrator."""
        self.providers: Dict[str, BaseProvider] = {}
        self.agents: Dict[str, Agent] = {}

    def add_provider(self, name: str, provider: BaseProvider):
        """
        Add a provider to the orchestrator.

        Args:
            name: Unique name for the provider
            provider: Provider instance
        """
        self.providers[name] = provider

    def add_agent(self, name: str, agent: Agent):
        """
        Add an agent to the orchestrator.

        Args:
            name: Unique name for the agent
            agent: Agent instance
        """
        self.agents[name] = agent

    def setup_default_providers(self):
        """Set up default providers (Ollama ONLY for real LLM, no mock data)."""
        # Try to add Ollama provider - REAL LLM ONLY
        try:
            ollama = OllamaProvider()
            if ollama.is_available():
                self.add_provider("ollama", ollama)
                return  # Found real provider, done
        except Exception:
            pass
            
        # Try to add Claude provider
        try:
            claude = ClaudeProvider()
            if claude.is_available():
                self.add_provider("claude", claude)
                return  # Found real provider, done
        except Exception:
            pass
        
        # Try to add OpenAI-compatible provider
        try:
            openai = OpenAICompatibleProvider()
            if openai.is_available():
                self.add_provider("openai", openai)
                return  # Found real provider, done
        except Exception:
            pass
        
        # NO MOCK PROVIDER - if no real providers available, raise error
        if not self.providers:
            raise RuntimeError(
                "No real LLM providers available!\n"
                "Please configure one of:\n"
                "  - Ollama: Install and run 'ollama serve'\n"
                "  - Claude: Set ANTHROPIC_API_KEY environment variable\n"
                "  - OpenAI: Set OPENAI_API_KEY environment variable"
            )

    def setup_default_agents(self, provider_name: Optional[str] = None):
        """
        Set up default agents using REAL LLM providers only (no mock).

        Args:
            provider_name: Specific provider to use, or None to use first available
        """
        # Get provider to use - REAL LLM ONLY
        if provider_name and provider_name in self.providers:
            provider = self.providers[provider_name]
        elif self.providers:
            # Use first available REAL provider
            provider = list(self.providers.values())[0]
        else:
            raise RuntimeError("No REAL LLM providers available. Cannot create agents without real providers.")

        # Create default agents with REAL LLM
        self.add_agent("research", ResearchAgent.create_default(provider))
        self.add_agent("coding", CodingAgent.create_default(provider))
        self.add_agent("writing", WritingAgent.create_default(provider))

    def get_agent(self, name: str) -> Optional[Agent]:
        """
        Get an agent by name.

        Args:
            name: Agent name

        Returns:
            Agent instance or None if not found
        """
        return self.agents.get(name)

    def get_provider(self, name: str) -> Optional[BaseProvider]:
        """
        Get a provider by name.

        Args:
            name: Provider name

        Returns:
            Provider instance or None if not found
        """
        return self.providers.get(name)

    def list_agents(self) -> List[str]:
        """
        List all available agent names.

        Returns:
            List of agent names
        """
        return list(self.agents.keys())

    def list_providers(self) -> List[str]:
        """
        List all available provider names.

        Returns:
            List of provider names
        """
        return list(self.providers.keys())

    def get_system_status(self) -> Dict[str, Any]:
        """
        Get the status of all providers and agents.

        Returns:
            Dictionary containing system status
        """
        return {
            "providers": {
                name: {
                    "name": provider.get_provider_name(),
                    "available": provider.is_available()
                }
                for name, provider in self.providers.items()
            },
            "agents": {
                name: agent.get_status()
                for name, agent in self.agents.items()
            }
        }
