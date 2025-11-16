#!/usr/bin/env node

/**
 * Kimi K2 Direct Test - Fixed Version
 * Properly handles authentication errors and JSON parsing issues
 */

const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { safeJsonParse, isAuthError } = require('./kimi-k2-utils');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const PORT = 8767;

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = path.join(__dirname, 'kimi-k2-direct-test.html');

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading file');
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache'
        });
        res.end(data);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}/`);
      resolve(server);
    });
  });
}

(async () => {
  let server, browser;

  try {
    server = await startServer();

    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    console.log('Opening page...\n');
    await page.goto(`http://localhost:${PORT}/`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await delay(2000);

    console.log('Clicking button...\n');
    await page.click('#sendBtn');

    // Wait for response
    console.log('Waiting for response...\n');
    await page.waitForFunction(() => {
      const btn = document.getElementById('sendBtn');
      return btn && !btn.disabled;
    }, { timeout: 60000 });

    const responseText = await page.evaluate(() => {
      return document.getElementById('response').textContent.trim();
    });

    console.log('=== KIMI K2 RESPONSE ===');
    console.log(responseText);
    console.log('=== END RESPONSE ===\n');

    // Handle response with proper error checking
    if (isAuthError(responseText)) {
      console.warn('⚠ Authentication error detected in response');
      const errorData = {
        timestamp: new Date().toISOString(),
        status: 'authentication_error',
        error: responseText,
        message: 'Authentication required - API key needed for Kimi K2 access'
      };
      
      // Save to error file
      const errorPath = path.join(__dirname, 'kimi-k2-auth-error.json');
      fs.writeFileSync(errorPath, JSON.stringify(errorData, null, 2));
      console.log('Authentication error saved to:', errorPath);
      
      // Also save raw response
      const rawPath = path.join(__dirname, 'kimi-k2-raw-response.txt');
      fs.writeFileSync(rawPath, responseText);
      console.log('Raw response saved to:', rawPath);
      
      throw new Error('Authentication required - Kimi K2 requires API key');
    }

    // Save successful response
    const outputPath = path.join(__dirname, 'kimi-k2-direct-response.txt');
    fs.writeFileSync(outputPath, responseText, 'utf8');
    console.log('Saved to:', outputPath, '\n');

    await delay(2000);
    await browser.close();
    server.close();
    console.log('Done');

  } catch (error) {
    console.error('Error:', error.message);
    if (browser) await browser.close();
    if (server) server.close();
    
    // Save error details
    const errorDetails = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    
    const errorPath = path.join(__dirname, 'kimi-k2-direct-error.json');
    fs.writeFileSync(errorPath, JSON.stringify(errorDetails, null, 2));
    console.log('Error details saved to:', errorPath);
    
    process.exit(1);
  }
})();