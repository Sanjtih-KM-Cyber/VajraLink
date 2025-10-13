from playwright.sync_api import Page, expect

import sys
from playwright.sync_api import Page, expect

def test_family_chat(page: Page):
    try:
        # 1. Arrange: Go to the family portal.
        page.goto("http://localhost:5175/family.html")
        page.evaluate("localStorage.clear()")
        page.reload()

        # 2. Act: Log in as a family member.
        page.wait_for_selector('input[name="username"]')
        page.get_by_label("Username").fill("family_user")
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Login").click()

        # 3. Act: Create a new group.
        page.get_by_role("button", name="Add Group").click()
        page.get_by_label("Group Name").fill("Test Family Group")
        page.get_by_label("Members").fill("family_user_2")
        page.get_by_role("button", name="Create").click()

        # 4. Assert: Confirm the new group is selected.
        expect(page.get_by_text("Test Family Group")).to_be_visible()
    finally:
        # 5. Screenshot: Capture the final result for visual verification.
        page.screenshot(path="jules-scratch/verification/family_chat.png")
        print("Screenshot created at jules-scratch/verification/family_chat.png")

if __name__ == "__main__":
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            test_family_chat(page)
        except Exception as e:
            print(f"An error occurred: {e}", file=sys.stderr)
        finally:
            browser.close()