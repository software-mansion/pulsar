import styles from './LivePreviewPanel.module.css';
import type { Settings } from '../../shared/types';
import iconExternalLink from '../assets/icon-external-link.svg';
import iconLink from '../assets/icon-link.svg';
import iconGlobe from '../assets/icon-globe.svg';
import iconLock from '../assets/icon-lock.svg';
import DemoVideo from './DemoVideo';
import { ONBOARDING_VIDEOS } from '../lib/onboardingMedia';

// Share tab - the hand-off / sharing surface. The file key, phone pairing, and
// the server-sync status all live in the Live preview tab now; this tab is just
// link visibility + the two share actions (copy link / open in browser).
//
// `settings` / `onChange` are unused today but kept on the signature so the
// dev-only override inputs can be reintroduced behind a flag without a
// prop-list change.
export default function LivePreviewPanel({
  isPublic,
  isShared,
  onToggleVisibility,
  onShowLivePreview,
  onCopyShareLink
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
  // Whether the share link is currently public (anyone with the link can view).
  isPublic: boolean;
  // Whether this file has been shared yet (has a server token). The visibility
  // toggle is meaningless - and disabled - until then.
  isShared: boolean;
  onToggleVisibility: (next: boolean) => void;
  onShowLivePreview: () => void;
  onCopyShareLink: () => void;
}) {
  return (
    <div className={`col ${styles['preview-panel']}`}>
      <div>
        <div className="panel-title">Share</div>
        <p className={`muted ${styles['preview-intro']}`}>
          Useful for handing the design off to a developer to implement the
          haptics in your app, or sharing it with anyone - they can open the live
          preview in a browser and feel every bound haptic.
        </p>
      </div>

      {/* The same clip the onboarding carousel uses for its "Share a design with
          a developer" step - shows the copy-link → open-in-browser hand-off. */}
      <DemoVideo src={ONBOARDING_VIDEOS.share} caption="How sharing a design works" />

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

      {/* Share actions on one row: copy the link (primary, left) is the main
          hand-off path; open in browser (secondary, right) previews it here. */}
      <div className={`row ${styles['preview-actions-row']}`}>
        <button
          className={`primary ${styles['preview-action']}`}
          onClick={onCopyShareLink}
          title="Copy the share link to the clipboard"
        >
          <img src={iconLink} alt="" width={14} height={14} />
          <span>Copy link</span>
        </button>
        <button
          className={`ghost ${styles['preview-action']}`}
          onClick={onShowLivePreview}
          title="Open the live preview in this browser"
        >
          <img src={iconExternalLink} alt="" width={14} height={14} />
          <span>Open in browser</span>
        </button>
      </div>
    </div>
  );
}
