// `pulsar-logo.svg` is a direct copy of docs/src/assets/logo.svg - the same
// brand mark used by the marketing site and the live-preview header. Vite
// inlines it as a base64 data-URI at build time (assetsInlineLimit is set high
// in vite.config.ts), so the plugin's single-file ui.html bundle stays
// single-file.
import logoUrl from '../assets/pulsar-logo.svg';

export default function PulsarLogo({ size = 24 }: { size?: number }) {
  return (
    <img className="pulsar-logo" src={logoUrl} alt="" width={size} height={size} />
  );
}
