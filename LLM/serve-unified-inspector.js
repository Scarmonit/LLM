#!/usr/bin/env node

/**
 * Serve Unified MCP Inspector
 * Quick server to serve the unified inspector on port 65033
 */

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 65033;

const server = createServer(async (req, res) => {
  try {
    const html = await readFile(join(__dirname, 'src/mcp/mcp-unified-inspector.html'), 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } catch (error) {
    res.writeHead(404);
    res.end('Unified inspector not found');
  }
});

server.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log(`🔍 MCP Unified Inspector`);
  console.log('='.repeat(70));
  console.log(`\n✅ Server running on: http://localhost:${PORT}`);
  console.log('\n📊 This page integrates:');
  console.log('   - MCP Inspector (localhost:6274)');
  console.log('   - Enhanced Dashboard (localhost:65031/enhanced)');
  console.log('   - Original Dashboard (localhost:65031)');
  console.log('\n💡 Open in browser: http://localhost:65033');
  console.log('\n' + '='.repeat(70) + '\n');
});
