# Haptics Design Principles

## Design Pattern Rules

**1. One action, one haptic.** Play haptics only at the moment something meaningful happens — when a state changes, not while the user is still deciding. A button should fire haptics on press/release, not on hover.

**2. Match physical metaphor.** The haptic should feel like what the interaction represents. Locking something → `lock()`. Deleting something irreversible → `cleave()`. An achievement → `fanfare()` or `flourish()`. Mismatched haptics erode trust.

**3. Scale intensity to stakes.** Low-stakes actions (nudges, notifications) get soft, unobtrusive presets. High-stakes actions (critical errors, confirmations, achievements) get forceful, unmistakable ones. Reserve maximum-intensity presets like `jolt()` or `clamor()` for truly critical moments.

**4. Avoid redundancy with visual feedback.** Haptics reinforce UI changes — they don't replace them. Always pair haptics with a visible state change. Never rely on haptics alone to communicate information.

**5. Respect the emotional arc.** Apps have an emotional flow. Use ascending presets (`ascent()`, `ramp()`, `crescendo()`) when building up, and descending or fading ones (`fadeOut()`, `wane()`, `dissolve()`) when winding down. Jarring haptics break immersion.

**6. Consistency across the app.** Choose a small set of presets for your core interaction vocabulary and use them consistently. If `ping()` is your selection confirmation, use it everywhere a selection is confirmed.

**7. Test on hardware.** Simulators and emulators do not reproduce haptic feel. Pulsar provides audio simulation for iteration, but always validate final choices on a physical device. On Android, test on multiple devices — a preset that feels great on a Pixel may feel very different on a mid-range device from another manufacturer.

## When to Use Haptics

Haptics are valuable when they add information or emotional texture that visuals alone cannot:

- **State changes that matter:** Toggle on/off, lock/unlock, item selected, task completed.
- **User-initiated actions:** Button taps, swipe gestures, drag-and-drop, scrolling past a boundary.
- **System feedback:** Success, failure, warning — especially when users need eyes-free confirmation.
- **Rhythm and timing:** Metronomes, breathing exercises, countdowns — where timing is the content.
- **Emotional moments:** Achievements, level-ups, celebrations, unlocks, coin rewards.
- **Physical metaphors in games:** Collisions, weapon fire, engine revs, explosions.
- **Snap points and boundaries:** When dragging hits a grid, when a scroll reaches its limit.

## When to Avoid Haptics

- **Passive content consumption:** Reading text, watching video, scrolling a news feed — haptics interrupt flow.
- **Too frequently:** If every interaction vibrates, users become numb to all of them. Save intensity for meaningful moments.
- **Repeated loops without user control:** Looping a haptic for more than a few seconds (like during a loading spinner or background sync) is fatiguing and annoying. Critically, users habituate to repeated patterns within seconds — the nervous system suppresses constant stimuli, so the signal value collapses almost immediately. Prefer firing a single cue at the start and another at the end of a long operation, rather than looping throughout. If you must signal ongoing activity, fire at a sparse interval (every 4–6 seconds) rather than continuously.
- **On every keypress in a text field:** Unless building a deliberate keyboard simulation, keyboard input should not vibrate on every character.
- **Low-information events:** Hovering, focus rings, minor layout changes — things the user doesn't need confirmation for.
- **When the user has disabled haptics:** Always check the device's haptic support level and respect the system haptics toggle. Never hardcode assumptions about capability.
- **Accessibility contexts:** Be aware that some users are sensitive to unexpected vibrations. Offer a setting to disable. See the expanded guidance below.
- **As a manipulation tool (dark haptics):** Do not use alarming or urgent haptic intensities to pressure users into decisions they are trying to opt out of — for example, firing an error-class haptic when a user dismisses a paywall, or using a distressing vibration on a consent dialog to coerce agreement. This is a dark pattern. Haptics should confirm what the user just did, not engineer an emotional response that overrides their intent. Misuse can trigger App Store review and permanently erodes user trust.

## Accessibility

Haptics are a progressively enhanced layer — the experience must remain fully usable without them.

**Controls to provide:**
- **On/Off toggle** — mandatory. Some users have conditions that make vibrations painful or meaningless (sensory processing disorders, chronic pain, fibromyalgia).
- **Intensity slider** (Off / Normal / Strong) — recommended for health, elder-care, or accessibility-focused apps. A binary toggle is the minimum; a spectrum is better.
- Never use haptics as the sole channel for critical information — always pair with a visual or audio cue.

**Age-related sensitivity decline:**
Vibrotactile sensitivity decreases measurably with age. Users 65+ may not perceive `Gentle`-tagged presets at all. For apps targeting older adults:
- Default to `Substantial` intensity presets rather than `Gentle`.
- For custom patterns, raise baseline amplitude to the 0.6–0.8 range.
- Use longer-duration patterns rather than brief impulses — longer contact time is easier to perceive.
- Test on actual hardware with age-representative participants, not lab settings with young testers.

