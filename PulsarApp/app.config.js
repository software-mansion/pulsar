// app.config.js - dynamic config with environment variables (e.g., PostHog keys from .env)
export default {
  name: "PulsarApp",
  slug: "PulsarApp",
  version: "1.0.2",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "pulsarapp",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.swmansion.pulsar.app",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    package: "com.swmansion.pulsar.app",
    versionCode: 2,
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "pulsarapp",
            host: "connect",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  updates: {
    url: "https://u.expo.dev/a0480f36-5519-450f-8836-8ae64b1a9ef1",
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 0,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  plugins: [
    "expo-updates",
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#E1F3FA",
      },
    ],
    "expo-localization",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  owner: "piaskowyk",
  extra: {
    eas: {
      projectId: "a0480f36-5519-450f-8836-8ae64b1a9ef1",
    },
  },
}
