"""End-to-end pipeline tests against the hand-authored fixtures."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from pulsar_lottie import emitter, events, features, mapper, parser, sampler

FIXTURES = Path(__file__).parent / "fixtures"


def _run_pipeline(path: Path):
    doc = parser.parse(path)
    times_s, tracks = sampler.sample(doc)
    signals = features.extract(doc, times_s, tracks)
    detected = events.detect(doc, signals)
    primitives = mapper.map_events(detected)
    pattern = emitter.build(doc, primitives)
    return doc, detected, primitives, pattern


def _all_in_unit_range(pattern: dict) -> None:
    for ev in pattern["events"]:
        if "intensity" in ev:
            assert 0.0 <= ev["intensity"] <= 1.0, ev
        assert 0.0 <= ev["sharpness"] <= 1.0, ev
        for pair in ev.get("intensity_envelope", []):
            assert 0.0 <= pair[1] <= 1.0, pair


def test_bounce_produces_strong_transients():
    doc, detected, primitives, pattern = _run_pipeline(FIXTURES / "bounce.json")
    transients = pattern["events"]
    transient_events = [e for e in transients if e["type"] == "transient"]

    # The ball bounces twice — at the two landings around 0.5s and 1.33s.
    assert 2 <= len(transient_events) <= 6
    impact_times = [e["time_ms"] for e in transient_events]
    # First landing is around frame 30 (~500 ms at 60fps).
    assert any(abs(t - 500) <= 50 for t in impact_times), impact_times
    # Second landing is around frame 80 (~1333 ms at 60fps).
    assert any(abs(t - 1333) <= 50 for t in impact_times), impact_times

    _all_in_unit_range(pattern)
    assert pattern["source"]["duration_ms"] == 2000
    assert pattern["source"]["framerate"] == 60


def test_fade_produces_one_sustained_low_sharpness():
    doc, detected, primitives, pattern = _run_pipeline(FIXTURES / "fade.json")
    sustained = [e for e in pattern["events"] if e["type"] == "continuous"]
    assert len(sustained) == 1
    win = sustained[0]
    # Should span most of the 1s animation.
    assert win["duration_ms"] >= 500
    assert 0.0 <= win["sharpness"] <= 1.0
    # Opacity ease in/out — sharpness should be modest, not at the extreme.
    assert win["sharpness"] < 0.9
    _all_in_unit_range(pattern)


def test_draw_on_produces_rising_envelope():
    doc, detected, primitives, pattern = _run_pipeline(FIXTURES / "draw_on.json")
    sustained = [e for e in pattern["events"] if e["type"] == "continuous"]
    assert len(sustained) == 1
    env = sustained[0]["intensity_envelope"]
    assert len(env) >= 2
    # First half mean < second half mean — envelope should rise.
    mid = len(env) // 2
    first = sum(v for _, v in env[:mid]) / max(1, mid)
    second = sum(v for _, v in env[mid:]) / max(1, len(env) - mid)
    assert second >= first, env
    _all_in_unit_range(pattern)


def test_emitter_schema_shape():
    _, _, _, pattern = _run_pipeline(FIXTURES / "bounce.json")
    assert pattern["version"] == "1.0"
    assert "source" in pattern and "events" in pattern
    assert isinstance(pattern["source"]["framerate"], (int, float))
    assert isinstance(pattern["source"]["duration_ms"], int)
    for ev in pattern["events"]:
        assert ev["type"] in {"transient", "continuous"}
        assert isinstance(ev["time_ms"], int)


def test_cli_dry_run(tmp_path):
    from typer.testing import CliRunner
    from pulsar_lottie.cli import app

    runner = CliRunner()
    result = runner.invoke(app, [str(FIXTURES / "bounce.json"), "--dry-run"])
    assert result.exit_code == 0, result.output
    stats = json.loads(result.output.strip().splitlines()[-1] if "\n" not in result.output else result.output[result.output.find("{"):])
    assert stats["duration_ms"] == 2000
    assert stats["transients"] >= 1
