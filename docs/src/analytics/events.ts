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
  studio_section_learn_more_clicked: 'The Studio teaser led to the Studio landing page',
  studio_section_open_studio_clicked: 'The Studio teaser led straight into the Studio app',

  // --- Studio landing page (/studio/) --------------------------------------
  studio_landing_cta_clicked: 'An "Open Pulsar Studio" CTA was clicked (which one, as `location`)',
  studio_landing_haptic_played: 'A hero emoji tile played its haptic',
  studio_landing_demo_played: 'The product demo video started playing',
  studio_landing_demo_progress: 'The demo video passed 25 / 50 / 75 / 100% for the first time',
  studio_landing_docs_link_clicked: 'The page sent the visitor into the docs',

  // --- Figma plugin landing page (/plugin-for-figma/) ----------------------
  figma_landing_cta_clicked:
    'An "Install from Figma Community" CTA was clicked (which one, as `location`)',
  figma_landing_how_it_works_clicked: 'The hero CTA jumped down to the how-it-works steps',
  figma_landing_haptic_played: 'A hero emoji tile played its haptic',
  figma_landing_app_store_clicked: 'A companion-app store link was clicked (`store`)',
  figma_landing_docs_link_clicked: 'The page sent the visitor into the plugin docs',

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