**Sensory and medical considerations:**
- Users with sensory processing disorders (SPD) can find unexpected vibrations genuinely painful, not merely annoying. Avoid surprise haptics.
- Peripheral neuropathy (common in diabetes and from some medications) can make tactile perception unreliable. Never rely on haptics alone for health-critical alerts.
- Prosthetic limb users may not perceive device haptics at all if the device is held differently.
- Tremors (essential tremor affects ~15% of adults over 80) can make short, rapid pulses indistinguishable from involuntary movement. Prefer rhythmically distinctive, longer patterns.

**Haptic memory and vocabulary:**
Users can reliably recognize only a small number of distinct haptic patterns without training — research suggests ~10 as an upper bound, but in practice 3–5 is more realistic for casual app use. Haptic memory also fades faster than visual or auditory memory: users recognize patterns they encounter frequently, but will not recall patterns they've seen only once. Design for recognition, not recall — keep your app's haptic vocabulary to the patterns users will encounter often enough to internalize.

---

## Haptics and Emotions

Haptic patterns convey emotional meaning. Use this intentionally:

| Emotional register | Character | Suggested presets |
|---|---|---|
| **Joy / celebration** | Energetic, bright, expansive | `fanfare`, `flourish`, `triumph`, `trumpet`, `fizz`, `surge`, `ramp` |
| **Success / completion** | Warm, definitive, satisfying | `bloom`, `dewdrop`, `stamp`, `lock`, `strike`, `snap` |
| **Warning / caution** | Insistent, escalating, firm | `peal`, `rustle`, `swell`, `throb`, `knell`, `hammer` |
| **Error / rejection** | Abrupt, hard, dissonant | `buzz`, `jolt`, `batter`, `pummel`, `alarm`, `clamor` |
| **Sadness / loss** | Heavy, fading, slow | `dirge`, `lament`, `wane`, `plummet`, `knell` |
| **Suspense / tension** | Building, tight, anticipatory | `buildup`, `charge`, `coil`, `crescendo`, `balloonPop` |
| **Calm / ambient** | Gentle, rhythmic, unobtrusive | `breath`, `pulse`, `wave`, `murmur`, `feather`, `wisp` |
| **Surprise / shock** | Sudden, intense, jarring | `flare`, `flinch`, `shockwave`, `jolt`, `explosion` |
| **Playful / whimsical** | Light, fun, bouncy | `chirp`, `fizz`, `coinDrop`, `pip`, `lope`, `unfurl` |

> **Note on variability:** These mappings reflect widely shared design conventions and cross-cultural associations, not universal laws. Individual responses to the same haptic pattern can vary by 30–40%. Treat this table as a useful starting vocabulary, not a guarantee of emotional outcome. For apps serving diverse or international audiences, consider offering an "expressive" vs. "subtle" haptic mode rather than a fixed mapping.

---

## Custom Pattern Parameters

When designing custom haptic patterns, two parameters control the character of each event: **amplitude** (intensity) and **frequency** (sharpness/texture). Both are normalized 0–1 across all platforms.

### Amplitude

Amplitude controls how strong the haptic feels — the physical force of the vibration.

| Range | Feel | When to use |
|---|---|---|
| **0.0–0.3** | Subtle, background | Ambient feedback, breathing rhythms, idle states, secondary confirmations |
| **0.4–0.7** | Moderate, clearly present | Standard interactions: button taps, selections, transitions, slider snaps |
| **0.8–1.0** | Strong, unmistakable | Critical moments: achievements, errors, confirmations, physical impacts |

### Frequency

Frequency controls the texture of the haptic — how round or crisp it feels. On iOS this maps to CoreHaptics sharpness; on Android it selects between primitive types or drives the envelope frequency curve.

| Range | Feel | When to use |
|---|---|---|
| **0.0–0.3** | Round, soft, low-pitched | Gentle notifications, calm states, soft landings, organic sensations |
| **0.4–0.6** | Neutral, balanced | General-purpose taps, medium-intensity feedback |
| **0.7–1.0** | Sharp, crisp, high-pitched | Hard clicks, precise selections, mechanical feedback, impacts |

### Combining Amplitude and Frequency

The two parameters are independent and combine to produce four distinct quadrants of feel:

| Amplitude | Frequency | Character | Example use case |
|---|---|---|---|
| High | High | Intense + crisp | Collision, error rejection, lock click |
| High | Low | Intense + round | Explosion, heavy thud, bass impact |
| Low | High | Subtle + crisp | Soft tick, light keyboard tap, notification ping |
| Low | Low | Subtle + round | Background pulse, breathing rhythm, ambient rumble |

