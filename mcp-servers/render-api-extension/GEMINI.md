# Render API Extension for Gemini CLI

This extension provides tools to manage Render.com services directly from Gemini CLI.

## Available Tools

### Service Management
- `render_list_services` - List all services in your account
- `render_get_service` - Get detailed service information

### Environment Variables
- `render_set_env_var` - Set a single environment variable
- `render_set_env_vars` - Replace all environment variables (use with caution)
- `render_get_env_vars` - List all environment variables

### Service Configuration
- `render_update_service` - Update service config (healthCheckPath, startCommand, branch, etc.)

### Deployment
- `render_deploy_service` - Trigger a new deployment
- `render_get_deploys` - List recent deployments
- `render_restart_service` - Restart without redeploying

### All-in-One
- `render_configure_and_deploy` - Set env vars + update config + deploy in one command

## Common Workflows

### Push Google Application Credentials and Update Health Check
```
Use render_configure_and_deploy with:
- serviceId: your service ID
- envVars: [{"key": "GOOGLE_APPLICATION_CREDENTIALS_JSON", "value": "<json-content>"}]
- healthCheckPath: "/health"
```

### Update Just the Health Check Path
```
Use render_update_service with:
- serviceId: your service ID
- healthCheckPath: "/api/health"
Then use render_deploy_service to apply changes.
```

### Set Multiple Environment Variables
```
Use render_configure_and_deploy with envVars array containing all variables you want to add/update.
Existing variables not in the array will be preserved.
```

## Important Notes

1. **Changes require deployment**: After updating env vars or config, you MUST deploy for changes to take effect.
2. **Environment variable merge**: `render_configure_and_deploy` merges new vars with existing ones.
3. **Full replacement warning**: `render_set_env_vars` replaces ALL env vars - use `render_set_env_var` for single updates.
4. **API Key required**: Set RENDER_API_KEY environment variable before using.

## Getting Your Service ID

Service IDs look like `srv-xxxxx`. Find them by:
1. Using `render_list_services` to see all your services
2. Looking in Render Dashboard URL: `dashboard.render.com/web/srv-xxxxx`
