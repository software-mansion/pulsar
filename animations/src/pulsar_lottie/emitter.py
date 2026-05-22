"""Emitter: serialize a PrimitiveSet to the Pulsar haptic-pattern JSON schema."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .mapper import PrimitiveSet
from .parser import LottieDoc

SCHEMA_VERSION = "1.0"


def build(doc: LottieDoc, primitives: PrimitiveSet) -> dict[str, Any]:
    duration_ms = int(round(doc.duration_seconds * 1000.0))
    events: list[dict[str, Any]] = []

    for t in primitives.transients:
        events.append(
            {
                "type": "transient",
                "time_ms": t.time_ms,
                "intensity": round(t.intensity, 4),
                "sharpness": round(t.sharpness, 4),
            }
        )

    for c in primitives.continuous:
        events.append(
            {
                "type": "continuous",
                "time_ms": c.time_ms,
                "duration_ms": c.duration_ms,
                "intensity_envelope": [
                    [off, round(v, 4)] for off, v in c.intensity_envelope
                ],
                "sharpness": round(c.sharpness, 4),
            }
        )

    events.sort(key=lambda e: e["time_ms"])

    return {
        "version": SCHEMA_VERSION,
        "source": {
            "framerate": doc.framerate,
            "duration_ms": duration_ms,
        },
        "events": events,
    }


def write(pattern: dict[str, Any], path: str | Path) -> None:
    Path(path).write_text(json.dumps(pattern, indent=2))
