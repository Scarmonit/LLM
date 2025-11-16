const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

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

    const response = await page.evaluate(() => {
      return document.getElementById('response').textContent.trim();
    });

    console.log('=== KIMI K2 RESPONSE ===');
    console.log(response);
    console.log('=== END RESPONSE ===\n');

    // Save to file
    const outputPath = path.join(__dirname, 'kimi-k2-direct-response.txt');
    fs.writeFileSync(outputPath, response, 'utf8');
    console.log('Saved to:', outputPath, '\n');

    await delay(2000);
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
