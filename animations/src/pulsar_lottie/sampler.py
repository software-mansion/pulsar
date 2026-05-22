"""Sampler: resample animated properties to a 120 Hz timeline.

Lottie keyframes are sparse and use cubic-bezier easing between pairs. We
walk each track, find the surrounding keyframes for every output sample,
solve the bezier for the easing curve's t-parameter, and interpolate the
value vector. The output is a contiguous numpy array per track, which the
feature extractor can differentiate cleanly.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from .parser import Keyframe, LottieDoc, PropertyTrack

SAMPLE_RATE_HZ = 120.0


@dataclass
class SampledTrack:
    layer_id: str
    prop: str
    values: np.ndarray  # shape: (N, D)
    static: bool


def _solve_bezier_x(p1x: float, p2x: float, target: float, iters: int = 8) -> float:
    """Solve cubic-bezier-on-x for the parameter t given normalized x in [0,1].

    Bezier control points are (0,0), (p1x,p1y), (p2x,p2y), (1,1). We only need
    the x-component to find t; Newton's method converges in a handful of steps.
    """
    t = target
    for _ in range(iters):
        # x(t) = 3(1-t)^2 t p1x + 3(1-t) t^2 p2x + t^3
        one_minus_t = 1.0 - t
        x = (
            3 * one_minus_t * one_minus_t * t * p1x
            + 3 * one_minus_t * t * t * p2x
            + t * t * t
        )
        # dx/dt = 3(1-t)^2 p1x + 6(1-t) t (p2x - p1x) + 3 t^2 (1 - p2x)
        dx = (
            3 * one_minus_t * one_minus_t * p1x
            + 6 * one_minus_t * t * (p2x - p1x)
            + 3 * t * t * (1.0 - p2x)
        )
        if dx < 1e-6:
            break
        t -= (x - target) / dx
        t = max(0.0, min(1.0, t))
    return t


def _bezier_y(p1y: float, p2y: float, t: float) -> float:
    one_minus_t = 1.0 - t
    return (
        3 * one_minus_t * one_minus_t * t * p1y
        + 3 * one_minus_t * t * t * p2y
        + t * t * t
    )


def _ease(progress: float, out_t: tuple[float, float], in_t: tuple[float, float]) -> float:
    """Map linear progress in [0,1] through the bezier easing curve to eased progress.

    `out_t` is the out-tangent of the starting keyframe; `in_t` is the
    in-tangent of the ending keyframe (Lottie convention).
    """
    if progress <= 0.0:
        return 0.0
    if progress >= 1.0:
        return 1.0
    p1x, p1y = out_t
    p2x, p2y = in_t
    # Clamp control x to [0,1] to keep the solver well-behaved.
    p1x = max(0.0, min(1.0, p1x))
    p2x = max(0.0, min(1.0, p2x))
    t = _solve_bezier_x(p1x, p2x, progress)
    return _bezier_y(p1y, p2y, t)


def _eval_track(track: PropertyTrack, frames: np.ndarray) -> np.ndarray:
    """Evaluate a property track at the given Lottie frame indices."""
    kfs = track.keyframes
    dim = max(len(kf.value) for kf in kfs)
    out = np.zeros((len(frames), dim), dtype=np.float64)

    if track.static or len(kfs) == 1:
        v = np.array(kfs[0].value + (0.0,) * (dim - len(kfs[0].value)))
        out[:] = v
        return out

    # Build sorted keyframe arrays for fast bisection.
    times = np.array([kf.t for kf in kfs])
    values = np.array([list(kf.value) + [0.0] * (dim - len(kf.value)) for kf in kfs])

    for i, f in enumerate(frames):
        if f <= times[0]:
            out[i] = values[0]
            continue
        if f >= times[-1]:
            out[i] = values[-1]
            continue
        # Find the segment [j, j+1] containing f.
        j = int(np.searchsorted(times, f, side="right") - 1)
        j = max(0, min(j, len(kfs) - 2))
        a: Keyframe = kfs[j]
        b: Keyframe = kfs[j + 1]
        span = b.t - a.t
        if span <= 0:
            out[i] = values[j]
            continue
        if a.hold:
            out[i] = values[j]
            continue
        progress = (f - a.t) / span
        eased = _ease(progress, a.out_t, b.in_t)
        out[i] = values[j] + (values[j + 1] - values[j]) * eased

    return out


def sample(doc: LottieDoc, rate_hz: float = SAMPLE_RATE_HZ) -> tuple[np.ndarray, list[SampledTrack]]:
    """Resample every track to `rate_hz`.

    Returns `(times_seconds, sampled_tracks)`. `times_seconds` is shared
    across every track so the feature extractor can align them.
    """
    duration_s = doc.duration_seconds
    if duration_s <= 0:
        return np.zeros(0), []

    n = max(2, int(round(duration_s * rate_hz)))
    times_s = np.linspace(0.0, duration_s, n)
    frames = doc.in_frame + times_s * doc.framerate

    sampled: list[SampledTrack] = []
    for track in doc.tracks:
        values = _eval_track(track, frames)
        sampled.append(
            SampledTrack(
                layer_id=track.layer_id,
                prop=track.prop,
                values=values,
                static=track.static,
            )
        )
    return times_s, sampled
