# Choosing the Right Preset

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

**Q3 — What is the emotional valence?**
- Positive (success, reward, joy)
- Negative (error, failure, blocked, destructive)
- Neutral (informational, status, ambient)

*Maps to: Shape — positive → Bumps or Saw (celebration); negative → Saw, Pattern, or Impulses; neutral → Peak or Bumps*

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

**Q8 — What intensity level fits the surrounding UI and moment?**
- Gentle — barely-there, should not distract
- Substantial — noticeable but not aggressive
- Bold — commanding, must land

*Maps to: Intensity tag. Ask only if not already resolved by Q4 or the code context.*

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
| Wellness, breathing, calm, ambient, meditation | `Soft` |
| Most UI interactions, social moments, notifications, standard app events | `Flexible` |
| Precision input (list selection, keyboard, camera shutter, data entry); sharp rejection; mechanical/system-like event | `Rigid` |

Default: `Flexible`. Use `Soft` only for explicitly warm or calm contexts. Use `Rigid` for mechanical or decisive interactions.

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
| `combinationLock()` | `Bold` `Rigid` `Saw` `Long` | The ritual of cracking a code, ideal for combination inputs or multi-step secure unlocking. |
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

| Tag | Meaning |
|---|---|
| `Gentle` | Light, delicate — barely-there to subtle feedback |
| `Substantial` | Medium-to-heavy — noticeable but not aggressive |
| `Bold` | Strong, heavy — commanding and unmistakable |

### Texture
How the haptic energy is shaped at the tactile level.

| Tag | Meaning |
|---|---|
| `Soft` | Cushioned, rounded edges — warm and smooth |
| `Flexible` | Adaptive, naturalistic — somewhere between hard and soft |
| `Rigid` | Hard, mechanical — crisp and precise |

### Shape
The envelope or waveform pattern of the haptic over time.

| Tag | Meaning |
|---|---|
| `Peak` | Single apex — energy rises then falls in one arc |
| `Ramp` | Rising arc — energy builds toward a climax |
| `Saw` | Sawtooth envelope — sharp rise, rapid decay, often repeated |
| `Impulses` | Discrete sharp transients — one or more crisp hits |
| `Bumps` | Smooth rounded pulses — softer, repeating bulges |
| `Pattern` | Rhythmic sequence — structured tempo or cadence |
| `Solid` | Continuous sustained output — fills duration without gaps |

### Duration
The rough playback length of the preset.

| Tag | Meaning |
|---|---|
| `Impulse` | Near-instantaneous — a single beat, under ~100 ms |
| `Short` | Brief — roughly 100–300 ms |
| `Long` | Noticeable length — roughly 300 ms–1 s |
| `Extended` | Long sequence — roughly 1 s or more |

### Using tags to choose a preset

Tags let you browse by feel. For example:
- **Gentle + Soft + Peak + Impulse** — the quietest, most invisible feedback possible.
- **Bold + Rigid + Impulses + Short** — sharp, decisive single or double taps.
- **Bold + Rigid + Pattern + Extended** — relentless, hard, rhythmic — error / alarm territory.
- **Substantial + Flexible + Bumps + Long** — natural-feeling, mid-weight, rolling sequence.

---

### Confirmations & Completions

Most confirmation presets (`stamp`, `strike`, `ping`, `chip`, `snap`, `lock`) reproduce well on mid-range and premium devices — they are short and high-contrast. `bloom` and `dewdrop` are very gentle and may feel imperceptible on budget hardware with weak actuators; consider falling back to `ping` or `nudge` on lower-capability devices.

### Achievements & Celebrations

Bold celebration presets (`fanfare`, `flourish`, `ramp`, `coinDrop`, `surge`) use extended patterns and high amplitude — they land well even on mid-range devices. Subtler celebratory presets (`fizz`, `unfurl`) rely on frequency texture and may feel flat or indistinct below `STANDARD_SUPPORT`. Prefer `fanfare` or `flourish` as your primary Android celebration preset.

### Errors & Rejections

Error presets are designed to be high-amplitude and high-contrast — they perform reliably across the Android ecosystem. `buzz`, `jolt`, `alarm`, `cleave`, and `wobble` are all strong choices on Android. `glitch` uses a pattern that may be less differentiated on devices below `STANDARD_SUPPORT`; substitute `alarm` or `pummel` if you need guaranteed impact.

### Notifications & Alerts

Notification presets work well on Android because they use the `Bumps` shape (smooth rounded pulses) which translates gracefully across actuator quality levels. `summon` and `pound` (Bold/Extended) are the safest choices when the alert must register on any device. Very gentle presets like `blip` and `feather` may be imperceptible on devices without amplitude control (below API 26).

### Warnings & Tension

`peal`, `knell`, and `hammer` are reliable across device tiers — they are Bold and Extended. `throb` and `rustle` (Substantial) may feel indistinct on weak actuators; for Android, prefer `swell` or `peal` if the warning must register on budget hardware.

### UI Interactions

Short, precise UI presets (`peck`, `flick`, `push`, `wisp`) are Gentle/Impulse — they may be undetectable on devices without amplitude control. On Android, treat these as progressive enhancement: if `CompatibilityMode` is `LIMITED_SUPPORT` or below, consider skipping them entirely rather than substituting a heavier preset. `cameraShutter` and `snap` are Substantial/Rigid and reproduce well.

### Ambient & Background

Ambient presets (`wave`, `breath`, `pulse`, `radar`, `sweep`) use continuous patterns. Their quality depends heavily on the `RealtimeComposerStrategy` and API level. On API 36+ (`ADVANCED_SUPPORT`), they feel rich and evolving. On `STANDARD_SUPPORT` they remain usable. Below `LIMITED_SUPPORT`, continuous patterns degrade to simple on/off vibration — avoid looping ambient haptics on these devices, as they become noise rather than texture.

