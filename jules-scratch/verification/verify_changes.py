import os
from playwright.sync_api import Page, expect

def test_vajralink_changes(page: Page):
    # Create the verification directory if it doesn't exist
    os.makedirs("jules-scratch/verification", exist_ok=True)

    # 1. Navigate to the application.
    page.goto("http://localhost:5173")

    # 2. Log in as a family member.
    page.get_by_role("button", name="User Login").click()
    page.get_by_role("button", name="Family").click()
    page.get_by_label("Username").fill("family")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # 3. Take a screenshot of the family dashboard.
    family_dashboard_path = "jules-scratch/verification/family_dashboard.png"
    page.screenshot(path=family_dashboard_path)
    print(f"Saved screenshot to {os.path.abspath(family_dashboard_path)}")

    # 4. Click the "Create Group" button.
    page.get_by_role("button", name="+").click()

    # 5. Take a screenshot of the create group modal.
    create_group_modal_path = "jules-scratch/verification/create_group_modal.png"
    page.locator(".fixed.inset-0").screenshot(path=create_group_modal_path)
    print(f"Saved screenshot to {os.path.abspath(create_group_modal_path)}")

    # 6. Click the "Call" button.
    page.get_by_role("button", name="Call").click()

    # 7. Take a screenshot of the call modal.
    call_modal_path = "jules-scratch/verification/call_modal.png"
    page.locator(".fixed.inset-0").screenshot(path=call_modal_path)
    print(f"Saved screenshot to {os.path.abspath(call_modal_path)}")