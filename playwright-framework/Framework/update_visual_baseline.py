import shutil
from datetime import datetime
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parent
BASELINE = PROJECT_DIR / "visual-baselines" / "launcher.png"
EVIDENCE = PROJECT_DIR / "reports" / "evidence"


def latest_launcher_screenshot():
    candidates = list(EVIDENCE.glob("*/visual-comparisons/launcher-current.png"))
    return max(candidates, key=lambda path: path.stat().st_mtime) if candidates else None


def main():
    latest = latest_launcher_screenshot()

    if latest is None:
        print("No Launcher comparison screenshot was found. Run the full suite first.")
        return 2

    print("WARNING: This accepts the latest Launcher appearance as the new approved baseline.")
    print("Only continue when the visual change has been reviewed and approved.")
    print(f"Current baseline : {BASELINE}")
    print(f"Proposed image   : {latest}")
    confirmation = input("Type UPDATE to replace the visual baseline: ").strip().casefold()

    if confirmation != "update":
        print("Visual baseline update cancelled. No files were changed.")
        return 1

    BASELINE.parent.mkdir(parents=True, exist_ok=True)

    if BASELINE.exists():
        timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        backup = BASELINE.with_name(f"launcher-backup-{timestamp}.png")
        shutil.copy2(BASELINE, backup)
        print(f"Previous baseline backed up to: {backup}")

    shutil.copy2(latest, BASELINE)
    print(f"Visual baseline updated from: {latest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

