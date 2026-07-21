#!/usr/bin/env python3

import importlib.util
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/analyze_context_usage.py"
SPEC = importlib.util.spec_from_file_location("analyze_context_usage", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


class ContextUsageTests(unittest.TestCase):
    def test_every_scenario_implicitly_includes_root_skill(self):
        counter = MODULE.TokenCounter("encoding-that-does-not-exist")
        for name, references in MODULE.SCENARIOS.items():
            usage = MODULE.measure_scenario(name, references, counter, (32_768,))
            self.assertEqual(usage.files[0], "SKILL.md")
            self.assertGreater(usage.tokens, 0)
            self.assertGreater(usage.words, 0)

    def test_all_combinations_cover_every_markdown_subset(self):
        reference_count = len(list((ROOT / "references").glob("*.md")))
        self.assertEqual(len(MODULE.all_combinations()), 2**reference_count)

    def test_reference_graph_is_depth_one(self):
        self.assertEqual(MODULE.reference_graph_errors(), [])

    def test_custom_subset_json(self):
        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--refs",
                "gesture-haptics.md",
                "android-api.md",
                "--format",
                "json",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        self.assertIn('"SKILL.md"', result.stdout)
        self.assertIn('"gesture-haptics.md"', result.stdout)
        self.assertIn('"android-api.md"', result.stdout)

    def test_unknown_reference_fails_cleanly(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--refs", "missing.md"],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 2)
        self.assertIn("unknown reference(s): missing.md", result.stderr)


if __name__ == "__main__":
    unittest.main()
