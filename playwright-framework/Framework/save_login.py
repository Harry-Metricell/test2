import argparse
from pathlib import Path

from playwright.sync_api import sync_playwright


AUTH_FILE = Path("playwright/.auth/user.json")


def main():
    parser = argparse.ArgumentParser(description="Save a manual 2FA login")
    parser.add_argument("--url", required=True)
    args = parser.parse_args()
    AUTH_FILE.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto(args.url)
        print("Complete login and 2FA in the browser.")
        print("Wait until the authenticated Launcher is visible.")
        input("Return here and press Enter to save the session...")
        context.storage_state(path=str(AUTH_FILE))
        browser.close()

    print(f"Saved login to {AUTH_FILE}")


if __name__ == "__main__":
    main()

