const Tags = {
  group1: ['Super short', 'Short', 'Medium long', 'Long'],
  group2: ['Simple', 'Moderate', 'Complex'],
  group3: ['Gentle', 'Noticeable', 'Intense'],
  group4: ['Success', 'Warning', 'Fail', 'Notification', 'Reward', 'Enjoy', 'Interaction'],
  group5: ['Happiness', 'Sadness', 'Neutral', 'Support', 'Celebration', 'Excitement', 'Surprise', 'Fear', 'Satisfaction', 'Relief', 'Boredom', 'Anger'],
  group6: ['Winning', 'Beginning', 'Task Competed', 'Announcement', 'Physical effect'],
  group7: [],
};

export default Tags;

export const GroupNames = {
  group1: 'Duration',
  group2: 'Complexity',
  group3: 'Intensity',
  group4: 'Feedback type',
  group5: 'Emotions',
  group6: 'Special occasions',
};
export const TagsInfo = {
  group1: [
    {
      name: 'Super short',
      description: 'Very short haptics pattern with duration less than 100 ms.',
      usage: 'Good as a reaction for tap events.',
    },
    {
      name: 'Short',
      description: 'Short haptic feedback lasting between 100-500ms. Provides clear tactile response without being overwhelming.',
      usage: 'Perfect for button presses, toggle switches, or confirming user actions. Commonly used in UI interactions.',
    },
    {
      name: 'Medium long',
      description: 'Medium-length haptic patterns lasting 500ms to 2 seconds. Allows for more complex feedback sequences.',
      usage: 'Ideal for notifications, progress indicators, or multi-step interactions. Good for drawing user attention.',
    },
    {
      name: 'Long',
      description: 'Extended haptic experiences lasting over 2 seconds. Can include complex patterns and variations.',
      usage: 'Best for immersive experiences, gaming effects, or elaborate feedback sequences that tell a story.',
    }
  ],
  group2: [
    {
      name: 'Simple',
      description: 'Basic single-pulse haptic feedback. Usually consists of a single vibration event or simple on/off pattern.',
      usage: 'Great for basic confirmations, simple button taps, or minimalist feedback where subtlety is key.',
    },
    {
      name: 'Moderate',
      description: 'Multi-step haptic patterns with variations in intensity or timing. Contains 2-4 distinct haptic events.',
      usage: 'Perfect for notifications with different urgency levels, scroll boundaries, or multi-state feedback.',
    },
    {
      name: 'Complex',
      description: 'Sophisticated haptic sequences with multiple layers, varying intensities, and intricate timing patterns.',
      usage: 'Ideal for immersive gaming experiences, elaborate notifications, or creating unique brand-specific feedback.',
    }
  ],
  group3: [
    {
      name: 'Gentle',
      description: "Soft, subtle haptic feedback that's barely noticeable. Light vibration that doesn't interrupt user focus.",
      usage: 'Perfect for background notifications, hover effects, or accessibility features where subtlety is important.',
    },
    {
      name: 'Noticeable',
      description: 'Moderate haptic strength that clearly communicates feedback without being disruptive or overwhelming.',
      usage: 'Ideal for most UI interactions, form validation, menu navigation, and general app feedback.',
    },
    {
      name: 'Intense',
      description: 'Strong, attention-grabbing haptic feedback that demands immediate user attention and focus.',
      usage: 'Best for critical alerts, error messages, emergency notifications, or high-impact gaming effects.',
    }
  ],
  group4: [
    {
      name: 'Success',
      description: 'Positive confirmation haptic indicating successful completion of an action or positive outcome.',
      usage: 'Use for successful form submissions, completed purchases, achievements unlocked, or tasks finished.',
    },
    {
      name: 'Warning',
      description: 'Cautionary haptic feedback alerting users to potential issues or important information requiring attention.',
      usage: 'Perfect for form validation errors, low battery alerts, or when user action might have consequences.',
    },
    {
      name: 'Fail',
      description: 'Strong negative feedback indicating errors, failures, or critical issues that need immediate attention.',
      usage: 'Use for error messages, failed operations, security alerts, or when something goes wrong.',
    },
    {
      name: 'Notification',
      description: 'General informational haptic feedback for delivering neutral messages or updates to the user.',
      usage: 'Ideal for incoming messages, app updates, reminders, or general information delivery.',
    },
    {
      name: 'Reward',
      description: 'Positive haptic feedback for rewarding user behavior, achievements, or milestone completion.',
      usage: 'Great for gamification elements, streak completions, level ups, or positive reinforcement.',
    },
    {
      name: 'Enjoy',
      description: 'Pleasant, delightful haptic feedback designed to enhance user experience and create positive emotions.',
      usage: 'Perfect for app interactions that should feel fun, engaging animations, or brand experience moments.',
    },
    {
      name: 'Interaction',
      description: 'Responsive haptic feedback for direct user interactions like taps, swipes, or button presses.',
      usage: 'Essential for UI element interactions, providing immediate feedback for user touch events.',
    },
  ],
  group5: [
    {
      name: 'Happiness',
      description: 'Joyful, uplifting haptic patterns that evoke positive feelings and cheerfulness.',
      usage: 'Perfect for celebrations, achievements, positive milestones, or creating delightful user moments.'
    },
    {
      name: 'Sadness',
      description: 'Gentle, melancholic haptic feedback that conveys empathy or reflects somber moments.',
      usage: 'Appropriate for memorial features, condolence messages, or empathetic app responses.'
    },
    { name: 'Neutral', description: "Balanced, non-emotional haptic feedback that doesn't convey specific feelings or moods.", usage: 'Ideal for professional apps, utilitarian interfaces, or when emotional neutrality is preferred.' },
    {
      name: 'Support',
      description: 'Comforting, reassuring haptic patterns that provide emotional support and encouragement.',
      usage: 'Great for wellness apps, meditation guides, encouragement features, or supportive interactions.'
    },
    {
      name: 'Celebration',
      description: 'Festive, party-like haptic feedback designed to enhance celebratory moments and special occasions.',
      usage: 'Perfect for birthdays, anniversaries, victories, party apps, or any celebratory features.'
    },
    { name: 'Excitement', description: 'Energetic, thrilling haptic patterns that build anticipation and convey high energy.', usage: 'Ideal for sports apps, gaming excitement, countdown timers, or high-energy promotional content.' },
    { name: 'Surprise', description: 'Sudden, unexpected haptic feedback that creates moments of pleasant shock or amazement.', usage: 'Great for magic tricks in apps, plot twists, surprise reveals, or unexpected delightful moments.' },
    { name: 'Fear', description: 'Intense, startling haptic patterns designed to create tension or alert users to danger.', usage: 'Suitable for horror games, security alerts, emergency notifications, or thriller app experiences.' },
    { name: 'Satisfaction', description: 'Fulfilling, content haptic feedback that conveys completion and user satisfaction.', usage: 'Perfect for task completion, successful purchases, goal achievements, or satisfying interactions.' },
    { name: 'Relief', description: 'Calming, soothing haptic patterns that provide comfort and ease tension or stress.', usage: 'Ideal for stress-relief apps, problem resolution, or calming interactions.' },
    { name: 'Boredom', description: 'Dull, monotonous haptic feedback reflecting lack of engagement or interest.', usage: 'Useful for representing inactive states, waiting periods, or low-priority background processes.' },
    { name: 'Anger', description: 'Sharp, aggressive haptic patterns that convey frustration, irritation, or strong negative emotions.', usage: 'Appropriate for representing system errors, user frustration, or intense negative feedback scenarios.' },
  ],
  group6: [
    { name: 'Winning', description: 'Triumphant haptic feedback celebrating victories, competitions won, or successful outcomes.', usage: 'Perfect for game victories, contest wins, successful challenges, or achieving competitive goals.' },
    { name: 'Beginning', description: 'Fresh, initiating haptic patterns that mark the start of new experiences, journeys, or processes.', usage: 'Ideal for onboarding flows, app launches, new user experiences, or starting new activities.' },
    { name: 'Task Competed', description: 'Satisfying completion haptic that signals the successful finish of tasks, projects, or goals.', usage: 'Great for productivity apps, project management, task lists, or any completion-based features.' },
    { name: 'Announcement', description: 'Attention-grabbing haptic patterns designed to broadcast important information or updates.', usage: 'Perfect for news apps, important updates, system announcements, or broadcasting features.' },
    { name: 'Physical effect', description: 'Tactile haptic feedback that simulates physical sensations or real-world material interactions.', usage: 'Excellent for AR/VR applications, material design feedback, or creating realistic touch sensations.' },
  ],
};
