"""Feature extractor: turn sampled tracks into global energy / transient signals.

For each animated property we compute velocity, acceleration, and jerk via
`np.gradient`. Per-layer prominence weights (size × opacity × center proximity)
modulate the contribution of each track. The two outputs — `energy(t)` and
`transient_score(t)` — drive the event detector downstream.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from .parser import LottieDoc, center_proximity_factor
from .sampler import SampledTrack, SAMPLE_RATE_HZ


@dataclass
class FeatureSignals:
    times_s: np.ndarray
    energy: np.ndarray  # normalized [0,1]
    transient_score: np.ndarray  # normalized [0,1]
    raw_jerk: np.ndarray  # before normalization, for sharpness lookup


def _vec_magnitude_gradient(values: np.ndarray, dt: float) -> np.ndarray:
    """Magnitude of the per-sample derivative of a multi-d signal."""
    if values.shape[0] < 2:
        return np.zeros(values.shape[0])
    deriv = np.gradient(values, dt, axis=0)
    return np.linalg.norm(deriv, axis=1)


def _safe_normalize(arr: np.ndarray) -> np.ndarray:
    m = float(np.max(arr)) if arr.size else 0.0
    if m <= 1e-12:
        return np.zeros_like(arr)
    return arr / m


def _layer_weight(doc: LottieDoc, layer_id: str) -> float:
    """Visual-prominence weight: relative size × static opacity × center proximity.

    Animated opacity is folded in later by the energy summation; here we use
    the static fallback so static-but-fading layers still get a baseline weight.
    """
    comp_area = max(doc.width * doc.height, 1.0)
    for layer in doc.layers:
        if layer.layer_id == layer_id:
            size_ratio = min(1.0, layer.bbox_area / comp_area)
            return size_ratio * max(layer.static_opacity, 0.05) * center_proximity_factor(doc, layer_id)
    return 0.1


def extract(
    doc: LottieDoc,
    times_s: np.ndarray,
    tracks: list[SampledTrack],
    rate_hz: float = SAMPLE_RATE_HZ,
) -> FeatureSignals:
    """Aggregate per-track derivatives into global energy and transient signals."""
    if times_s.size == 0:
        empty = np.zeros(0)
        return FeatureSignals(times_s=empty, energy=empty, transient_score=empty, raw_jerk=empty)

    dt = 1.0 / rate_hz
    n = times_s.size
    energy = np.zeros(n)
    transient = np.zeros(n)

    # Cache layer weights so we don't recompute per track.
    layer_weights: dict[str, float] = {}
    for layer in doc.layers:
        layer_weights[layer.layer_id] = _layer_weight(doc, layer.layer_id)

    for track in tracks:
        if track.static:
            continue
        w = layer_weights.get(track.layer_id, 0.1)
        if w <= 0:
            continue

        if track.values.shape[1] >= 2 and track.prop == "position":
            velocity = _vec_magnitude_gradient(track.values, dt)
        else:
            # Scalar / 1-d properties — operate on the first component only.
            v = track.values[:, 0]
            velocity = np.abs(np.gradient(v, dt))

        accel = np.abs(np.gradient(velocity, dt))
        jerk = np.abs(np.gradient(accel, dt))

        v_norm = _safe_normalize(velocity)
        j_norm = _safe_normalize(jerk)

        energy += w * v_norm
        transient += w * j_norm

    energy_n = _safe_normalize(energy)
    transient_n = _safe_normalize(transient)
    return FeatureSignals(
        times_s=times_s,
        energy=energy_n,
        transient_score=transient_n,
        raw_jerk=transient,  # un-normalized aggregate for sharpness lookup
    )
