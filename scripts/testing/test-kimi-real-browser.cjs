const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const PORT = 8768;

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
      console.log(`Server: http://localhost:${PORT}/`);
      resolve(server);
    });
  });
}

(async () => {
  let server, browser;

  try {
    server = await startServer();

    // Use a persistent browser profile to maintain Puter's auth
    const userDataDir = path.join(__dirname, '.puppeteer-profile');
    
    browser = await puppeteer.launch({
      headless: false,
      userDataDir: userDataDir,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const page = await browser.newPage();

    page.on('console', msg => {
      const text = msg.text();
      if (!text.includes('Navigated to')) {
        console.log('PAGE:', text);
      }
    });

    console.log('Loading page...\n');
    await page.goto(`http://localhost:${PORT}/`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait longer for Puter to fully initialize
    console.log('Waiting for Puter SDK (10 seconds)...\n');
    await delay(10000);

    // Check Puter auth status
    const puterStatus = await page.evaluate(() => {
      if (typeof puter === 'undefined') return 'Puter not loaded';
      if (typeof puter.auth === 'undefined') return 'Puter.auth not available';
      return 'Puter loaded';
    });

    console.log('Puter Status:', puterStatus);

    if (puterStatus !== 'Puter loaded') {
      console.log('Puter SDK not ready. Stopping.');
      await browser.close();
      server.close();
      return;
    }

    console.log('Clicking Ask Kimi K2...\n');
    await page.click('#sendBtn');

    // Wait for response with extended timeout
    console.log('Waiting for AI response (max 2 minutes)...\n');
    
    let responseText = '';
    let gotResponse = false;

    for (let i = 0; i < 60; i++) {
      await delay(2000);

      const state = await page.evaluate(() => {
        const responseDiv = document.getElementById('response');
        const sendBtn = document.getElementById('sendBtn');
        return {
          text: responseDiv ? responseDiv.textContent.trim() : '',
          disabled: sendBtn ? sendBtn.disabled : true
        };
      });

      if (!state.disabled) {
        responseText = state.text;
        gotResponse = true;
        console.log(`Got response after ${(i + 1) * 2} seconds!\n`);
        break;
      }

      if (i % 10 === 0 && i > 0) {
        console.log(`Still waiting (${i * 2}s)...`);
      }
    }

    if (gotResponse) {
      console.log('=== KIMI K2 RESPONSE ===');
      console.log(responseText);
      console.log('=== END RESPONSE ===\n');

      const outputPath = path.join(__dirname, 'kimi-k2-final-response.txt');
      fs.writeFileSync(outputPath, responseText, 'utf8');
      console.log('Saved to:', outputPath, '\n');
    } else {
      console.log('No response received after 120 seconds\n');
    }

    await delay(3000);
    await browser.close();
    server.close();
    console.log('Done');

  } catch (error) {
    console.error('Error:', error.message);
    if (browser) await browser.close();
    if (server) server.close();
    process.exit(1);
  }
})();
