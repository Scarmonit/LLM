# Testing Omnipotent MCP with Inspector

## Quick Test with MCP Inspector

The MCP Inspector is a visual tool for testing MCP servers without needing to configure Claude.

### Step 1: Run the Inspector

```bash
npx @modelcontextprotocol/inspector uv --directory C:/Users/scarm/omnipotent-mcp run server.py
```

This will:
1. Start the MCP server
2. Open a browser at `http://localhost:5173`
3. Show all available tools

### Step 2: Test Tools Visually

In the Inspector UI you'll see:

**Tools Tab** - All 25+ tools listed:
- system_info
- list_processes
- kill_process
- execute_command
- network_connections
- read_file_advanced
- write_file_advanced
- search_files
- execute_python
- http_request
- scrape_webpage
- download_file
- get_env_var
- set_env_var
- list_env_vars
- analyze_text
- regex_search
- git_status
- git_log
- query_json_file
- cron_schedule_info
- get_clipboard
- set_clipboard
- create_zip
- extract_zip

### Step 3: Test Individual Tools

Click on any tool to test it:

#### Test 1: system_info
- Click "system_info"
- Click "Call Tool"
- See your system information in JSON format

#### Test 2: list_processes
- Click "list_processes"
- Enter filter: `"python"` (optional)
- Click "Call Tool"
- See all Python processes

#### Test 3: search_files
- Click "search_files"
- Enter directory: `"C:/Users/scarm"`
- Enter pattern: `"*.py"`
- Set recursive: `true`
- Click "Call Tool"
- See all Python files found

#### Test 4: execute_python
- Click "execute_python"
- Enter code: `"print('Hello from MCP!')"`
- Click "Call Tool"
- See output: `{"stdout": "Hello from MCP!\n", ...}`

#### Test 5: analyze_text
- Click "analyze_text"
- Enter text: `"The quick brown fox jumps over the lazy dog."`
- Click "Call Tool"
- See text analysis (word count, etc.)

### Step 4: Check Notifications

In the Inspector, you should see:
- Server connection established
- Tool list received
- Each tool call logged

### What Success Looks Like

✅ **Connection established**: Server starts without errors
✅ **Tools listed**: All 25+ tools appear in the Tools tab
✅ **Tool calls work**: Each test returns valid JSON
✅ **No errors**: Notifications pane shows successful operations

### Common Issues

#### Port already in use
If port 5173 is taken:
```bash
# The inspector will try the next available port
# Check the console output for the actual port
```

#### Server won't start
```bash
# Test server directly first
cd C:/Users/scarm/omnipotent-mcp
uv run server.py
# Should see startup messages
```

#### Tools not appearing
- Check that server started successfully
- Refresh the browser
- Check the console for errors

### Full Test Sequence

Here's a complete test sequence to verify everything:

1. **System Info Test**
   ```json
   Tool: system_info
   Args: (none)
   Expected: JSON with platform, CPU, memory, disk info
   ```

2. **Process List Test**
   ```json
   Tool: list_processes
   Args: {"filter_name": ""}
   Expected: Array of top 50 processes
   ```

3. **File Search Test**
   ```json
   Tool: search_files
   Args: {
     "directory": ".",
     "pattern": "*.py",
     "recursive": true,
     "max_results": 10
   }
   Expected: Array of Python files
   ```

4. **Python Execution Test**
   ```json
   Tool: execute_python
   Args: {"code": "print(2 + 2)"}
   Expected: {"stdout": "4\n", "returncode": 0}
   ```

5. **Text Analysis Test**
   ```json
   Tool: analyze_text
   Args: {"text": "Hello world! How are you?"}
   Expected: {
     "words": 5,
     "characters": 24,
     ...
   }
   ```

6. **Environment Variable Test**
   ```json
   Tool: list_env_vars
   Args: {"filter_prefix": "PATH"}
   Expected: JSON with PATH-related variables
   ```

### After Testing

Once the Inspector tests pass:

1. ✅ All tools are working
2. ✅ Server is stable
3. ✅ Ready for Claude Code CLI integration

Next: Add to your Claude Code CLI config and restart!

---

## Alternative: Manual Testing

If you prefer testing without the Inspector:

```bash
# Start server
cd C:/Users/scarm/omnipotent-mcp
uv run server.py

# In another terminal, test with Python:
python -c "
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import asyncio
import subprocess

async def test():
    server_params = StdioServerParameters(
        command='uv',
        args=['--directory', 'C:/Users/scarm/omnipotent-mcp', 'run', 'server.py']
    )
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print(f'Found {len(tools.tools)} tools:')
            for tool in tools.tools:
                print(f'  - {tool.name}')

asyncio.run(test())
"
```

Expected output:
```
Found 25 tools:
  - system_info
  - list_processes
  - kill_process
  ...
```

---

## Tips for Inspector Testing

1. **Start simple**: Test `system_info` first
2. **Check responses**: Ensure JSON is valid
3. **Test with parameters**: Try different inputs
4. **Monitor logs**: Watch the server console
5. **Test edge cases**: Empty strings, large inputs, etc.

Happy testing! 🧪
