"""Writing agent for content creation tasks."""

from ..core.agent import Agent, AgentConfig


class WritingAgent(Agent):
    """Agent specialized in writing and content creation."""

    @classmethod
    def create_default(cls, provider):
        """
        Create a writing agent with default configuration.

        Args:
            provider: LLM provider to use

        Returns:
            Configured WritingAgent instance
        """
        config = AgentConfig(
            name="Writing Agent",
            description="Creates and edits written content",
            system_prompt=(
                "You are a creative writing AI agent. Your role is to help with "
                "content creation including articles, documentation, and creative "
                "writing. Provide engaging, well-structured, and polished content."
            ),
            max_iterations=8,
            temperature=0.8,
        )
        return cls(config, provider)
