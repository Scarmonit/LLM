# Render API Extension for Gemini CLI

Configure Render.com services, push environment variables, and trigger deployments directly from Gemini CLI.

## Features

- **Environment Variables**: Set `GOOGLE_APPLICATION_CREDENTIALS_JSON` and other env vars
- **Service Configuration**: Update `healthCheckPath`, `startCommand`, `branch`, etc.
- **Instant Deployments**: Trigger deployments after configuration changes
- **All-in-One Command**: Configure and deploy in a single action

## Installation

### Prerequisites

1. **Gemini CLI** installed and configured
2. **Node.js** v18 or later
3. **Render API Key** from [Render Dashboard](https://dashboard.render.com/u/settings#api-keys)

### Setup

1. Clone or download this extension:
```bash
cd ~/mcp-servers/render-api-extension
```

2. Install dependencies and build:
```bash
npm install
npm run build
```

3. Set your Render API key:
```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
export RENDER_API_KEY="rnd_xxxxxxxxxxxx"
```

4. Install the extension in Gemini CLI:
```bash
# Option A: Link for development (changes reflect immediately)
gemini extensions link ~/mcp-servers/render-api-extension

# Option B: Install (creates a copy)
gemini extensions install ~/mcp-servers/render-api-extension
```

5. Restart Gemini CLI

## Usage

### Using Custom Commands

```bash
# Start Gemini CLI
gemini

# Use the custom commands
> /push-gcp-creds    # Push Google credentials and update health check
> /deploy-config     # General configuration and deployment helper
```

### Direct Tool Usage

```bash
# List all your Render services
> Use render_list_services to show my services

# Set GOOGLE_APPLICATION_CREDENTIALS_JSON
> Use render_set_env_var to set GOOGLE_APPLICATION_CREDENTIALS_JSON on service srv-xxxxx

# Update health check path
> Use render_update_service to set healthCheckPath to /health on srv-xxxxx

# Deploy changes
> Use render_deploy_service on srv-xxxxx

# All-in-one (recommended)
> Use render_configure_and_deploy to set GOOGLE_APPLICATION_CREDENTIALS_JSON and healthCheckPath=/health on srv-xxxxx, then deploy
```

### Example: Push Credentials and Update Health Check

```
You: Use render_configure_and_deploy with:
     - serviceId: srv-xxxxx
     - envVars: [{"key": "GOOGLE_APPLICATION_CREDENTIALS_JSON", "value": "{\"type\":\"service_account\",...}"}]
     - healthCheckPath: /api/health

Gemini: I'll configure and deploy your service...
        [Sets environment variable]
        [Updates health check path]
        [Triggers deployment]
        Done! Deployment started.
```

## Available Tools

| Tool | Description |
|------|-------------|
| `render_list_services` | List all services in your account |
| `render_get_service` | Get detailed service information |
| `render_set_env_var` | Set a single environment variable |
| `render_set_env_vars` | Replace all environment variables |
| `render_get_env_vars` | List all environment variables |
| `render_update_service` | Update service configuration |
| `render_deploy_service` | Trigger a new deployment |
| `render_get_deploys` | List recent deployments |
| `render_restart_service` | Restart without redeploying |
| `render_configure_and_deploy` | All-in-one: set vars + config + deploy |

## Configuration Options

### Environment Variables

| Variable | Description |
|----------|-------------|
| `RENDER_API_KEY` | Your Render API key (required) |

### Service Configuration Fields

When using `render_update_service`:

- `healthCheckPath` - Health check endpoint (e.g., `/health`)
- `startCommand` - Command to start the service
- `branch` - Git branch to deploy
- `autoDeploy` - Enable/disable auto-deploy (`yes`/`no`)
- `dockerCommand` - Docker command override
- `plan` - Service plan (free, starter, standard, pro, etc.)
- `numInstances` - Number of instances
- `region` - Deployment region

## Tool Chain Diagram

```
[render_set_env_var]  ─┐
                      │
[render_update_service]├──> [render_deploy_service] ──> Changes Live!
                      │
     OR use:          │
                      │
[render_configure_and_deploy] ────────────────────────> All in one!
```

## Troubleshooting

### "RENDER_API_KEY environment variable is required"

Make sure you've exported your API key:
```bash
export RENDER_API_KEY="rnd_xxxxxxxxxxxx"
```

### Changes not appearing after configuration

Remember to deploy! Configuration changes require a deployment to take effect:
```
> Use render_deploy_service on srv-xxxxx
```

Or use `render_configure_and_deploy` which deploys automatically.

### Finding your Service ID

Service IDs look like `srv-xxxxx`. Find them by:
1. Using `render_list_services`
2. Looking in your Render Dashboard URL

## API Reference

This extension uses the [Render API](https://api-docs.render.com/):

- [Update Environment Variables](https://api-docs.render.com/reference/update-env-vars-for-service)
- [Update Service](https://api-docs.render.com/reference/update-service)
- [Create Deploy](https://api-docs.render.com/reference/create-deploy)
- [Health Checks Documentation](https://render.com/docs/health-checks)

## License

MIT
