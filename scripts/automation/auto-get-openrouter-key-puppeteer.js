#!/usr/bin/env node

/**
 * Automated OpenRouter API Key Retrieval using Puppeteer
 *
 * This script uses headless browser automation to:
 * 1. Open OpenRouter's key creation page
 * 2. Attempt to automate the login process
 * 3. Create and retrieve an API key
 *
 * Note: OAuth logins (GitHub/Google) require human interaction for security.
 * This script will guide you through the minimal steps needed.
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getOpenRouterKey() {
  console.log('\n🤖 Automated OpenRouter API Key Retrieval (Puppeteer)\n');
  console.log('='.repeat(60));
  console.log('\n📋 This script will:\n');
  console.log('  1. Open OpenRouter in a visible browser');
  console.log('  2. Navigate to the API keys page');
  console.log('  3. Wait for you to sign in and create a key');
  console.log('  4. Automatically detect and save the key\n');
  console.log('⚠️  Note: OAuth logins require your interaction (security)\n');
  console.log('Starting browser in 3 seconds...\n');

  await new Promise(resolve => setTimeout(resolve, 3000));

  const browser = await puppeteer.launch({
    headless: false, // Visible browser for OAuth login
    defaultViewport: { width: 1280, height: 800 },
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();

  try {
    console.log('✅ Browser launched\n');
    console.log('🌐 Navigating to OpenRouter keys page...\n');

    // Navigate to OpenRouter keys page
    await page.goto('https://openrouter.ai/keys', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log('✅ Page loaded\n');
    console.log('━'.repeat(60));
    console.log('\n👤 ACTION REQUIRED:\n');
    console.log('  In the browser window that just opened:\n');
    console.log('  1. Click "Sign In" (top right corner)');
    console.log('  2. Choose GitHub, Google, or Email');
    console.log('  3. Complete the login process');
    console.log('  4. Click "Create Key"');
    console.log('  5. Name it (e.g., "Claude Code")');
    console.log('  6. Click "Create"\n');
    console.log('  The script will automatically detect the key!\n');
    console.log('━'.repeat(60));
    console.log('\n⏳ Waiting for API key to appear...\n');

    // Wait for the API key to be created
    // This selector targets the key display element
    const keySelector = 'input[type="text"][value^="sk-or-v1-"], code:contains("sk-or-v1-"), pre:contains("sk-or-v1-"), [class*="key"]:contains("sk-or-v1-")';

    let apiKey = null;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes (120 * 1 second)

    while (!apiKey && attempts < maxAttempts) {
      try {
        // Check for API key in various possible locations
        const pageContent = await page.content();

        // Look for sk-or-v1- pattern in page content
        const keyMatch = pageContent.match(/sk-or-v1-[a-zA-Z0-9]{64,}/);
        if (keyMatch) {
          apiKey = keyMatch[0];
          break;
        }

        // Try to find input field with the key
        const inputs = await page.$$('input[type="text"]');
        for (const input of inputs) {
          const value = await input.evaluate(el => el.value);
          if (value && value.startsWith('sk-or-v1-')) {
            apiKey = value;
            break;
          }
        }

        if (apiKey) break;

        // Try to find in code/pre tags
        const codeElements = await page.$$('code, pre');
        for (const element of codeElements) {
          const text = await element.evaluate(el => el.textContent);
          if (text && text.includes('sk-or-v1-')) {
            const match = text.match(/sk-or-v1-[a-zA-Z0-9]{64,}/);
            if (match) {
              apiKey = match[0];
              break;
            }
          }
        }

        if (apiKey) break;

      } catch (e) {
        // Continue waiting
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;

      // Show progress every 10 seconds
      if (attempts % 10 === 0) {
        console.log(`  Still waiting... (${attempts}s elapsed)`);
      }
    }

    if (!apiKey) {
      console.log('\n⏱️  Timeout: No API key detected after 2 minutes\n');
      console.log('📋 Manual steps:\n');
      console.log('  1. Complete the key creation in the browser');
      console.log('  2. Copy the key (starts with sk-or-v1-)');
      console.log('  3. Paste it below\n');

      // Wait for manual input
      const readline = (await import('readline')).createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      apiKey = await new Promise(resolve => {
        readline.question('Paste your API key here: ', answer => {
          readline.close();
          resolve(answer.trim());
        });
      });
    } else {
      console.log('\n✅ API key detected automatically!\n');
    }

    if (!apiKey || !apiKey.startsWith('sk-or-v1-')) {
      throw new Error('Invalid API key format');
    }

    console.log('🔑 API Key:', apiKey.slice(0, 20) + '...\n');

    // Validate the key
    console.log('🧪 Validating API key...\n');

    const validateResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!validateResponse.ok) {
      throw new Error(`Key validation failed: ${validateResponse.status}`);
    }

    console.log('✅ API key is valid!\n');

    // Save the key
    console.log('💾 Saving API key...\n');

    const home = process.env.HOME || process.env.USERPROFILE;
    const keyFile = path.join(home, '.openrouter-key.txt');
    const bashProfile = path.join(home, '.bash_profile');

    // Save to file
    fs.writeFileSync(keyFile, apiKey, 'utf8');
    console.log(`✅ Saved to: ${keyFile}`);

    // Add to bash profile
    const exportLine = `\nexport OPENROUTER_API_KEY="${apiKey}"\n`;
    if (fs.existsSync(bashProfile)) {
      const content = fs.readFileSync(bashProfile, 'utf8');
      if (!content.includes('OPENROUTER_API_KEY')) {
        fs.appendFileSync(bashProfile, exportLine);
        console.log('✅ Added to ~/.bash_profile');
      } else {
        console.log('ℹ️  Already in ~/.bash_profile');
      }
    } else {
      fs.writeFileSync(bashProfile, exportLine);
      console.log('✅ Created ~/.bash_profile with key');
    }

    // Set in Windows environment (if on Windows)
    if (process.platform === 'win32') {
      const { execSync } = await import('child_process');
      try {
        execSync(
          `powershell -Command "[System.Environment]::SetEnvironmentVariable('OPENROUTER_API_KEY', '${apiKey}', 'User')"`,
          { stdio: 'ignore' }
        );
        console.log('✅ Saved to Windows User Environment');
      } catch (e) {
        console.log('⚠️  Could not save to Windows environment');
      }
    }

    console.log('\n' + '━'.repeat(60));
    console.log('\n🎉 SUCCESS! OpenRouter API key is ready!\n');
    console.log('To use it immediately:\n');
    console.log(`  export OPENROUTER_API_KEY="${apiKey}"\n`);
    console.log('Or restart your terminal to load from ~/.bash_profile\n');
    console.log('📚 Next steps:\n');
    console.log('  1. Test: ./test-integrated-solution.sh');
    console.log('  2. Demo: node unified-ai-client.js\n');

    await browser.close();
    return apiKey;

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Try the manual setup instead:');
    console.log('   powershell.exe -ExecutionPolicy Bypass -File ".\\Get-OpenRouterKey.ps1"\n');
    await browser.close();
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  getOpenRouterKey().catch(console.error);
}

export { getOpenRouterKey };
