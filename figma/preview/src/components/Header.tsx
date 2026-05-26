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
      <span className="dot" />
      <span className="brand">Pulsar</span>
      <span className="status">{status}</span>
      <span className="pill">
        <b>{count}</b> with haptics
      </span>
      <button className="fs-btn" onClick={onEnterFullscreen} title="Fullscreen (content only)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Fullscreen
      </button>
    </header>
  );
}
