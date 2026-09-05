# Analytics — what the site measures, and why it needs no cookie banner

The Pulsar site reports **which pages are read and which things are used** to
PostHog, across its three surfaces:

| `surface`        | Pages                        |
| ---------------- | ---------------------------- |
| `landing`        | `/pulsar/`                   |
| `studio-landing` | `/pulsar/studio/`            |
| `docs`           | everything Starlight renders |

The standalone Pulsar Web App under `/pulsar/web-app/` is a separate Vite bundle
that does not include this component, so it reports nothing.

Files: [`events.ts`](./events.ts) (**the catalogue**), [`analytics.ts`](./analytics.ts)
(the wrapper), [`../components/posthog.astro`](../components/posthog.astro)
(init), [`../components/site-analytics.astro`](../components/site-analytics.astro)
(the delegated, site-wide listeners).

---

## Cookieless, and why that means no banner

The banner requirement (**ePrivacy Directive Art. 5(3)**, the rule the GDPR
usually gets blamed for) is about _storing information on, or gaining access to
information stored in, a user's terminal equipment_ — cookies, `localStorage`,
`sessionStorage`, device fingerprints. It is not about analytics as such. Remove
the storage and the consent requirement goes with it.

So `posthog.init` is configured:

| Option                                         | Effect                                                                                                                                                |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cookieless_mode: 'always'`                    | No cookie, no local or session storage. Identity is a salted hash PostHog derives **server-side** from the request, rotated daily and not reversible. |
| `persistence: 'memory'`                        | The belt to that brace — SDK state lives in a variable that dies with the tab.                                                                        |
| `person_profiles: 'never'`                     | Events never accumulate against a person profile.                                                                                                     |
| `autocapture: false`                           | We send named events from the catalogue, never every DOM click and its text.                                                                          |
| `disable_session_recording`, `disable_surveys` | No replay, no injected UI.                                                                                                                            |
| `property_denylist`                            | Drops everything the SDK reads _from the device_ — see below.                                                                                         |
| `sanitize_properties`                          | Every URL PostHog attaches is reduced to origin + path.                                                                                               |
| no `identify()`                                | Events are anonymous.                                                                                                                                 |

Verified in a browser against a stubbed ingestion host (see below): after loading
the landing page, the Studio landing page and a docs page, and exercising the
waitlist form, `document.cookie` held nothing from PostHog and neither storage
held a PostHog key. Every event carried `$cookieless_mode: true`,
`distinct_id: "$posthog_cookieless"`, `$device_id: null` and
`$process_person_profile: false`, and **no denylisted property at all** — no
screen or viewport size, no timezone, no raw user agent.

This puts the site in the same position as Plausible, Fathom and a
CNIL-exempt Matomo configuration: an audience measurement that produces only
aggregate statistics, does not follow anyone across sites, and holds no
persistent identifier.

> ⚠️ **Cookieless mode must also be enabled in the PostHog project**
> (Settings → Project → _Cookieless server hash mode_). Until it is, PostHog
> **drops cookieless events on ingestion** — the client works, the dashboards
> stay empty. This is the first thing to check if no data appears.

### What consent-exempt does _not_ mean

Consent is not required; **transparency still is**. GDPR Art. 13 applies to this
processing regardless of the ePrivacy question, and the legal basis is legitimate
interest in understanding how the site is used. Two things must therefore stay
true:

1. The privacy/cookie policy the footer links to must say that anonymous,
   cookieless usage statistics are collected, and name PostHog as the processor.
2. Nothing a visitor typed may ever be sent (see below).

PostHog computes the cookieless hash at ingestion from
`hash(team_id, daily_salt, ip, user_agent, hostname)` — all of it from the
request, none of it from the client — so the denylist below cannot break it.
GeoIP enrichment is unavailable in cookieless mode anyway, which leaves the stored
`$ip` as the last identifier-shaped field; **Discard client IP data** in the
project settings removes it, though it is worth confirming with PostHog that the
setting runs after the hash rather than before.

### What is deliberately NOT sent

- **No identity.** No email, no name, no `identify()`, no person profiles.
- **Nothing typed.** Not the waitlist form's name / email / company / position,
  and not the docs search query — `docs_search_opened` counts the _act_ of
  searching, and the waitlist reports only the shape of the submission
  (`newsletter: true|false`, and an HTTP status when it fails).
- **No query strings.** `sanitize_properties` strips them from `$current_url`,
  `$initial_current_url`, `$referrer` and `$initial_referrer`. `$current_url`
  rides on _every_ event, not just pageviews, and the playground's share links
  carry a preset payload. Campaign parameters still arrive as PostHog's own
  `$utm_*` properties, so attribution is unaffected.
- **No copied code, no link URLs.** `code_copied` sends the language;
  `outbound_link_clicked` sends the destination _host_.
- **Nothing the script asks the device for.** `property_denylist` drops
  `$screen_width/height`, `$viewport_width/height`, `$timezone` and
  `$timezone_offset`. This is the sharpest line in the design: Art. 5(3) bites on
  _gaining access to information stored in the terminal equipment_, and these are
  the only properties the SDK obtains by interrogating the device rather than by
  reading what the browser already sent. Without them, nothing in the payload
  comes from the device at all.
- **Nothing the request already carried.** `$raw_user_agent` and
  `$browser_language` are dropped as redundant — the UA and `Accept-Language`
  reach PostHog as headers regardless, and `$browser`, `$os`, `$device_type` and
  `$browser_language_prefix` carry the same answers at a fraction of the entropy.

What is left is `$browser` / `$browser_version` / `$os` / `$os_version` /
`$device_type` / `$browser_language_prefix`, the referrer host and the sanitized
URL — low-cardinality buckets derived from headers the browser sends in the
ordinary course of the request. "Which browsers and devices read the docs?" stays
answerable; "which visitor is this?" does not.

---

## The catalogue is the point

[`events.ts`](./events.ts) lists **every** event with a one-line description, and
`track()` only accepts an `EventName` — a typo is a compile error, so the
vocabulary in the dashboard cannot drift from the code.

It is also the only way to answer **"what is nobody using?"** PostHog can show
the names that _arrived_; it cannot show the ones that never did. Diff a
breakdown of received events against `EVENT_NAMES`.

### Adding an event

Add its name + description to `EVENTS`, then call `track('name')` at the one
place the visitor actually triggers it.

---

## Two ways to fire an event, and when to use which

Most of the landing sections are **not hydrated** — Astro renders them to HTML
and ships no JavaScript for them. An `onClick` on such a section is dropped at
build time and its event silently never fires. (`sdk_section_viewed`,
`sdk_logo_clicked` and `connect_phone_cta_clicked` were in exactly that state
before this was written down.)

| The element lives in…                                 | Use                                                         |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| a hydrated island (`client:load` / `client:visible`)  | `track('name', props)`                                      |
| static markup, or markup you would rather not hydrate | `trackingAttributes('name', props)` spread onto the element |

`trackingAttributes` renders `data-ph-event` / `data-ph-<prop>` attributes, which the
delegated listener in `site-analytics.astro` picks up on any click. No hydration,
no extra JavaScript per section.

---

## Volume

Everything here is click- or navigation-driven, so there is nothing to coalesce.
The two exceptions are guarded:

- **Scroll depth** reports each of 25 / 50 / 75 / 100% once per page load, from a
  fixed 250 ms window (not a debounce — a long scroll would otherwise keep
  resetting the timer and never report). Pages with less than 400 px of scroll
  are skipped: every threshold would be crossed on load and the number would mean
  nothing.
- **Demo video progress** uses `trackFirstTimeOnly`, so a looping video reports each
  quartile once.

`autocapture` stays off. It is the one setting that would turn traffic into
volume, and everything it would buy is already in the catalogue.

---

## Configuration

| Where       | Value                                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project key | Defaulted in [`config.ts`](../../config.ts) (public, write-only — the same key Pulsar Studio and PulsarApp use). Override with `PUBLIC_POSTHOG_KEY`.  |
| Host        | `https://us.i.posthog.com`. Override with `PUBLIC_POSTHOG_HOST`.                                                                                      |
| Dev         | **Off.** `posthog.astro` renders nothing unless `import.meta.env.PROD`, so `astro dev` never moves the numbers and `window.posthog` is simply absent. |

### Telling the surfaces apart

Every event carries `app: 'pulsar-docs'` and one of the three `surface` values.
Pulsar Studio (the application) sets `app: 'pulsar-studio'`; PulsarApp sets
neither, so `app is not set` isolates it.

---

## Checking it end to end

Analytics is off in `astro dev`, so a real check needs a production build pointed
at a host you can watch:

```bash
PUBLIC_POSTHOG_HOST=http://localhost:9999 PUBLIC_POSTHOG_KEY=phc_stub npm run build
```

Serve `dist/` under `/pulsar` from the same host and have it answer
`/static/array.js` with a copy of PostHog's real `array.js` (otherwise the SDK
never loads and nothing is exercised). Log the POSTs to `/e/`: each body is
base64'd gzip JSON with a `batch` of events. Then confirm in the console that
`document.cookie` holds no PostHog key and that both storages are empty.

Two things will bite during a manual check:

- PostHog defers its initial `$pageview` until `document.visibilityState` is
  `visible`. A headless or backgrounded tab sends `$pageleave` but no
  `$pageview`.
- The waitlist form posts to the real server. Stub `window.fetch` before
  submitting, or a test run becomes a real subscriber.
