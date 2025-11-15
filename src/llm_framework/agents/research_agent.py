"""Research agent for gathering and analyzing information."""

from ..core.agent import Agent, AgentConfig


class ResearchAgent(Agent):
    """Agent specialized in research and information gathering."""

    @classmethod
    def create_default(cls, provider):
        """
        Create a research agent with default configuration.

        Args:
            provider: LLM provider to use

        Returns:
            Configured ResearchAgent instance
        """
        config = AgentConfig(
            name="Research Agent",
            description="Analyzes and researches topics in depth",
            system_prompt=(
                "You are a research specialist AI agent. Your role is to gather, "
                "analyze, and synthesize information on given topics. Provide "
                "comprehensive and well-structured responses backed by reasoning."
            ),
            max_iterations=5,
            temperature=0.5,
        )
        return cls(config, provider)
