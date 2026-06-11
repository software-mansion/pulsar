import type { Settings } from '../../shared/types';
import type { SyncStatus } from '../App';
import iconExternalLink from '../assets/icon-external-link.svg';
import iconLink from '../assets/icon-link.svg';
import iconQrCode from '../assets/icon-qr-code.svg';
import iconKey from '../assets/icon-key.svg';
import iconClose from '../assets/icon-close.svg';
import iconGlobe from '../assets/icon-globe.svg';
import iconLock from '../assets/icon-lock.svg';
import iconRefresh from '../assets/icon-refresh.svg';

// Live preview tab. Share paths with clear visual hierarchy:
//   - Primary CTA: open the preview in the browser (most direct, taps the
//     current device immediately).
//   - Two equal secondaries: copy the share link (paste into chat / phone) or
//     show a QR code (scan with phone camera).
//   - One full-width tertiary: copy just the share token — handy for pasting
//     into other figma-preview URLs (e.g. local dev) or sharing the raw token
//     without a particular host.
// The previously-exposed "File key override" / "Preview base URL override"
// inputs are deliberately gone from the UI — they're still honoured if set
// programmatically on the Settings object (the consumers in App.tsx haven't
// changed), but they're advanced/dev knobs, not user-facing.
//
// Props is intentionally a superset of what we now render so the parent
// (App.tsx) doesn't need wholesale prop-list changes. `settings` and
// `onChange` are unused here today but kept on the signature so the inputs
// can be reintroduced behind a flag without another round-trip.
// Copy + dot colour for each sync state. The dot colour reuses the design
// tokens so the pill sits in the same palette as the rest of the plugin.
const SYNC_META: Record<SyncStatus, { label: string; dot: string; pulse?: boolean }> = {
  idle: { label: 'Not shared yet', dot: 'var(--color-blue-20)' },
  syncing: { label: 'Syncing…', dot: 'var(--color-blue-50)', pulse: true },
  synced: { label: 'Synced with server', dot: '#1ea672' },
  unsynced: { label: 'Unsynced changes', dot: 'var(--color-yellow-60)' },
  error: { label: 'Sync failed — will retry', dot: '#d2392b' }
};

