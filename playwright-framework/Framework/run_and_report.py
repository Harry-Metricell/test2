import argparse
import json
import os
import subprocess
import sys
import time
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from generate_report_from_template import build_report, build_ticket_reports
from suite_config import SUITE_VERSION


PROJECT_DIR = Path(__file__).resolve().parent
RESULTS_FILE = PROJECT_DIR / "test-results" / "results.json"
FINAL_API_TEST = "test_metricell_v4.py::test_zz_no_api_requests_failed"
AUDIT_EXPLORER_TEST = "test_zy_api_audit_has_no_5xx_for_current_run"


def read_results():
    return json.loads(RESULTS_FILE.read_text(encoding="utf-8"))


def previous_failed_targets():
    if not RESULTS_FILE.exists():
        raise FileNotFoundError("No previous results were found. Run the full suite first.")

    previous = read_results()
    failed = [test for test in previous.get("tests", []) if test.get("outcome") == "failed"]

    if not failed:
        return []

    if any(test.get("name") == AUDIT_EXPLORER_TEST for test in failed):
        print("The Request Explorer audit depends on activity from the complete run, so the full suite will be rerun.")
        return ["test_metricell_v4.py"]

    browser_failures = [test["nodeid"] for test in failed if test.get("name") != "test_zz_no_api_requests_failed"]

    if not browser_failures:
        print("The aggregate API test was the only failure, so the full suite must be rerun.")
        return ["test_metricell_v4.py"]

    targets = list(dict.fromkeys(browser_failures))
    targets.append(FINAL_API_TEST)
    return targets


def failed_targets_from_results(results):
    """Use the same retry rules for an in-progress automatic retry."""
    failed = [test for test in results.get("tests", []) if test.get("outcome") == "failed"]
    if not failed:
        return []
    if any(test.get("name") == AUDIT_EXPLORER_TEST for test in failed):
        return ["test_metricell_v4.py"]

    browser_failures = [test["nodeid"] for test in failed if test.get("name") != "test_zz_no_api_requests_failed"]
    if not browser_failures:
        return ["test_metricell_v4.py"]

    return [*dict.fromkeys(browser_failures), FINAL_API_TEST]


def merge_retry_results(initial_results, retry_results):
    """Replace only retried test records while preserving the full-suite report."""
    retried = {test["nodeid"]: test for test in retry_results.get("tests", [])}
    merged_tests = [retried.get(test["nodeid"], test) for test in initial_results.get("tests", [])]
    return {
        **initial_results,
        "generated_at": retry_results.get("generated_at", initial_results.get("generated_at")),
        "exit_status": 0 if not any(test.get("outcome") == "failed" for test in merged_tests) else 1,
        "execution_mode": "Full suite with automatic failed-test retry",
        "evidence_directory": retry_results.get("evidence_directory", initial_results.get("evidence_directory")),
        "tests": merged_tests,
    }


def print_summary(results, elapsed_seconds):
    tests = results.get("tests", [])
    passed = sum(test.get("outcome") == "passed" for test in tests)
    failed = sum(test.get("outcome") in {"failed", "error"} for test in tests)
    skipped = sum(test.get("outcome") == "skipped" for test in tests)
    minutes, seconds = divmod(int(round(elapsed_seconds)), 60)

    print("\n" + "=" * 62)
    print("METRICELL V4 QA COMPLETE")
    print("=" * 62)
    print(f"Test suite : {results.get('suite_version', SUITE_VERSION)}")
    print(f"Run type   : {results.get('execution_mode', 'Automated')}")
    print(f"Total      : {len(tests)}")
    print(f"Passed     : {passed}")
    print(f"Failed     : {failed} (includes setup/teardown errors)")
    print(f"Skipped    : {skipped}")
    print(f"Duration   : {minutes} minute(s) {seconds} second(s)")
    print("=" * 62)


