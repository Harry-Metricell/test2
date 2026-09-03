import subprocess
import sys
from datetime import datetime
from pathlib import Path

from start_metricell_tests import install_chromium_if_needed, install_requirements
from suite_config import SUITE_VERSION


PROJECT_DIR = Path(__file__).resolve().parent
AUTH_FILE = PROJECT_DIR / "playwright" / ".auth" / "user.json"
RECORDINGS_DIR = PROJECT_DIR / "playwright-recordings"
GIS_URL = "https://smartnetworkv4-o2-uk-dev.metricell.com/gis"


def main():
    print("=" * 62)
    print(f"{SUITE_VERSION.upper()} - RECORDER")
    print("=" * 62)
    install_requirements()
    install_chromium_if_needed()

    RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)
    AUTH_FILE.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    output_file = RECORDINGS_DIR / f"metricell_gis_recording_{timestamp}.py"

    command = [sys.executable, "-m", "playwright", "codegen", "--target=python"]
    command.extend([f"--output={output_file}", f"--save-storage={AUTH_FILE}"])

    if AUTH_FILE.exists():
        command.append(f"--load-storage={AUTH_FILE}")
        print(f"Loading saved Metricell login from: {AUTH_FILE}")
    else:
        print("No saved login was found. Complete sign-in and 2FA in the recorder browser.")

    command.append(GIS_URL)
    print(f"Generated Python will be saved to: {output_file}")
    print("Close the recorder browser when finished so the files are saved.")
    result = subprocess.run(command, cwd=PROJECT_DIR)

    if result.returncode == 0:
        print(f"\nRecorder finished. Generated code: {output_file}")
    else:
        print(f"\nRecorder stopped with exit code {result.returncode}.")

    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())

