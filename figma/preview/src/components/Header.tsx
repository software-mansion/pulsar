// Copied verbatim from docs/src/assets/logo.svg so the preview ships the same
// brand mark as the marketing site / Figma plugin. Imported as a URL — Vite
// emits a hashed filename and rewrites the path through the app's `base`
// (`./`), so the asset works at any deploy sub-path.
import logoUrl from '../assets/pulsar-logo.svg';
import fullscreenIcon from '../assets/icon-fullscreen.svg';

export function Header({
  status,
  count,
  onEnterFullscreen
}: {
  status: string;
  count: number;
  onEnterFullscreen: () => void;
}) {
  return (
    <header className="header">
      <img className="brand-logo" src={logoUrl} alt="" width={34} height={34} />
      <span className="brand">Pulsar</span>
      <span className="status">{status}</span>
      <span className="pill">
        <b>{count}</b> with haptics
      </span>
      <button className="fs-btn" onClick={onEnterFullscreen} title="Fullscreen (content only)">
        <img src={fullscreenIcon} alt="" width={14} height={14} />
        Fullscreen
      </button>
    </header>
  );
}
