const puppeteer = require('puppeteer');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Capture all network requests to see the 401 details
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('puter') || url.includes('api') || url.includes('openrouter')) {
        console.log('Network Response:', response.status(), url);
        try {
          if (response.status() !== 200) {
            const body = await response.text();
            console.log('Error Body:', body.substring(0, 500));
          }
        } catch (e) {
          console.log('Could not read response body');
        }
      }
    });

    page.on('console', msg => {
      const text = msg.text();
      console.log('PAGE LOG:', text);
    });

    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });

    // Navigate to the HTML file
    console.log('Opening HTML file...');
    await page.goto('file:///C:/Users/scarm/kimi-k2-puter-test.html', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('Waiting for Puter SDK to initialize...');
    await delay(5000);

    // Inject error monitoring
    await page.evaluate(() => {
      window.addEventListener('unhandledrejection', event => {
        console.log('UNHANDLED REJECTION:', event.reason ? event.reason.toString() : 'Unknown error');
      });
    });

    console.log('Clicking Ask Kimi K2 button...');
    await page.click('#sendBtn');

    // Monitor for 30 seconds to capture network activity and any errors
    console.log('Monitoring for 30 seconds...');
    await delay(30000);

    const finalState = await page.evaluate(() => {
      return {
        responseText: document.getElementById('response').textContent.trim(),
        responseHTML: document.getElementById('response').innerHTML,
        buttonText: document.getElementById('sendBtn').textContent,
        buttonDisabled: document.getElementById('sendBtn').disabled
      };
    });

    console.log('\n=== FINAL STATE ===');
    console.log('Response Text:', finalState.responseText);
    console.log('Button Text:', finalState.buttonText);
    console.log('Button Still Disabled:', finalState.buttonDisabled);
    console.log('=== END STATE ===\n');

    await browser.close();

  } catch (error) {
    console.error('Script Error:', error.message);
    await browser.close();
    process.exit(1);
  }
})();
