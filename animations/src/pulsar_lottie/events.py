"""Event detector: turn energy/transient signals into discrete haptic events.

We pick out two kinds of events:
  - Transients: sharp jerk peaks (impacts, snaps, easing landings).
  - Sustained windows: contiguous regions of elevated energy (sweeps, fades).

Density is capped at 12 events/second to keep output usable on real hardware.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from scipy.signal import find_peaks

from .features import FeatureSignals
from .parser import LottieDoc, PropertyTrack
from .sampler import SAMPLE_RATE_HZ

MIN_SUSTAINED_MS = 100.0
ENERGY_THRESHOLD = 0.2
TRANSIENT_PROMINENCE_RATIO = 0.15
TRANSIENT_MIN_DISTANCE_SAMPLES = 7  # ~60 ms at 120 Hz
MERGE_WINDOW_MS = 50.0
SUSTAINED_MERGE_GAP_MS = 200.0  # short value dips inside a single motion
MAX_EVENTS_PER_SECOND = 12.0


@dataclass
class TransientEvent:
    time_s: float
    peak: float      # transient_score value at the peak (0..1)
    sharpness: float  # raw jerk at peak (un-normalized; mapper rescales)


@dataclass
class SustainedEvent:
    start_s: float
    end_s: float
    envelope: list[tuple[float, float]]  # (t_seconds, energy 0..1)
    sharpness: float  # mean normalized jerk over the window


@dataclass
class EventSet:
    transients: list[TransientEvent]
    sustained: list[SustainedEvent]


def _easing_landing_times(doc: LottieDoc) -> list[float]:
    """Detect keyframes whose out-tangent shows a sharp ease-out (snap-to-stop).

    Lottie out-tangents close to (1, 1) and in-tangents close to (0, ~1) on
    the next keyframe mean velocity drops fast — a "landing".
    """
    times: list[float] = []
    if doc.framerate <= 0:
        return times
    for track in doc.tracks:
        if track.static or len(track.keyframes) < 2:
            continue
        for a, b in zip(track.keyframes[:-1], track.keyframes[1:]):
            # ease-out shape: low out-tangent y on `a`, high in-tangent y on `b`.
            if a.out_t[1] < 0.3 and b.in_t[1] > 0.7:
                t_s = (b.t - doc.in_frame) / doc.framerate
                times.append(float(t_s))
    return times


def _merge_close(transients: list[TransientEvent]) -> list[TransientEvent]:
    if not transients:
        return []
    transients = sorted(transients, key=lambda e: e.time_s)
    merged: list[TransientEvent] = [transients[0]]
    for ev in transients[1:]:
        last = merged[-1]
        if (ev.time_s - last.time_s) * 1000.0 <= MERGE_WINDOW_MS:
            if ev.peak > last.peak:
                merged[-1] = ev
        else:
            merged.append(ev)
    return merged


def _cap_density(transients: list[TransientEvent], duration_s: float) -> list[TransientEvent]:
    if duration_s <= 0:
        return transients
    max_total = int(MAX_EVENTS_PER_SECOND * duration_s)
    if len(transients) <= max_total:
        return transients
    # Drop the weakest peaks.
    ranked = sorted(transients, key=lambda e: e.peak, reverse=True)[:max_total]
    return sorted(ranked, key=lambda e: e.time_s)


def detect(doc: LottieDoc, signals: FeatureSignals, rate_hz: float = SAMPLE_RATE_HZ) -> EventSet:
    transients: list[TransientEvent] = []
    sustained: list[SustainedEvent] = []

    if signals.times_s.size < 4:
        return EventSet(transients=transients, sustained=sustained)

    ts = signals.times_s
    score = signals.transient_score
    energy = signals.energy
    raw_jerk = signals.raw_jerk

    peak_threshold = TRANSIENT_PROMINENCE_RATIO * float(np.max(score)) if score.size else 0.0
    if peak_threshold > 0:
        peaks, _ = find_peaks(
            score,
            prominence=peak_threshold,
            distance=TRANSIENT_MIN_DISTANCE_SAMPLES,
        )
        for idx in peaks:
            transients.append(
                TransientEvent(
                    time_s=float(ts[idx]),
                    peak=float(score[idx]),
                    sharpness=float(raw_jerk[idx]),
                )
            )

    # Easing-landing transients — extra events at keyframe boundaries.
    for t_s in _easing_landing_times(doc):
        idx = int(np.clip(round(t_s * rate_hz), 0, len(ts) - 1))
        transients.append(
            TransientEvent(
                time_s=float(ts[idx]),
                peak=float(max(score[idx], 0.3)),
                sharpness=float(raw_jerk[idx]),
            )
        )

    transients = _merge_close(transients)
    transients = _cap_density(transients, ts[-1] if ts.size else 0.0)

    # Sustained windows: contiguous samples above energy threshold.
    if energy.size:
        threshold = ENERGY_THRESHOLD * float(np.max(energy))
        above = energy > threshold
        # Bridge short dips inside an otherwise-active window (e.g. a velocity
        # zero-crossing where motion reverses direction).
        bridge_samples = int((SUSTAINED_MERGE_GAP_MS / 1000.0) * rate_hz)
        above = _bridge_gaps(above, bridge_samples)
        min_samples = max(2, int((MIN_SUSTAINED_MS / 1000.0) * rate_hz))
        i = 0
        n = len(above)
        while i < n:
            if not above[i]:
                i += 1
                continue
            j = i
            while j < n and above[j]:
                j += 1
            if (j - i) >= min_samples:
                envelope = _build_envelope(ts[i:j], energy[i:j])
                sharpness = float(np.mean(score[i:j])) if score.size else 0.0
                sustained.append(
                    SustainedEvent(
                        start_s=float(ts[i]),
                        end_s=float(ts[j - 1]),
                        envelope=envelope,
                        sharpness=sharpness,
                    )
                )
            i = j

    return EventSet(transients=transients, sustained=sustained)


def _bridge_gaps(mask: np.ndarray, max_gap: int) -> np.ndarray:
    """Fill False runs shorter than `max_gap` between True regions."""
    if max_gap <= 0 or mask.size == 0:
        return mask
    out = mask.copy()
    n = len(out)
    i = 0
    # Find the first True to anchor bridging.
    while i < n and not out[i]:
        i += 1
    while i < n:
        # advance through the True run
        while i < n and out[i]:
            i += 1
        gap_start = i
        while i < n and not out[i]:
            i += 1
        if i < n and (i - gap_start) <= max_gap:
            out[gap_start:i] = True
    return out


def _build_envelope(times: np.ndarray, values: np.ndarray) -> list[tuple[float, float]]:
    """Pick 3-5 envelope anchor points (start, peak, end + interior)."""
    if times.size == 0:
        return []
    if times.size <= 3:
        return [(float(t - times[0]), float(v)) for t, v in zip(times, values)]
    anchors = [0, int(times.size * 0.25), int(np.argmax(values)), int(times.size * 0.75), times.size - 1]
    seen = []
    out: list[tuple[float, float]] = []
    for a in anchors:
        if a in seen:
            continue
        seen.append(a)
        out.append((float(times[a] - times[0]), float(values[a])))
    out.sort(key=lambda p: p[0])
    return out
