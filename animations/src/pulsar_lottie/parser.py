"""Lottie JSON parser.

Walks a Lottie JSON file and extracts animated properties (position, scale,
rotation, opacity, trim path) from every layer. Each property is normalized
into a list of keyframes with bezier-easing tangents so the sampler can
interpolate without re-reading the raw schema.
"""

from __future__ import annotations

import json
import logging
import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

log = logging.getLogger(__name__)

# Properties we extract from a layer's `ks` block.
LAYER_PROPS = {
    "p": "position",
    "s": "scale",
    "r": "rotation",
    "o": "opacity",
}


@dataclass
class Keyframe:
    """A single keyframe with bezier-easing tangents.

    `value` is a tuple of floats (1-d for scalars, 2-d for position, etc.).
    `t` is the frame index (Lottie composition frame, not seconds).
    `in_t` / `out_t` are bezier control points (x,y in [0,1]) used for easing.
    `hold` means the value stays constant until the next keyframe.
    """

    t: float
    value: tuple[float, ...]
    in_t: tuple[float, float] = (0.0, 0.0)
    out_t: tuple[float, float] = (1.0, 1.0)
    hold: bool = False


@dataclass
class PropertyTrack:
    layer_id: str
    prop: str  # "position" | "scale" | "rotation" | "opacity" | "trim_start" | "trim_end"
    keyframes: list[Keyframe]
    static: bool = False  # True when there's only one keyframe (no animation)


@dataclass
class LayerInfo:
    layer_id: str
    name: str
    bbox_area: float  # rough area estimate in composition pixels
    static_opacity: float  # fallback when opacity isn't animated


@dataclass
class LottieDoc:
    framerate: float
    in_frame: float
    out_frame: float
    width: float
    height: float
    layers: list[LayerInfo]
    tracks: list[PropertyTrack] = field(default_factory=list)

    @property
    def duration_frames(self) -> float:
        return max(0.0, self.out_frame - self.in_frame)

    @property
    def duration_seconds(self) -> float:
        return self.duration_frames / self.framerate if self.framerate else 0.0


def _as_tuple(v: Any) -> tuple[float, ...]:
    if isinstance(v, (list, tuple)):
        return tuple(float(x) for x in v)
    return (float(v),)


def _bezier_xy(pt: Any) -> tuple[float, float]:
    """Extract a single (x,y) from a Lottie bezier tangent block.

    Lottie stores tangents as `{"x": [..], "y": [..]}` (per-dim) or as scalars.
    We collapse them to a single 2D point — good enough since most authoring
    tools emit the same x/y for every dimension on rotation/opacity tracks.
    """
    if pt is None:
        return (0.0, 0.0)
    x = pt.get("x", 0.0)
    y = pt.get("y", 0.0)
    if isinstance(x, list):
        x = x[0] if x else 0.0
    if isinstance(y, list):
        y = y[0] if y else 0.0
    return (float(x), float(y))


def _parse_property(layer_id: str, prop_name: str, raw: dict[str, Any] | None) -> PropertyTrack | None:
    """Convert a Lottie property block (`{a, k, ...}`) into a PropertyTrack."""
    if raw is None:
        return None
    if raw.get("x") is not None:
        log.warning("Layer %s.%s uses a JS expression; skipping", layer_id, prop_name)
        return None

    k = raw.get("k")
    # Some older Bodymovin exports set `a: 0` even when `k` contains keyframe
    # dicts. Detect animation by the shape of `k` rather than trusting `a`.
    is_keyframe_list = isinstance(k, list) and any(isinstance(x, dict) for x in k)
    animated = raw.get("a", 0) == 1 or is_keyframe_list

    if not animated:
        value = _as_tuple(k) if k is not None else (0.0,)
        return PropertyTrack(
            layer_id=layer_id,
            prop=prop_name,
            keyframes=[Keyframe(t=0.0, value=value)],
            static=True,
        )

    if not isinstance(k, list):
        return None

    keyframes: list[Keyframe] = []
    for i, kf in enumerate(k):
        if not isinstance(kf, dict):
            continue
        t = float(kf.get("t", 0.0))
        # Lottie's old-style stores both `s` (start) and `e` (end); modern
        # files only store `s` and the next keyframe's `s` is the end.
        s = kf.get("s")
        if s is None:
            # Final implicit keyframe at the end (no value).
            if keyframes:
                keyframes.append(Keyframe(t=t, value=keyframes[-1].value, hold=True))
            continue
        value = _as_tuple(s)
        in_t = _bezier_xy(kf.get("i"))
        out_t = _bezier_xy(kf.get("o"))
        hold = bool(kf.get("h", 0))
        keyframes.append(Keyframe(t=t, value=value, in_t=in_t, out_t=out_t, hold=hold))

    # Old-style files often have a trailing keyframe whose `e` field holds the
    # final value and lacks an `s`. Append it if we'd otherwise miss it.
    if k and isinstance(k[-1], dict) and "e" in k[-1] and len(keyframes) >= 1:
        last_raw = k[-1]
        if keyframes[-1].t == float(last_raw.get("t", 0.0)):
            try:
                end_val = _as_tuple(last_raw["e"])
                if end_val != keyframes[-1].value:
                    # Replace the implicit trailing hold with the real end value.
                    keyframes[-1] = Keyframe(
                        t=keyframes[-1].t + 1.0,
                        value=end_val,
                        hold=False,
                    )
            except (TypeError, ValueError):
                pass

    if not keyframes:
        return None
    return PropertyTrack(layer_id=layer_id, prop=prop_name, keyframes=keyframes, static=False)


