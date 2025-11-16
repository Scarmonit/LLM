const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const PORT = 8766;

// Start a simple HTTP server with modified HTML
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

        // Inject a timeout wrapper around the puter.ai.chat call
        data = data.replace(
          'const response = await puter.ai.chat(prompt, {',
          `// Add timeout wrapper
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timed out after 60 seconds')), 60000)
                );
                const chatPromise = puter.ai.chat(prompt, {`
        );

        data = data.replace(
          '});',
          `});
                const response = await Promise.race([chatPromise, timeoutPromise]);`
        );

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
    // Start the HTTP server with modified HTML
    server = await startServer();

    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Monitor console for errors
    page.on('console', msg => {
      const text = msg.text();
      console.log('PAGE:', text);
    });

    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });

    // Navigate to the page
    console.log('Opening page...');
    await page.goto(`http://localhost:${PORT}/`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('Waiting for Puter SDK...');
    await delay(5000);

    // Check if puter is defined
    const puterReady = await page.evaluate(() => {
      return typeof puter !== 'undefined' && typeof puter.ai !== 'undefined';
    });

    console.log('Puter SDK ready:', puterReady);

    if (!puterReady) {
      console.error('Puter SDK not loaded!');
      await browser.close();
      server.close();
      return;
    }

    console.log('Clicking Ask Kimi K2 button...');
    await page.click('#sendBtn');

    // Wait for response with detailed monitoring
    console.log('Waiting for response (max 90 seconds)...\n');
    let responseReceived = false;
    const maxAttempts = 45; // 90 seconds
    let attempts = 0;

    while (attempts < maxAttempts && !responseReceived) {
      await delay(2000);
      attempts++;

      const state = await page.evaluate(() => {
        const responseDiv = document.getElementById('response');
        const sendBtn = document.getElementById('sendBtn');
        return {
          text: responseDiv ? responseDiv.textContent.trim() : '',
          buttonDisabled: sendBtn ? sendBtn.disabled : true
        };
      });

      // Check if response is ready
      if (!state.buttonDisabled) {
        console.log('\n Response completed after', attempts * 2, 'seconds\n');
        responseReceived = true;

        console.log('=== KIMI K2 RESPONSE ===');
        console.log(state.text);
        console.log('=== END RESPONSE ===\n');

        // Save to file
        const outputPath = path.join(__dirname, 'kimi-k2-response.txt');
        fs.writeFileSync(outputPath, state.text, 'utf8');
        console.log('Saved to:', outputPath, '\n');

        break;
      }

      if (attempts % 5 === 0) {
        console.log(`Waiting... (${attempts * 2}s) - Current: ${state.text.substring(0, 50)}`);
      }
    }

    if (!responseReceived) {
      console.log('\nTimeout: No response after', maxAttempts * 2, 'seconds');
    }

    await delay(2000);
    await browser.close();
    server.close();
    console.log('Done\n');

  } catch (error) {
    console.error('Error:', error.message);
    if (browser) await browser.close();
    if (server) server.close();
    process.exit(1);
  }
})();
