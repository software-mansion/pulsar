import type { Settings } from '../../shared/types';
import iconExternalLink from '../assets/icon-external-link.svg';
import iconLink from '../assets/icon-link.svg';
import iconQrCode from '../assets/icon-qr-code.svg';
import iconClose from '../assets/icon-close.svg';

// Live preview tab. Three share paths with clear visual hierarchy:
//   - Primary CTA: open the preview in the browser (most direct, taps the
//     current device immediately).
//   - Two equal secondaries: copy the share link (paste into chat / phone) or
//     show a QR code (scan with phone camera).
// The previously-exposed "File key override" / "Preview base URL override"
// inputs are deliberately gone from the UI — they're still honoured if set
// programmatically on the Settings object (the consumers in App.tsx haven't
// changed), but they're advanced/dev knobs, not user-facing.
//
// Props is intentionally a superset of what we now render so the parent
// (App.tsx) doesn't need wholesale prop-list changes. `settings` and
// `onChange` are unused here today but kept on the signature so the inputs
// can be reintroduced behind a flag without another round-trip.
export default function LivePreviewPanel({
  onShowLivePreview,
  onCopyShareLink,
  onShowQrCode,
  qrDataUrl,
  onClearQr
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
  onShowLivePreview: () => void;
  onCopyShareLink: () => void;
  onShowQrCode: () => void;
  qrDataUrl: string | null;
  onClearQr: () => void;
}) {
  return (
    <div className="col" style={{ padding: 16, gap: 14 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>Live preview</div>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 'var(--fs-xs)', lineHeight: 1.5 }}>
          Open the current design in the standalone preview app and feel the
          bound haptics when you tap an element.
        </p>
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
