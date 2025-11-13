# Axiom.ai Integration Setup Guide

Complete guide to integrating Axiom.ai with your existing automation stack.

## What is Axiom.ai?

Axiom.ai is a no-code browser automation platform that complements your existing Puppeteer-based automation:

- **Axiom.ai**: Visual, template-based automations (fast setup, no coding)
- **Puppeteer**: Programmatic control (complex logic, full customization)
- **Together**: Complete automation coverage for any use case

## Prerequisites

### 1. Axiom.ai Account (Paid Plan Required)

**Note**: The Axiom.ai API is only available on paid plans, not free plans.

1. Visit [https://axiom.ai](https://axiom.ai)
2. Sign up for an account
3. Choose a paid plan (API access required)
4. Install the browser extension (Chrome, Firefox, or Edge)

### 2. Generate API Key

1. Open the Axiom.ai browser extension
2. Navigate to **Google Sheets and API key**
3. Click **"Show API token"** under "Generate Axiom API token"
4. Click **"Copy and close"** to copy your API key

### 3. Save API Key

Choose one of these methods:

#### Option A: Environment Variable (Recommended for CI/CD)

**Windows (Git Bash/MSYS2):**
```bash
echo 'export AXIOM_API_KEY="your-api-key-here"' >> ~/.bash_profile
source ~/.bash_profile
```

**Windows (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable('AXIOM_API_KEY', 'your-api-key-here', 'User')
```

#### Option B: Local File (Recommended for Development)

**Windows (Git Bash/MSYS2):**
```bash
echo "your-api-key-here" > ~/.axiom-key.txt
chmod 600 ~/.axiom-key.txt
```

**Windows (PowerShell):**
```powershell
"your-api-key-here" | Out-File -FilePath "$env:USERPROFILE\.axiom-key.txt" -Encoding ASCII
```

## Quick Start

### 1. Test Your API Connection

```bash
node axiom-client.cjs trigger "Test Automation"
```

If you see an error about missing API key, check your setup above.

### 2. Create Your First Automation

1. Open Axiom.ai extension
2. Click **"New Axiom"**
3. Choose a template or use **Axiom Builder**
4. Name it (e.g., "Test Automation")
5. Configure the steps
6. Save and test in the extension

### 3. Trigger from Node.js

```javascript
const { AxiomClient } = require('./axiom-client.cjs');

const client = new AxiomClient();

// Trigger automation
const result = await client.triggerAutomation('Test Automation');
console.log('Run ID:', result.runId);

// Check status
const status = await client.getRunData(result.runId);
console.log('Status:', status);
```

### 4. Run Integration Examples

```bash
# View all examples
node axiom-puppeteer-bridge.cjs

# Test with your automation names
node axiom-client.cjs run "Your Automation Name"
```

## Integration Patterns

### Pattern 1: Scrape → Fill
**Puppeteer scrapes data, Axiom.ai fills forms**

```javascript
const { AxiomClient, formatDataForAxiom } = require('./axiom-client.cjs');

// Scrape data with Puppeteer
const data = await puppeteerScrape();

// Format for Axiom.ai
const axiomData = formatDataForAxiom(data);

// Trigger form filling automation
const client = new AxiomClient();
await client.runAutomation('Form Filler', axiomData);
```

### Pattern 2: Visual Scrape → Process
**Axiom.ai scrapes visually, Node.js processes**

```javascript
const client = new AxiomClient();

// Trigger Axiom.ai scraper
const result = await client.runAutomation('Visual Scraper');

// Process the results
const processed = processData(result.data);
```

### Pattern 3: Orchestrated Workflow
**Both tools in sequence**

```javascript
// 1. Puppeteer handles login
await puppeteerLogin();

// 2. Axiom.ai performs repetitive UI tasks
await client.runAutomation('Click Workflow');

// 3. Puppeteer extracts final results
const results = await puppeteerExtract();
```

## Configuration

### Edit `axiom-config.json`

```json
{
  "automations": {
    "my-scraper": {
      "name": "My Web Scraper",
      "description": "Scrapes product data",
      "type": "scraping",
      "enabled": true
    }
  },
  "settings": {
    "defaultTimeout": 300000,
    "pollInterval": 2000
  }
}
```

## CLI Commands

```bash
# Trigger automation
node axiom-client.cjs trigger "Automation Name"

# Trigger with data
node axiom-client.cjs trigger "Automation Name" '[["A1","B1"],["A2","B2"]]'

# Check status
node axiom-client.cjs status "run-123456"

# Run and wait for completion
node axiom-client.cjs run "Automation Name"
```

## API Reference

### AxiomClient Methods

#### `triggerAutomation(name, data, options)`
Trigger an automation without waiting for completion.

**Parameters:**
- `name` (string): Automation name (case-sensitive)
- `data` (Array): 2D array of data `[[row1], [row2]]`
- `options` (Object): Optional settings
  - `runId`: Custom run ID
  - `webhookUrl`: Webhook for completion notification

**Returns:** `{ runId: string, link: string }`

#### `getRunData(runId)`
Get automation run status and results.

**Parameters:**
- `runId` (string): Run ID from trigger response

**Returns:** `{ status: string, data: Array, ... }`

#### `waitForCompletion(runId, pollInterval, maxWait)`
Poll until automation completes.

**Parameters:**
- `runId` (string): Run ID to monitor
- `pollInterval` (number): Poll interval in ms (default: 2000)
- `maxWait` (number): Max wait time in ms (default: 300000)

**Returns:** Final run data

#### `runAutomation(name, data, options)`
Trigger and wait for completion (convenience method).

**Parameters:** Same as `triggerAutomation`

**Returns:** Complete run data

### Helper Functions

#### `formatDataForAxiom(objects)`
Convert array of objects to Axiom.ai 2D array format.

```javascript
const objects = [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
];

const axiomData = formatDataForAxiom(objects);
// Result: [
//   ['name', 'email'],
//   ['John', 'john@example.com'],
//   ['Jane', 'jane@example.com']
// ]
```

## Use Cases

### 1. Automated Data Entry
Scrape data from one source, automatically fill forms on another.

### 2. Competitive Analysis
Axiom.ai scrapes competitor sites, Node.js analyzes and stores data.

### 3. Job Application Automation
Puppeteer customizes cover letters, Axiom.ai fills application forms.

### 4. Social Media Management
Schedule posts, monitor mentions, automated responses.

### 5. E-commerce Operations
Price monitoring, inventory updates, order processing.

## Integration with Existing Tools

### With Puppeteer MCP
```javascript
// Use Puppeteer for complex authentication
// Use Axiom.ai for repetitive clicking/scrolling
// Use Puppeteer for final data extraction
```

### With ChatGPT
```javascript
// Axiom.ai scrapes content
// Send to ChatGPT API for processing
// Axiom.ai posts processed results
```

### With Zapier/Make
Set webhook in Axiom.ai to trigger Zapier workflows.

## Troubleshooting

### "API key not found"
- Check `~/.axiom-key.txt` exists and contains valid key
- Or verify `AXIOM_API_KEY` environment variable is set
- Run `echo $AXIOM_API_KEY` to verify

### "Free plan does not have API access"
- Upgrade to a paid Axiom.ai plan
- API access is not available on free tier

### "Automation not found"
- Automation names are case-sensitive
- Check exact name in Axiom.ai extension
- Ensure automation is saved and not deleted

### Rate Limits
- Axiom.ai has rate limits based on your plan
- Implement exponential backoff for high-volume use
- Check documentation for current limits

## Best Practices

1. **Use Axiom.ai for**:
   - Visual/template-based tasks
   - Rapid prototyping
   - Non-technical user workflows
   - Tasks with existing templates

2. **Use Puppeteer for**:
   - Complex conditional logic
   - Custom data processing
   - Authentication flows
   - Database integration

3. **Security**:
   - Never commit `.axiom-key.txt` to git
   - Use environment variables in CI/CD
   - Rotate API keys periodically
   - Add `.axiom-key.txt` to `.gitignore`

4. **Performance**:
   - Batch data when possible
   - Use webhooks instead of polling
   - Cache automation metadata
   - Monitor API usage

## Next Steps

1. ✓ Install Axiom.ai extension
2. ✓ Generate and save API key
3. ✓ Test connection with `axiom-client.cjs`
4. ✓ Create first automation in extension
5. ✓ Trigger from Node.js
6. ✓ Review `axiom-puppeteer-bridge.cjs` examples
7. ✓ Build your first integrated workflow

## Resources

- [Axiom.ai Official Docs](https://axiom.ai/docs/)
- [API Reference](https://axiom.ai/docs/reference/api)
- [Axiom.ai Templates](https://axiom.ai/templates/)
- [Integration Examples](axiom-puppeteer-bridge.cjs)

## Support

- Axiom.ai Support: [https://axiom.ai/support](https://axiom.ai/support)
- API Documentation: [https://axiom.ai/docs/developers/](https://axiom.ai/docs/developers/)
- Community: Axiom.ai Discord/Forum

---

**Ready to automate!** 🚀

Start with the examples in `axiom-puppeteer-bridge.cjs` and customize for your needs.
