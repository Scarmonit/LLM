#!/usr/bin/env node

/**
 * Kimi K2 Direct Test - Simplified approach
 * Tests Kimi AI at https://kimi.moonshot.cn
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testKimiDirect() {
  console.log('Starting Kimi K2 direct test...');
  console.log('Target: https://kimi.moonshot.cn\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ],
      defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();

    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Navigating to Kimi...');
    await page.goto('https://kimi.moonshot.cn', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Take initial screenshot
    const initialScreenshot = path.join(process.cwd(), 'kimi-initial.png');
    await page.screenshot({ path: initialScreenshot, fullPage: false });
    console.log(`Initial screenshot: ${initialScreenshot}`);

    // Check if we can access without login
    const pageContent = await page.content();
    fs.writeFileSync(path.join(process.cwd(), 'kimi-page.html'), pageContent);
    console.log('Page HTML saved to kimi-page.html');

    // Look for input field (common patterns)
    console.log('\nSearching for input field...');
    const inputSelectors = [
      'textarea[placeholder*="问"]',
      'textarea[placeholder*="Ask"]',
      'textarea',
      'input[type="text"]',
      '[contenteditable="true"]',
      '.chat-input textarea',
      '.input-box textarea'
    ];

    let inputElement = null;
    let foundSelector = null;

    for (const selector of inputSelectors) {
      try {
        inputElement = await page.$(selector);
        if (inputElement) {
          foundSelector = selector;
          console.log(`✓ Found input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (!inputElement) {
      // Check if login is required
      const loginIndicators = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return {
          hasLogin: text.includes('login') || text.includes('sign in') || text.includes('登录'),
          hasRegister: text.includes('register') || text.includes('sign up') || text.includes('注册'),
          bodyText: text.substring(0, 500)
        };
      });

      console.log('\nPage analysis:');
      console.log('Has login indicator:', loginIndicators.hasLogin);
      console.log('Has register indicator:', loginIndicators.hasRegister);
      console.log('Body text preview:', loginIndicators.bodyText);

      // Try to find a guest/try button
      const guestButtons = [
        'button:has-text("Try")',
        'button:has-text("试用")',
        'button:has-text("Start")',
        'a:has-text("Demo")',
        '.try-button',
        '.demo-button'
      ];

      for (const selector of guestButtons) {
        try {
          const button = await page.$(selector);
          if (button) {
            console.log(`\nFound guest access button: ${selector}`);
            await button.click();
            await page.waitForTimeout(3000);

            // Try finding input again
            for (const sel of inputSelectors) {
              inputElement = await page.$(sel);
              if (inputElement) {
                foundSelector = sel;
                break;
              }
            }
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    }

    if (inputElement) {
      console.log('\n✓ Input field accessible!');

      // Type the query
      const query = 'Write a hello world program in Python';
      console.log(`Typing: "${query}"`);

      await inputElement.click();
      await page.waitForTimeout(500);
      await page.keyboard.type(query, { delay: 50 });
      await page.waitForTimeout(1000);

      // Take screenshot after typing
      const typedScreenshot = path.join(process.cwd(), 'kimi-typed.png');
      await page.screenshot({ path: typedScreenshot, fullPage: false });
      console.log(`Screenshot with query: ${typedScreenshot}`);

      // Try to submit
      console.log('\nAttempting to submit...');
      const submitMethods = [
        async () => await page.keyboard.press('Enter'),
        async () => {
          const btn = await page.$('button[type="submit"]');
          if (btn) await btn.click();
        },
        async () => {
          const btn = await page.$('button.send-button');
          if (btn) await btn.click();
        },
        async () => {
          const btn = await page.$('svg[class*="send"]');
          if (btn) await btn.click();
        }
      ];

      for (const method of submitMethods) {
        try {
          await method();
          break;
        } catch (e) {
          // Try next method
        }
      }

      // Wait for response
      console.log('Waiting for response (15 seconds)...');
      await page.waitForTimeout(15000);

      // Take final screenshot
      const responseScreenshot = path.join(process.cwd(), 'kimi-response.png');
      await page.screenshot({ path: responseScreenshot, fullPage: true });
      console.log(`Response screenshot: ${responseScreenshot}`);

      // Extract response
      console.log('\nExtracting response...');
      const response = await page.evaluate(() => {
        // Try multiple approaches to get the response
        const selectors = [
          '.message-content',
          '.response-text',
          '[class*="response"]',
          '[class*="message"]',
          'pre code',
          '.markdown-body'
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            // Get the last message (likely the response)
            const lastElement = elements[elements.length - 1];
            const text = lastElement.textContent || lastElement.innerText;
            if (text && text.length > 10) {
              return {
                found: true,
                selector: selector,
                text: text
              };
            }
          }
        }

        // Fallback: get all text
        return {
          found: false,
          selector: 'body',
          text: document.body.innerText
        };
      });

      // Save results
      const results = {
        timestamp: new Date().toISOString(),
        success: true,
        query: query,
        inputSelector: foundSelector,
        response: response,
        screenshots: {
          initial: initialScreenshot,
          typed: typedScreenshot,
          response: responseScreenshot
        }
      };

      const resultsPath = path.join(process.cwd(), 'kimi-k2-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      console.log(`\nResults saved to: ${resultsPath}`);

      console.log('\n=== KIMI K2 RESPONSE ===');
      console.log(response.text.substring(0, 800));
      console.log('========================\n');

      return results;

    } else {
      console.log('\n✗ Could not access input field');
      console.log('Login may be required or page structure is different');

      const results = {
        timestamp: new Date().toISOString(),
        success: false,
        error: 'Input field not accessible',
        loginRequired: true
      };

      fs.writeFileSync(
        path.join(process.cwd(), 'kimi-k2-results.json'),
        JSON.stringify(results, null, 2)
      );

      return results;
    }

  } catch (error) {
    console.error('\n✗ Error:', error.message);

    const errorResults = {
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message,
      stack: error.stack
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'kimi-k2-error.json'),
      JSON.stringify(errorResults, null, 2)
    );

    throw error;

  } finally {
    if (browser) {
      console.log('\nClosing browser...');
      await browser.close();
    }
  }
}

// Run
testKimiDirect()
  .then(results => {
    console.log('\n✓ Test completed');
    process.exit(results.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n✗ Test failed:', error.message);
    process.exit(1);
  });
