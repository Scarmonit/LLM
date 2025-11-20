# NPM Scripts Quick Reference

## Essential Commands

### Installation & Setup

```bash
npm install              # Install all dependencies
npm run fix:npm          # Fix npm issues and verify setup
npm run fix:npm:clean    # Clean install (removes node_modules first)
npm run clean            # Remove node_modules and package-lock.json
```

### Running the Application

```bash
npm start                # Start the main application
npm run start:bridge     # Start AI bridge server
npm run dev              # Run in development mode (same as start)
```

### Kali MCP Server

```bash
npm run kali:help        # Show help for Kali MCP usage
npm run test:kali-mcp    # Test Kali MCP server (recommended)
npm run kali:mcp         # Run Kali MCP server (not for direct use)
```

### MCP Tools

```bash
npm run mcp:config       # Load MCP configuration
npm run mcp:diagnose     # Diagnose MCP startup issues
```

### Testing & Quality

```bash
npm test                 # Run all tests
npm run lint             # Lint source code
npm run format           # Format code with prettier
npm run verify:npm       # Verify npm setup and security
```

### Troubleshooting

```bash
npm run fix:ide          # Fix IDE-specific package issues
npm run fix:npm          # Fix npm installation issues
npm run clean            # Start fresh (remove node_modules)
```

## Detailed Command Information

### `npm run fix:npm`

Comprehensive npm fix script that:
- ✅ Checks npm version and state
- ✅ Cleans and verifies cache
- ✅ Installs all packages
- ✅ Runs security audit
- ✅ Verifies installation
- ✅ Checks for updates

**Output Example:**
```
═══════════════════════════════════════════════════════════
  NPM Installation & Security Fix Script
═══════════════════════════════════════════════════════════

📊 Step 1: Checking current npm state...
   ✓ npm version: 11.6.2
...
✅ All checks passed! npm environment is healthy.
```

### `npm run fix:npm:clean`

Same as `fix:npm` but removes node_modules first for a completely fresh install.

**When to use:**
- After pulling major changes
- When facing persistent package issues
- Before important deployments

### `npm run clean`

Removes:
- `node_modules/` directory
- `package-lock.json` file

**Output Example:**
```
🧹 Cleaning project...
   🗑️  Removing node_modules...
   ✅ node_modules removed
   🗑️  Removing package-lock.json...
   ✅ package-lock.json removed

✅ Cleaning complete!
💡 Run `npm install` to reinstall dependencies
```

### `npm run verify:npm`

Quick verification that:
- Runs `npm audit` to check for vulnerabilities
- Runs `npm ls --depth=0` to verify installed packages

### `npm test`

Runs the Node.js native test runner:
```bash
node --test tests/**/*.test.js
```

## Common Workflows

### Fresh Start
```bash
npm run clean
npm install
npm run verify:npm
```

### Fix Installation Issues
```bash
npm run fix:npm          # Try standard fix first
# If problems persist:
npm run fix:npm:clean    # Nuclear option
```

### Development Workflow
```bash
npm install              # Initial setup
npm run dev              # Start development server
npm test                 # Run tests
npm run lint             # Check code quality
```

### Pre-Commit Checks
```bash
npm test                 # All tests pass
npm run lint             # No linting errors
npm run format           # Code formatted
npm run verify:npm       # No vulnerabilities
```

## Platform Support

All scripts work on:
- ✅ Windows (PowerShell, CMD)
- ✅ macOS (Terminal, iTerm)
- ✅ Linux (Bash, Zsh, etc.)
- ✅ CI/CD environments (GitHub Actions, etc.)

## Script Categories

### Lifecycle Hooks
- `preinstall` - Runs before package installation
- `postinstall` - Runs after package installation

### Server Scripts
- `start` - Production server
- `start:bridge` - AI bridge server
- `dev` - Development server

### Kali MCP Scripts
- `kali:mcp` - MCP server
- `kali:help` - Usage help
- `test:kali-mcp` - Testing client

### MCP Utility Scripts
- `mcp:config` - Configuration loader
- `mcp:diagnose` - Diagnostics

### Fix Scripts
- `fix:ide` - IDE package fixes
- `fix:npm` - npm installation fixes
- `fix:npm:clean` - Clean npm fix

### Quality Scripts
- `test` - Run tests
- `lint` - Code linting
- `format` - Code formatting
- `verify:npm` - Verify npm setup

### Utility Scripts
- `clean` - Remove dependencies
- `dev` - Development mode

## Exit Codes

Scripts follow standard Unix exit codes:
- `0` - Success
- `1` - Error occurred
- Other codes - Specific error conditions

## Environment Variables

Scripts respect standard npm environment variables:
- `NODE_ENV` - Environment (development, production)
- `npm_config_*` - npm configuration

## Tips

1. **Always run `npm run verify:npm` after installation**
2. **Use `npm run fix:npm:clean` for stubborn issues**
3. **Run `npm test` before committing**
4. **Check `npm run` to see all available scripts**
5. **Scripts are cross-platform - work everywhere**

## Getting Help

```bash
npm run                  # List all available scripts
npm run kali:help        # Kali MCP specific help
npm run fix:npm          # Comprehensive setup check
```

---

**Last Updated**: November 20, 2025  
**Version**: 2.1.1  
**Platform**: Cross-platform (Windows, macOS, Linux)

