from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

print("=== Testing Puter Terminal in Browser ===\n")

chrome_options = Options()
driver = webdriver.Chrome(options=chrome_options)
driver.maximize_window()

try:
    print("Step 1: Navigating to Puter...")
    driver.get("http://puter.localhost:4100")
    time.sleep(5)

    driver.save_screenshot("C:/Users/scarm/step1-loaded.png")
    print("Screenshot saved: step1-loaded.png")

    print("\nStep 2: Looking for login elements...")
    # Wait for page to be interactive
    wait = WebDriverWait(driver, 20)

    # Try to find username input with various selectors
    username_input = None
    selectors = [
        "input[name='username']",
        "input[placeholder*='sername' i]",
        "input[type='text']",
        ".username",
        "#username"
    ]

    for selector in selectors:
        try:
            username_input = driver.find_element(By.CSS_SELECTOR, selector)
            print(f"✓ Found username field with: {selector}")
            break
        except:
            continue

    if not username_input:
        print("Trying to click anywhere to dismiss dialogs...")
        driver.find_element(By.TAG_NAME, "body").click()
        time.sleep(2)
        driver.save_screenshot("C:/Users/scarm/step2-after-click.png")

        # Try again
        for selector in selectors:
            try:
                username_input = driver.find_element(By.CSS_SELECTOR, selector)
                print(f"✓ Found username field with: {selector}")
                break
            except:
                continue

    if username_input:
        print("Entering username...")
        username_input.clear()
        username_input.send_keys("admin")

        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        print("Entering password...")
        password_input.clear()
        password_input.send_keys("c849dc06")

        driver.save_screenshot("C:/Users/scarm/step3-credentials-entered.png")

        print("\nStep 3: Clicking login button...")
        # Find and click login button
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()

        print("Waiting for desktop to load...")
        time.sleep(10)
        driver.save_screenshot("C:/Users/scarm/step4-logged-in.png")

        print("\nStep 4: Looking for Terminal app...")
        # Find Terminal app - try multiple approaches
        terminal_found = False

        # Try text search
        try:
            terminal = driver.find_element(By.XPATH, "//*[contains(text(), 'Terminal')]")
            print("✓ Found Terminal via text search")
            terminal.click()
            terminal_found = True
        except:
            print("Terminal not found via text search, trying class/id...")

        if terminal_found:
            print("Clicked Terminal, waiting for it to open...")
            time.sleep(8)
            driver.save_screenshot("C:/Users/scarm/step5-terminal-opened.png")

            # Check for errors
            page_source = driver.page_source.lower()

            if "401" in page_source or "authentication failed" in page_source or "token_auth_failed" in page_source:
                print("\n❌ FAILED: Terminal shows 401 authentication error")
                print("GitHub issue #1083 bug is NOT fixed")
            else:
                print("\n✅ SUCCESS: Terminal opened without authentication errors!")
                print("GitHub issue #1083 bug is FIXED")
        else:
            print("❌ Could not find Terminal app")
            driver.save_screenshot("C:/Users/scarm/terminal-not-found.png")

    else:
        print("❌ Could not find login form")
        print("Page HTML snippet:")
        print(driver.page_source[:1000])

    print("\nKeeping browser open for 10 seconds...")
    time.sleep(10)

except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    driver.save_screenshot("C:/Users/scarm/error.png")

finally:
    driver.quit()
    print("\nTest complete! Check screenshots in C:/Users/scarm/")
