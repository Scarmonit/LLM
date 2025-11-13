#!/usr/bin/env node

/**
 * Kimi K2 AI Test Script
 * Automates interaction with Kimi K2 via Hugging Face Space
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testKimiK2() {
  console.log('Starting Kimi K2 test...');

  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to Kimi K2 Hugging Face Space...');
    await page.goto('https://huggingface.co/spaces/vansin/Kimi-K2', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait a bit for the space to fully load
    await page.waitForTimeout(5000);

    // Take screenshot of initial page
    const screenshotPath = path.join(__dirname, 'kimi-k2-initial.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Try to find input field - common selectors for Gradio interfaces
    const selectors = [
      'textarea',
      'input[type="text"]',
      '.input-text',
      'gradio-textbox textarea',
      '#component-0 textarea',
      '[data-testid="textbox"]'
    ];

    let inputFound = false;
    let inputSelector = null;

    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          inputSelector = selector;
          inputFound = true;
          console.log(`Found input using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!inputFound) {
      // Get page content for debugging
      const bodyHTML = await page.evaluate(() => document.body.innerHTML);
      fs.writeFileSync(path.join(__dirname, 'kimi-k2-page.html'), bodyHTML);
      console.log('Page HTML saved to kimi-k2-page.html for debugging');

      throw new Error('Could not find input field on page');
    }

    // Type the test query
    const testQuery = 'Write a hello world program in Python';
    console.log(`Typing query: "${testQuery}"`);
    await page.type(inputSelector, testQuery);

    // Wait a moment after typing
    await page.waitForTimeout(1000);

    // Try to find and click submit button
    const buttonSelectors = [
      'button:has-text("Submit")',
      'button[type="submit"]',
      '.submit-button',
      'button.primary',
      'gradio-button button'
    ];

    let buttonFound = false;
    for (const selector of buttonSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          console.log(`Clicking submit button: ${selector}`);
          await button.click();
          buttonFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!buttonFound) {
      // Try pressing Enter instead
      console.log('Submit button not found, trying Enter key...');
      await page.keyboard.press('Enter');
    }

    // Wait for response
    console.log('Waiting for Kimi K2 response...');
    await page.waitForTimeout(10000); // Wait 10 seconds for response

    // Take screenshot of response
    const responseScreenshot = path.join(__dirname, 'kimi-k2-response.png');
    await page.screenshot({ path: responseScreenshot, fullPage: true });
    console.log(`Response screenshot saved to: ${responseScreenshot}`);

    // Try to extract response text
    const outputSelectors = [
      '.output-text',
      'gradio-textbox:last-of-type textarea',
      '[data-testid="textbox"]:last-of-type',
      '.markdown-text',
      'pre',
      'code'
    ];

    let responseText = '';
    for (const selector of outputSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          responseText = await page.evaluate(el => el.textContent || el.value, element);
          if (responseText && responseText.trim()) {
            console.log(`Found response using selector: ${selector}`);
            break;
          }
        }
      } catch (e) {
        // Continue
      }
    }

    // If no specific output found, get all text content
    if (!responseText || !responseText.trim()) {
      console.log('Extracting all visible text from page...');
      responseText = await page.evaluate(() => document.body.innerText);
    }

    // Save response to file
    const responsePath = path.join(__dirname, 'kimi-k2-response.txt');
    const responseData = {
      timestamp: new Date().toISOString(),
      query: testQuery,
      response: responseText,
      status: 'success'
    };

    fs.writeFileSync(responsePath, JSON.stringify(responseData, null, 2));
    console.log(`Response saved to: ${responsePath}`);
    console.log('\n=== Kimi K2 Response ===');
    console.log(responseText.substring(0, 500)); // Print first 500 chars

    return responseData;

  } catch (error) {
    console.error('Error during Kimi K2 test:', error);

    // Save error details
    const errorData = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };

    fs.writeFileSync(
      path.join(__dirname, 'kimi-k2-error.json'),
      JSON.stringify(errorData, null, 2)
    );

    throw error;
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

// Run if called directly
if (require.main === module) {
  testKimiK2()
    .then(result => {
      console.log('\n✓ Test completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n✗ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testKimiK2 };
