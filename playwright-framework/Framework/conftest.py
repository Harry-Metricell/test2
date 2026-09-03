import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import pytest
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError


PLATFORM_URL = "https://smartnetworkv4-o2-uk-dev.metricell.com/"
RESULTS = []
ARTIFACTS = {}
OUTPUT = Path("test-results")
AUTH_FILE = Path("playwright/.auth/user.json")
SUITE_VERSION = os.environ.get("METRICELL_SUITE_VERSION", "Metricell V4 test suite")
EXECUTION_MODE = os.environ.get("METRICELL_EXECUTION_MODE", "Direct pytest run")
RUN_ID = datetime.now().strftime("%Y-%m-%d_%H%M%S")
EVIDENCE = Path("reports/evidence") / RUN_ID
VIDEO_DIR = EVIDENCE / "videos"
TRACE_DIR = EVIDENCE / "traces"
SCREENSHOT_DIR = EVIDENCE / "screenshots"


def safe_test_name(nodeid: str):
    """Create a Windows-safe filename from a pytest test identifier."""
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", nodeid).strip("_")


def launcher_is_visible(page, timeout=15_000):
    launcher = page.locator("#root").get_by_text("Launcher", exact=True)

    try:
        launcher.wait_for(state="visible", timeout=timeout)
        return True
    except PlaywrightTimeoutError:
        return False


def authentication_page_is_visible(page):
    """Identify common SSO/login redirects without depending on one provider."""
    platform_host = urlparse(PLATFORM_URL).hostname
    current_url = page.url.lower()
    current_host = urlparse(page.url).hostname
    url_markers = ("login", "signin", "sign-in", "oauth", "authorize", "saml")

    if current_host and platform_host and current_host != platform_host:
        return True

    if any(marker in current_url for marker in url_markers):
        return True

    sign_in_text = page.get_by_text(re.compile(r"^(sign in|log in)$", re.IGNORECASE))
    return sign_in_text.count() > 0


def refresh_authentication_if_needed(page):
    """Reuse saved authentication, or pause for manual login and save it again."""
    page.goto(PLATFORM_URL, wait_until="domcontentloaded", timeout=60_000)

    if launcher_is_visible(page):
        return

    recognised_login = authentication_page_is_visible(page)
    print("\nThe saved Metricell login is missing, expired, or no longer accepted.")
    print(f"Current browser page: {page.url}")

    if recognised_login:
        print("An authentication page was detected.")
    else:
        print("Launcher was not found. Check the open browser for a sign-in or availability message.")

    print("Complete sign-in and 2FA if requested, and wait for the Metricell Launcher.")

    try:
        input("When Launcher is visible, return here and press Enter...")
    except (EOFError, OSError):
        pytest.fail(
            "Metricell authentication requires user input, but this run has no interactive terminal. "
            "Run python run_and_report.py manually to refresh login and 2FA."
        )

    if not launcher_is_visible(page, timeout=180_000):
        pytest.fail(
            "Authentication was not completed successfully. The Metricell Launcher was not visible "
            f"at {page.url}."
        )

    AUTH_FILE.parent.mkdir(parents=True, exist_ok=True)
    page.context.storage_state(path=str(AUTH_FILE))
    print(f"Refreshed login saved to {AUTH_FILE}")


@pytest.fixture
def evidence_directory():
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    return EVIDENCE


@pytest.fixture
def authenticated_page(browser, request):
    VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    TRACE_DIR.mkdir(parents=True, exist_ok=True)
    context_options = {
        "record_video_dir": str(VIDEO_DIR),
        "record_video_size": {"width": 1280, "height": 720},
        "viewport": {"width": 1280, "height": 720},
    }

    if AUTH_FILE.exists():
        context_options["storage_state"] = str(AUTH_FILE)

    context = browser.new_context(**context_options)
    context.tracing.start(screenshots=True, snapshots=True, sources=True)
    page = context.new_page()
    video = page.video
    fixture_failed = False
    setup_screenshot = None

    try:
        refresh_authentication_if_needed(page)
        yield page
    except BaseException:
        fixture_failed = True
        SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
        screenshot_path = SCREENSHOT_DIR / f"{safe_test_name(request.node.nodeid)}_setup.png"

        try:
            page.screenshot(path=str(screenshot_path), full_page=True)
            setup_screenshot = str(screenshot_path)
        except Exception:
            pass

        raise
    finally:
        report = getattr(request.node, "rep_call", None)
        failed = fixture_failed or bool(report and report.failed)
        trace_path = TRACE_DIR / f"{safe_test_name(request.node.nodeid)}.zip"
        saved_trace = None
        saved_video = None

        try:
            if failed:
                context.tracing.stop(path=str(trace_path))
                saved_trace = str(trace_path)
            else:
                context.tracing.stop()
        except Exception:
            pass

        try:
            context.close()
        except Exception:
            pass

        try:
            saved_video = str(video.path())
        except Exception:
            pass

        ARTIFACTS[request.node.nodeid] = {
            "video": saved_video,
            "trace": saved_trace,
            "screenshot": setup_screenshot,
        }


