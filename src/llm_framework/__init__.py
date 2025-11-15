"""LLM Multi-Provider Framework - Core package initialization."""

__version__ = "0.1.0"
__author__ = "LLM Framework Team"

from .core.base_provider import BaseProvider
from .core.agent import Agent, AgentConfig
from .providers.claude_provider import ClaudeProvider
from .providers.ollama_provider import OllamaProvider
from .providers.mock_provider import MockLLMProvider
from .providers.openai_compatible_provider import OpenAICompatibleProvider
from .continuous_agent import ContinuousAgent
from .github_integration import GitHubIntegration, AgentGitHubBridge

__all__ = [
    "BaseProvider",
    "Agent",
    "AgentConfig",
    "ClaudeProvider",
    "OllamaProvider",
    "MockLLMProvider",
    "OpenAICompatibleProvider",
    "ContinuousAgent",
    "GitHubIntegration",
    "AgentGitHubBridge",
]
