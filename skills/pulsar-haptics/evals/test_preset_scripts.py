#!/usr/bin/env python3

import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FIND = ROOT / "scripts/find_presets.py"
BUILD = ROOT / "scripts/build_preset_index.py"


class PresetScriptTests(unittest.TestCase):
    def find(self, *args: str):
        result = subprocess.run(
            [sys.executable, str(FIND), *args],
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(result.stdout)

    def test_generated_index_is_current(self):
        subprocess.run([sys.executable, str(BUILD), "--check"], check=True)

    def test_index_shape_and_count(self):
        records = json.loads((ROOT / "references/presets.json").read_text())
        self.assertEqual(len(records), 151)
        self.assertEqual(len({record["name"] for record in records}), 151)
        self.assertTrue(all(set(record["tags"]) == {"intensity", "texture", "shape", "duration"} for record in records))

    def test_exact_name_and_method(self):
        self.assertEqual(self.find("--name", "CoinDrop")[0]["method"], "coinDrop")
        self.assertEqual(self.find("--name", "coinDrop")[0]["name"], "CoinDrop")

    def test_multi_tag_filter(self):
        results = self.find(
            "--intensity", "Substantial",
            "--texture", "Rigid",
            "--shape", "Impulses",
            "--duration", "Impulse",
        )
        self.assertTrue(results)
        self.assertTrue(all(item["tags"]["texture"] == "Rigid" for item in results))

    def test_text_search_and_limit(self):
        results = self.find("--query", "confirmation", "--limit", "2")
        self.assertLessEqual(len(results), 2)
        self.assertTrue(results)

    def test_no_match(self):
        self.assertEqual(self.find("--name", "NotARealPreset"), [])

    def test_invalid_tag(self):
        result = subprocess.run(
            [sys.executable, str(FIND), "--intensity", "Huge"],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 2)
        self.assertIn("invalid choice", result.stderr)


if __name__ == "__main__":
    unittest.main()
