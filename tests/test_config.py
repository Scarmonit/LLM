"""Tests for configuration management."""

import os
import json
import tempfile
from pathlib import Path
import pytest
import yaml
from src.llm_framework.config import Config, ConfigError


@pytest.fixture
def temp_config_dir(tmp_path):
    """Create a temporary directory for config files."""
    return tmp_path


@pytest.fixture
def sample_yaml_config():
    """Sample YAML configuration."""
    return """
providers:
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}
    model: claude-3-sonnet-20240229
  ollama:
    base_url: http://localhost:11434
    model: qwen2.5:0.5b

agents:
  research:
    temperature: 0.5
    max_tokens: 150
  coding:
    temperature: 0.3
    max_tokens: 500

github:
  token: ${GITHUB_TOKEN}
  owner: Scarmonit
  repo: LLM
"""


@pytest.fixture
def sample_json_config():
    """Sample JSON configuration."""
    return {
        "providers": {
            "anthropic": {
                "api_key": "${ANTHROPIC_API_KEY}",
                "model": "claude-3-sonnet-20240229"
            },
            "ollama": {
                "base_url": "http://localhost:11434",
                "model": "qwen2.5:0.5b"
            }
        },
        "agents": {
            "research": {
                "temperature": 0.5,
                "max_tokens": 150
            },
            "coding": {
                "temperature": 0.3,
                "max_tokens": 500
            }
        },
        "github": {
            "token": "${GITHUB_TOKEN}",
            "owner": "Scarmonit",
            "repo": "LLM"
        }
    }


def test_config_no_file():
    """Test Config works without config file."""
    config = Config()
    assert config.config == {}
    assert config.get('nonexistent', 'default') == 'default'


def test_config_yaml_file(temp_config_dir, sample_yaml_config):
    """Test loading YAML config file."""
    config_file = temp_config_dir / "config.yaml"
    config_file.write_text(sample_yaml_config)
    
    config = Config(str(config_file))
    assert 'providers' in config.config
    assert 'agents' in config.config
    assert 'github' in config.config


def test_config_json_file(temp_config_dir, sample_json_config):
    """Test loading JSON config file."""
    config_file = temp_config_dir / "config.json"
    config_file.write_text(json.dumps(sample_json_config, indent=2))
    
    config = Config(str(config_file))
    assert 'providers' in config.config
    assert 'agents' in config.config
    assert 'github' in config.config


def test_config_env_interpolation(temp_config_dir, sample_yaml_config, monkeypatch):
    """Test environment variable interpolation."""
    monkeypatch.setenv('ANTHROPIC_API_KEY', 'test-key-123')
    monkeypatch.setenv('GITHUB_TOKEN', 'ghp_test456')
    
    config_file = temp_config_dir / "config.yaml"
    config_file.write_text(sample_yaml_config)
    
    config = Config(str(config_file))
    
    # Check interpolation happened
    assert config.config['providers']['anthropic']['api_key'] == 'test-key-123'
    assert config.config['github']['token'] == 'ghp_test456'


def test_config_env_interpolation_missing(temp_config_dir, sample_yaml_config):
    """Test that missing env vars are kept as-is."""
    config_file = temp_config_dir / "config.yaml"
    config_file.write_text(sample_yaml_config)
    
    config = Config(str(config_file))
    
    # Should keep ${VAR} if env var not set
    assert '${' in config.config['providers']['anthropic']['api_key']


def test_config_get_simple(temp_config_dir, sample_json_config):
    """Test getting simple config values."""
    config_file = temp_config_dir / "config.json"
    config_file.write_text(json.dumps(sample_json_config))
    
    config = Config(str(config_file))
    
    # Get with default
    assert config.get('nonexistent', 'default') == 'default'


def test_config_get_with_section(temp_config_dir, sample_json_config):
    """Test getting config values from sections."""
    config_file = temp_config_dir / "config.json"
    config_file.write_text(json.dumps(sample_json_config))
    
    config = Config(str(config_file))
    
    # Get from section
    model = config.get('model', section='providers.ollama')
    assert model == 'qwen2.5:0.5b'
    
    temp = config.get('temperature', section='agents.research')
    assert temp == 0.5


def test_config_env_override(temp_config_dir, sample_json_config, monkeypatch):
    """Test that environment variables override file config."""
    config_file = temp_config_dir / "config.json"
    config_file.write_text(json.dumps(sample_json_config))
    
    # Set env var that should override file
    monkeypatch.setenv('OLLAMA_MODEL', 'llama2:7b')
    
    config = Config(str(config_file))
    
    # Env var should take precedence
    model = config.get('model', section='providers.ollama')
    assert model == 'llama2:7b'


def test_config_get_provider_config(temp_config_dir, sample_json_config, monkeypatch):
    """Test getting provider-specific configuration."""
    monkeypatch.setenv('ANTHROPIC_API_KEY', 'sk-ant-override')
    
    config_file = temp_config_dir / "config.json"
    config_file.write_text(json.dumps(sample_json_config))
    
    config = Config(str(config_file))
    
    # Get Anthropic config
    anthropic_config = config.get_provider_config('anthropic')
    assert anthropic_config['api_key'] == 'sk-ant-override'  # Env var override
    assert anthropic_config['model'] == 'claude-3-sonnet-20240229'  # From file
    
    # Get Ollama config
    ollama_config = config.get_provider_config('ollama')
    assert ollama_config['base_url'] == 'http://localhost:11434'
    assert ollama_config['model'] == 'qwen2.5:0.5b'


