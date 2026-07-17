# Choosing the Right Preset

## Contents

- [Preset Selection Workflow](#preset-selection-workflow) — 5-step process: read code, identify gaps, ask questions, map tags, recommend (~line 8)
- [Clarifying Questions](#clarifying-questions) — Q1–Q8 question bank; use only the gaps that cannot be inferred from code (~line 30)
- [Tag Selection Guide](#tag-selection-guide) — Translate context into Intensity / Texture / Shape / Duration tags (~line 106)
- [Response Format Rules](#response-format-rules) — How to present recommendations in code and chat (~line 164)
- [All Presets](preset-catalog.md#all-presets) — Full alphabetical table: 150+ presets with tags and descriptions
- [Preset Tags](preset-catalog.md#preset-tags) — Tag definitions for all four dimensions

---

## Preset Selection Workflow

When a user asks which preset to use, follow this sequence before writing any code or making a recommendation.

**Step 1 — Read the user's code first.**
Before asking anything, read the file(s) where the haptic will be added. Extract what can be inferred automatically:
- The function/callback name (e.g., `onPaymentSuccess`, `onDeletePress`, `onError`) → event type and emotional register
- The surrounding UI component (button, list item, modal, background task) → interaction type
- App domain from imports/component names (e.g., game → `impact()`/`flurry()`, health → `breath()`/`heartbeat()`) → intensity
- Whether the call site is user-triggered (inside a press handler) or system-triggered (inside a `useEffect`, callback, or background task) → duration and shape
- Any existing visual or audio feedback nearby → whether to go subtler on intensity

**Step 2 — List what is still unknown.**
After reading the code, identify only the gaps that cannot be inferred. These gaps — and only these — become clarifying questions.

**Step 3 — Ask only for the gaps (1–2 questions max).**
Use the Clarifying Questions section below to pick the most discriminating questions for the remaining unknowns. Never ask more than 2–3 at once — it should feel like a focused follow-up, not a form.

**Step 4 — Map context → tags → shortlist → primary preset.**
Translate all gathered context into one value per tag dimension (see Tag Selection Guide below). Scan the preset tables in this file for entries whose tags match. Pick the single best-fit preset as the primary recommendation for the code.

**Step 5 — Note alternatives.**
From the remaining shortlist, identify 2–3 runner-up presets to mention in the chat response. For each, write one sentence explaining when it would be a better choice.

---

## Clarifying Questions

The full question bank. After reading the code, ask only the questions whose answers cannot be inferred from it. Pick 1–2 that cover the most remaining unknowns.

**Q1 — What category of event is this?**
- User action on a UI element (button, toggle, drawer)
- Confirmation or completion of an operation
- Error, rejection, or blocked action
- Notification or alert arriving from outside
- Warning or building tension state
- Achievement, reward, or celebration
- Ambient / ongoing background state
- Game or physical metaphor
- Keyboard / typing simulation
- Selection or scrolling (scroll picker tick, pull-to-refresh, scroll-to-edge)
- Drag and drop (snap-to-target, drop placement, list reorder)
- Navigation or screen transition (push, pop, modal present/dismiss, tab switch)
- Media playback (play/pause, scrubbing, chapter marker)
- Authentication or biometric event (Face ID, Touch ID, access denied)
- Onboarding or tutorial guidance (first-time action, guided step spotlight)

*Maps to: which preset category table to use*

**Q2 — Who triggered the event — the user or the system?**
- User-initiated (tap, swipe, submit) → tends toward Impulse/Short duration, Peak/Impulses shape
- System-initiated (notification, background task finished) → tends toward Bumps/Pattern shape, Long/Extended duration

*Maps to: Shape + Duration. Skip if call site is inside a press handler (user) or `useEffect`/callback (system).*

**Q3 — What is the emotional register?**
- Positive / completion (task done, save confirmed, dialog accepted, payment received)
- Positive / celebratory (milestone, streak, rank-up, achievement unlocked, reward)
- Negative / warning (expiring trial, approaching deadline, soft validation error, caution state)
- Negative / error or rejection (blocked action, access denied, critical failure, destructive/irreversible)
- Neutral (informational, status update, ambient indicator)

*Maps to: Shape and Intensity — use the full five-way split to avoid collapsing "success confirmation" and "milestone celebration" into the same preset family, or conflating a soft caution with a hard rejection. Positive/completion → Substantial + Short; positive/celebratory → Bold + Extended; warning → Substantial + escalating shape; error/rejection → Bold + Rigid + Saw.*

**Q4 — How urgent or critical is it?**
- Non-intrusive / can be missed (background task completed quietly)
- Moderate / should be noticed (standard notification)
- Critical / must not be missed (emergency, access denied)

*Maps to: Intensity — non-intrusive → Gentle, moderate → Substantial, critical → Bold*

**Q5 — Is the action reversible or destructive/irreversible?**
- Reversible (most actions)
- Irreversible or high-stakes (delete, remove, cannot undo) → strong signal for `cleave()`

*Direct preset signal — irreversible destructive actions almost always use `cleave()`*

**Q6 — Is this a one-shot event or an ongoing/looping state?**
- Single moment (tap, confirm, error) → Impulse/Short/Long
- Ongoing state (scanning, loading, breathing exercise, background activity) → Long/Extended with Pattern/Bumps/Solid shape

*Maps to: Duration + Shape. Skip if already answered by Q2.*

**Q7 — What specific UI element or context is involved?**
- Primary CTA button vs. secondary button vs. ghost/outline button
- Toggle / switch vs. list item selection
- Small icon button, chip, tag, or filter
- Menu / drawer opening vs. closing
- Form submission vs. dialog confirmation
- Photo capture, incoming call, personal message vs. generic notification

*Maps to: specific preset recommendations within a category*

**Q8 — What is the physical or emotional quality of this interaction?**
- Warm, organic, personal — wellness, breathing, calming, social connection → `Soft`
- Mechanical, precise, system-like — keyboard input, camera shutter, dial clicks, combination lock, data-entry ticks, sharp system confirmations → `Rigid`
- General-purpose / neither extreme → `Flexible`

*Maps to: Texture tag. Ask only when the code or app domain doesn't make this clear. Skip if the app clearly signals the answer (explicit wellness context → Soft; clearly mechanical or precision UI → Rigid). This is the most commonly missed dimension — Texture is the only tag that cannot be inferred from urgency or timing alone.*

---

## Tag Selection Guide

Use this to translate the gathered context into one candidate value per tag dimension. Choose independently per dimension — don't let one dimension influence another.

### Intensity — How weighty is this moment?

| Context | Tag |
|---|---|
| Background task, ambient indicator, ghost/outline button | `Gentle` |
| Standard UI tap, non-urgent notification, informational confirmation, toggle | `Substantial` |
| Critical error, major achievement, irreversible action, urgent alert, primary high-stakes CTA | `Bold` |

Default: `Substantial`. Reserve `Bold` for moments that must capture attention; `Gentle` for moments that should not register consciously.

### Texture — What is the physical quality of this interaction?

| Context | Tag |
|---|---|
| Wellness, breathing, calm, ambient | `Soft` |
| Most UI interactions, social moments, notifications, standard app events | `Flexible` |
| Precision input (list selection, keyboard, camera shutter, data entry); sharp rejection; mechanical/system-like event | `Rigid` |

Default: `Flexible`. Decision rule:
- Use `Soft` if the surrounding design is warm, rounded, or personal — wellness apps, intimate social moments, or any context where the word "gentle" fits naturally.
- Use `Rigid` if the interaction has a mechanical analogy or demands precision — keyboards, camera shutters, dial clicks, combination locks, data-entry scroll ticks, or system-level confirmations where crispness matters.
- Use `Flexible` for everything else: general UI taps, standard notifications, social feeds, navigation, and any context where neither extreme applies.

### Shape — What is the interaction's arc?

| Context | Tag |
|---|---|
| Single button tap, item selection, instant confirmation | `Peak` |
| Action building toward a climax, ramping energy | `Ramp` |
| Error, rejection, alarm, blocked action | `Saw` |
| Precise discrete tap(s), toggle snap, keyboard key | `Impulses` |
| Notification, social signal, gentle attention request | `Bumps` |
| Structured rhythm, scanning, polling, heartbeat | `Pattern` |
| Continuous dragging, drawer closing | `Solid` |

Default for user-initiated: `Peak`. Default for system-initiated: `Bumps`.

**Peak vs. Impulses for confirmations:** Both appear in single-tap confirmation contexts. Choose `Peak` when the feel should be smooth and warm — a single arc settling like a gentle press. Choose `Impulses` when it should feel crisp and definitive — one or more sharp transients, like a mechanical click or snap locking in. Most confirmation presets (`stamp`, `ping`, `chip`, `lock`) use `Impulses`; softer organic confirmations (`strike`, `thud`) use `Peak`.

**Bumps vs. Pattern for notifications and ongoing states:** `Bumps` = loosely-spaced rounded pulses, fired once to grab attention (notifications, social signals, reminders). `Pattern` = strict repeating cadence at metronomic intervals (active scanning, polling loops, heartbeat monitoring). Rule of thumb: triggered once to announce → `Bumps`; repeats at a fixed rhythm → `Pattern`.

### Duration — How long should the user feel this?

| Context | Tag |
|---|---|
| Instant tap, single keypress, discrete selection | `Impulse` |
| Quick confirmation, minor error, toggle flip | `Short` |
| Noticeable feedback, menu open, achievement reward | `Long` |
| Sequence of events, celebration, alarm, incoming call, ambient loop | `Extended` |

Default: `Short` for most standard confirmations and notifications. Avoid `Extended` for anything triggered by a single tap — it will feel slow and unresponsive.

---

## Response Format Rules

**In code:** Use exactly one preset. No conditionals, no multiple options in a single block. The code example must be immediately ready to paste.

**In chat text:** After the code block, mention 2–3 alternative presets. For each, write one sentence: "`alternateName()` — better if [specific condition], because [brief reason]."

**When context is ambiguous:** Do not guess and show code. Ask 1–2 clarifying questions first, wait for the response, then recommend.

**Never surface the tag-matching logic.** The four-tag narrowing process is internal. Users see a confident recommendation with brief reasoning — not intermediate filtering steps.

**When no preset fits well:** If the tag mapping narrows to a shortlist but none of the preset descriptions match the use case — or the use case requires precise timing, rhythm, or sustained texture that named presets can't provide — ask before guessing:

> "No existing preset captures this exactly. Would you like me to build a custom pattern using `PatternComposer`? I can design a discrete tap sequence, a continuous amplitude/frequency envelope, or both layered together to match your specific timing and feel."

If the user confirms, design the pattern using the parameter guidance from the design principles file:
- Amplitude `0.0–0.3` for subtle/background, `0.4–0.7` for standard interactions, `0.8–1.0` for critical moments
- Frequency `0.0–0.3` for round/soft/low-pitched, `0.4–0.6` for neutral, `0.7–1.0` for crisp/mechanical
- Use `discretePattern` events for individual taps; use `continuousPattern` for sustained vibrations with evolving envelopes
- Both layers can be combined: crisp discrete taps over a sustained background rumble

Reference the platform API file for `PatternComposer` syntax.

Example of a correctly formatted response:

> For a payment confirmation, `stamp()` is the right choice — calm and decisive without drama.
>
> ```ts
> Presets.stamp();
> ```
>
> Alternatives worth considering:
> - `strike()` — better if this is the main call-to-action button itself rather than the completion screen, because it feels more action-initiating than receipt-like.
> - `lock()` — better if the payment also secures a subscription or credential, because it carries a satisfying "locked in" quality.

---
