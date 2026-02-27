// app.config.js - extends app.json with dynamic config (e.g., environment variables)
// PostHog keys are read from .env at build time and exposed via expo-constants
const appJson = require('./app.json')

export default {
  ...appJson.expo,
  extra: {
    posthogApiKey: process.env.POSTHOG_API_KEY,
    posthogHost: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
  },
}
