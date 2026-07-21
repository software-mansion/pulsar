# Preset Selection

Use this process when choosing a named preset. Do not load the full preset dataset; query it with `scripts/find_presets.py`.

## 1. Read Context

Infer these facts from code and the request:

- event: confirmation, warning, rejection, notification, achievement, ambient state, game impact, selection, or gesture
- initiator: user or system
- stakes: routine, notable, critical, or irreversible
- timing: one-shot, repeated, or sustained
- physical character: soft/organic, neutral, or crisp/mechanical

## 2. Map Four Tags

Choose one value from each axis:

| Axis | Values | Selection rule |
|---|---|---|
| Intensity | `Gentle`, `Substantial`, `Bold` | Background/subtle, normal UI, or critical/high-impact. |
| Texture | `Soft`, `Flexible`, `Rigid` | Organic/calm, neutral, or crisp/mechanical. |
| Shape | `Peak`, `Ramp`, `Saw`, `Impulses`, `Bumps`, `Pattern`, `Solid` | Single arc, build/fade, rejection edge, taps, notification pulses, rhythm, or sustained signal. |
| Duration | `Impulse`, `Short`, `Extended`, `Long` | Instant, brief, expressive sequence, or prolonged effect. |

Useful defaults:

- routine confirmation: `Substantial` + `Flexible` + `Impulses` + `Short`
- precise selection: `Gentle` or `Substantial` + `Rigid` + `Impulses` + `Impulse`
- major achievement: `Bold` + `Flexible` or `Rigid` + `Peak` or `Ramp` + `Extended` or `Long`
- hard rejection: `Bold` + `Rigid` + `Saw` or `Impulses` + `Short`
- calm/wellness: `Gentle` or `Substantial` + `Soft`

Do not recommend a long loop merely because an ambient preset exists. Apply `SKILL.md` safety rules first.

## 3. Query Candidates

Run the narrowest useful query from the skill root:

```bash
python3 scripts/find_presets.py --intensity Substantial --texture Rigid --shape Impulses --duration Impulse
```

Use `--query`, `--name`, or fewer tags when exact filtering returns no candidates. Never invent preset names.

## 4. Validate the Match

Confirm the returned preset description and duration fit the event, not only the requested tags. Reject candidates whose documented meaning conflicts with the interaction. Never invent a preset name.
