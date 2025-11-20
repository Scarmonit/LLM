# Configuration Guide

## Overview

The LLM Multi-Provider Framework now supports flexible configuration through YAML/JSON files in addition to environment variables. This guide explains how to use configuration files effectively.

## Quick Start

1. **Copy the example configuration:**
   ```bash
   cp config.yaml.example config.yaml
   ```

2. **Edit the configuration:**
   Edit `config.yaml` with your preferred text editor and update:
   - API keys (can use environment variables)
   - Provider settings (models, URLs)
   - Agent parameters (temperature, max_tokens)
   - GitHub integration settings

3. **Run the framework:**
   ```bash
   python run_real_agents.py
   ```
   
   The framework will automatically discover and use your `config.yaml` file.

## Configuration Formats

### YAML Format (Recommended)

```yaml
providers:
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}  # Environment variable
    model: claude-3-sonnet-20240229

  ollama:
    base_url: http://localhost:11434
    model: qwen2.5:0.5b

agents:
  research:
    temperature: 0.5
    max_tokens: 150
```

### JSON Format

```json
{
  "providers": {
    "anthropic": {
      "api_key": "${ANTHROPIC_API_KEY}",
      "model": "claude-3-sonnet-20240229"
    }
  },
  "agents": {
    "research": {
      "temperature": 0.5,
      "max_tokens": 150
    }
  }
}
```

## Environment Variable Interpolation

Use `${VAR_NAME}` syntax to reference environment variables:

```yaml
providers:
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}  # Will use ANTHROPIC_API_KEY env var
```

If the environment variable is not set, the literal string is kept.

## Configuration Precedence

Settings are applied in this order (highest to lowest):

1. **Environment Variables** (highest priority)
   - `ANTHROPIC_API_KEY` overrides config file
   - `OLLAMA_MODEL` overrides config file

2. **Configuration File**
   - `config.yaml` or `config.json`

3. **Code Defaults** (lowest priority)
   - Built-in defaults in provider/agent classes

### Example

If you have:
- Config file: `model: qwen2.5:0.5b`
- Environment variable: `OLLAMA_MODEL=llama2:7b`

The framework will use `llama2:7b` (env var wins).

## File Discovery

The framework searches for configuration files in this order:

1. Explicit path via `--config` flag (if provided)
2. `./config.yaml`
3. `./config.json`
4. No config (uses environment variables only)

## Using Config in Code

### Basic Usage

```python
from llm_framework.orchestrator import AgentOrchestrator

# Auto-discover config file
orchestrator = AgentOrchestrator()
```

### Explicit Config Path

```python
from llm_framework.config import Config
from llm_framework.orchestrator import AgentOrchestrator

# Use specific config file
config = Config('/path/to/config.yaml')
orchestrator = AgentOrchestrator(config=config)
```

### Accessing Config Values

```python
from llm_framework.config import Config

config = Config('config.yaml')

# Get provider config
ollama_config = config.get_provider_config('ollama')
print(ollama_config['model'])  # qwen2.5:0.5b

# Get agent config
research_config = config.get_agent_config('research')
print(research_config['temperature'])  # 0.5

# Get specific value with section
model = config.get('model', section='providers.ollama')
```

## Configuration Schema

### Providers Section

```yaml
providers:
  # Anthropic Claude
  anthropic:
    api_key: string          # Required for Claude
    model: string           # Optional, defaults to claude-3-sonnet-20240229

  # OpenAI
  openai:
    api_key: string          # Required for OpenAI
    base_url: string        # Optional, for compatible APIs
    model: string           # Optional

  # Ollama (local)
  ollama:
    base_url: string        # Optional, defaults to http://localhost:11434
    model: string           # Optional, defaults to qwen2.5:0.5b
```

### Agents Section

```yaml
agents:
  research:
    temperature: float      # 0.0-1.0, controls randomness
    max_tokens: integer     # Maximum response length

  coding:
    temperature: float
    max_tokens: integer

  writing:
    temperature: float
    max_tokens: integer
```

### GitHub Section

```yaml
github:
  token: string            # GitHub personal access token
  owner: string            # Repository owner
  repo: string             # Repository name
```

## Best Practices

1. **Never commit config files with secrets**
   - Use `.gitignore` (already configured)
   - Use environment variables for sensitive data

2. **Use environment variable interpolation**
   ```yaml
   api_key: ${ANTHROPIC_API_KEY}  # ✅ Good
   api_key: sk-ant-actual-key     # ❌ Bad - don't hardcode
   ```

3. **Version control example files**
   - Commit: `config.yaml.example`
   - Don't commit: `config.yaml`

4. **Document your settings**
   - Add comments to example files
   - Explain what each setting does

5. **Test with different configurations**
   ```bash
   # Development
   python run_real_agents.py --config config.dev.yaml
   
   # Production
   python run_real_agents.py --config config.prod.yaml
   ```

## Troubleshooting

### Config file not found

If you get "Config file not found" error:
- Check the file exists in the current directory
- Check file extension (`.yaml`, `.yml`, or `.json`)
- Try explicit path: `--config /full/path/to/config.yaml`

### Invalid YAML/JSON

If you get parsing errors:
- Validate YAML syntax (use online validator)
- Check for proper indentation (YAML is sensitive)
- Check JSON syntax (use `jq` or online validator)

### Environment variables not working

If `${VAR_NAME}` isn't being replaced:
- Check the variable is actually set: `echo $VAR_NAME`
- Check the syntax: must be exactly `${VAR_NAME}`
- Check the config is being loaded correctly

### Settings not taking effect

If your settings aren't being used:
1. Check precedence: env vars override config
2. Validate the config: `config.validate()`
3. Check spelling of keys (case-sensitive)
4. Verify the config file is being loaded

## Examples

### Minimal Config (Ollama only)

```yaml
providers:
  ollama:
    model: llama2:7b
```

### Full Config (All providers)

```yaml
providers:
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}
    model: claude-3-sonnet-20240229
  
  openai:
    api_key: ${OPENAI_API_KEY}
    model: gpt-4
  
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
  writing:
    temperature: 0.8
    max_tokens: 300

github:
  token: ${GITHUB_TOKEN}
  owner: YourOrg
  repo: your-repo
```

### Development vs Production

**config.dev.yaml:**
```yaml
providers:
  ollama:
    base_url: http://localhost:11434
    model: qwen2.5:0.5b  # Fast, local model

agents:
  research:
    max_tokens: 100  # Shorter for faster testing
```

**config.prod.yaml:**
```yaml
providers:
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}
    model: claude-3-sonnet-20240229  # Production model

agents:
  research:
    max_tokens: 500  # Longer, detailed responses
```

## Migration from Environment Variables

If you're currently using environment variables, you can migrate gradually:

### Before (env only)
```bash
export ANTHROPIC_API_KEY=sk-ant-...
export OLLAMA_BASE_URL=http://localhost:11434
python run_real_agents.py
```

### After (mixed - recommended)
```yaml
# config.yaml
providers:
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}  # Still uses env var
    model: claude-3-sonnet-20240229  # New: from file

agents:
  research:
    temperature: 0.5  # New: from file
```

```bash
export ANTHROPIC_API_KEY=sk-ant-...  # Still needed
python run_real_agents.py  # Simpler command
```

## Additional Resources

- Example files: `config.yaml.example`, `config.json.example`
- Demo script: `python demo_config.py`
- Source code: `src/llm_framework/config.py`
- Tests: `tests/test_config.py`
