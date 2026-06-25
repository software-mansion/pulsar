// Single source of truth for the onboarding tour and the Help tab's Q&A. Both
// the first-run carousel (OnboardingOverlay) and the FAQ accordion
// (OnboardingPanel) read from here, so the "how do I…" copy never drifts
// between the two surfaces.

// One step of the first-run carousel. `gif` is the (eventual) animated demo for
// the step - left undefined for now so the overlay renders a labelled
// placeholder box. Drop a built asset import here to light it up:
//   import gifConnectPreset from '../assets/onboarding-connect-preset.gif';
//   gif: gifConnectPreset
export interface OnboardingStep {
  id: string;
  title: string;
  // Short, single-idea explanation shown under the demo. One concept per step
  // keeps the tour skimmable (progressive disclosure).
  body: string;
  // Caption shown inside the placeholder until a real GIF is wired in.
  gifPlaceholder: string;
  gif?: string;
}

// Intro screen shown first in the tour (not part of the FAQ - it's a greeting,
// not a how-to). Kept here so all onboarding copy lives in one place.
export const WELCOME = {
  title: 'Welcome to the Pulsar Figma plugin',
  body: "Let's start a quick tour of the plugin's features."
};

// Closing screen shown after the feature steps - a send-off, also not a FAQ.
export const OUTRO = {
  title: "You're all set!",
  body: "Go make something that feels great. Good luck - we can't wait to feel what you build."
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'bind-preset',
    title: 'Connect a preset to a component',
    body: 'Open the Presets tab, pick a haptic, then select a layer or component on the canvas and hit Bind. Pulsar attaches the preset to that node so it fires whenever the component is tapped in a preview.',
    gifPlaceholder: 'Binding a preset to a component'
  },
  {
    id: 'live-preview',
    title: 'Connect a live preview',
    body: 'On the Live preview tab, paste your Figma file link and scan the QR code with the Pulsar mobile app. Your prototype runs on the phone and plays real haptics as you tap the components you bound.',
    gifPlaceholder: 'Pairing a phone for live preview'
  },
  {
    id: 'share-design',
    title: 'Share a design with a developer',
    body: 'Open the Share tab and publish a share link. Developers open it to feel every bound haptic and copy ready-to-use SDK code for iOS, Android, React Native and more - no Figma access required.',
    gifPlaceholder: 'Sharing a design with a developer'
  }
];

// One Q&A entry for the Help tab accordion.
export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

// The FAQ leads with the three tour steps (rephrased as questions, same copy as
// the carousel) so the Help tab fully restates the onboarding, then adds the
// follow-up questions the tour doesn't cover.
export const FAQ: FaqEntry[] = [
  {
    id: 'what-is-pulsar',
    question: 'What is Pulsar?',
    answer:
      'Pulsar lets you design haptics right in Figma. Attach vibration presets to your components, feel them on a real device through a live preview, and hand developers a shareable link with ready-to-use SDK code.'
  },
  ...ONBOARDING_STEPS.map<FaqEntry>((step) => ({
    id: step.id,
    question: `How do I ${step.title[0].toLowerCase()}${step.title.slice(1)}?`,
    answer: step.body
  })),
  {
    id: 'custom-presets',
    question: 'Can I create my own presets?',
    answer:
      'Yes. On the Presets tab use "Add custom preset" to paste a custom haptic pattern as JSON. Your custom presets appear at the top of the list and can be bound just like the built-in ones.'
  },
  {
    id: 'tags',
    question: 'What do the tags on presets mean?',
    answer:
      'Tags describe a preset along four dimensions - Intensity, Sharpness, Shape and Duration. Tap them to filter the list, or open the Tags guide from the Presets tab for a full explanation of each one.'
  },
  {
    id: 'phone-not-connecting',
    question: 'My phone won’t connect - what should I check?',
    answer:
      'Make sure you pasted a valid Figma file link on the Live preview tab, that the Pulsar app is updated, and that the phone has a working internet connection. Re-scan the QR code if the pairing times out.'
  },
  {
    id: 'get-the-app',
    question: 'Where do I get the mobile app?',
    answer:
      'The Pulsar app is on the App Store and Google Play. You can grab it from the QR codes on the Live preview tab, or search for "Pulsar" in your store.'
  }
];

// Resource links surfaced on the Help tab. Update these once the public Figma
// file and example app are live (placeholders point at sensible defaults).
export const FIGMA_DESIGN_URL =
  'https://www.figma.com/community/file/pulsar-onboarding-example';
export const EXAMPLE_APP_URL = 'https://docs.swmansion.com/pulsar/figma-preview/';
export const SUPPORT_EMAIL = 'projects@swmansion.com';
