"""Coding agent for software development tasks."""

from ..core.agent import Agent, AgentConfig


class CodingAgent(Agent):
    """Agent specialized in coding and software development."""

    @classmethod
    def create_default(cls, provider):
        """
        Create a coding agent with default configuration.

        Args:
            provider: LLM provider to use

        Returns:
            Configured CodingAgent instance
        """
        config = AgentConfig(
            name="Coding Agent",
            description="Assists with software development and coding tasks",
            system_prompt=(
                "You are a software development AI agent. Your role is to help with "
                "coding tasks including writing, debugging, and explaining code. "
                "Provide clear, well-documented, and efficient code solutions."
            ),
            max_iterations=10,
            temperature=0.3,
        )
        return cls(config, provider)
