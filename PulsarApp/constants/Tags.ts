export const TagsInfo = [
  {
    groupName: 'Intensity',
    tags: [
      {
        name: 'Gentle',
        description: 'Haptics with low amplitude — barely perceptible vibration that stays in the background.',
        usage: 'Good for subtle confirmations, hover effects, or any interaction where the feedback should not interrupt the user. Common situations: cursor hover, background sync, silent notification, passive scroll boundary nudge, accessibility hints.',
      },
      {
        name: 'Substantial',
        description: 'Haptics with medium amplitude — a clear, balanced vibration that is easy to notice without being disruptive.',
        usage: 'Ideal for most standard UI interactions such as button presses, toggles, or form confirmations. Common situations: button tap, toggle switch, form validation, menu item selection, pull-to-refresh trigger.',
      },
      {
        name: 'Bold',
        description: 'Haptics with high amplitude — a strong, attention-commanding vibration that is immediately felt.',
        usage: 'Best for critical alerts, error states, or high-impact moments that require the user\'s immediate attention. Common situations: payment failure, security alert, authentication error, destructive action confirmation, game hit or collision.',
      },
    ],
  },
  {
    groupName: 'Sharpness',
    tags: [
      {
        name: 'Soft',
        description: 'Haptics with low frequency — a smooth, rounded vibration with a gentle, cushioned feel.',
        usage: 'Perfect for calm, ambient feedback, wellness interactions, or any context where a soft touch is preferred. Common situations: sleep reminder, gentle onboarding hint, ambient soundscape interaction.',
      },
      {
        name: 'Flexible',
        description: 'Haptics with medium frequency — a balanced vibration that sits between soft and rigid.',
        usage: 'Suitable for general-purpose UI feedback, notifications, and interactions that need a neutral tactile character. Common situations: incoming message, push notification, content scroll snap, date picker tick, standard in-app alert.',
      },
      {
        name: 'Rigid',
        description: 'Haptics with high frequency — a crisp, precise vibration with a sharp, mechanical feel.',
        usage: 'Great for snappy UI elements, keyboard-like taps, or any interaction that should feel precise and definitive. Common situations: virtual keyboard key press, numeric keypad tap, rotary dial click, picker wheel snap, PIN entry digit confirmation.',
      },
    ],
  },
  {
    groupName: 'Shape',
    tags: [
      {
        name: 'Peak',
        description: 'Haptics with a single amplitude peak — a quick rise and fall in intensity.',
        usage: 'Ideal for single-event feedback, such as button presses or selection confirmations. Common situations: like or heart button tap, photo shutter release, item selection confirmation, swipe action completion, quick reply send.',
      },
      {
        name: 'Impulses',
        description: 'Haptics with a discrete pattern — short, distinct pulses separated by silence.',
        usage: 'Useful for click-like feedback, Morse-style cues, or sequences of distinct tactile events. Common situations: step counter tick, quantity increment, metronome cue, item added to cart, typing indicator in chat.',
      },
      {
        name: 'Solid',
        description: 'Haptics with a long continuous pattern at a constant amplitude — a steady, uniform vibration.',
        usage: 'Good for indicating ongoing processes, loading states, or sustained alerts that need consistent presence. Common situations: file upload or download in progress, active voice recording, hold-to-confirm gesture, persistent alarm, live activity tracking.',
      },
      {
        name: 'Bumps',
        description: 'Haptics with multiple amplitude peaks — a series of rhythmic rises and falls.',
        usage: 'Perfect for multi-step feedback, rhythmic notifications, or interactions that need a repeating pulse feel. Common situations: in-app achievement or badge unlock, multi-item batch selection, dice roll, streak milestone reached, coin or reward collection.',
      },
      {
        name: 'Saw',
        description: 'Haptics with a sawtooth-shaped amplitude pattern — a sharp rise followed by an abrupt drop, or vice versa.',
        usage: 'Effective for mechanical-feeling interactions, ratchet effects, or any feedback with a sharp, asymmetric edge. Common situations: ratchet scroll, slot machine reel spin, rotary dial simulation, drag-and-drop snap into position, file shredding animation.',
      },
      {
        name: 'Pattern',
        description: 'Haptics with a custom, often repeating amplitude pattern — a structured sequence that defines a unique rhythm.',
        usage: 'Best for branded feedback signatures, complex notifications, or effects that carry a recognizable tactile identity. Common situations: branded notification signature, custom incoming call alert, game character footstep cycle, sound-to-haptic mapping, recurring rhythm in a music app.',
      },
      {
        name: 'Ramp',
        description: 'Haptics with a ramp-shaped amplitude pattern — amplitude increases or decreases linearly over the duration.',
        usage: 'Suited for fade-in or fade-out effects, swipe feedback, or any interaction that should feel like a gradual build or release. Common situations: volume or brightness slider, swipe-to-dismiss gesture, pinch zoom, countdown timer nearing zero, pull-down refresh building tension.',
      },
    ],
  },
  {
    groupName: 'Duration',
    tags: [
      {
        name: 'Impulse',
        description: 'Extremely short haptic lasting less than 100 ms — an instantaneous tactile click.',
        usage: 'Best for keyboard taps, quick confirmations, or any interaction that requires an instant, minimal response. Common situations: virtual keyboard key press, quick tap micro-interaction, toggle switch flip, checkbox tick, cursor click simulation.',
      },
      {
        name: 'Short',
        description: 'Brief haptic lasting between 100 ms and 250 ms — long enough to be clearly felt without lingering.',
        usage: 'Ideal for button presses, toggle switches, and standard UI element interactions. Common situations: primary action button press, navigation tab switch, swipe gesture acknowledgement, photo filter selection, card flip or reveal.',
      },
      {
        name: 'Extended',
        description: 'Medium-length haptic lasting between 250 ms and 600 ms — provides richer, more expressive feedback.',
        usage: 'Good for notifications, multi-step confirmations, or interactions that benefit from a more deliberate tactile moment. Common situations: incoming push notification, payment or purchase success, pull-to-refresh completion, form submission success, app rating prompt.',
      },
      {
        name: 'Long',
        description: 'Prolonged haptic lasting 600 ms or more — creates an immersive, sustained tactile experience.',
        usage: 'Best for complex animations, gaming effects, elaborate alerts, or experiences where the haptic plays a central role. Common situations: in-app achievement or level completion, onboarding celebration, game victory screen, subscription or reward unlock, end-of-session summary celebration.',
      },
    ],
  },
];
