import json
import re
import shutil
from datetime import datetime
from pathlib import Path

from playwright.sync_api import Page, expect, sync_playwright


PLATFORM_URL = "https://smartnetworkv4-o2-uk-dev.metricell.com/"
AUTH_FILE = Path("playwright/.auth/user.json")

MODULES = [
    ("Agentic AI", "agentic-ai"),
    ("GIS", "gis"),
    ("Agentic AI Administration", "agentic-ai-administration"),
    ("Access admin", "access-admin"),
    ("RPO", "rpo"),
    ("API request audit", "api-request-audit"),
]


def inspect_controls(page: Page):
    """Return visible interactive elements without reading form values."""
    return page.locator(
        "button:visible, a:visible, input:visible, select:visible, "
        "textarea:visible, [role]:visible"
    ).evaluate_all(
        """
        elements => elements.map((element, index) => ({
            index,
            tag: element.tagName.toLowerCase(),
            role: element.getAttribute('role'),
            text: (element.innerText || '').trim().slice(0, 500),
            aria_label: element.getAttribute('aria-label'),
            title: element.getAttribute('title'),
            placeholder: element.getAttribute('placeholder'),
            name: element.getAttribute('name'),
            type: element.getAttribute('type'),
            data_test: element.getAttribute('data-test'),
            data_testid: element.getAttribute('data-testid'),
            href: element.tagName.toLowerCase() === 'a'
                ? element.getAttribute('href')
                : null
        }))
        """
    )


def safe_root_text(page: Page):
    try:
        return page.locator("#root").inner_text(timeout=10_000)[:30_000]
    except Exception:
        return ""


def api_record(response):
    """Capture metadata only: no headers, bodies, cookies or query strings."""
    request = response.request
    if request.resource_type not in {"xhr", "fetch"}:
        return None
    if "/api/" not in response.url.lower():
        return None

    return {
        "status": response.status,
        "method": request.method,
        "url_without_query": response.url.split("?", 1)[0],
    }


def discover_module(context, position, module_name, slug, output_directory):
    page = context.new_page()
    api_requests = []

    def capture_response(response):
        record = api_record(response)
        if record:
            api_requests.append(record)

    page.on("response", capture_response)
    page.goto(PLATFORM_URL)

    expect(
        page.locator("#root").get_by_text("Launcher", exact=True)
    ).to_be_visible(timeout=30_000)

    # The Launcher header can appear before the cards finish rendering.
    # Text lookup is used because this build sometimes exposes the text before
    # the button accessibility role becomes available to a standalone script.
    open_buttons = page.get_by_text("Open module", exact=True)
    expect(open_buttons.first).to_be_visible(timeout=30_000)

    if open_buttons.count() < len(MODULES):
        raise RuntimeError(
            f"Expected at least {len(MODULES)} visible Open module controls, "
            f"but found {open_buttons.count()}. Current URL: {page.url}"
        )

    open_buttons.nth(position).click()
    page.wait_for_timeout(3_000)

    module_result = {
        "module": module_name,
        "launcher_position": position,
        "url": page.url,
        "page_title": page.title(),
        "visible_page_text": safe_root_text(page),
        "visible_controls": inspect_controls(page),
        "navigation_menu_controls": [],
        "api_requests": [],
    }

    page.screenshot(
        path=str(output_directory / f"{position + 1:02d}-{slug}.png"),
        full_page=True,
    )

    # Recorder output showed the first button is the top-left menu button.
    try:
        menu_button = page.get_by_role("button").first
        expect(menu_button).to_be_visible(timeout=5_000)
        menu_button.click()
        page.wait_for_timeout(500)
        module_result["navigation_menu_controls"] = inspect_controls(page)
        page.screenshot(
            path=str(
                output_directory / f"{position + 1:02d}-{slug}-menu.png"
            ),
            full_page=True,
        )
    except Exception as error:
        module_result["menu_discovery_error"] = str(error)[:1_000]

    module_result["api_requests"] = api_requests
    page.close()
    return module_result


def main():
    if not AUTH_FILE.exists():
        raise FileNotFoundError(
            "Saved login was not found. Run save_login.py before discovery."
        )

    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    output_directory = Path(f"metricell-page-inventory-{timestamp}")
    output_directory.mkdir()

    inventory = {
        "generated_at_local": datetime.now().isoformat(),
        "platform": PLATFORM_URL,
        "safety": (
            "Read-only discovery. Opened Launcher modules and navigation menus; "
            "did not fill forms or activate feature controls."
        ),
        "modules": [],
        "discovery_errors": [],
    }

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)
        context = browser.new_context(storage_state=str(AUTH_FILE))

        for position, (module_name, slug) in enumerate(MODULES):
            print(f"Inspecting {module_name}...")
            try:
                result = discover_module(
                    context,
                    position,
                    module_name,
                    slug,
                    output_directory,
                )
                inventory["modules"].append(result)
            except Exception as error:
                inventory["discovery_errors"].append(
                    {"module": module_name, "error": str(error)[:2_000]}
                )

        context.close()
        browser.close()

    inventory_file = output_directory / "platform-page-inventory.json"
    inventory_file.write_text(
        json.dumps(inventory, indent=2),
        encoding="utf-8",
    )

    archive = shutil.make_archive(
        str(output_directory),
        "zip",
        root_dir=output_directory,
    )

    print()
    print(f"Created folder: {output_directory.resolve()}")
    print(f"Created ZIP:    {Path(archive).resolve()}")


if __name__ == "__main__":
    main()

