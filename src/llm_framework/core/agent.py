"""Core agent implementation for autonomous task execution."""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from .base_provider import BaseProvider


@dataclass
class AgentConfig:
    """Configuration for an agent."""

    name: str
    description: str = ""
    system_prompt: str = ""
    max_iterations: int = 10
    temperature: float = 0.7
    additional_params: Dict[str, Any] = field(default_factory=dict)


class Agent:
    """Autonomous agent that can execute tasks using LLM providers."""

    def __init__(self, config: AgentConfig, provider: BaseProvider):
        """
        Initialize the agent.

        Args:
            config: Agent configuration
            provider: LLM provider to use for generation
        """
        self.config = config
        self.provider = provider
        self.conversation_history: List[Dict[str, str]] = []

    def execute(self, task: str, context: Optional[Dict[str, Any]] = None) -> str:
        """
        Execute a task autonomously.

        Args:
            task: The task description
            context: Optional context information

        Returns:
            The result of the task execution
        """
        if not self.provider.is_available():
            raise RuntimeError(
                f"Provider {self.provider.get_provider_name()} is not available"
            )

        # Build the full prompt
        full_prompt = self._build_prompt(task, context)

        # Generate response
        try:
            response = self.provider.generate(
                full_prompt,
                temperature=self.config.temperature,
                **self.config.additional_params
            )

            # Store in conversation history
            self.conversation_history.append({
                "role": "user",
                "content": task
            })
            self.conversation_history.append({
                "role": "assistant",
                "content": response
            })

            return response
        except Exception as e:
            raise RuntimeError(f"Error executing task: {str(e)}") from e

    def _build_prompt(self, task: str, context: Optional[Dict[str, Any]] = None) -> str:
        """
        Build the full prompt from system prompt, context, and task.

        Args:
            task: The task description
            context: Optional context information

        Returns:
            The complete prompt
        """
        parts = []

        if self.config.system_prompt:
            parts.append(f"System: {self.config.system_prompt}")

        if context:
            parts.append(f"Context: {context}")

        parts.append(f"Task: {task}")

        return "\n\n".join(parts)

    def reset_conversation(self):
        """Reset the conversation history."""
        self.conversation_history = []

    def get_status(self) -> Dict[str, Any]:
        """
        Get the current status of the agent.

        Returns:
            Dictionary containing agent status information
        """
        return {
            "name": self.config.name,
            "provider": self.provider.get_provider_name(),
            "provider_available": self.provider.is_available(),
            "conversation_length": len(self.conversation_history),
            "config": {
                "max_iterations": self.config.max_iterations,
                "temperature": self.config.temperature,
            }
        }
