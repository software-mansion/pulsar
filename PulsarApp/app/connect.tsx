import { Redirect } from 'expo-router';

// Deep-link landing route for pairing QRs (`pulsarapp://connect?code=…&name=…`).
// The pairing code itself is consumed by ConnectionsProvider's URL listener
// (mounted above the navigator, so it fires regardless of route); this route
// just needs to exist so the link resolves instead of showing "Unmatched Route",
// and then drops the user on Home where the new connection appears. Using the
// `connect` host (registered in app.config.js's Android intent filters) keeps
// the QR working on both Android and iOS.
export default function ConnectRoute() {
  return <Redirect href="/" />;
}