def _walk_shapes(shapes: list[Any], layer_id: str, out: list[PropertyTrack]) -> None:
    """Recursively walk shape items, extracting Trim Paths (tm) properties."""
    for shape in shapes:
        if not isinstance(shape, dict):
            continue
        ty = shape.get("ty")
        if ty == "tm":
            for key, prop in (("s", "trim_start"), ("e", "trim_end")):
                track = _parse_property(layer_id, prop, shape.get(key))
                if track is not None:
                    out.append(track)
        elif ty == "gr":  # group — recurse
            inner = shape.get("it", [])
            if isinstance(inner, list):
                _walk_shapes(inner, layer_id, out)


def _estimate_bbox_area(layer: dict[str, Any], comp_w: float, comp_h: float) -> float:
    """Rough size estimate; falls back to a quarter of the comp area."""
    if "w" in layer and "h" in layer:
        try:
            return float(layer["w"]) * float(layer["h"])
        except (TypeError, ValueError):
            pass
    return 0.25 * comp_w * comp_h


def parse(path: str | Path) -> LottieDoc:
    """Load a Lottie JSON file and return a normalized LottieDoc."""
    p = Path(path)
    data = json.loads(p.read_text())

    fr = float(data.get("fr", 30))
    ip = float(data.get("ip", 0))
    op = float(data.get("op", 0))
    w = float(data.get("w", 1))
    h = float(data.get("h", 1))

    layers_info: list[LayerInfo] = []
    tracks: list[PropertyTrack] = []

    for idx, layer in enumerate(data.get("layers", [])):
        layer_id = str(layer.get("ind", idx))
        name = layer.get("nm", layer_id)
        ks = layer.get("ks", {}) or {}

        for key, prop_name in LAYER_PROPS.items():
            track = _parse_property(layer_id, prop_name, ks.get(key))
            if track is not None:
                tracks.append(track)

        shapes = layer.get("shapes")
        if isinstance(shapes, list):
            _walk_shapes(shapes, layer_id, tracks)

        # Resolve a fallback static opacity (used by the prominence weight).
        opacity_raw = ks.get("o") or {}
        op_k = opacity_raw.get("k", 100)
        if isinstance(op_k, list):
            op_k = op_k[0] if op_k and not isinstance(op_k[0], (dict, list)) else 100
        try:
            static_op = float(op_k) / 100.0
        except (TypeError, ValueError):
            static_op = 1.0
        static_op = max(0.0, min(1.0, static_op))

        layers_info.append(
            LayerInfo(
                layer_id=layer_id,
                name=name,
                bbox_area=_estimate_bbox_area(layer, w, h),
                static_opacity=static_op,
            )
        )

    return LottieDoc(
        framerate=fr,
        in_frame=ip,
        out_frame=op,
        width=w,
        height=h,
        layers=layers_info,
        tracks=tracks,
    )


def layer_center(doc: LottieDoc, layer_id: str) -> tuple[float, float]:
    """Approximate the layer's average screen position (for prominence weighting)."""
    for track in doc.tracks:
        if track.layer_id == layer_id and track.prop == "position":
            xs = [kf.value[0] for kf in track.keyframes if len(kf.value) >= 1]
            ys = [kf.value[1] for kf in track.keyframes if len(kf.value) >= 2]
            if xs and ys:
                return (sum(xs) / len(xs), sum(ys) / len(ys))
    return (doc.width / 2.0, doc.height / 2.0)


def center_proximity_factor(doc: LottieDoc, layer_id: str) -> float:
    """1.0 at the composition center, decaying to ~0.3 at the corners."""
    cx, cy = layer_center(doc, layer_id)
    dx = (cx - doc.width / 2.0) / max(doc.width, 1.0)
    dy = (cy - doc.height / 2.0) / max(doc.height, 1.0)
    d = math.sqrt(dx * dx + dy * dy)
    return max(0.3, 1.0 - d)