def test_config_get_agent_config(temp_config_dir, sample_json_config):
    """Test getting agent-specific configuration."""
    config_file = temp_config_dir / "config.json"
    config_file.write_text(json.dumps(sample_json_config))
    
    config = Config(str(config_file))
    
    # Get research agent config
    research_config = config.get_agent_config('research')
    assert research_config['temperature'] == 0.5
    assert research_config['max_tokens'] == 150
    
    # Get coding agent config
    coding_config = config.get_agent_config('coding')
    assert coding_config['temperature'] == 0.3
    assert coding_config['max_tokens'] == 500
    
    # Non-existent agent
    unknown_config = config.get_agent_config('unknown')
    assert unknown_config == {}


def test_config_get_github_config(temp_config_dir, sample_json_config, monkeypatch):
    """Test getting GitHub configuration."""
    monkeypatch.setenv('GITHUB_TOKEN', 'ghp_env_override')
    monkeypatch.setenv('GITHUB_REPO_OWNER', 'EnvOwner')
    
    config_file = temp_config_dir / "config.json"
    config_file.write_text(json.dumps(sample_json_config))
    
    config = Config(str(config_file))
    
    github_config = config.get_github_config()
    assert github_config['token'] == 'ghp_env_override'  # Env override
    assert github_config['owner'] == 'EnvOwner'  # Env override
    assert github_config['repo'] == 'LLM'  # From file


def test_config_validate_valid(temp_config_dir, sample_json_config):
    """Test validation of valid configuration."""
    config_file = temp_config_dir / "config.json"
    config_file.write_text(json.dumps(sample_json_config))
    
    config = Config(str(config_file))
    assert config.validate() is True


def test_config_validate_invalid_providers():
    """Test validation fails for invalid providers section."""
    config = Config()
    config.config = {'providers': 'not-a-dict'}
    
    with pytest.raises(ConfigError, match="'providers' must be a dictionary"):
        config.validate()


def test_config_validate_invalid_agents():
    """Test validation fails for invalid agents section."""
    config = Config()
    config.config = {'agents': 'not-a-dict'}
    
    with pytest.raises(ConfigError, match="'agents' must be a dictionary"):
        config.validate()


def test_config_validate_invalid_provider_config():
    """Test validation fails for invalid provider config."""
    config = Config()
    config.config = {
        'providers': {
            'ollama': 'not-a-dict'
        }
    }
    
    with pytest.raises(ConfigError, match="Provider 'ollama' config must be a dictionary"):
        config.validate()


def test_config_invalid_yaml(temp_config_dir):
    """Test handling of invalid YAML."""
    config_file = temp_config_dir / "config.yaml"
    config_file.write_text("invalid: yaml: syntax: error:")
    
    with pytest.raises(ConfigError, match="Invalid YAML"):
        Config(str(config_file))


def test_config_invalid_json(temp_config_dir):
    """Test handling of invalid JSON."""
    config_file = temp_config_dir / "config.json"
    config_file.write_text("{invalid json")
    
    with pytest.raises(ConfigError, match="Invalid JSON"):
        Config(str(config_file))


def test_config_nonexistent_file():
    """Test error when explicit config file doesn't exist."""
    with pytest.raises(ConfigError, match="Config file not found"):
        Config("/nonexistent/config.yaml")


def test_config_unsupported_format(temp_config_dir):
    """Test error for unsupported config file format."""
    config_file = temp_config_dir / "config.txt"
    config_file.write_text("some content")
    
    with pytest.raises(ConfigError, match="Unsupported config file format"):
        Config(str(config_file))


def test_config_auto_discovery_yaml(temp_config_dir, sample_yaml_config, monkeypatch):
    """Test automatic discovery of config.yaml."""
    # Change to temp directory
    monkeypatch.chdir(temp_config_dir)
    
    config_file = temp_config_dir / "config.yaml"
    config_file.write_text(sample_yaml_config)
    
    # Config should auto-discover the file
    config = Config()
    assert 'providers' in config.config


def test_config_auto_discovery_json(temp_config_dir, sample_json_config, monkeypatch):
    """Test automatic discovery of config.json."""
    # Change to temp directory
    monkeypatch.chdir(temp_config_dir)
    
    config_file = temp_config_dir / "config.json"
    config_file.write_text(json.dumps(sample_json_config))
    
    # Config should auto-discover the file
    config = Config()
    assert 'providers' in config.config


def test_config_yaml_precedence(temp_config_dir, sample_yaml_config, sample_json_config, monkeypatch):
    """Test that YAML takes precedence over JSON in auto-discovery."""
    # Change to temp directory
    monkeypatch.chdir(temp_config_dir)
    
    # Create both files
    yaml_file = temp_config_dir / "config.yaml"
    yaml_file.write_text(sample_yaml_config)
    
    json_file = temp_config_dir / "config.json"
    modified_json = sample_json_config.copy()
    modified_json['test_marker'] = 'json'
    json_file.write_text(json.dumps(modified_json))
    
    # Config should discover YAML first
    config = Config()
    assert 'test_marker' not in config.config  # Should use YAML, not JSON


def test_config_empty_file(temp_config_dir):
    """Test handling of empty config file."""
    config_file = temp_config_dir / "config.yaml"
    config_file.write_text("")
    
    config = Config(str(config_file))
    assert config.config == {}


def test_config_env_var_shorthand(temp_config_dir, sample_json_config, monkeypatch):
    """Test shorthand env var names for providers."""
    config_file = temp_config_dir / "config.json"
    config_file.write_text(json.dumps(sample_json_config))
    
    # Use ANTHROPIC_API_KEY instead of PROVIDERS_ANTHROPIC_API_KEY
    monkeypatch.setenv('ANTHROPIC_API_KEY', 'sk-test-shorthand')
    
    config = Config(str(config_file))
    
    # Should work with shorthand
    api_key = config.get('api_key', section='providers.anthropic')
    assert api_key == 'sk-test-shorthand'
