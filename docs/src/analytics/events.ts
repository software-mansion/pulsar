/** The only events this site sends. See ./README.md. */
export const EVENTS = {
  // --- site-wide -----------------------------------------------------------
  page_scroll_depth: 'A page was scrolled past 25 / 50 / 75 / 100% for the first time',
  outbound_link_clicked: 'A link to another host was clicked (host only, never the full URL)',
  nav_link_clicked: 'A top-bar or mobile-menu destination was chosen',
  code_copied: 'A code block was copied with the copy button',
  docs_search_opened: 'The docs search dialog was opened (the query itself is never sent)',

  // --- landing page --------------------------------------------------------
  see_all_presets_clicked: 'The "See all presets" button under the preset teaser was clicked',
  preset_playground_cta_clicked: 'The hero CTA into the presets playground was clicked',
  docs_cta_clicked: 'The hero CTA into the docs was clicked',
  haptics_demo_interacted: 'A preset in the hero demo was played',
  connect_phone_cta_clicked: 'The "connect your phone" CTA was clicked',
  sdk_section_viewed: 'The SDK section was expanded',
  sdk_logo_clicked: 'A platform logo in the SDK section was clicked',
  app_showcase_store_clicked: 'An App Store / Google Play badge was clicked',
  studio_section_waitlist_clicked: 'The Studio teaser on the landing page led to the waitlist',

  // --- Studio landing page (/studio/) --------------------------------------
  studio_landing_cta_clicked: 'A "Join the waitlist" CTA was clicked',
  studio_landing_haptic_played: 'A hero emoji tile played its haptic',
  studio_landing_demo_played: 'The product demo video started playing',
  studio_landing_demo_progress: 'The demo video passed 25 / 50 / 75 / 100% for the first time',
  studio_landing_docs_link_clicked: 'The "Why Pulsar" section sent the visitor into the docs',
  studio_landing_waitlist_started: 'The first waitlist field was filled in',
  studio_landing_waitlist_submitted: 'The waitlist form was submitted',
  studio_landing_waitlist_succeeded: 'The waitlist submission was accepted by the server',
  studio_landing_waitlist_failed: 'The waitlist submission was rejected or threw',
  studio_landing_waitlist_consent_blocked: 'Submission was blocked by the unchecked consent box',

  // --- presets playground (docs) -------------------------------------------
  preset_played: 'A preset was previewed in the browser',
  preset_played_on_device: 'A preset was sent to a connected phone',
  preset_code_copied: "A preset's code snippet was copied",
  preset_edit_in_studio: 'A preset was opened in Pulsar Studio',
  preset_favourited: 'A preset was added to favourites',
  preset_unfavourited: 'A preset was removed from favourites',
  preset_filter_applied: 'The preset list was filtered',
  preset_sound_enabled: 'Preview sound was turned on',
  preset_sound_disabled: 'Preview sound was turned off',

  // --- web presets playground (docs) ---------------------------------------
  web_preset_played: 'A web preset was previewed',
  web_preset_sound_enabled: 'Web preview sound was turned on',
  web_preset_sound_disabled: 'Web preview sound was turned off',

  // --- phone connection (docs) ---------------------------------------------
  device_connected: 'A phone paired with the playground',
  device_disconnected: 'A paired phone disconnected',
  reset_connection: 'The pairing was reset from the UI',
} as const;

export type EventName = keyof typeof EVENTS;

export const EVENT_NAMES = Object.keys(EVENTS) as EventName[];
