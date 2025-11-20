# Kali MCP Server

Model Context Protocol server providing Kali Linux security scanning tools.

## Features

### 1. Nmap Port Scanning (`kali_nmap_scan`)

Perform network port scans with multiple modes:

- **Quick Scan**: Fast scan of 100 most common ports
- **Stealth Scan**: SYN stealth scan to avoid detection
- **Service Detection**: Identify services and versions

**Example**:
```json
{
  "tool": "kali_nmap_scan",
  "arguments": {
    "target": "example.com",
    "scanType": "quick"
  }
}
```

### 2. Technology Detection (`kali_tech_detect`)

Detect web technologies and frameworks:

- Server software
- Web frameworks (React, Vue, Angular)
- Content Management Systems
- Server-side technologies

**Example**:
```json
{
  "tool": "kali_tech_detect",
  "arguments": {
    "url": "https://example.com"
  }
}
```

### 3. Host Discovery (`kali_host_discovery`)

Discover active hosts in a network range:

- ICMP ping sweep
- Network mapping
- Host identification

**Example**:
```json
{
  "tool": "kali_host_discovery",
  "arguments": {
    "network": "192.168.1.0/24"
  }
}
```

## Security Features

### Input Validation
- Target format validation (IP/domain)
- CIDR notation validation
- URL parsing and validation

### SSRF Protection
- Blocks access to private IP ranges:
  - 127.0.0.0/8 (localhost)
  - 10.0.0.0/8 (private)
  - 172.16.0.0/12 (private)
  - 192.168.0.0/16 (private)

### Rate Limiting
- Command timeouts (60s for scans, 120s for discovery)
- Connection limits
- Resource constraints

### Error Handling
- Graceful timeout handling
- Command execution errors
- Network errors

## Requirements

### System
- Node.js >= 18.0.0
- Nmap installed and in PATH

### Install Nmap

**Ubuntu/Debian**:
```bash
sudo apt-get install nmap
```

**macOS**:
```bash
brew install nmap
```

**Windows**:
Download from https://nmap.org/download.html

### Node Dependencies
```bash
npm install
```

## Usage

### Standalone Mode
```bash
node src/mcp/kali-mcp-server.js
```

### With Claude Desktop

Add to Claude Desktop MCP settings (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "kali": {
      "command": "node",
      "args": [
        "C:\\Users\\scarm\\LLM\\src\\mcp\\kali-mcp-server.js"
      ]
    }
  }
}
```

### NPM Script
```bash
npm run kali:mcp
```

## Architecture

### Components

1. **MCP Server** (`src/mcp/kali-mcp-server.js`)
   - Tool registration
   - Request handling
   - Error management

2. **Security Layer**
   - Input validation
   - SSRF protection
   - Rate limiting

3. **Execution Layer**
   - Command spawning
   - Output capture
   - Timeout enforcement

### Message Format

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "kali_nmap_scan",
    "arguments": {
      "target": "example.com",
      "scanType": "quick"
    }
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"tool\":\"kali_nmap_scan\",\"target\":\"example.com\",\"scanType\":\"quick\",\"output\":\"...\"}"
      }
    ]
  }
}
```

## Performance

### Timeouts
- Nmap scans: 60 seconds
- Host discovery: 120 seconds
- HTTP requests: 10 seconds

### Resource Usage
- Memory: ~50MB baseline
- CPU: Varies with scan intensity
- Network: Depends on target responsiveness

## Troubleshooting

### "nmap: command not found"
**Solution**: Install Nmap (see Requirements section)

### "Permission denied" errors
**Solution**: Some scan types require root/admin privileges:
```bash
sudo node src/mcp/kali-mcp-server.js
```

### Timeout errors
**Solution**: 
- Check network connectivity
- Verify target is reachable
- Consider using quicker scan types

### SSRF protection blocking legitimate targets
**Solution**: Verify target is not in private IP ranges. For internal scanning, modify `isPrivateIP()` method.

## Development

### Adding New Tools

1. Add tool definition in `ListToolsRequestSchema` handler
2. Implement tool method (e.g., `async newTool(args)`)
3. Add case in `CallToolRequestSchema` handler
4. Update documentation

### Testing

```bash
node --test tests/kali-mcp-server.test.js
```

### Logging

Server logs to stderr (MCP stdout is reserved for protocol):
```bash
node src/mcp/kali-mcp-server.js 2> server.log
```

## Security Considerations

### Authorization
- No built-in authentication (relies on MCP transport security)
- Consider adding API keys for production
- Use Claude Desktop's built-in security

### Network Security
- SSRF protection enabled by default
- Rate limiting recommended for production
- Audit scan targets

### Legal Considerations
- Only scan systems you own or have permission to test
- Respect robots.txt and security policies
- Comply with applicable laws and regulations

## Roadmap

- [ ] Rate limiting implementation
- [ ] Scan result caching
- [ ] Advanced Nmap scripting engine support
- [ ] Vulnerability database integration
- [ ] Export results to formats (JSON, XML, CSV)
- [ ] Integration with other security tools

## License

ISC

## Support

For issues and feature requests, visit:
https://github.com/Scarmonit/LLM/issues
