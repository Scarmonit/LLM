# Development Container Configuration

This directory contains the development container configuration for GitHub Codespaces and VS Code Remote Containers.

## What's Included

- **Base Image**: Universal dev container with common tools
- **Features**: Project-specific tools and runtimes
- **Extensions**: VS Code extensions for development
- **Lifecycle Scripts**: Automated setup on container creation

## Usage

### GitHub Codespaces

1. Open this repository in GitHub
2. Click "Code" → "Create codespace on main"
3. Wait for container to build (~2-5 minutes first time)
4. Start coding!

### VS Code Remote Containers

1. Install "Remote - Containers" extension
2. Open this repository in VS Code
3. Click "Reopen in Container" when prompted
4. Wait for container to build

## Cost Optimization

This configuration uses:
- **2 CPU cores** (free tier eligible)
- **4GB RAM** (efficient for most tasks)
- **32GB storage** (within free tier)

### Tips to Reduce Costs

1. **Use Prebuilds**: Enable prebuilds in repository settings
2. **Auto-Stop**: Configure auto-stop timeout (default: 30 min)
3. **Monitor Usage**: Check usage at github.com/settings/billing
4. **Stop When Done**: Stop codespace when not actively coding

## Customization

Edit `.devcontainer/devcontainer.json` to:
- Add more features
- Install additional extensions
- Change resource limits
- Add lifecycle scripts
- Configure port forwarding

## Troubleshooting

### Container fails to build
- Check Docker syntax in devcontainer.json
- View build logs in VS Code output panel
- Try rebuilding: Cmd/Ctrl + Shift + P → "Rebuild Container"

### Slow performance
- Increase CPU/memory in hostRequirements
- Use prebuilds for faster startup
- Check for resource-heavy extensions

### Extensions not loading
- Ensure extension IDs are correct
- Check extension compatibility
- Reload window after installation

## Resources

- [Dev Containers Spec](https://containers.dev/)
- [GitHub Codespaces Docs](https://docs.github.com/en/codespaces)
- [Feature List](https://containers.dev/features)
