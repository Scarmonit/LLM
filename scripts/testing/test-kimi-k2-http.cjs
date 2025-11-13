const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const PORT = 8765;

// Start a simple HTTP server
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = path.join(__dirname, 'kimi-k2-puter-test.html');

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
      console.log(`HTTP Server started at http://localhost:${PORT}/`);
      resolve(server);
    });
  });
}

(async () => {
  let server, browser;

  try {
    // Start the HTTP server
    server = await startServer();

    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Monitor network requests
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('puter') || url.includes('api') || url.includes('openrouter')) {
        console.log('Network:', response.status(), url.substring(0, 80));
        if (response.status() !== 200) {
          try {
            const body = await response.text();
            console.log('Error Body:', body.substring(0, 300));
          } catch (e) {}
        }
      }
    });

    page.on('console', msg => {
      console.log('PAGE:', msg.text());
    });

    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });

    // Navigate to the page via HTTP
    console.log('\nOpening page via HTTP...');
    await page.goto(`http://localhost:${PORT}/`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('Waiting for Puter SDK to initialize...');
    await delay(5000);

    console.log('Clicking "Ask Kimi K2" button...');
    await page.click('#sendBtn');

    // Poll for response for up to 2 minutes
    console.log('Waiting for Kimi K2 response...\n');
    let responseReceived = false;
    const maxAttempts = 60; // 2 minutes
    let attempts = 0;

    while (attempts < maxAttempts && !responseReceived) {
      await delay(2000);
      attempts++;

      const state = await page.evaluate(() => {
        const responseDiv = document.getElementById('response');
        const sendBtn = document.getElementById('sendBtn');
        return {
          text: responseDiv ? responseDiv.textContent.trim() : '',
          html: responseDiv ? responseDiv.innerHTML : '',
          buttonDisabled: sendBtn ? sendBtn.disabled : true
        };
      });

      // Check if we got a response (not loading, button re-enabled, or error message)
      if (!state.buttonDisabled || state.text.includes('Error') || state.text.includes('❌')) {
        console.log('Response received after', attempts * 2, 'seconds');
        responseReceived = true;

        console.log('\n=== KIMI K2 RESPONSE ===');
        console.log(state.text);
        console.log('=== END RESPONSE ===\n');

        // Get stats if available
        const stats = await page.evaluate(() => {
          const statsDiv = document.getElementById('stats');
          if (statsDiv && statsDiv.style.display !== 'none') {
            return {
              responseTime: document.getElementById('responseTime').textContent,
              wordCount: document.getElementById('wordCount').textContent,
              model: document.getElementById('model').textContent
            };
          }
          return null;
        });

        if (stats) {
          console.log('=== STATS ===');
          console.log(JSON.stringify(stats, null, 2));
          console.log('=== END STATS ===\n');
        }

        // Save response to file
        const outputPath = path.join(__dirname, 'kimi-k2-response.txt');
        fs.writeFileSync(outputPath, state.text, 'utf8');
        console.log('Response saved to:', outputPath);

        break;
      }

      if (attempts % 5 === 0) {
        console.log(`Still waiting... (${attempts * 2}s elapsed)`);
      }
    }

    if (!responseReceived) {
      console.log('\nNo response after', maxAttempts * 2, 'seconds');
      const finalState = await page.evaluate(() => ({
        text: document.getElementById('response').textContent.trim()
      }));
      console.log('Final state:', finalState.text);
    }

    await delay(2000);
    await browser.close();
    server.close();
    console.log('\nServer stopped');

  } catch (error) {
    console.error('Script Error:', error.message);
    if (browser) await browser.close();
    if (server) server.close();
    process.exit(1);
  }
})();
