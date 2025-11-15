"""Mock LLM provider for testing and demonstration without external dependencies."""

from typing import Optional
from ..core.base_provider import BaseProvider


class MockLLMProvider(BaseProvider):
    """
    Mock LLM provider that generates responses without external API calls.
    Useful for testing, demonstrations, and development.
    """

    def __init__(self, **kwargs):
        """
        Initialize Mock LLM provider.

        Args:
            **kwargs: Additional configuration (ignored for mock)
        """
        super().__init__(None, **kwargs)
        self.response_templates = {
            "research": "Based on current research, {topic} shows significant progress. "
                       "Key findings include improved efficiency, better accuracy, and "
                       "wider adoption across industries. Further investigation reveals "
                       "that this technology is becoming increasingly important.",
            "coding": "Here's a solution for {topic}:\n\n"
                     "```python\n"
                     "def solve_problem():\n"
                     "    # Implementation\n"
                     "    result = process_data()\n"
                     "    return result\n"
                     "```\n\n"
                     "This approach is efficient and follows best practices.",
            "writing": "Regarding {topic}, it's important to note that this represents "
                      "a significant development in the field. The implications are far-reaching "
                      "and demonstrate the evolving nature of modern technology. "
                      "This trend is likely to continue as we move forward.",
            "default": "In response to your query about {topic}, I can provide the following "
                      "analysis: This is a complex subject that requires careful consideration. "
                      "Multiple factors contribute to the current state, and ongoing developments "
                      "suggest continued evolution in this area."
        }

    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate a mock response based on the prompt.

        Args:
            prompt: The input prompt
            **kwargs: Additional generation parameters (temperature, max_tokens, etc.)

        Returns:
            A generated mock response
        """
        # Extract topic from prompt
        topic = self._extract_topic(prompt)
        
        # Determine response type
        response_type = "default"
        prompt_lower = prompt.lower()
        
        if "research" in prompt_lower or "analyze" in prompt_lower:
            response_type = "research"
        elif "code" in prompt_lower or "implement" in prompt_lower or "function" in prompt_lower:
            response_type = "coding"
        elif "write" in prompt_lower or "create" in prompt_lower or "compose" in prompt_lower:
            response_type = "writing"
        
        # Get template and format with topic
        template = self.response_templates.get(response_type, self.response_templates["default"])
        response = template.format(topic=topic)
        
        # Simulate temperature effect (add variation)
        temperature = kwargs.get("temperature", 0.7)
        if temperature > 0.8:
            response += "\n\nAdditionally, creative exploration of this subject reveals "
            response += "unique perspectives that traditional approaches might overlook."
        elif temperature < 0.3:
            response += "\n\nPrecise analysis indicates specific, deterministic outcomes "
            response += "based on established principles."
        
        return response

    def _extract_topic(self, prompt: str) -> str:
        """Extract the main topic from the prompt."""
        # Simple topic extraction
        words = prompt.split()
        if len(words) > 10:
            # Take middle portion as topic
            topic_words = words[min(5, len(words)//2):min(15, len(words))]
            return " ".join(topic_words)
        return "the subject at hand"

    def is_available(self) -> bool:
        """
        Check if the provider is available.

        Returns:
            Always True for mock provider
        """
        return True

    def get_provider_name(self) -> str:
        """
        Get the provider name.

        Returns:
            "MockLLM" as the provider name
        """
        return "MockLLM"
