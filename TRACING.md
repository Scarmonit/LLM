# OpenTelemetry Tracing Guide

## Overview

Your MCP servers now include comprehensive OpenTelemetry tracing for observability, debugging, and performance monitoring.

## Features

 **Distributed Tracing** - Track operations across your MCP servers  
 **Azure Application Insights** - Optional cloud-based monitoring  
 **Console Export** - Local development debugging  
 **Automatic Instrumentation** - All tool executions and MCP requests are traced  
 **Performance Metrics** - Execution times, success/failure rates  
 **Error Tracking** - Automatic exception recording in spans  

## Quick Start

### 1. Local Development (Console Tracing)

Tracing is **enabled by default** with console output for local development:

``powershell
# Run your MCP server normally
node src/mcp/aws-cli-mcp-server-traced.js
``

You'll see trace spans in the console showing:
- Operation names
- Execution times
- Tool parameters
- Success/failure status

### 2. Azure Application Insights (Optional)

To send traces to Azure Application Insights for cloud monitoring:

#### Step 1: Create Application Insights Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Application Insights** resource
3. Copy the **Connection String** from Properties

#### Step 2: Configure Environment

``powershell
# Create .env file
cp .env.example .env

# Edit .env and add your connection string
notepad .env
``

Add this line:
``
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://...
``

#### Step 3: Load Environment Variables

``powershell
# Install dotenv if needed
npm install dotenv

# Load env vars before running
node -r dotenv/config src/mcp/aws-cli-mcp-server-traced.js
``

## Tracing Structure

### Trace Hierarchy

``
mcp.request.list_tools
mcp.request.call_tool
   tool.aws_cli_execute
        (AWS CLI command execution)
``

### Trace Attributes

Each span includes:
- mcp.operation - Operation name
- mcp.component - Component type (tool, request)
- mcp.tool.name - Tool being executed
- mcp.tool.params - Tool parameters (sanitized)
- mcp.tool.duration_ms - Execution time
- mcp.request.type - Request type
- service.name - Service name
- service.version - Service version

## Tracing API

### Basic Usage

``javascript
import { tracing, traceTool, traceRequest } from '../utils/tracing.js';

// Initialize (already done in MCP servers)
tracing.initialize({
  serviceName: 'my-mcp-server',
  serviceVersion: '1.0.0',
});

// Trace a tool execution
await traceTool('my_tool', { param: 'value' }, async () => {
  // Your tool logic here
  return result;
});

// Trace an MCP request
await traceRequest('call_tool', { toolName: 'my_tool' }, async () => {
  // Your request handling logic
  return response;
});

// Custom tracing
await tracing.trace('custom_operation', async (span) => {
  span.setAttribute('custom.attr', 'value');
  // Your logic here
}, { 'category': 'custom' });
``

### Shutdown Gracefully

``javascript
// Already implemented in servers
process.on('SIGINT', async () => {
  await tracing.shutdown(); // Flushes pending spans
  process.exit(0);
});
``

## Viewing Traces

### Console (Local Development)

Traces appear in console output with:
- Span name
- Start/end times
- Attributes
- Status (OK/ERROR)
- Parent/child relationships

### Azure Application Insights

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Application Insights resource
3. Select **Transaction search** or **Application map**
4. View distributed traces with:
   - End-to-end transaction times
   - Dependency tracking
   - Failure analysis
   - Performance trends

## Troubleshooting

### No Traces Appearing

**Check Node Environment:**
``powershell
`production
# Should be 'development' for console tracing
``

**Verify Initialization:**
``javascript
// Check logs for: "Tracing initialized for service: aws-cli-mcp-server@1.0.0"
``

### Azure Traces Not Appearing

**Verify Connection String:**
``powershell
`
# Should show your full connection string
``

**Check Network:**
- Ensure outbound HTTPS allowed
- Check proxy/firewall settings
- Verify Azure endpoint reachability

**View Logs:**
``javascript
// Tracing module logs initialization status
// Look for: "Azure Monitor tracing enabled"
``

### Performance Impact

**Local Development:**
- Console export: ~1-5ms overhead per operation
- Minimal memory footprint

**Production:**
- Azure export: ~5-10ms overhead (batched)
- Network I/O is async (non-blocking)

**Disable if needed:**
``javascript
tracing.initialize({
  serviceName: 'my-service',
  consoleExport: false, // Disable console
});
``

## Best Practices

### 1. Use Meaningful Span Names
``javascript
// Good
await tracing.trace('fetch_user_profile', ...);

// Less helpful
await tracing.trace('operation1', ...);
``

### 2. Add Contextual Attributes
``javascript
await tracing.trace('process_data', async (span) => {
  span.setAttribute('data.size', dataSize);
  span.setAttribute('data.format', 'json');
  // ...
});
``

### 3. Record Errors Properly
``javascript
try {
  await operation();
} catch (error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw error;
}
``

### 4. Use Batching for Production
The tracing module uses BatchSpanProcessor by default, which:
- Batches multiple spans before export
- Reduces network calls
- Improves performance

## Files Created

- **src/utils/tracing.js** - Tracing configuration and API
- **src/mcp/aws-cli-mcp-server-traced.js** - Instrumented AWS CLI MCP server
- **.env.example** - Environment configuration template
- **TRACING.md** - This guide

## Next Steps

1. **Test locally** - Run the traced server and observe console output
2. **Set up Azure** (optional) - Create Application Insights and configure connection string
3. **Monitor production** - Analyze traces for performance bottlenecks and errors
4. **Instrument other servers** - Apply the same pattern to terraform-mcp-server.js

## Support

For OpenTelemetry documentation:
- [OpenTelemetry Docs](https://opentelemetry.io/docs/instrumentation/js/)
- [Azure Monitor Export](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-enable?tabs=nodejs)

For MCP SDK:
- [Model Context Protocol](https://modelcontextprotocol.io/)
