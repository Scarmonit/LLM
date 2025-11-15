"""Base provider interface for LLM providers."""

from abc import ABC, abstractmethod
from typing import Optional


class BaseProvider(ABC):
    """Abstract base class for LLM providers."""

    def __init__(self, api_key: Optional[str] = None, **kwargs):
        """
        Initialize the provider.

        Args:
            api_key: API key for authentication (if required)
            **kwargs: Additional provider-specific configuration
        """
        self.api_key = api_key
        self.config = kwargs

    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate a response from the LLM.

        Args:
            prompt: The input prompt
            **kwargs: Additional generation parameters

        Returns:
            The generated text response
        """

    @abstractmethod
    def is_available(self) -> bool:
        """
        Check if the provider is available and configured correctly.

        Returns:
            True if the provider is available, False otherwise
        """

    @abstractmethod
    def get_provider_name(self) -> str:
        """
        Get the name of the provider.

        Returns:
            Provider name as a string
        """
