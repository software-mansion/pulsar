# Gesture-Based Haptics

Gesture-driven haptics are fundamentally different from event-based ones. Instead of firing a preset at a discrete moment, you drive haptic parameters in real time — continuously updated as the gesture moves. Use the **RealtimeComposer** for this, not PatternComposer.

---

## Core Design Principle: Physical Coupling

The haptic must feel like it is caused by the gesture, not triggered by it. That means:
- Parameters update on every gesture callback, not on gesture start/end only.
- The haptic amplitude should visibly track the gesture's speed or pressure.
- If the gesture pauses, the haptic quiets. If it accelerates, the haptic intensifies.

A haptic that fires once at gesture start and stays constant until release feels like a notification, not a physical interaction.

---

## Mapping Gesture Values to Haptic Parameters

Two common mappings:

**Velocity → Amplitude** — used for swipes, drags, and scrolls where force matters:
```
amplitude = clamp(velocity / maxExpectedVelocity, 0.0, 1.0)
```
Apply a square-root or logarithmic curve if the linear mapping feels too twitchy at low speeds.

**Position → Frequency** — used when dragging toward a boundary or snapping zone:
- Frequency rises as the drag approaches its limit, signalling increasing resistance.
- Snap to 0.7–1.0 frequency as the drag hits a hard boundary.
- Return to baseline frequency (0.3–0.5) as the drag moves freely in open space.

---

## Gesture Phases and When to Fire

| Phase | Haptic action |
|---|---|
| **Began** | Start the RealtimeComposer; do NOT fire a discrete event yet — nothing has happened |
| **Changed** | Update amplitude and frequency continuously from gesture values |
| **Snap point hit** | Fire a discrete impulse (`ping`, `chip`, `snap`) layered on top of the continuous signal |
| **Boundary reached** | Spike amplitude to 0.8–1.0 briefly, then return to the continuous level |
| **Ended — settled** | Fire a single landing event (`stamp`, `lock`, `snap`) and stop the composer |
| **Ended — cancelled** | Fire nothing or a very soft fade; stop the composer |
| **Ended — released mid-drag** | Fire a release event sized to the release velocity |

---

## Snap Points

A snap point should feel like clicking into place — a brief, crisp discrete event layered on top of whatever continuous haptic is running:
- **Preset**: `ping()`, `chip()`, `snap()`, or `peck()` — Rigid texture, Impulse duration
- **Amplitude**: 0.5–0.7 (clear but not startling)
- **Timing**: fire exactly when the UI element snaps — within the 45–75 ms sync window

For a scroll that ticks through items (date pickers, slot machines, segment controls), fire the same discrete event on each tick. The preset should be Rigid + Impulse and light enough not to fatigue — `ping()` or `chip()`, not `stamp()`.

---

## Resistance and Boundary Haptics

When a drag approaches a spring boundary, a rubberband edge, or a pull-to-refresh threshold:
- Gradually increase amplitude as the drag nears the limit: 0.3 (free drag) → 0.7 (near limit) → 0.9 (at limit).
- Increase frequency to signal stiffness: 0.3 (free) → 0.7 (near limit).
- At the hard boundary, fire a brief spike then let amplitude fall — this mimics a physical stop.
- If the user pulls past the threshold (e.g. pull-to-refresh trigger), fire a distinct discrete event (`stamp()`, `lock()`) to confirm the threshold was crossed.

---

## Common Patterns

| Gesture | Continuous signal | Discrete events |
|---|---|---|
| Drag-and-drop (free area) | Low amplitude (0.2), neutral frequency (0.4) | Snap on drop target enter, `stamp()` on release |
| Drag hitting rubber-band edge | Rising amplitude + frequency as drag extends | Spike at max extension |
| Scroll ticker (date picker) | None needed | `ping()` or `chip()` on each tick position |
| Swipe-to-delete | Rising amplitude as swipe extends past threshold | `cleave()` on delete confirmation |
| Pull-to-refresh | None during pull; slight rumble (0.2 amp) above threshold | `lock()` or `stamp()` at release-to-refresh |
| Pinch-to-zoom | Low amplitude (0.15–0.25), velocity-mapped | None unless crossing a zoom boundary |
| Slider knob | Low amplitude (0.1–0.2) continuous; or none | `ping()` at each notch/step |

---

## Throttling and Performance

RealtimeComposer parameters are updated via gesture callbacks. On most devices, 60 Hz updates are safe. Avoid:
- Updating on every frame with expensive calculations — pre-compute parameter curves where possible.
- Creating new composer instances per gesture event — create once when the gesture starts, update on move events, stop when the gesture ends.
- Forgetting to stop the composer — a running RealtimeComposer with no gesture attached drains battery and can interfere with other haptics.