def create_shareable_zip(report_path: Path, results, ticket_reports=()):
    generated = datetime.fromisoformat(results["generated_at"].replace("Z", "+00:00")).astimezone()
    archive_path = report_path.parent / f"Metricell_QA_Run_{generated:%Y-%m-%d_%H%M%S}.zip"
    evidence_path = Path(results.get("evidence_directory", ""))

    if not evidence_path.is_absolute():
        evidence_path = PROJECT_DIR / evidence_path

    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.write(report_path, report_path.name)
        for ticket_report in ticket_reports:
            archive.write(ticket_report, Path("tickets") / ticket_report.name)
        archive.write(RESULTS_FILE, "test-results/results.json")

        if evidence_path.exists():
            for file_path in evidence_path.rglob("*"):
                if file_path.is_file():
                    relative = file_path.relative_to(evidence_path)
                    archive_name = Path("evidence") / evidence_path.name / relative
                    archive.write(file_path, archive_name.as_posix())

    return archive_path


def open_report(report_path: Path):
    if os.name == "nt":
        try:
            os.startfile(str(report_path.resolve()))
        except OSError as error:
            print(f"The report could not be opened automatically: {error}")


def run_tests(rerun_failed=False, open_when_finished=True, auto_retry=True):
    os.chdir(PROJECT_DIR)

    try:
        targets = previous_failed_targets() if rerun_failed else ["test_metricell_v4.py"]
    except (FileNotFoundError, json.JSONDecodeError) as error:
        print(f"Cannot rerun failures: {error}")
        return 2

    if not targets:
        print("The previous run contains no failed tests. Nothing needs to be rerun.")
        return 0

    execution_mode = "Failed-test rerun" if rerun_failed and targets != ["test_metricell_v4.py"] else "Full suite"

    if RESULTS_FILE.exists():
        RESULTS_FILE.unlink()

    environment = os.environ.copy()
    environment["METRICELL_SUITE_VERSION"] = SUITE_VERSION
    environment["METRICELL_EXECUTION_MODE"] = execution_mode
    environment["METRICELL_RUN_STARTED_UTC"] = datetime.now(timezone.utc).isoformat()
    command = [sys.executable, "-m", "pytest", *targets]
    started = time.perf_counter()
    result = subprocess.run(command, env=environment)
    elapsed = time.perf_counter() - started

    if not RESULTS_FILE.exists():
        print("\nNo results.json file was produced, so a Word report cannot be created.")
        return result.returncode or 2

    results = read_results()

    if auto_retry and not rerun_failed and result.returncode and results.get("tests"):
        retry_targets = failed_targets_from_results(results)
        if retry_targets:
            print("\nRetrying failed tests once before generating the final report...")
            first_results = results
            RESULTS_FILE.unlink()
            retry_environment = environment.copy()
            retry_environment["METRICELL_EXECUTION_MODE"] = "Automatic failed-test retry"
            retry_command = [sys.executable, "-m", "pytest", *retry_targets]
            retry_started = time.perf_counter()
            subprocess.run(retry_command, env=retry_environment)
            elapsed += time.perf_counter() - retry_started

            if RESULTS_FILE.exists():
                retry_results = read_results()
                results = merge_retry_results(first_results, retry_results)
                RESULTS_FILE.write_text(json.dumps(results, indent=2), encoding="utf-8")
                result = subprocess.CompletedProcess(command, results["exit_status"])
    print_summary(results, elapsed)

    try:
        report_path = build_report()
        ticket_reports = build_ticket_reports()
        archive_path = create_shareable_zip(report_path, results, ticket_reports)
        print(f"\nWord report : {report_path.resolve()}")
        if ticket_reports:
            print(f"Ticket evidence packs: {len(ticket_reports)}")
        print(f"Evidence ZIP: {archive_path.resolve()}")
    except Exception as error:
        print(f"\nReport or evidence ZIP generation failed: {error}", file=sys.stderr)
        return result.returncode or 2

    if open_when_finished:
        open_report(report_path)

    return result.returncode


def main():
    parser = argparse.ArgumentParser(description=f"Run {SUITE_VERSION}")
    parser.add_argument("--rerun-failed", action="store_true", help="Rerun failures from results.json")
    parser.add_argument("--no-auto-retry", action="store_true", help="Do not retry failures after a full run")
    parser.add_argument("--no-open", action="store_true", help="Do not open the generated Word report")
    arguments = parser.parse_args()
    return run_tests(arguments.rerun_failed, not arguments.no_open, not arguments.no_auto_retry)


if __name__ == "__main__":
    raise SystemExit(main())

