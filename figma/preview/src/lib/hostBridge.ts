// Bridge to the native PulsarApp host (react-native-webview).
//
// react-native-webview injects `window.ReactNativeWebView` into the *top-level*
// WebView document only. The docs `/figma-preview` page embeds this app inside
// an `<iframe srcdoc>` (see docs/src/components/preview/Preview.astro), so when
// running there the bridge lives on `window.parent`, not `window`. A srcdoc
// iframe inherits its parent's origin, so reaching up one level is same-origin
// and allowed - this mirrors how `getTokenFromUrl` (lib/payload.ts) forwards
// the parent's query string into the embed.

interface ReactNativeWebView {
  postMessage(message: string): void;
}

// Resolve the native bridge from this window or the parent (srcdoc embed),
// returning undefined when neither is reachable (plain web, cross-origin parent).
export function getHostBridge(): ReactNativeWebView | undefined {
  const own = (window as any).ReactNativeWebView as ReactNativeWebView | undefined;
  if (own) return own;
  try {
    if (window.parent !== window) {
      const parentBridge = (window.parent as any).ReactNativeWebView as
        | ReactNativeWebView
        | undefined;
      if (parentBridge) return parentBridge;
    }
  } catch {
    // Cross-origin parent - no reachable bridge.
  }
  return undefined;
}

// True when running inside the PulsarApp WebView (directly or via the srcdoc
// embed). Authoritative signal for routing taps to native haptics and showing
// the in-app-only nav-bar toggle.
export function isAppHost(): boolean {
  return getHostBridge() !== undefined;
}
