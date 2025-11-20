#!/usr/bin/env python3
"""
Demonstration of configuration file support.

This script shows how to use YAML/JSON config files with the LLM Framework.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from llm_framework.config import Config
from llm_framework.orchestrator import AgentOrchestrator


def demo_config_features():
    """Demonstrate configuration features."""
    print("=" * 70)
    print("LLM Framework - Configuration File Support Demo")
    print("=" * 70)

    # Demo 1: Auto-discovery
    print("\n📁 DEMO 1: Auto-Discovery")
    print("-" * 70)
    print("Creating orchestrator without explicit config...")
    print("Will auto-discover config.yaml or config.json if present")
    orch = AgentOrchestrator()
    print(f"✓ Orchestrator created")
    print(f"✓ Config loaded: {bool(orch.config.config)}")
    if orch.config.config:
        print(f"✓ Config sections: {list(orch.config.config.keys())}")

    # Demo 2: Explicit config path
    print("\n📁 DEMO 2: Explicit Config Path")
    print("-" * 70)
    
    # Create a temporary config file for demo
    import tempfile
    import yaml
    
    demo_config = {
        "providers": {
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
        }
    }
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
        yaml.dump(demo_config, f)
        temp_config_path = f.name
    
    print(f"Loading temporary config file...")
    config = Config(temp_config_path)
    print(f"✓ Config loaded from {temp_config_path}")

    # Show provider configs
    if "providers" in config.config:
        print(f"✓ Providers configured: {list(config.config['providers'].keys())}")

        # Show Ollama config
        ollama_config = config.get_provider_config("ollama")
        if ollama_config:
            print(f"  - Ollama base_url: {ollama_config.get('base_url')}")
            print(f"  - Ollama model: {ollama_config.get('model')}")

    # Show agent configs
    if "agents" in config.config:
        print(f"✓ Agents configured: {list(config.config['agents'].keys())}")

        # Show research agent config
        research_config = config.get_agent_config("research")
        if research_config:
            print(
                f"  - Research temperature: {research_config.get('temperature')}"
            )
            print(
                f"  - Research max_tokens: {research_config.get('max_tokens')}"
            )
    
    # Clean up temp file
    import os
    os.unlink(temp_config_path)

    # Demo 3: Environment variable interpolation
    print("\n🔧 DEMO 3: Environment Variable Features")
    print("-" * 70)
    print("Configuration supports ${VAR_NAME} syntax")
    print("Example: api_key: ${ANTHROPIC_API_KEY}")
    print("\nPrecedence order:")
    print("  1. Environment variables (highest)")
    print("  2. Config file")
    print("  3. Defaults (lowest)")

    # Demo 4: Validation
    print("\n✅ DEMO 4: Config Validation")
    print("-" * 70)
    print("Validating config...")
    try:
        # Use the temp config we created earlier
        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
            yaml.dump(demo_config, f)
            temp_path = f.name
        
        config = Config(temp_path)
        config.validate()
        print("✓ Config validation passed")
        os.unlink(temp_path)
    except Exception as e:
        print(f"✗ Config validation failed: {e}")

    # Demo 5: Using config with orchestrator
    print("\n🤖 DEMO 5: Using Config with Orchestrator")
    print("-" * 70)
    print("Creating orchestrator with config...")
    
    # Create temp config
    with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
        yaml.dump(demo_config, f)
        temp_path = f.name
    
    config = Config(temp_path)
    orch = AgentOrchestrator(config=config)
    print("✓ Orchestrator created with config")
    print(f"✓ Available config methods:")
    print(f"  - config.get_provider_config('ollama')")
    print(f"  - config.get_agent_config('research')")
    print(f"  - config.get_github_config()")
    print(f"  - config.get('key', section='providers.ollama')")
    
    os.unlink(temp_path)

    # Summary
    print("\n" + "=" * 70)
    print("Configuration Features Summary")
    print("=" * 70)
    print("✓ YAML and JSON format support")
    print("✓ Auto-discovery of config.yaml / config.json")
    print("✓ Environment variable interpolation (${VAR_NAME})")
    print("✓ Environment variables override file settings")
    print("✓ Custom config path via --config flag")
    print("✓ Schema validation with clear error messages")
    print("✓ Backward compatible (env-only still works)")
    print("\nSee config.yaml.example for full configuration options")
    print("=" * 70)


if __name__ == "__main__":
    demo_config_features()
