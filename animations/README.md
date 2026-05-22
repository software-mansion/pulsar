# pulsar-lottie

Auto-generate Pulsar haptic patterns from Lottie animations. Zero configuration.

```bash
pip install -e .
pulsar-lottie tests/fixtures/bounce.json -o bounce.pulsar.json
pulsar-lottie tests/fixtures/fade.json --dry-run
cat bounce.pulsar.json
```

## How it works

The tool runs a six-stage offline analysis on the Lottie JSON:

1. **parser** — Walks the Lottie schema, extracting animated `position`, `scale`,
   `rotation`, `opacity` and shape `trim path` properties (with bezier tangents)
   from every layer. JS-expression properties are skipped with a warning.
2. **sampler** — Resamples every animated property to a fixed 120 Hz timeline,
   evaluating Lottie's cubic-bezier easing between keyframes.
3. **features** — Computes velocity / acceleration / jerk per track via
   `np.gradient`, weights each layer by `(size × opacity × center proximity)`,
   and aggregates to two global signals: `energy(t)` and `transient_score(t)`.
4. **events** — Uses `scipy.signal.find_peaks` on the transient score (≥15% of
   max, ≥60 ms apart) and finds energy windows above 20% of max lasting
   >100 ms. Adds extra transients for ease-out keyframe "landings". Caps
   density at 12 events/second.
5. **mapper** — Converts events to primitives, min-max normalizing intensity
   and sharpness across the animation so every output uses the full 0–1 range.
6. **emitter** — Serializes the `1.0` pattern schema.

## Output schema

```json
{
  "version": "1.0",
  "source": {"framerate": 60, "duration_ms": 2000},
  "events": [
    {"type": "transient", "time_ms": 500, "intensity": 0.82, "sharpness": 0.65},
    {"type": "continuous", "time_ms": 0, "duration_ms": 1000,
     "intensity_envelope": [[0, 0.3], [500, 0.9], [1000, 0.1]],
     "sharpness": 0.4}
  ]
}
```

## CLI

```
pulsar-lottie INPUT [-o OUTPUT] [--dry-run] [--verbose]
```

- `-o, --output PATH`  Write the pattern to a file (stdout if omitted).
- `--dry-run`          Print stats only; do not write output.
- `--verbose`          Log parsing / extraction info to stderr.

## Playground app

`example/` is an Expo app that pairs each Lottie with its generated pattern
and plays them in sync via [`react-native-pulsar`][rnp]. See
[`example/README.md`](example/README.md) for setup. The `generate-patterns`
script there runs this CLI over `example/assets/animations/` and emits one
TypeScript module per animation plus a manifest, so the app stays static at
build time.

[rnp]: https://www.npmjs.com/package/react-native-pulsar

## Development

```bash
pip install -e ".[dev]"
pytest
```
