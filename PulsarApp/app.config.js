// app.config.js - extends app.json with dynamic config (e.g., environment variables)
// PostHog keys are read from .env at build time and exposed via expo-constants
const appJson = require('./app.json')

export default {
  ...appJson.expo,
  owner: "piaskowyk",
  extra: {
    eas: {
      projectId: "a0480f36-5519-450f-8836-8ae64b1a9ef1",
    },
    posthogApiKey: process.env.POSTHOG_API_KEY,
    posthogHost: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
  },
}
