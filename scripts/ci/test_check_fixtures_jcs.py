"""Tests for check-fixtures-jcs.py: a replay of zero vectors must fail the job."""
import importlib.util
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).with_name("check-fixtures-jcs.py")
spec = importlib.util.spec_from_file_location("check_fixtures_jcs", SCRIPT)
assert spec is not None and spec.loader is not None
check = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check)


class ReplayCountTest(unittest.TestCase):
    def test_real_package_replays_at_least_one_vector(self) -> None:
        ran, failures = check.replay_byte_vectors()
        self.assertGreater(ran, 0)
        self.assertEqual(failures, [])

    def test_empty_iterator_counts_zero(self) -> None:
        with mock.patch.object(check.a2ajcs, "vectors", return_value=iter([])):
            ran, failures = check.replay_byte_vectors()
        self.assertEqual((ran, failures), (0, []))

    def test_empty_iterator_fails_the_job(self) -> None:
        with mock.patch.object(check.a2ajcs, "vectors", return_value=iter([])):
            self.assertEqual(check.main(), 1)

    def test_full_run_passes(self) -> None:
        self.assertEqual(check.main(), 0)


if __name__ == "__main__":
    unittest.main()
