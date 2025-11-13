const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Listen for console messages and network requests
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('response', response => {
        if (response.url().includes('/whoami')) {
            console.log(`/whoami endpoint: ${response.status()} ${response.statusText()}`);
        }
    });

    try {
        console.log('Navigating to Puter...');
        await page.goto('http://puter.localhost:4100', { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('Waiting for login form...');
        await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });

        console.log('Filling in credentials...');
        // Find username field
        await page.evaluate(() => {
            const inputs = document.querySelectorAll('input[type="text"], input[name="username"]');
            for (let input of inputs) {
                if (input.placeholder?.toLowerCase().includes('username') ||
                    input.name === 'username' ||
                    input.closest('form')) {
                    input.value = 'admin';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    break;
                }
            }
        });

        // Find password field
        await page.evaluate(() => {
            const inputs = document.querySelectorAll('input[type="password"]');
            if (inputs[0]) {
                inputs[0].value = 'c849dc06';
                inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        console.log('Clicking login button...');
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button, input[type="submit"]');
            for (let btn of buttons) {
                if (btn.textContent?.toLowerCase().includes('login') ||
                    btn.textContent?.toLowerCase().includes('sign in') ||
                    btn.type === 'submit') {
                    btn.click();
                    break;
                }
            }
        });

        console.log('Waiting for desktop to load...');
        await page.waitForTimeout(3000);

        console.log('Looking for Terminal app...');
        const terminalFound = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            for (let el of elements) {
                const text = el.textContent || el.title || el.alt || '';
                if (text.toLowerCase().includes('terminal')) {
                    console.log('Found Terminal element:', el.outerHTML.substring(0, 200));
                    el.click();
                    return true;
                }
            }
            return false;
        });

        if (terminalFound) {
            console.log('Terminal app clicked! Waiting for it to open...');
            await page.waitForTimeout(5000);

            // Check for errors
            const errorMessages = await page.evaluate(() => {
                const errors = [];
                const errorEls = document.querySelectorAll('.error, [class*="error"], [class*="Error"]');
                errorEls.forEach(el => {
                    if (el.textContent.includes('401') || el.textContent.includes('Authentication')) {
                        errors.push(el.textContent);
                    }
                });
                return errors;
            });

            if (errorMessages.length > 0) {
                console.log('❌ ERRORS FOUND:', errorMessages);
            } else {
                console.log('✅ Terminal opened without authentication errors!');
            }

            await page.screenshot({ path: 'C:/Users/scarm/terminal-test.png' });
            console.log('Screenshot saved to C:/Users/scarm/terminal-test.png');
        } else {
            console.log('❌ Could not find Terminal app');
            await page.screenshot({ path: 'C:/Users/scarm/desktop-view.png' });
            console.log('Screenshot of desktop saved to C:/Users/scarm/desktop-view.png');
        }

        await page.waitForTimeout(3000);

    } catch (error) {
        console.error('Error during test:', error.message);
        await page.screenshot({ path: 'C:/Users/scarm/error-screenshot.png' });
    }

    await browser.close();
})();
