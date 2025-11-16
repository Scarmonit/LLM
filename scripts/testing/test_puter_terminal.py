from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

print("=== Testing Puter Terminal in Browser ===\n")

# Setup Chrome
chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(options=chrome_options)
driver.maximize_window()

try:
    # Navigate to Puter
    print("Step 1: Navigating to http://puter.localhost:4100")
    driver.get("http://puter.localhost:4100")
    time.sleep(3)

    # Login
    print("Step 2: Logging in with admin credentials...")
    username_field = driver.find_element(By.CSS_SELECTOR, "input[type='text'], input[name='username']")
    password_field = driver.find_element(By.CSS_SELECTOR, "input[type='password']")

    username_field.send_keys("admin")
    password_field.send_keys("c849dc06")

    login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    login_button.click()

    print("Waiting for desktop to load...")
    time.sleep(5)

    # Find and click Terminal
    print("Step 3: Looking for Terminal app...")
    terminal_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Terminal')]")

    if terminal_elements:
        print(f"✅ Found {len(terminal_elements)} Terminal element(s)")
        print("Clicking on Terminal...")
        terminal_elements[0].click()
        time.sleep(5)

        # Check for authentication errors
        page_text = driver.find_element(By.TAG_NAME, "body").text

        if "401" in page_text or "Authentication failed" in page_text or "token_auth_failed" in page_text:
            print("❌ FAILED: Terminal shows 401 authentication error!")
            print("Bug from GitHub issue #1083 is NOT fixed")
            driver.save_screenshot("C:/Users/scarm/terminal-error.png")
        else:
            print("✅ SUCCESS: Terminal opened without authentication errors!")
            print("Bug from GitHub issue #1083 is FIXED")
            driver.save_screenshot("C:/Users/scarm/terminal-success.png")
    else:
        print("❌ Could not find Terminal app on desktop")
        driver.save_screenshot("C:/Users/scarm/no-terminal.png")

    print("\nKeeping browser open for 10 seconds for verification...")
    time.sleep(10)

except Exception as e:
    print(f"❌ Error: {e}")
    driver.save_screenshot("C:/Users/scarm/test-error.png")

finally:
    driver.quit()
    print("\nTest complete!")
