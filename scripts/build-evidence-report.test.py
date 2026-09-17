"""Regression tests for matching review criteria to tester screenshot evidence."""
import importlib.util
from pathlib import Path
import unittest


MODULE = Path(__file__).with_name("build-evidence-report.py")
SPEC = importlib.util.spec_from_file_location("build_evidence_report", MODULE)
REPORT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REPORT)


class ResultMatchingTests(unittest.TestCase):
    def test_uses_ordered_result_when_review_has_full_criterion_text(self):
        criteria = ["The launcher is displayed."]
        tester_result = {"criterion": 1, "evidence": ["criterion-1-initial.png", "criterion-1-final.png"]}
        reviewer_outcome = {"criterion": "The launcher is displayed."}
        matched = REPORT.result_for_outcome(reviewer_outcome, [tester_result], {"1": tester_result}, criteria, 0)
        self.assertEqual(matched, tester_result)


if __name__ == "__main__":
    unittest.main()
