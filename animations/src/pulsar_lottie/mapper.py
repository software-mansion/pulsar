"""Primitive mapper: convert detected events into Pulsar haptic primitives.

Transients become discrete impulses with `intensity` (peak strength) and
`sharpness` (how snappy the rise is). Sustained windows become continuous
events with an intensity envelope sampled along their duration. Both fields
are min-max normalized within a single animation so every output uses the
full 0..1 range — output files don't have to know about absolute scales.
"""

from __future__ import annotations

from dataclasses import dataclass

from .events import EventSet


@dataclass
class TransientPrimitive:
    time_ms: int
    intensity: float
    sharpness: float


@dataclass
class ContinuousPrimitive:
    time_ms: int
    duration_ms: int
    intensity_envelope: list[tuple[int, float]]  # (offset_ms, value 0..1)
    sharpness: float


@dataclass
class PrimitiveSet:
    transients: list[TransientPrimitive]
    continuous: list[ContinuousPrimitive]


def _normalize(values: list[float]) -> list[float]:
    if not values:
        return []
    lo = min(values)
    hi = max(values)
    if hi - lo < 1e-9:
        return [0.5 for _ in values]
    return [(v - lo) / (hi - lo) for v in values]


def _clip01(v: float) -> float:
    return max(0.0, min(1.0, v))


def map_events(events: EventSet) -> PrimitiveSet:
    # Normalize transient intensity (peak) and sharpness (raw jerk).
    peaks = [e.peak for e in events.transients]
    sharps = [e.sharpness for e in events.transients]
    norm_peaks = _normalize(peaks)
    norm_sharps = _normalize(sharps)

    transient_primitives: list[TransientPrimitive] = []
    for ev, ip, sp in zip(events.transients, norm_peaks, norm_sharps):
        transient_primitives.append(
            TransientPrimitive(
                time_ms=int(round(ev.time_s * 1000.0)),
                intensity=_clip01(ip),
                sharpness=_clip01(sp),
            )
        )

    # Normalize sustained intensities by their peak envelope value,
    # and sharpness across the set.
    cont_sharps = _normalize([s.sharpness for s in events.sustained])

    continuous_primitives: list[ContinuousPrimitive] = []
    for ev, ns in zip(events.sustained, cont_sharps):
        env_vals = [v for _, v in ev.envelope]
        norm_env = _normalize(env_vals) if env_vals else []
        envelope_ms = [
            (int(round(off * 1000.0)), _clip01(v))
            for (off, _), v in zip(ev.envelope, norm_env)
        ]
        duration_ms = int(round((ev.end_s - ev.start_s) * 1000.0))
        continuous_primitives.append(
            ContinuousPrimitive(
                time_ms=int(round(ev.start_s * 1000.0)),
                duration_ms=duration_ms,
                intensity_envelope=envelope_ms,
                sharpness=_clip01(ns),
            )
        )

    return PrimitiveSet(
        transients=transient_primitives,
        continuous=continuous_primitives,
    )
