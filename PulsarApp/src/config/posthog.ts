import PostHog from 'posthog-react-native'
import { POSTHOG_CONFIG } from './public'

const apiKey: string | undefined = POSTHOG_CONFIG.apiKey
const host: string | undefined = POSTHOG_CONFIG.host
const isPostHogConfigured = Boolean(apiKey && apiKey !== 'phc_your_api_key_here')

if (__DEV__) {
  console.log('PostHog config:', {
    apiKey: apiKey ? 'SET' : 'NOT SET',
    host,
    isConfigured: isPostHogConfigured,
  })
}

if (!isPostHogConfigured) {
  console.warn(
    'PostHog API key not configured. Analytics will be disabled. ' +
      'Set POSTHOG_CONFIG in src/config/public.ts to enable analytics.'
  )
}

/**
 * PostHog client instance for Expo
 *
 * Configuration loaded from src/config/public.ts.
 * Required peer dependencies: expo-file-system, expo-application,
 * expo-device, expo-localization
 *
 * @see https://posthog.com/docs/libraries/react-native
 */
export const posthog = new PostHog(apiKey || 'placeholder_key', {
  // PostHog API host
  host,

  // Disable PostHog if API key is not configured
  disabled: !isPostHogConfigured,

  // Capture app lifecycle events:
  // - Application Installed, Application Updated
  // - Application Opened, Application Became Active, Application Backgrounded
  captureAppLifecycleEvents: true,

  // Batching: queue events and flush periodically to optimize battery usage
  flushAt: 20,
  flushInterval: 10000,
  maxBatchSize: 100,
  maxQueueSize: 1000,

  // Feature flags
  preloadFeatureFlags: true,
  sendFeatureFlagEvent: true,
  featureFlagsRequestTimeoutMs: 10000,

  // Network settings
  requestTimeout: 10000,
  fetchRetryCount: 3,
  fetchRetryDelay: 3000,
})

export const isPostHogEnabled = isPostHogConfigured