### Games & Physical Metaphors

Game presets (`impact`, `explosion`, `shockwave`, `flurry`, `trigger`) are designed to be Bold and use high amplitude — they perform well across Android tiers. `engineRev` and `heartbeat` use continuous patterns and benefit from higher `CompatibilityMode`. `explosion` and `thunder` use a `Soft`/`Low` frequency character that may feel less distinct on devices with ERM motors (which have no frequency control); the amplitude envelope still lands.

### Keyboard & Typing

Keyboard simulation presets (`keyboardMechanical`, `keyboardMembrane`, `typewriter`) rely on precise frequency texture to differentiate the "mechanical" vs. "membrane" feel. This distinction is only meaningful on `ADVANCED_SUPPORT` devices with Envelope API. On lower-tier devices, all three may feel similar. Use `keyboardMechanical` as the default — it has the highest amplitude contrast — and don't expect cross-device fidelity for the others.

### Selection & Scrolling

Scroll picker ticks (`ping`, `chip`) are Rigid/Impulse and high-contrast — they reproduce well across mid-range and premium devices. `peck` (Gentle/Impulse) may be undetectable on devices below API 26; omit it entirely on `LIMITED_SUPPORT` hardware rather than substituting a heavier preset, which would feel intrusive at scroll frequency. `snap` is a safe choice for pull-to-refresh threshold feedback across all tiers.

### Drag & Drop

`snap` and `lock` (Substantial/Short) are reliable across Android tiers. `wobble` (Rigid/Peak) has adequate contrast to land on most devices. `cleave` (Bold/Rigid) performs well everywhere. `thud` (Flexible/Peak) may feel less distinct on ERM devices; substitute `ping` if the drop acknowledgement needs sharper definition.

### Navigation & Transitions

`thud` and `latch` (Substantial) perform well on mid-range and above. `push` and `flick` (Gentle/Impulse) may be imperceptible on devices without amplitude control — treat them as progressive enhancement and skip on `LIMITED_SUPPORT` or below rather than replacing with something heavier, which would make navigation feel weighted. `zipper` (Gentle/Solid) uses a continuous pattern and degrades to simple on/off vibration below `LIMITED_SUPPORT`; consider skipping it on low-capability hardware.

### Media & Playback

`strike` and `ping` (Substantial/Rigid) are reliable across Android. `fanfare` (Bold/Extended) lands on all tiers. `blip` (Gentle) may be imperceptible below API 26. For scrub-tick use cases that fire at high frequency, use `peck` only on `STANDARD_SUPPORT` and above, and skip entirely on `LIMITED_SUPPORT` — repeated light vibrations on weak actuators become noise.

### Authentication & Biometrics

`stamp` (Substantial/Soft) performs well on mid-range and premium devices; the Soft texture may feel less defined on budget hardware — substitute `ping` if the success signal needs sharper acknowledgement. `lock` (Substantial/Bumps) reproduces reliably. `wobble` and `buzz` are high-contrast and safe across all tiers.

### Onboarding & Tutorials

`nudge` and `poke` (Substantial/Bumps) translate well across Android tiers. `bloom` (Gentle/Bumps/Extended) uses a continuous pattern — below `LIMITED_SUPPORT` it may degrade to simple vibration; substitute `nudge` on low-capability hardware. `dewdrop` (Gentle) may be imperceptible without amplitude control; on `LIMITED_SUPPORT` devices, either skip it or use `nudge` so the step-completion signal registers.

---

## Full Preset List

All 150+ presets:

`afterglow` `aftershock` `alarm` `anvil` `applause` `ascent` `balloonPop` `barrage` `bassDrop` `batter` `bellToll` `blip` `bloom` `bongo` `boulder` `breakingWave` `breath` `buildup` `burst` `buzz` `cadence` `cameraShutter` `canter` `cascade` `castanets` `catPaw` `charge` `chime` `chip` `chirp` `clamor` `clasp` `cleave` `coil` `coinDrop` `combinationLock` `crescendo` `dewdrop` `dirge` `dissolve` `dogBark` `drone` `engineRev` `exhale` `explosion` `fadeOut` `fanfare` `feather` `finale` `fingerDrum` `firecracker` `fizz` `flare` `flick` `flinch` `flourish` `flurry` `flush` `gallop` `gavel` `glitch` `guitarStrum` `hail` `hammer` `heartbeat` `herald` `hoofBeat` `ignition` `impact` `jolt` `keyboardMechanical` `keyboardMembrane` `knell` `knock` `lament` `latch` `lighthouse` `lilt` `lock` `lope` `march` `metronome` `murmur` `nudge` `passingCar` `patter` `peal` `peck` `pendulum` `ping` `pip` `piston` `plink` `plummet` `plunk` `poke` `pound` `powerDown` `propel` `pulse` `pummel` `push` `radar` `rain` `ramp` `rap` `ratchet` `rebound` `ripple` `rivet` `rustle` `shockwave` `snap` `sonar` `spark` `spin` `stagger` `stamp` `stampede` `stomp` `stoneSkip` `strike` `summon` `surge` `sway` `sweep` `swell` `syncopate` `throb` `thud` `thump` `thunder` `thunderRoll` `tickTock` `tidalSurge` `tideSwell` `tremor` `trigger` `triumph` `trumpet` `typewriter` `unfurl` `vortex` `wane` `warDrum` `waterfall` `wave` `wisp` `wobble` `woodpecker` `zipper`
