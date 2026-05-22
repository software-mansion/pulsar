"""Smoke tests over the real-world Lottie files shipped in example/.

These guard against regressions in the parser when it meets quirks of
actual Bodymovin exports (e.g. old-style keyframes with `e` fields,
3D positions, animated lists masquerading as static, opacity arrays).
"""

from __future__ import annotations

from pathlib import Path

import pytest

from pulsar_lottie import emitter, events, features, mapper, parser, sampler

EXAMPLE_DIR = Path(__file__).resolve().parents[1] / "example" / "assets" / "animations"

ANIMATIONS = sorted(EXAMPLE_DIR.glob("*.json")) if EXAMPLE_DIR.exists() else []


@pytest.mark.skipif(not ANIMATIONS, reason="example/assets/animations not present")
@pytest.mark.parametrize("path", ANIMATIONS, ids=lambda p: p.name)
def test_pipeline_does_not_crash(path: Path):
    doc = parser.parse(path)
    assert doc.framerate > 0
    times_s, tracks = sampler.sample(doc)
    if times_s.size == 0:
        return
    signals = features.extract(doc, times_s, tracks)
    detected = events.detect(doc, signals)
    primitives = mapper.map_events(detected)
    pattern = emitter.build(doc, primitives)

    assert pattern["version"] == "1.0"
    assert pattern["source"]["duration_ms"] >= 0

    for ev in pattern["events"]:
        assert ev["type"] in {"transient", "continuous"}
        assert 0.0 <= ev["sharpness"] <= 1.0
        if "intensity" in ev:
            assert 0.0 <= ev["intensity"] <= 1.0
        for offset, value in ev.get("intensity_envelope", []):
            assert 0.0 <= value <= 1.0
            assert offset >= 0