@pytest.hookimpl(tryfirst=True)
def pytest_report_teststatus(report, config):
    """Show setup and teardown errors as failures in pytest's console output."""
    if report.failed and report.when in {"setup", "teardown"}:
        return "failed", "F", "FAILED"


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    setattr(item, f"rep_{report.when}", report)

    if report.when == "setup" and report.failed:
        test_name = getattr(item, "originalname", None) or item.name.split("[", 1)[0]
        crash = getattr(report.longrepr, "reprcrash", None)
        failure_summary = getattr(crash, "message", "") or str(report.longrepr)
        RESULTS.append(
            {
                "name": test_name,
                "display_name": item.name,
                "nodeid": item.nodeid,
                "outcome": "failed",
                "duration_seconds": round(report.duration, 3),
                "failure": str(report.longrepr),
                "failure_summary": failure_summary,
                "screenshot": None,
                "browser_version": None,
                "current_url": None,
                "page_title": None,
                "actual_result": "Authentication or browser setup failed before the test steps could run.",
            }
        )
        return

    if report.when != "call":
        return

    OUTPUT.mkdir(exist_ok=True)
    test_name = getattr(item, "originalname", None) or item.name.split("[", 1)[0]
    page = item.funcargs.get("page") or item.funcargs.get("authenticated_page")
    screenshot = None
    visual_screenshot = None
    browser_version = None
    current_url = None
    page_title = None

    if page is not None and not page.is_closed():
        try:
            browser_version = page.context.browser.version
            current_url = page.url
            page_title = page.title()
        except Exception:
            pass

    # Retain a final-state screenshot for every test outcome.  A passing image is
    # positive execution evidence, while a failing image helps diagnose the cause.
    if page is not None and not page.is_closed():
        SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
        screenshot_path = SCREENSHOT_DIR / f"{safe_test_name(item.nodeid)}_final.png"
        try:
            page.screenshot(path=str(screenshot_path), full_page=True)
            visual_screenshot = str(screenshot_path)
            screenshot = visual_screenshot
        except Exception:
            pass

    failure_summary = ""
    if report.failed:
        crash = getattr(report.longrepr, "reprcrash", None)
        failure_summary = getattr(crash, "message", "") or str(report.longrepr)

    properties = dict(getattr(item, "user_properties", []))
    RESULTS.append(
        {
            "name": test_name,
            "display_name": item.name,
            "nodeid": item.nodeid,
            "outcome": report.outcome,
            "duration_seconds": round(report.duration, 3),
            "failure": str(report.longrepr) if report.failed else "",
            "failure_summary": failure_summary,
            "screenshot": screenshot,
            "visual_screenshot": visual_screenshot,
            "browser_version": browser_version,
            "current_url": current_url,
            "page_title": page_title,
            "actual_result": properties.get("actual_result", ""),
            "visual_current": properties.get("visual_current", ""),
            "visual_baseline": properties.get("visual_baseline", ""),
            "visual_difference": properties.get("visual_difference", ""),
        }
    )


def pytest_sessionfinish(session, exitstatus):
    OUTPUT.mkdir(exist_ok=True)

    for result in RESULTS:
        artifacts = ARTIFACTS.get(result["nodeid"], {})
        result["video"] = artifacts.get("video")
        result["trace"] = artifacts.get("trace")
        result["screenshot"] = result.get("screenshot") or artifacts.get("screenshot")

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "exit_status": exitstatus,
        "suite_version": SUITE_VERSION,
        "execution_mode": EXECUTION_MODE,
        "evidence_directory": str(EVIDENCE),
        "tests": RESULTS,
    }
    (OUTPUT / "results.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