### Discrete vs. Continuous

A custom pattern has two independent layers:

- **`discretePattern`** — Individual transient events (taps, clicks, impacts) at precise timestamps. Each event has its own amplitude and frequency. Use for anything that should feel like a tap or click.
- **`continuousPattern`** — A sustained vibration whose amplitude and frequency evolve over time via envelope curves. Use for rumble, breathing rhythms, sustained pulses, and anything that should feel like ongoing vibration.

Combine both layers to produce complex feels — crisp discrete taps layered over a sustained background rumble. If either layer is empty, only the other plays.

### Timing and perception thresholds

These psychophysical benchmarks guide custom pattern design:

| Parameter | Value | Implication |
|---|---|---|
| **Haptic + visual sync window** | 45–75 ms | Haptic and its visual counterpart must arrive within this window to feel simultaneous. Anything beyond 100 ms feels disconnected — like a dubbed film. |
| **Optimal discrete event duration** | 10–20 ms | The vibration itself; the actuator rings out for an additional 20–50 ms. Design pattern gaps accordingly. |
| **Minimum gap between primitives** | 50 ms | Two events closer than 50 ms blur into one sensation. Use ≥50 ms gaps for distinct, separable beats. |
| **Perceptibly distinct amplitude step** | ≥ 1.4× ratio | Amplitude must differ by at least 40% to feel noticeably different to most users. Small tweaks (e.g. 0.5 → 0.6) are imperceptible in practice. |

---

## Gesture-Based Haptics

Gesture-driven haptics require a different approach from event-based haptics — you drive amplitude and frequency in real time as the gesture evolves, using **RealtimeComposer** rather than PatternComposer.

For full design guidance, parameter mapping, phase tables, common patterns (drag-and-drop, snap points, pull-to-refresh, swipe-to-delete), and platform-specific implementation notes, see [Gesture-Based Haptics](gesture-haptics.md).

---

## Platform-Specific Notes

### iOS: Background / foreground lifecycle

Pulsar automatically stops the haptic engine when the app enters the background and restarts it when the app returns to the foreground. You do not need to manage this yourself.

### iOS: Audio simulation on the Simulator

The iOS Simulator has no haptic hardware. Pulsar generates audio from haptic pattern parameters instead, enabled by default in debug builds. Disable it if you prefer silence:

```swift
pulsar.enableSound(state: false)
```

### Android: Audio simulation on the Emulator

The Android Emulator has no haptic hardware. Like iOS, Pulsar generates audio from haptic parameters in debug builds so you can hear the shape of presets and custom patterns while iterating. Disable it if you prefer silence:

```kotlin
pulsar.enableSound(false)
```

Audio simulation does not replace testing on physical hardware — actuator quality varies significantly across real Android devices.

---

## Limitations

### Hardware fragmentation

Android devices span a vast range of haptic actuator quality. Budget and mid-range devices typically have simple ERM motors with no amplitude or frequency fidelity. Premium devices (Pixel series, recent Samsung flagships) include LRA actuators capable of nuanced control.

Design for iOS first, then verify on at least one mid-range Android device. Accept that some subtle presets will feel weaker or less differentiated — it is a hardware constraint, not a Pulsar limitation.

### Android system API limitations and inconsistency

Android's haptic API has evolved significantly across OS versions, creating a fragmented landscape:

- **API 26 (Android 8.0):** `VibrationEffect` introduced amplitude control. Devices below this API level receive only binary on/off vibration.
- **API 31 (Android 12):** `VibrationEffect.Composition` and `PRIMITIVE_*` constants introduced fine-grained waveform composition. This is the minimum API level needed for expressive multi-step haptic patterns.

Even on devices that report API support, behavior varies widely between manufacturers:

- **OEM overrides:** Samsung, Xiaomi, and other OEMs often intercept haptic calls and remap them through proprietary engines. The same `VibrationEffect` can produce noticeably different results across manufacturers even on the same Android version.
- **`hasAmplitudeControl()` is unreliable:** Some devices return `true` but silently clamp or ignore amplitude values. Others return `false` yet partially respect amplitude. Pulsar normalizes around this, but output fidelity cannot be guaranteed.
- **`HapticFeedbackConstants` inconsistency:** System-level constants like `KEYBOARD_TAP` or `LONG_PRESS` are mapped differently per OEM. Avoid relying on these constants directly — use Pulsar presets instead, which abstract over the inconsistencies.
- **Composition primitives availability:** Even on API 31+, not all `PRIMITIVE_*` constants are supported on every device. Pulsar falls back gracefully, but complex compositions may be silently simplified on unsupported hardware.

When targeting Android, treat haptics as progressively enhanced: the experience should still be usable without haptic feedback, and improvements in fidelity should be treated as additive rather than required.

