import argparse
import subprocess
import sys
from pathlib import Path

from suite_config import SUITE_VERSION


PROJECT_DIR = Path(__file__).resolve().parent
REQUIREMENTS = PROJECT_DIR / "requirements.txt"


def run_command(command, description):
    print(f"\n{description}")
    result = subprocess.run(command, cwd=PROJECT_DIR)

    if result.returncode != 0:
        print(f"\nStopped because this step failed: {description}")
        raise SystemExit(result.returncode)


def install_requirements():
    command = [sys.executable, "-m", "pip", "install", "-r", str(REQUIREMENTS)]
    run_command(command, "Checking and installing required Python packages...")


def chromium_is_installed():
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as playwright:
            executable = Path(playwright.chromium.executable_path)
        return executable.exists()
    except Exception:
        return False


def install_chromium_if_needed():
    if chromium_is_installed():
        print("\nPlaywright Chromium is already installed.")
        return

    command = [sys.executable, "-m", "playwright", "install", "chromium"]
    run_command(command, "Playwright Chromium is missing and will now be installed...")


def main():
    parser = argparse.ArgumentParser(description=f"One-click launcher for {SUITE_VERSION}")
    parser.add_argument("--rerun-failed", action="store_true")
    arguments = parser.parse_args()

    print("=" * 62)
    print(SUITE_VERSION.upper())
    print("=" * 62)
    install_requirements()
    install_chromium_if_needed()

    command = [sys.executable, "run_and_report.py"]
    if arguments.rerun_failed:
        command.append("--rerun-failed")

    return subprocess.run(command, cwd=PROJECT_DIR).returncode


if __name__ == "__main__":
    raise SystemExit(main())

