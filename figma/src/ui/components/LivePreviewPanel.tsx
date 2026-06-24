import styles from './LivePreviewPanel.module.css';
import type { Settings } from '../../shared/types';
import type { SyncStatus } from '../App';
import iconExternalLink from '../assets/icon-external-link.svg';
import iconLink from '../assets/icon-link.svg';
import iconKey from '../assets/icon-key.svg';
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
  figmaFileKey,
  onFigmaFileKeyChange,
  syncStatus,
  onSyncNow,
  isPublic,
  isShared,
  onToggleVisibility,
  onShowLivePreview,
  onCopyShareLink,
  onCopyShareToken
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
  // The real Figma file key (or share URL) for the embed, remembered per-file.
  figmaFileKey: string;
  onFigmaFileKeyChange: (next: string) => void;
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
}) {
  const sync = SYNC_META[syncStatus];
  return (
    <div className={`col ${styles['preview-panel']}`}>
      <div>
        <div className="panel-title">Live preview</div>
        <p className={`muted ${styles['preview-intro']}`}>
          Open the current design in the standalone preview app and feel the
          bound haptics when you tap an element.
        </p>
      </div>

      {/* The preview embeds the real Figma file (embed.figma.com/proto/<key>),
          but the plugin can't read the file key without the private API, so the
          user pastes the file's share URL (or raw key) here. Required before a
          preview can load. */}
      <div className={styles['preview-filekey']}>
        <label className={styles['preview-filekey-label']} htmlFor="figma-file-key">
          Figma file key
        </label>
        <input
          id="figma-file-key"
          type="text"
          placeholder="Paste this file’s link or key"
          value={figmaFileKey}
          onChange={(e) => onFigmaFileKeyChange(e.target.value)}
        />
        <p className={`muted ${styles['preview-filekey-hint']}`}>
          Saved with this file — enter it once. From Figma use <b>Share → Copy link</b>.
        </p>
      </div>

      {/* Sync status: a coloured-dot pill plus an on-demand "Sync now" button.
          Bindings auto-save to the server (debounced); this row shows whether
          the shared link is currently up to date and lets the user force it. */}
      <div className={styles['preview-sync-row']}>
        <span className={styles['preview-sync-pill']} title="Whether the shared preview matches your current design">
          <span
            className={`${styles['preview-sync-dot']}${sync.pulse ? ` ${styles['pulse']}` : ''}`}
            style={{ background: sync.dot }}
          />
          <span>{sync.label}</span>
        </span>
        <button
          className={`ghost icon ${styles['preview-sync-now']}`}
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
            className={syncStatus === 'syncing' ? styles['preview-sync-spin'] : undefined}
          />
        </button>
      </div>

      {/* Share-link visibility. When public, anyone with the link can open the
          preview; flip it off to revoke access without losing the share token.
          Any share action below re-opens it. Disabled until the file has been
          shared at least once (no server row to gate yet). */}
      <div className={`${styles['preview-visibility-row']}${isShared ? '' : ` ${styles['disabled']}`}`}>
        <img
          src={isPublic ? iconGlobe : iconLock}
          alt=""
          width={16}
          height={16}
          className={styles['preview-visibility-icon']}
        />
        <div className={styles['preview-visibility-main']}>
          <div className={styles['preview-visibility-title']}>
            {isPublic ? 'Anyone with the link can view' : 'Link is private'}
          </div>
          <p className={`muted ${styles['preview-visibility-text']}`}>
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
        className={`primary ${styles['preview-cta']}`}
        onClick={onShowLivePreview}
        title="Open the live preview in this browser"
      >
        <img src={iconExternalLink} alt="" width={16} height={16} />
        <span>Open in browser</span>
      </button>

      {/* Secondary action — copy the share link. The phone-pairing QR now lives
          in the Presets tab's Phone panel (it also carries the playback code),
          so there's no separate preview QR here. */}
      <div className={`row ${styles['preview-secondary-row']}`}>
        <button
          className={`ghost ${styles['preview-secondary']}`}
          onClick={onCopyShareLink}
          title="Copy the share link to the clipboard"
        >
          <img src={iconLink} alt="" width={14} height={14} />
          <span>Copy link</span>
        </button>
      </div>

      {/* Tertiary action — full-width, raw token only. Useful for pasting the
          token into a different host (local-dev preview, debug tooling) without
          the full URL boilerplate. */}
      <button
        className={`ghost ${styles['preview-tertiary']}`}
        onClick={onCopyShareToken}
        title="Copy just the share token (no URL) to the clipboard"
      >
        <img src={iconKey} alt="" width={14} height={14} />
        <span>Copy share token</span>
      </button>
    </div>
  );
}