export default function LivePreviewPanel({
  syncStatus,
  onSyncNow,
  isPublic,
  isShared,
  onToggleVisibility,
  onShowLivePreview,
  onCopyShareLink,
  onCopyShareToken,
  onShowQrCode,
  qrDataUrl,
  onClearQr
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
  syncStatus: SyncStatus;
  onSyncNow: () => void;
  // Whether the share link is currently public (anyone with the link can view).
  isPublic: boolean;
  // Whether this file has been shared yet (has a server token). The visibility
  // toggle is meaningless — and disabled — until then.
  isShared: boolean;
  onToggleVisibility: (next: boolean) => void;
  onShowLivePreview: () => void;
  onCopyShareLink: () => void;
  onCopyShareToken: () => void;
  onShowQrCode: () => void;
  qrDataUrl: string | null;
  onClearQr: () => void;
}) {
  const sync = SYNC_META[syncStatus];
  return (
    <div className="col" style={{ padding: 16, gap: 14 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>Live preview</div>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 'var(--fs-xs)', lineHeight: 1.5 }}>
          Open the current design in the standalone preview app and feel the
          bound haptics when you tap an element.
        </p>
      </div>

      {/* Sync status: a coloured-dot pill plus an on-demand "Sync now" button.
          Bindings auto-save to the server (debounced); this row shows whether
          the shared link is currently up to date and lets the user force it. */}
      <div className="preview-sync-row">
        <span className="preview-sync-pill" title="Whether the shared preview matches your current design">
          <span
            className={`preview-sync-dot${sync.pulse ? ' pulse' : ''}`}
            style={{ background: sync.dot }}
          />
          <span>{sync.label}</span>
        </span>
        <button
          className="ghost icon preview-sync-now"
          onClick={onSyncNow}
          disabled={syncStatus === 'syncing'}
          title="Push the current design to the server now"
          aria-label="Sync now"
        >
          <img
            src={iconRefresh}
            alt=""
            width={16}
            height={16}
            className={syncStatus === 'syncing' ? 'preview-sync-spin' : undefined}
          />
        </button>
      </div>

      {/* Share-link visibility. When public, anyone with the link can open the
          preview; flip it off to revoke access without losing the share token.
          Any share action below re-opens it. Disabled until the file has been
          shared at least once (no server row to gate yet). */}
      <div className={`preview-visibility-row${isShared ? '' : ' disabled'}`}>
        <img
          src={isPublic ? iconGlobe : iconLock}
          alt=""
          width={16}
          height={16}
          style={{ flexShrink: 0, marginTop: 1 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>
            {isPublic ? 'Anyone with the link can view' : 'Link is private'}
          </div>
          <p
            className="muted"
            style={{ margin: '2px 0 0', fontSize: 'var(--fs-xs)', lineHeight: 1.45 }}
          >
            {isShared
              ? isPublic
                ? 'Turn off to revoke the link. Sharing again re-opens it.'
                : 'The share link won’t work until you share the preview again.'
              : 'Share the preview first to control who can access the link.'}
          </p>
        </div>
        <input
          type="checkbox"
          className="switch"
          checked={isPublic}
          disabled={!isShared}
          onChange={(e) => onToggleVisibility(e.target.checked)}
          title={
            isShared
              ? isPublic
                ? 'Make the share link private'
                : 'Make the share link public'
              : 'Share the preview first'
          }
          aria-label="Anyone with the link can view"
        />
      </div>

      {/* Primary action — full-width, icon-prefixed. */}
      <button
        className="primary preview-cta"
        onClick={onShowLivePreview}
        title="Open the live preview in this browser"
      >
        <img src={iconExternalLink} alt="" width={16} height={16} />
        <span>Open in browser</span>
      </button>

      {/* Secondary actions — two equal columns. */}
      <div className="row preview-secondary-row">
        <button
          className="ghost preview-secondary"
          onClick={onCopyShareLink}
          title="Copy the share link to the clipboard"
        >
          <img src={iconLink} alt="" width={14} height={14} />
          <span>Copy link</span>
        </button>
        <button
          className="ghost preview-secondary"
          onClick={onShowQrCode}
          title="Show a QR code that opens the preview on your phone"
        >
          <img src={iconQrCode} alt="" width={14} height={14} />
          <span>QR code</span>
        </button>
      </div>

      {/* Tertiary action — full-width, raw token only. Useful for pasting the
          token into a different host (local-dev preview, debug tooling) without
          the full URL boilerplate. */}
      <button
        className="ghost preview-tertiary"
        onClick={onCopyShareToken}
        title="Copy just the share token (no URL) to the clipboard"
      >
        <img src={iconKey} alt="" width={14} height={14} />
        <span>Copy share token</span>
      </button>

      {qrDataUrl && (
        /*
         * Mirrors the docs Connection.tsx codebox: a white card (the docs
         * .content layer) wrapping a blue-10 inner panel (.codebox) that
         * holds a centred prompt above the QR. The close affordance is a
         * small square button in the codebox's top-right corner — same
         * placement and ergonomics as the docs widget. The QR's own
         * lightColor matches the codebox fill (set in App.tsx) so the
         * modules blend seamlessly into the panel.
         */
        <div className="preview-qr-card">
          <div className="preview-qr-box">
            <button
              className="preview-qr-close"
              onClick={onClearQr}
              title="Hide QR code"
              aria-label="Hide QR code"
            >
              <img src={iconClose} alt="" width={14} height={14} />
            </button>
            <div className="preview-qr-prompt">
              Scan with your phone to open the live preview
            </div>
            <div className="preview-qr-wrap">
              <img
                src={qrDataUrl}
                alt="Scan to open the live preview on your phone"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
