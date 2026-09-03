import json
import os
from pathlib import Path


SUITE_VERSION = "Metricell V4 Playwright Test Script V1.20"
TESTER_CONFIG = Path(__file__).resolve().parent / "tester_config.json"


def load_audit_caller():
    configured = os.environ.get("METRICELL_AUDIT_CALLER", "").strip()
    if configured:
        return configured
    if TESTER_CONFIG.exists():
        settings = json.loads(TESTER_CONFIG.read_text(encoding="utf-8"))
        return str(settings.get("audit_caller", "")).strip()
    return ""


AUDIT_CALLER = load_audit_caller()

