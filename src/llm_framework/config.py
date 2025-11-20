"""Configuration management for LLM Framework.

This module handles loading and parsing configuration from YAML/JSON files
with environment variable interpolation and validation.
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, Any, Optional
import yaml


class ConfigError(Exception):
    """Configuration-related errors."""

    pass


class Config:
    """Configuration manager for LLM Framework.

    Loads configuration from YAML/JSON files with support for:
    - Environment variable interpolation (${VAR_NAME} syntax)
    - Multiple file formats (YAML, JSON)
    - Configuration precedence (env vars > file)
    - Custom config file paths via --config flag
    """

    def __init__(self, config_path: Optional[str] = None):
        """Initialize configuration.

        Args:
            config_path: Optional explicit path to config file.
                        If None, searches for ./config.yaml or ./config.json
        """
        self.config_path = config_path
        self.config = self._load_config()

    def _find_config_file(self) -> Optional[Path]:
        """Find configuration file in standard locations.

        Returns:
            Path to config file or None if not found
        """
        search_paths = [
            Path("config.yaml"),
            Path("config.json"),
        ]

        for path in search_paths:
            if path.exists():
                return path

        return None

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file.

        Returns:
            Configuration dictionary

        Raises:
            ConfigError: If config file is specified but invalid
        """
        # If explicit path provided, use it
        if self.config_path:
            config_file = Path(self.config_path)
            if not config_file.exists():
                raise ConfigError(f"Config file not found: {self.config_path}")
        else:
            # Search for config file
            config_file = self._find_config_file()
            if not config_file:
                # No config file found - return empty config
                # Environment variables will still be used
                return {}

        # Load and parse file
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                if config_file.suffix in [".yaml", ".yml"]:
                    config = yaml.safe_load(f) or {}
                elif config_file.suffix == ".json":
                    config = json.load(f)
                else:
                    raise ConfigError(
                        f"Unsupported config file format: {config_file.suffix}. "
                        "Use .yaml, .yml, or .json"
                    )
        except yaml.YAMLError as e:
            raise ConfigError(f"Invalid YAML in {config_file}: {e}") from e
        except json.JSONDecodeError as e:
            raise ConfigError(f"Invalid JSON in {config_file}: {e}") from e
        except OSError as e:
            raise ConfigError(f"Error reading {config_file}: {e}") from e

        # Interpolate environment variables
        config = self._interpolate_env_vars(config)

        return config

    def _interpolate_env_vars(self, config: Any) -> Any:
        """Recursively interpolate ${VAR_NAME} references with environment variables.

        Args:
            config: Configuration value (dict, list, string, or other)

        Returns:
            Configuration with environment variables interpolated
        """
        if isinstance(config, dict):
            return {
                key: self._interpolate_env_vars(value) for key, value in config.items()
            }
        elif isinstance(config, list):
            return [self._interpolate_env_vars(item) for item in config]
        elif isinstance(config, str):
            # Replace ${VAR_NAME} with environment variable value
            def replace_var(match):
                var_name = match.group(1)
                return os.getenv(var_name, match.group(0))  # Keep ${VAR} if not found

            return re.sub(r"\$\{([A-Za-z0-9_]+)\}", replace_var, config)
        else:
            return config

    def get(self, key: str, default: Any = None, section: Optional[str] = None) -> Any:
        """Get configuration value with environment variable override.

        Environment variables take precedence over file configuration.

        Args:
            key: Configuration key (e.g., 'api_key')
            default: Default value if not found
            section: Optional section name (e.g., 'providers.anthropic')

        Returns:
            Configuration value, with env var taking precedence
        """
        # Check environment variable first (highest priority)
        # Convert key to uppercase env var format
        env_key = key.upper()
        if section:
            # For sectioned keys like 'providers.anthropic.api_key'
            # Try ANTHROPIC_API_KEY first, then fall back to PROVIDERS_ANTHROPIC_API_KEY
            section_parts = section.split(".")
            if len(section_parts) >= 2:
                # Try {SECTION}_{KEY} format (e.g., ANTHROPIC_API_KEY)
                env_key_short = f"{section_parts[-1].upper()}_{key.upper()}"
                env_value = os.getenv(env_key_short)
                if env_value is not None:
                    return env_value

            # Try full path format
            env_key = f"{section.replace('.', '_').upper()}_{key.upper()}"

        env_value = os.getenv(env_key)
        if env_value is not None:
            return env_value

        # Check config file
        if section:
            # Navigate to section
            value = self.config
            for part in section.split("."):
                if isinstance(value, dict):
                    value = value.get(part, {})
                else:
                    value = {}

            if isinstance(value, dict):
                return value.get(key, default)
            return default
        else:
            return self.config.get(key, default)

    def get_provider_config(self, provider_name: str) -> Dict[str, Any]:
        """Get configuration for a specific provider.

        Args:
            provider_name: Provider name (e.g., 'anthropic', 'ollama', 'openai')

        Returns:
            Provider configuration dictionary
        """
        config = {}

        # Get from config file
        providers = self.config.get("providers", {})
        if isinstance(providers, dict):
            provider_config = providers.get(provider_name, {})
            if isinstance(provider_config, dict):
                config.update(provider_config)

        # Override with environment variables
        # Common patterns: ANTHROPIC_API_KEY, OLLAMA_BASE_URL, etc.
        provider_upper = provider_name.upper()

        # API key
        api_key = os.getenv(f"{provider_upper}_API_KEY")
        if api_key:
            config["api_key"] = api_key

        # Base URL (for Ollama, OpenAI, etc.)
        base_url = os.getenv(f"{provider_upper}_BASE_URL") or os.getenv(
            "OLLAMA_BASE_URL"
        )
        if base_url and provider_name == "ollama":
            config["base_url"] = base_url

        # Model
        model = os.getenv(f"{provider_upper}_MODEL")
        if model:
            config["model"] = model

        return config

    def get_agent_config(self, agent_name: str) -> Dict[str, Any]:
        """Get configuration for a specific agent.

        Args:
            agent_name: Agent name (e.g., 'research', 'coding', 'writing')

        Returns:
            Agent configuration dictionary
        """
        agents = self.config.get("agents", {})
        if isinstance(agents, dict):
            agent_config = agents.get(agent_name, {})
            if isinstance(agent_config, dict):
                return agent_config.copy()

        return {}

    def get_github_config(self) -> Dict[str, Any]:
        """Get GitHub integration configuration.

        Returns:
            GitHub configuration dictionary
        """
        config = {}

        # Get from config file
        github = self.config.get("github", {})
        if isinstance(github, dict):
            config.update(github)

        # Override with environment variables
        token = os.getenv("GITHUB_TOKEN")
        if token:
            config["token"] = token

        owner = os.getenv("GITHUB_REPO_OWNER")
        if owner:
            config["owner"] = owner

        repo = os.getenv("GITHUB_REPO_NAME")
        if repo:
            config["repo"] = repo

        return config

    def validate(self) -> bool:
        """Validate configuration structure.

        Returns:
            True if configuration is valid

        Raises:
            ConfigError: If configuration is invalid
        """
        if not isinstance(self.config, dict):
            raise ConfigError("Configuration must be a dictionary")

        # Validate providers section
        if "providers" in self.config:
            providers = self.config["providers"]
            if not isinstance(providers, dict):
                raise ConfigError("'providers' must be a dictionary")

            # Validate each provider
            for name, provider_config in providers.items():
                if not isinstance(provider_config, dict):
                    raise ConfigError(f"Provider '{name}' config must be a dictionary")

        # Validate agents section
        if "agents" in self.config:
            agents = self.config["agents"]
            if not isinstance(agents, dict):
                raise ConfigError("'agents' must be a dictionary")

            # Validate each agent
            for name, agent_config in agents.items():
                if not isinstance(agent_config, dict):
                    raise ConfigError(f"Agent '{name}' config must be a dictionary")

        # Validate github section
        if "github" in self.config:
            github = self.config["github"]
            if not isinstance(github, dict):
                raise ConfigError("'github' must be a dictionary")

        return True
