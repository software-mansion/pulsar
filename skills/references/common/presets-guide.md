# Choosing the Right Preset

## Contents

- [Preset Selection Workflow](#preset-selection-workflow) — 5-step process: read code, identify gaps, ask questions, map tags, recommend (~line 8)
- [Clarifying Questions](#clarifying-questions) — Q1–Q8 question bank; use only the gaps that cannot be inferred from code (~line 30)
- [Tag Selection Guide](#tag-selection-guide) — Translate context into Intensity / Texture / Shape / Duration tags (~line 106)
- [Response Format Rules](#response-format-rules) — How to present recommendations in code and chat (~line 164)
- [All Presets](#all-presets) — Full alphabetical table: 150+ presets with tags and descriptions (~line 205)
- [Preset Tags](#preset-tags) — Tag definitions for all four dimensions (~line 362)

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

Reference the platform api-overview for `PatternComposer` syntax.

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

## All Presets

| Preset | Tags | Description |
|---|---|---|
| `afterglow()` | `Bold` `Soft` `Impulses` `Short` | A three-beat phrase that dissolves gently, ideal for soft endings or gradually quieting feedback. |
| `aftershock()` | `Substantial` `Flexible` `Impulses` `Extended` | A firm opening that settles calmly, ideal for transitions needing a strong start and a gentle finish. |
| `alarm()` | `Bold` `Rigid` `Pattern` `Extended` | Relentless and urgent, best for critical errors or emergencies that require immediate attention. |
| `anvil()` | `Bold` `Soft` `Ramp` `Extended` | The full weight of a massive collision, conveys sheer physical force and momentum. |
| `applause()` | `Substantial` `Flexible` `Solid` `Long` | A growing wave of appreciation, ideal for celebratory moments or social approval. |
| `ascent()` | `Bold` `Flexible` `Pattern` `Long` | The rush of leveling up, evoking the classic RPG reward of growth and progression. |
| `balloonPop()` | `Substantial` `Flexible` `Bumps` `Long` | Mounting suspense that bursts into release, perfect for countdowns or suspenseful reveals. |
| `barrage()` | `Bold` `Rigid` `Impulses` `Extended` | An overwhelming storm of rapid impacts, suited for maxing out a meter or total sensory overload moments. |
| `bassDrop()` | `Bold` `Soft` `Impulses` `Impulse` | Two grounded thumps with a tonal descent, suited for distinct double-confirmation feedback. |
| `batter()` | `Bold` `Flexible` `Saw` `Extended` | An unrestrained explosion of rage, suited for catastrophic errors or total loss of control. |
| `bellToll()` | `Bold` `Flexible` `Impulses` `Extended` | Three notes that soften as they land, suited for closing interactions or softening after a strong start. |
| `blip()` | `Gentle` `Flexible` `Peak` `Short` | A composed, subtle heads-up, ideal for non-critical warnings that should not interrupt the user. |
| `bloom()` | `Gentle` `Flexible` `Bumps` `Extended` | A quiet confirmation of completion, ideal for subtle task completions or non-intrusive positive reinforcement. |
| `bongo()` | `Substantial` `Flexible` `Impulses` `Extended` | Two balanced bursts of three, suited for structured multi-step or paired sequence feedback. |
| `boulder()` | `Bold` `Soft` `Impulses` `Impulse` | Deep and weighty without sharpness, great for heavy object impacts or grounded confirmation feedback. |
| `breakingWave()` | `Substantial` `Flexible` `Impulses` `Short` | Two measured steps leading into a stronger landing, ideal for escalating confirmations or staged actions. |
| `breath()` | `Substantial` `Soft` `Bumps` `Long` | Slow, calming in-and-out rhythm, ideal for breathing exercises. |
| `buildup()` | `Bold` `Flexible` `Impulses` `Extended` | An energizing crescendo of rising intensity, ideal for charging actions or building anticipation. |
| `burst()` | `Bold` `Flexible` `Peak` `Extended` | The tension-and-release of a sneeze, imitates the involuntary build and explosion. |
| `buzz()` | `Bold` `Rigid` `Ramp` `Extended` | An unmistakable hard rejection, suited for critical errors, access denied, or blocked actions. |
| `cadence()` | `Bold` `Rigid` `Impulses` `Short` | A natural two-beat rhythm with a subtle textural shift, suitable for double-tap confirmations. |
| `cameraShutter()` | `Substantial` `Rigid` `Impulses` `Short` | The satisfying click of capturing a moment, ideal for photo capture or scan confirmation. |
| `canter()` | `Bold` `Soft` `Impulses` `Short` | A three-beat rhythm with natural variation, suited for multi-step feedback where each step has character. |
| `cascade()` | `Substantial` `Flexible` `Impulses` `Long` | A long sequence that unwinds from intensity to calm, ideal for complex multi-phase transitions or step-by-step completions. |
| `castanets()` | `Bold` `Rigid` `Impulses` `Short` | A crisp, decisive pair of sharp taps, ideal for double-confirmation or back-to-back interaction feedback. |
| `catPaw()` | `Substantial` `Soft` `Impulses` `Impulse` | A calm, warm pair of taps, ideal for gentle confirmations or soft paired acknowledgements. |
| `charge()` | `Bold` `Rigid` `Pattern` `Long` | The electric buildup of a countdown, perfect for race starts or any go moment. |
| `chime()` | `Substantial` `Flexible` `Bumps` `Extended` | A warm, friendly double-tap, ideal for incoming messages or chat notifications. |
| `chip()` | `Substantial` `Rigid` `Impulses` `Impulse` | Sharp, authoritative, and precise, suited for confirmations that demand clarity and definition. |
| `chirp()` | `Gentle` `Flexible` `Saw` `Extended` | Light-hearted and cheerful, ideal for positive micro-interactions or small wins. |
| `clamor()` | `Bold` `Flexible` `Saw` `Extended` | Impossible to ignore, suited for critical warnings, emergency alerts, or safety-critical states. |
| `clasp()` | `Bold` `Rigid` `Impulses` `Short` | The satisfying snap of acquiring a target, ideal for lock-on, cursor snap-to, or radar acquisition. |
| `cleave()` | `Bold` `Rigid` `Impulses` `Short` | Signals an irreversible, high-stakes action for deletes, removes, or anything the user cannot undo. |
| `coil()` | `Substantial` `Flexible` `Peak` `Long` | Rising tension that releases into certainty, ideal for long-press activation or charge-complete feedback. |
| `coinDrop()` | `Bold` `Rigid` `Saw` `Extended` | A playful cascade of coins, ideal for reward moments, payment confirmations, or in-app purchases. |
| `combinationLock()` | `Bold` `Rigid` `Saw` `Long` | The ritual of cracking a code — suited for the complete multi-step entry sequence or final unlock confirmation, not individual per-digit ticks. For rapid per-click dial feedback, use `ping()` or `chip()` instead. |
| `crescendo()` | `Substantial` `Rigid` `Impulses` `Long` | A rising build that peaks with energy, ideal for charge-up moments or building anticipation. |
| `dewdrop()` | `Substantial` `Flexible` `Bumps` `Short` | A quiet confirmation of success, ideal for operations that completed without needing attention. |
| `dirge()` | `Substantial` `Soft` `Pattern` `Long` | Heavy and fading like a dying heartache, best for conveying grief, loss, or deep sorrow. |
| `dissolve()` | `Gentle` `Soft` `Ramp` `Long` | A gentle, soothing fade, ideal for calm relief after a mild challenge or successful low-stakes action. |
| `dogBark()` | `Bold` `Soft` `Bumps` `Extended` | Two forceful low bursts like a sharp bark, ideal for alert sounds or short punchy notification moments. |
| `drone()` | `Gentle` `Flexible` `Pattern` `Long` | Flat and going nowhere, communicates idle waiting, disengagement, or nothing happening. |
| `engineRev()` | `Bold` `Flexible` `Bumps` `Long` | The thrill of revving to full throttle, ideal for racing games or mechanical acceleration feedback. |
| `exhale()` | `Substantial` `Flexible` `Ramp` `Long` | Tension releasing into calm, ideal for completing a stressful task or resolving an error. |
| `explosion()` | `Bold` `Soft` `Ramp` `Long` | A catastrophic detonation that echoes into rumble, ideal for game destruction events or dramatic impacts. |
| `fadeOut()` | `Substantial` `Flexible` `Impulses` `Extended` | A graceful drift toward silence, ideal for dismissals or transitions that should feel calm and natural. |
| `fanfare()` | `Bold` `Rigid` `Bumps` `Extended` | A short burst of triumph, ideal for achievement unlocked, rank-ups, or moments that deserve a cheer. |
| `feather()` | `Substantial` `Flexible` `Ramp` `Short` | A gentle, non-disruptive nudge, ideal for low-priority reminders. |
| `finale()` | `Bold` `Flexible` `Bumps` `Long` | A countdown that closes with emphasis, ideal for timer completions or countdown-finished alerts. |
| `fingerDrum()` | `Substantial` `Flexible` `Impulses` `Extended` | Three casual, even taps, ideal for low-key acknowledgements or non-urgent rhythm patterns. |
| `firecracker()` | `Bold` `Rigid` `Impulses` `Impulse` | Two maximum-force strikes demanding immediate response, suited for urgent double-confirmations or critical alerts. |
| `fizz()` | `Substantial` `Rigid` `Saw` `Extended` | Bubbling with joy, ideal for success celebrations or upbeat positive feedback. |
| `flare()` | `Bold` `Rigid` `Peak` `Extended` | A mind-blowing jolt, ideal for overwhelming surprise or impossible-to-believe reveals. |
| `flick()` | `Gentle` `Flexible` `Peak` `Impulse` | A light, quick tap with minimal presence, ideal for chips, tags, and filters. |
| `flinch()` | `Bold` `Flexible` `Bumps` `Extended` | A shock to the senses, ideal for unexpected alerts or startling reveals. |
| `flourish()` | `Bold` `Rigid` `Peak` `Long` | Triumphant and expansive, ideal for achievement unlocked or major task completions. |
| `flurry()` | `Bold` `Rigid` `Bumps` `Extended` | The thrill of a combo streak, ideal for hit combos, chain multipliers, or rapid-fire scoring. |
| `flush()` | `Bold` `Flexible` `Peak` `Extended` | The involuntary heave of disgust, ideal for aversion reactions or gross-out moments in playful UI contexts. |
| `gallop()` | `Bold` `Flexible` `Impulses` `Long` | A natural four-beat rhythm, suited for multi-step processes or organic rhythmic feedback. |
| `gavel()` | `Bold` `Flexible` `Impulses` `Short` | Two weighty, deliberate taps, suited for decisive double-step actions or bold acknowledgement feedback. |
| `glitch()` | `Bold` `Rigid` `Pattern` `Short` | The haptic feel of a system glitching, ideal for data corruption, errors, or intentional glitch aesthetics. |
| `guitarStrum()` | `Bold` `Flexible` `Ramp` `Long` | A rich, resonant strike that lingers, ideal for musical interactions or warm confirmation moments. |
| `hail()` | `Gentle` `Rigid` `Solid` `Extended` | An unpredictable, relentless barrage, ideal for weather events or disorienting overload feedback. |
| `hammer()` | `Bold` `Soft` `Saw` `Long` | The insistent urgency of a fist on a door, ideal for forceful alerts or escalating persistent notifications. |
| `heartbeat()` | `Substantial` `Soft` `Pattern` `Long` | The familiar lub-dub of life and tension, perfect for health apps or anxious waiting moments. |
| `herald()` | `Substantial` `Rigid` `Impulses` `Short` | Two gentle knocks building to a decisive third, ideal for staged confirmations with a clear conclusion. |
| `hoofBeat()` | `Bold` `Soft` `Impulses` `Short` | Two warm, grounded taps, ideal for mellow double confirmations or soft paired feedback. |
| `ignition()` | `Bold` `Flexible` `Impulses` `Short` | Three beats that sharpen with each hit, ideal for staged confirmations or escalating emphasis. |
| `impact()` | `Bold` `Flexible` `Peak` `Short` | The instant punch of impact, perfect for collision events or taking a hit in games. |
| `jolt()` | `Bold` `Rigid` `Impulses` `Impulse` | The most intense hit possible, suited for critical alerts or any moment that demands absolute impact. |
| `keyboardMechanical()` | `Gentle` `Flexible` `Impulses` `Impulse` | The satisfying two-stage snap of a mechanical key, great for precision typing or keyboard simulations. |
| `keyboardMembrane()` | `Gentle` `Soft` `Impulses` `Short` | A soft, muffled press, best for simulating the quiet feel of a membrane keyboard. |
| `knell()` | `Bold` `Flexible` `Bumps` `Extended` | A commanding last-chance signal, ideal for final reminders or deadline-critical alerts. |
| `knock()` | `Substantial` `Soft` `Bumps` `Long` | A polite knock announcing arrival, ideal for gentle attention requests or non-urgent presence alerts. |
| `lament()` | `Bold` `Flexible` `Pattern` `Long` | The sinking finality of defeat, captures the deflating feeling of a game-over moment. |
| `latch()` | `Substantial` `Flexible` `Bumps` `Short` | The clear feel of something switching off, communicates deactivation or opting out. |
| `lighthouse()` | `Substantial` `Flexible` `Pattern` `Long` | Steady and bias-free, suitable for neutral status updates or steady-state notifications. |
| `lilt()` | `Substantial` `Flexible` `Bumps` `Extended` | Warm and personal, ideal for direct messages or social notifications from people you know. |
| `lock()` | `Substantial` `Flexible` `Bumps` `Short` | The satisfying click of locking into place, ideal for locking, latching, or secure-confirmation interactions. |
| `lope()` | `Substantial` `Rigid` `Pattern` `Extended` | A galloping bounce with swagger, ideal for adventurous or playful UI moments. |
| `march()` | `Substantial` `Soft` `Bumps` `Long` | Like an encouraging pat on the back, ideal for motivational confirmations or achievement feedback. |
| `metronome()` | `Substantial` `Flexible` `Impulses` `Extended` | Balanced and unemotional, ideal for neutral confirmations, pagination steps, or generic two-step feedback. |
| `murmur()` | `Substantial` `Soft` `Impulses` `Impulse` | Two soft, quiet taps, ideal for subtle double-step interactions or unobtrusive confirmations. |
| `nudge()` | `Substantial` `Flexible` `Bumps` `Short` | A polite, unobtrusive double tap that announces a notification without being intrusive. |
| `passingCar()` | `Bold` `Flexible` `Peak` `Long` | The whoosh of something passing at speed, ideal for vehicle pass-by or motion-blur effects. |
| `patter()` | `Substantial` `Soft` `Impulses` `Short` | Three mild, unforced taps, ideal for low-key acknowledgements or non-urgent triple feedback. |
| `peal()` | `Bold` `Flexible` `Bumps` `Extended` | Firm and measured, conveys that something needs attention soon without triggering panic. |
| `peck()` | `Gentle` `Flexible` `Peak` `Impulse` | An ultra-short, precise tap, perfect for small icon buttons. |
| `pendulum()` | `Substantial` `Flexible` `Bumps` `Long` | A rhythmic swing that gradually settles, ideal for winding-down moments or calm settling effects. |
| `ping()` | `Substantial` `Rigid` `Impulses` `Impulse` | A precise, definitive click, ideal for list selections or any interaction where clarity of choice matters. |
| `pip()` | `Gentle` `Rigid` `Impulses` `Impulse` | A light, sparkling burst, ideal for in-game collectibles or power-up feedback. |
| `piston()` | `Bold` `Flexible` `Impulses` `Impulse` | Two forceful, immediate strikes, ideal for commanding double-confirmations or high-energy paired actions. |
| `plink()` | `Substantial` `Flexible` `Bumps` `Short` | A neutral heads-up suited as a baseline for informational notifications. |
| `plummet()` | `Bold` `Soft` `Peak` `Long` | The terrifying pause before impact, ideal for drop effects or dramatic collision moments. |
| `plunk()` | `Substantial` `Soft` `Impulses` `Impulse` | Understated but present, suitable for subdued feedback that still has noticeable weight. |
| `poke()` | `Substantial` `Flexible` `Bumps` `Extended` | Someone specifically called your name, ideal for mentions, tags, or direct-attention notifications. |
| `pound()` | `Bold` `Rigid` `Bumps` `Extended` | Impossible to ignore, ideal for critical alerts or notifications that cannot wait. |
| `powerDown()` | `Bold` `Flexible` `Ramp` `Long` | A steady deceleration to silence, communicates shutdown, power-off, or deactivation. |
| `propel()` | `Bold` `Flexible` `Bumps` `Extended` | A confident forward push communicating that a form or action has been decisively submitted. |
| `pulse()` | `Gentle` `Flexible` `Bumps` `Long` | A gentle, steady pulse that quietly signals ongoing activity without demanding attention. |
| `pummel()` | `Bold` `Rigid` `Saw` `Extended` | Escalating rage that peaks at full force, suited for blocked actions, critical failures, or frustrated moments. |
| `push()` | `Gentle` `Flexible` `Peak` `Impulse` | A quieter click that supports without competing, ideal for secondary actions. |
| `radar()` | `Substantial` `Flexible` `Pattern` `Long` | The focused sweep of active scanning, ideal for network requests or polling states. |
| `rain()` | `Gentle` `Flexible` `Pattern` `Long` | Soft and unpredictable, ideal for ambient atmospheric effects or organic ambient notifications. |
| `ramp()` | `Bold` `Rigid` `Bumps` `Long` | The joy of growing stronger, ideal for level-up moments or rank promotion celebrations. |
| `rap()` | `Substantial` `Flexible` `Bumps` `Short` | A clean double-knock that announces an alert quietly, ideal for non-urgent in-app notifications. |
| `ratchet()` | `Bold` `Rigid` `Impulses` `Extended` | A firm, assertive triple beat, suited for strong confirmations or emphatic acknowledgements. |
| `rebound()` | `Bold` `Rigid` `Impulses` `Impulse` | A strong opening that softens on the second hit, ideal for double-tap confirmations. |
| `ripple()` | `Bold` `Flexible` `Bumps` `Extended` | A strong hit that radiates outward in softening waves, ideal for touch ripples or impact echo effects. |
| `rivet()` | `Bold` `Rigid` `Impulses` `Short` | Three sharp, assertive beats, suited for triple-step confirmations or high-confidence feedback. |
| `rustle()` | `Substantial` `Flexible` `Bumps` `Extended` | A gentle heads-up that does not demand immediate action, ideal for mild warnings. |
| `shockwave()` | `Bold` `Flexible` `Ramp` `Long` | The pressure wave of a nearby explosion, ideal for detonations, force fields, or dramatic impacts. |
| `snap()` | `Substantial` `Flexible` `Impulses` `Impulse` | A firm snap that conveys a locked-in selection, perfect for toggles, switches, or confirming a choice. |
| `sonar()` | `Bold` `Rigid` `Pattern` `Long` | The eureka moment, ideal for conveying the satisfying rush of finding what you were looking for. |
| `spark()` | `Bold` `Rigid` `Peak` `Short` | The snap of electric ignition, ideal for discharge effects, ignition moments, or quick-fire activation. |
| `spin()` | `Substantial` `Flexible` `Saw` `Long` | A crisp, mechanical rhythm communicating repeating progress, great for looping or spinner states. |
| `stagger()` | `Substantial` `Flexible` `Saw` `Extended` | Woozy and disorienting, ideal for confusion, error overload, or hit-stun effects. |
| `stamp()` | `Substantial` `Soft` `Impulses` `Short` | Calm and decisive, communicates acceptance without drama, suited for dialog confirmations. |
| `stampede()` | `Bold` `Soft` `Impulses` `Long` | Four deep, measured thumps, suited for grounded step-by-step confirmation feedback. |
| `stomp()` | `Bold` `Soft` `Impulses` `Short` | Three deep, grounded beats, suitable for unhurried triple confirmations or calm rhythmic emphasis. |
| `stoneSkip()` | `Bold` `Flexible` `Impulses` `Short` | Three firm taps with a softening finish, suited for decisive but composed triple confirmations. |
| `strike()` | `Substantial` `Flexible` `Peak` `Impulse` | A confident, decisive strike that delivers a clear and satisfying response for the main call-to-action. |
| `summon()` | `Bold` `Flexible` `Bumps` `Extended` | A commanding signal that refuses to be ignored, ideal for incoming calls or urgent attention-demand moments. |
| `surge()` | `Bold` `Rigid` `Saw` `Extended` | An irrepressible swell of delight, ideal for reaction moments or expressions of pure joy. |
| `sway()` | `Substantial` `Soft` `Bumps` `Long` | Reassuring and rhythmic, ideal for calming or encouraging feedback. |
| `sweep()` | `Substantial` `Rigid` `Pattern` `Long` | The rhythmic pulse of active searching, ideal for search operations or background polling states. |
| `swell()` | `Substantial` `Flexible` `Bumps` `Extended` | A patient nudge that quietly escalates, ideal for reminders that build attention without anxiety. |
| `syncopate()` | `Bold` `Rigid` `Impulses` `Extended` | A lively three-beat rhythm with mixed texture, ideal for multi-step confirmations or animated feedback. |
| `throb()` | `Substantial` `Flexible` `Impulses` `Short` | An accelerated heartbeat that signals something is wrong, ideal for pre-danger tension or warning states. |
| `thud()` | `Substantial` `Flexible` `Peak` `Short` | A soft, warm acknowledgement, ideal for opening a menu or drawer. |
| `thump()` | `Bold` `Flexible` `Impulses` `Impulse` | Confident and present without being harsh, useful for bold feedback that avoids aggression. |
| `thunder()` | `Bold` `Soft` `Peak` `Long` | The raw power of a thunderstorm, ideal for dramatic reveals or moments of overwhelming force. |
| `thunderRoll()` | `Bold` `Flexible` `Impulses` `Long` | A dramatic arc of mounting intensity, ideal for thunderstorm effects or climactic UI transitions. |
| `tickTock()` | `Bold` `Flexible` `Pattern` `Long` | The steady pulse of time, ideal for timing feedback, countdowns, or metronome-style interactions. |
| `tidalSurge()` | `Bold` `Flexible` `Impulses` `Extended` | Two waves of escalating intensity, suited for compound actions or impactful paired confirmations. |
| `tideSwell()` | `Substantial` `Flexible` `Impulses` `Long` | A long wave-like arc that rises and falls, ideal for extended ambient effects or fluid UI transitions. |
| `tremor()` | `Bold` `Soft` `Impulses` `Impulse` | Pure, heavy rumble with no sharpness, ideal for seismic events or maximum-weight impact simulations. |
| `trigger()` | `Bold` `Flexible` `Peak` `Extended` | The decisive moment of release, ideal for weapon discharge, trigger confirmation, or releasing a charged gesture. |
| `triumph()` | `Bold` `Flexible` `Saw` `Long` | Pure triumph, conveys the overwhelming joy of a major win or achievement. |
| `trumpet()` | `Bold` `Flexible` `Saw` `Extended` | A joyful flourish that peaks in triumph, ideal for celebrations or milestone completions. |
| `typewriter()` | `Bold` `Flexible` `Peak` `Short` | The nostalgic thud of a vintage typewriter, perfect for retro keyboard or analog-feel experiences. |
| `unfurl()` | `Bold` `Flexible` `Pattern` `Long` | The unmistakable thrill of discovery, evoking the iconic joy of opening a treasure chest. |
| `vortex()` | `Substantial` `Flexible` `Peak` `Long` | An irresistible pull into the unknown, ideal for drain animations or dramatic disappearing transitions. |
| `wane()` | `Gentle` `Flexible` `Ramp` `Extended` | A lazy, dismissive fade, fitting for sarcastic or indifferent UI moments. |
| `warDrum()` | `Bold` `Soft` `Impulses` `Extended` | Three steady drum-like beats, ideal for grounded triple confirmations or structured repetitive feedback. |
| `waterfall()` | `Bold` `Flexible` `Impulses` `Extended` | A rush of energy that spills and softens, ideal for clearing actions or flowing state transitions. |
| `wave()` | `Substantial` `Soft` `Bumps` `Long` | Gentle and non-interrupting, communicates ongoing activity without breaking the user's focus. |
| `wisp()` | `Gentle` `Flexible` `Peak` `Impulse` | A barely-there touch, best for ghost or outline buttons that should feel subtle and unobtrusive. |
| `wobble()` | `Substantial` `Rigid` `Peak` `Short` | A gentle correction without alarm, ideal for minor validation errors or soft negative feedback. |
| `woodpecker()` | `Bold` `Rigid` `Solid` `Extended` | Mechanical and relentless, ideal for repetitive automated sequences where precision is key. |
| `zipper()` | `Gentle` `Flexible` `Solid` `Extended` | The familiar drag and snap of a zipper closing, ideal for closure interactions or drawer animations. |


## Preset Tags

Every preset is tagged with exactly four attributes — one from each category — that describe its haptic character. Use tags to find alternatives within a similar feel, filter by intensity or duration, or understand what a preset will feel like before playing it.

### Intensity
The overall weight and forcefulness of the haptic.

| Tag | Meaning | Usage |
|---|---|---|
| `Gentle` | Haptics with low amplitude — barely perceptible vibration that stays in the background. | Good for subtle confirmations, hover effects, or any interaction where the feedback should not interrupt the user. Common situations: cursor hover, background sync, silent notification, passive scroll boundary nudge, accessibility hints. |
| `Substantial` | Haptics with medium amplitude — a clear, balanced vibration that is easy to notice without being disruptive. | Ideal for most standard UI interactions such as button presses, toggles, or form confirmations. Common situations: button tap, toggle switch, form validation, menu item selection, pull-to-refresh trigger. |
| `Bold` | Haptics with high amplitude — a strong, attention-commanding vibration that is immediately felt. | Best for critical alerts, error states, or high-impact moments that require the user's immediate attention. Common situations: payment failure, security alert, authentication error, destructive action confirmation, game hit or collision. |

### Sharpness
How the haptic energy is shaped at the tactile level.

| Tag | Meaning | Usage |
|---|---|---|
| `Soft` | Haptics with low frequency — a smooth, rounded vibration with a gentle, cushioned feel. | Perfect for calm, ambient feedback, wellness interactions, or any context where a soft touch is preferred. Common situations: sleep reminder, gentle onboarding hint, ambient soundscape interaction. |
| `Flexible` | Haptics with medium frequency — a balanced vibration that sits between soft and rigid. | Suitable for general-purpose UI feedback, notifications, and interactions that need a neutral tactile character. Common situations: incoming message, push notification, content scroll snap, date picker tick, standard in-app alert. |
| `Rigid` | Haptics with high frequency — a crisp, precise vibration with a sharp, mechanical feel. | Great for snappy UI elements, keyboard-like taps, or any interaction that should feel precise and definitive. Common situations: virtual keyboard key press, numeric keypad tap, rotary dial click, picker wheel snap, PIN entry digit confirmation. |

### Shape
The envelope or waveform pattern of the haptic over time.

| Tag | Meaning | Usage |
|---|---|---|
| `Peak` | Haptics with a single amplitude peak — a quick rise and fall in intensity. | Ideal for single-event feedback, such as button presses or selection confirmations. Common situations: like or heart button tap, photo shutter release, item selection confirmation, swipe action completion, quick reply send. |
| `Ramp` | Haptics with a ramp-shaped amplitude pattern — amplitude increases or decreases linearly over the duration. | Suited for fade-in or fade-out effects, swipe feedback, or any interaction that should feel like a gradual build or release. Common situations: volume or brightness slider, swipe-to-dismiss gesture, pinch zoom, countdown timer nearing zero, pull-down refresh building tension. |
| `Saw` | Haptics with a sawtooth-shaped amplitude pattern — a sharp rise followed by an abrupt drop, or vice versa. | Effective for mechanical-feeling interactions, ratchet effects, or any feedback with a sharp, asymmetric edge. Common situations: ratchet scroll, slot machine reel spin, rotary dial simulation, drag-and-drop snap into position, file shredding animation. |
| `Impulses` | Haptics with a discrete pattern — short, distinct pulses separated by silence. | Useful for click-like feedback, Morse-style cues, or sequences of distinct tactile events. Common situations: step counter tick, quantity increment, metronome cue, item added to cart, typing indicator in chat. |
| `Bumps` | Haptics with multiple amplitude peaks — a series of rhythmic rises and falls. | Perfect for multi-step feedback, rhythmic notifications, or interactions that need a repeating pulse feel. Common situations: in-app achievement or badge unlock, multi-item batch selection, dice roll, streak milestone reached, coin or reward collection. |
| `Pattern` | Haptics with a custom, often repeating amplitude pattern — a structured sequence that defines a unique rhythm. | Best for branded feedback signatures, complex notifications, or effects that carry a recognizable tactile identity. Common situations: branded notification signature, custom incoming call alert, game character footstep cycle, sound-to-haptic mapping, recurring rhythm in a music app. |
| `Solid` | Haptics with a long continuous pattern at a constant amplitude — a steady, uniform vibration. | Good for indicating ongoing processes, loading states, or sustained alerts that need consistent presence. Common situations: file upload or download in progress, active voice recording, hold-to-confirm gesture, persistent alarm, live activity tracking. |

### Duration
The rough playback length of the preset.

| Tag | Meaning | Usage |
|---|---|---|
| `Impulse` | Extremely short haptic lasting less than 100 ms — an instantaneous tactile click. | Best for keyboard taps, quick confirmations, or any interaction that requires an instant, minimal response. Common situations: virtual keyboard key press, quick tap micro-interaction, toggle switch flip, checkbox tick, cursor click simulation. |
| `Short` | Brief haptic lasting between 100 ms and 250 ms — long enough to be clearly felt without lingering. | Ideal for button presses, toggle switches, and standard UI element interactions. Common situations: primary action button press, navigation tab switch, swipe gesture acknowledgement, photo filter selection, card flip or reveal. |
| `Extended` | Medium-length haptic lasting between 250 ms and 600 ms — provides richer, more expressive feedback. | Good for notifications, multi-step confirmations, or interactions that benefit from a more deliberate tactile moment. Common situations: incoming push notification, payment or purchase success, pull-to-refresh completion, form submission success, app rating prompt. |
| `Long` | Prolonged haptic lasting 600 ms or more — creates an immersive, sustained tactile experience. | Best for complex animations, gaming effects, elaborate alerts, or experiences where the haptic plays a central role. Common situations: in-app achievement or level completion, onboarding celebration, game victory screen, subscription or reward unlock, end-of-session summary celebration. |

### Using tags to choose a preset

Tags let you browse by feel. For example:
- **Gentle + Soft + Peak + Impulse** — the quietest, most invisible feedback possible.
- **Bold + Rigid + Impulses + Short** — sharp, decisive single or double taps.
- **Bold + Rigid + Pattern + Extended** — relentless, hard, rhythmic — error / alarm territory.
- **Substantial + Flexible + Bumps + Long** — natural-feeling, mid-weight, rolling sequence.

---

### Confirmations & Completions

**Preferred spec:** `Substantial` + `Impulses` or `Peak` + `Short` — the moment should feel decisive but proportionate. Brief and high-contrast.

**Avoid:** `Gentle` when the confirmation must register consciously; `Extended` duration on a single-tap event — it will feel sluggish rather than satisfying.

**Context you need before choosing:**
- *Emotional register* — warm/organic completion (personal save, wellness check-in) → `Soft` texture; crisp system confirmation (form submit, payment) → `Rigid` texture.
- *Reversibility* — irreversible or destructive action → `Bold` + `Rigid`; routine save or dismiss → `Substantial`.
- *Who triggered it* — user-initiated completion → `Impulses`/`Peak`/`Short`; system-completed task → `Bumps`/`Long`.

### Achievements & Celebrations

**Preferred spec:** `Bold` + `Extended` for major milestones; `Substantial` + `Long` for minor rewards.

**Avoid:** `Gentle` for any celebratory moment — it won't feel like a reward. `Short` or `Impulse` duration for a major achievement — it will feel like a tap, not a fanfare.

**Context you need before choosing:**
- *Milestone weight* — minor reward (streak day, points earned) → `Substantial`/`Long`; major achievement (level-up, rank, unlock) → `Bold`/`Extended`.
- *Emotional tone* — warm/personal achievement → `Soft` or `Flexible` texture; triumphant/game-like → `Flexible` or `Rigid` with `Ramp` shape.

### Errors & Rejections

**Preferred spec:** `Bold` + `Rigid` + `Saw` + `Short` or `Extended` — errors should feel sharp and interruptive. The `Saw` shape (sharp rise, rapid decay) communicates rejection clearly.

**Avoid:** `Gentle` or `Soft` for any error — the signal will not read as a rejection. `Peak` shape (smooth arc) softens the error and loses its urgency.

**Context you need before choosing:**
- *Severity* — soft validation hint → `Substantial`/`Flexible`/`Saw`/`Short`; hard block or access denied → `Bold`/`Rigid`/`Saw`/`Extended`.
- *Reversibility* — destructive/irreversible action that was blocked → escalate to `Bold`; recoverable error → `Substantial`.

### Notifications & Alerts

**Preferred spec:** `Bumps` shape at `Substantial` or `Bold` intensity — rounded pulses announce attention without demanding it. `Bumps` is the most natural shape for incoming signals.

**Avoid:** `Gentle` when the alert must be noticed; `Impulse` or `Short` duration for a notification — it will feel like a UI tap rather than an incoming signal.

**Context you need before choosing:**
- *Criticality* — must-not-miss → `Bold`/`Extended`; standard notification → `Substantial`/`Long`; passive background signal → `Gentle`/`Bumps`.
- *Source* — personal/social (message, call) → warmer texture (`Flexible`/`Soft`); system/service alert → crisper texture (`Rigid`/`Flexible`).

### Warnings & Tension

**Preferred spec:** `Bold` + `Extended` with `Pattern` or `Ramp` shape — warnings should build or persist, not just tap once. Sustained duration communicates ongoing risk.

**Avoid:** `Short` or `Impulse` for a warning state — it reads as a notification, not a caution. `Soft` texture weakens the urgency.

**Context you need before choosing:**
- *Tension arc* — static/persistent warning → `Pattern`; escalating urgency → `Ramp`; repeated alarm-like pulse → `Saw`/`Pattern`.
- *Severity relative to errors in the same app* — warnings should be perceptibly lighter than hard errors; if errors use `Bold`/`Rigid`, warnings can use `Substantial`/`Flexible` unless they are critical.

### UI Interactions

**Preferred spec:** `Substantial` + `Rigid` + `Impulse` for primary controls; `Gentle` + `Impulse` for secondary or ghost-button interactions (treat as progressive enhancement).

**Avoid:** `Extended` or `Long` for any single tap — duration must match interaction speed. `Bold` for routine taps — it will make every interaction feel heavy and alarming.

**Context you need before choosing:**
- *Control weight* — primary CTA, toggle, mechanical control (shutter, lock) → `Substantial`/`Rigid`; secondary button, chip, icon tap → `Gentle`/`Impulse`.
- *Is the haptic essential or enhancement?* — if it can be skipped without confusing the user, use `Gentle`; if it confirms a state change the user must perceive, use `Substantial`.

### Ambient & Background

**Preferred spec:** `Gentle` or `Substantial` + `Solid` or `Pattern` + `Extended` — ambient haptics should feel like texture, not events. Continuous shapes work best.

**Avoid:** `Bold` for ambient states — it will feel like an alert, not an atmosphere. `Impulse` or `Short` duration is meaningless for a looping state. `Saw` shape reads as an error, not background texture.

**Context you need before choosing:**
- *Is this looping or one-shot?* — looping ambient → `Solid`/`Extended` or `Pattern`/`Extended`; one-shot ambient cue (attention nudge) → `Bumps`/`Long`.
- *Emotional quality* — calm/meditative → `Soft`/`Gentle`; active/monitoring → `Flexible`/`Substantial` with `Pattern`.
- *Does it layer with other haptics?* — if discrete events fire over the ambient loop, the ambient layer must be `Gentle` enough not to mask them.

### Games & Physical Metaphors

**Preferred spec:** `Bold` + `Peak` or `Ramp` for impact events; `Solid`/`Extended` for continuous physical states (engine, heartbeat).

**Avoid:** `Soft` texture for sharp physical impacts — it will feel cushioned rather than physical. `Impulse` duration for explosions or collisions — the event needs mass, which requires `Long` or `Extended`.

**Context you need before choosing:**
- *Event type* — discrete impact (hit, collision, tap) → `Bold`/`Peak` or `Ramp`/`Short` or `Long`; continuous physical state (engine running, heartbeat) → `Solid` or `Pattern`/`Extended`.
- *Physical metaphor weight* — a pebble drop vs. a boulder collapse should differ in both Intensity and Duration, not just amplitude.
- *Texture* — mechanical/digital game event → `Rigid`; organic/physical world event → `Flexible` or `Soft`.

### Keyboard & Typing

**Preferred spec:** `Rigid` + `Impulse` — keyboard haptics must be near-instantaneous and mechanically crisp. Every keystroke fires at typing speed, so `Impulse` duration is required to avoid blur.

**Avoid:** `Short` or longer duration — it will overlap with the next keypress at normal typing speed. `Soft` or `Flexible` texture weakens the mechanical character that makes keyboard haptics useful.

**Context you need before choosing:**
- *Key type differentiation* — if the design distinguishes key types (mechanical vs. membrane feel), use amplitude contrast between them rather than relying on texture alone; texture differences are subtle and easily missed.
- *Typing speed* — high-frequency input means even `Short` can overlap; confirm the call site fires per keypress, not per word.

### Selection & Scrolling

**Preferred spec (per-item tick):** `Rigid` + `Impulse` — scroll ticks must be imperceptible in isolation but accumulate into a tactile rhythm. Brief and crisp.

**Preferred spec (threshold / snap-to):** `Substantial` + `Rigid` + `Short` — a snap-point or pull-to-refresh threshold is a one-shot event; it should feel like a definitive click, not a tick.

**Avoid:** Substituting a heavier spec for a `Gentle` tick at high firing frequency — it will feel intrusive rather than textured. If `Gentle`/`Impulse` is too subtle, omit ticks rather than replacing them with something heavier.

**Context you need before choosing:**
- *Firing frequency* — per-detent scroll tick → `Impulse` only; one-shot threshold → `Short` acceptable.
- *Interaction type* — continuous scroll picker → `Rigid`/`Impulse`; pull-to-refresh → `Substantial`/`Rigid`/`Short`; dial complete/unlock ceremony → `Substantial` or `Bold`/`Extended`.

### Drag & Drop

**Preferred spec:** `Substantial` + `Rigid` + `Short` for snap-to-target and drop placement — the moment of placement should feel like something locking in.

**Avoid:** `Gentle` for drop events — the signal will be lost during the physical motion of dragging. `Extended` duration for a drop landing — it should be instantaneous.

**Context you need before choosing:**
- *Event type* — snap-to-target mid-drag → lighter spec (`Substantial`/`Short`); final drop placement → equal or heavier (`Substantial` or `Bold`/`Short`); destructive/irreversible drop → `Bold`/`Rigid`.
- *Texture* — mechanical list reorder → `Rigid`; organic drag (photo collage, freeform canvas) → `Flexible`.

### Navigation & Transitions

**Preferred spec:** `Substantial` + `Short` for modal present/dismiss; `Gentle` + `Impulse` for lightweight navigation (tab switch, back).

**Avoid:** `Bold` for routine navigation — it makes every screen feel like a critical event. `Extended` for any transition — it outlasts the animation and feels slow.

**Context you need before choosing:**
- *Transition weight* — modal or sheet (heavier) → `Substantial`/`Short`; tab switch, back, push/pop → `Gentle`/`Impulse`.
- *Is the haptic essential or enhancement?* — navigation haptics are almost always enhancement. If it would feel odd without haptics, it's enhancement; design accordingly and do not escalate beyond `Substantial`.
- *Direction* — presenting/opening → slightly heavier; dismissing/closing → slightly lighter or omit entirely.

### Media & Playback

**Preferred spec:** `Substantial` + `Rigid` + `Short` for discrete playback events (play/pause, chapter marker); `Gentle` + `Rigid` + `Impulse` for high-frequency scrub ticks.

**Avoid:** `Bold` for routine play/pause — it should feel like a control tap, not an alert. `Short` or longer for scrub ticks — at drag speed, anything longer than `Impulse` turns into continuous noise.

**Context you need before choosing:**
- *Firing frequency* — scrub ticks fire continuously while the user drags; use `Impulse` duration only. One-shot events (play, pause, chapter boundary) can use `Short` or `Long`.
- *Event weight* — chapter boundary or major marker → `Substantial`/`Long`; routine play/pause → `Substantial`/`Short`; scrub tick → `Gentle`/`Impulse`.

### Authentication & Biometrics

**Preferred spec:** `Substantial` + `Rigid` + `Impulses` or `Peak` + `Short` for success; `Bold` + `Rigid` + `Saw` + `Short` for failure/access denied.

**Avoid:** `Soft` texture for authentication feedback — the signal needs to feel definitive, not cushioned. `Gentle` for any auth event — this is a trust signal; it must register.

**Context you need before choosing:**
- *Success vs. failure* — success should feel settled and final (`Impulses`/`Peak`); failure should feel sharp and interruptive (`Saw`).
- *App tone* — if the app is explicitly warm or wellness-oriented, `Flexible` texture is acceptable for success; otherwise default to `Rigid` for clarity.

### Onboarding & Tutorials

**Preferred spec:** `Substantial` + `Bumps` + `Short` for step-completion moments; `Gentle` + `Bumps`/`Solid` + `Extended` for ambient guidance cues (only when continuous looping is appropriate).

**Avoid:** `Bold` for guidance cues — onboarding should feel supportive, not alarming. `Impulse` duration for step milestones — the completion moment deserves more than a tap.

**Context you need before choosing:**
- *Step importance* — primary milestone (first action completed, setup done) → `Substantial`/`Bumps`/`Short` or `Long`; subtle ambient guide → `Gentle`/`Soft`.
- *Continuous vs. one-shot* — spotlight/attention nudge that pulses → `Bumps`/`Extended`; step-completion confirmation → `Bumps`/`Short` or `Long`.

---

## Full Preset List

All 150+ presets:

`afterglow` `aftershock` `alarm` `anvil` `applause` `ascent` `balloonPop` `barrage` `bassDrop` `batter` `bellToll` `blip` `bloom` `bongo` `boulder` `breakingWave` `breath` `buildup` `burst` `buzz` `cadence` `cameraShutter` `canter` `cascade` `castanets` `catPaw` `charge` `chime` `chip` `chirp` `clamor` `clasp` `cleave` `coil` `coinDrop` `combinationLock` `crescendo` `dewdrop` `dirge` `dissolve` `dogBark` `drone` `engineRev` `exhale` `explosion` `fadeOut` `fanfare` `feather` `finale` `fingerDrum` `firecracker` `fizz` `flare` `flick` `flinch` `flourish` `flurry` `flush` `gallop` `gavel` `glitch` `guitarStrum` `hail` `hammer` `heartbeat` `herald` `hoofBeat` `ignition` `impact` `jolt` `keyboardMechanical` `keyboardMembrane` `knell` `knock` `lament` `latch` `lighthouse` `lilt` `lock` `lope` `march` `metronome` `murmur` `nudge` `passingCar` `patter` `peal` `peck` `pendulum` `ping` `pip` `piston` `plink` `plummet` `plunk` `poke` `pound` `powerDown` `propel` `pulse` `pummel` `push` `radar` `rain` `ramp` `rap` `ratchet` `rebound` `ripple` `rivet` `rustle` `shockwave` `snap` `sonar` `spark` `spin` `stagger` `stamp` `stampede` `stomp` `stoneSkip` `strike` `summon` `surge` `sway` `sweep` `swell` `syncopate` `throb` `thud` `thump` `thunder` `thunderRoll` `tickTock` `tidalSurge` `tideSwell` `tremor` `trigger` `triumph` `trumpet` `typewriter` `unfurl` `vortex` `wane` `warDrum` `waterfall` `wave` `wisp` `wobble` `woodpecker` `zipper`
