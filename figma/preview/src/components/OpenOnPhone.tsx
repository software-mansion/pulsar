import { useEffect, useState } from 'react';
import { useEscapeKey } from '../lib/useEscapeKey';
import QRCode from 'qrcode';
import storeApple from '../assets/store-apple.svg';
import storeGoogle from '../assets/store-google.png';
import closeIcon from '../assets/icon-close.svg';

// Public store listings for the Pulsar mobile app (same links the plugin + docs
// use). Shown for visitors who don't have the app installed yet - as tappable
// badges and as scannable download QRs.
const APPLE_STORE_URL = 'https://apps.apple.com/pl/app/haptics-presets-pulsar/id6761362104';
const GOOGLE_STORE_URL = 'https://play.google.com/store/apps/details?id=com.swmansion.pulsar.app';

// Remember the collapsed choice across reloads (the preview refetches/reloads a
// lot) so the panel stays out of the way once the user dismisses it.
const COLLAPSED_KEY = 'pulsar-preview-open-on-phone-collapsed';
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
};

const QR_OPTS = {
  margin: 1,
  width: 240,
  errorCorrectionLevel: 'L' as const,
  // Navy modules on white, matching the app's palette.
  color: { dark: '#001a72', light: '#ffffff' }
};

// Sidebar footer that lets the user open this exact preview in the Pulsar mobile
// app (a QR encoding the deep link with this page's share token), plus a "get
// the app" section for visitors who don't have it yet. Collapsible - once the
// user hides it, it shrinks to a one-line reopener so it doesn't eat sidebar
// space, and the choice persists across reloads.
export function OpenOnPhone({ deepLink }: { deepLink: string }) {
  const [qr, setQr] = useState<string | null>(null);
  // Download-app QRs (one per store) - optional, revealed by a toggle and
  // generated lazily the first time they're shown.
  const [downloadQr, setDownloadQr] = useState<{ apple: string; google: string } | null>(null);
  const [showDownloadQr, setShowDownloadQr] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const setCollapsedPersist = (next: boolean) => {
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
    } catch {
      // Storage unavailable (private mode / embedded) - collapse still works
      // for this session.
    }
  };

  // Open-this-preview QR. Rendered at a generous resolution so the enlarged
  // overlay stays crisp; the footer just downscales the same image.
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(deepLink, { ...QR_OPTS, width: 360 })
      .then((url) => {
        if (!cancelled) setQr(url);
      })
      .catch(() => {
        if (!cancelled) setQr(null);
      });
    return () => {
      cancelled = true;
    };
  }, [deepLink]);

  // Store-download QRs - static, generated lazily the first time the user
  // reveals them.
  useEffect(() => {
    if (collapsed || !showDownloadQr || downloadQr) return;
    let cancelled = false;
    Promise.all([QRCode.toDataURL(APPLE_STORE_URL, QR_OPTS), QRCode.toDataURL(GOOGLE_STORE_URL, QR_OPTS)])
      .then(([apple, google]) => {
        if (!cancelled) setDownloadQr({ apple, google });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [collapsed, showDownloadQr, downloadQr]);

  // Close the enlarged view on Escape.
  useEscapeKey(() => setExpanded(false), expanded);

  // Don't render the section until the QR is ready (avoids an empty box flash).
  if (!qr) return null;

  // Collapsed: a one-line reopener so the panel stops eating sidebar space.
  if (collapsed) {
    return (
      <button
        className="open-on-phone-reopen"
        onClick={() => setCollapsedPersist(false)}
        title="Show the open-on-phone options"
      >
        <img src={qr} alt="" className="open-on-phone-reopen-qr" />
        <span className="open-on-phone-reopen-text">Open on your phone</span>
        <span className="open-on-phone-reopen-cta">Show</span>
      </button>
    );
  }

  return (
    <div className="open-on-phone">
      <div className="open-on-phone-head">
        <span className="open-on-phone-title">Open on your phone</span>
        <button
          className="open-on-phone-hide"
          onClick={() => setCollapsedPersist(true)}
          title="Hide"
          aria-label="Hide the open-on-phone panel"
        >
          <img src={closeIcon} alt="" width={12} height={12} />
        </button>
      </div>

      <div className="open-on-phone-main">
        <p className="open-on-phone-sub">
          Scan with the Pulsar app to feel the real haptics on your device.
        </p>
        <button
          className="open-on-phone-qr"
          onClick={() => setExpanded(true)}
          title="Tap to enlarge"
          aria-label="Enlarge QR code"
        >
          <img src={qr} alt="QR code to open this preview in the Pulsar app" width={96} height={96} />
        </button>
      </div>

      {/* For visitors without the app yet - store badges plus optional scannable
          download QRs (one per platform, since a single QR can't target both
          stores), revealed by a toggle to keep the panel compact. */}
      <div className="open-on-phone-getapp">
        <span className="open-on-phone-getapp-label">Don’t have the Pulsar app yet?</span>
        <div className="open-on-phone-stores">
          <a href={APPLE_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store">
            <img src={storeApple} alt="Download on the App Store" />
          </a>
          <a href={GOOGLE_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play">
            <img src={storeGoogle} alt="Get it on Google Play" />
          </a>
        </div>
        <button
          className="open-on-phone-qr-toggle"
          onClick={() => setShowDownloadQr((v) => !v)}
          aria-expanded={showDownloadQr}
        >
          {showDownloadQr ? 'Hide QR code' : 'Show QR code'}
        </button>
        {showDownloadQr && downloadQr && (
          <div className="open-on-phone-download-qrs">
            <figure className="open-on-phone-download-qr">
              <img src={downloadQr.apple} alt="QR code to download Pulsar on the App Store" />
              <figcaption>iOS</figcaption>
            </figure>
            <figure className="open-on-phone-download-qr">
              <img src={downloadQr.google} alt="QR code to download Pulsar on Google Play" />
              <figcaption>Android</figcaption>
            </figure>
          </div>
        )}
      </div>

      {expanded && (
        <div
          className="qr-overlay"
          onClick={() => setExpanded(false)}
          role="dialog"
          aria-label="QR code to open this preview in the Pulsar app"
        >
          <div className="qr-overlay-card" onClick={(e) => e.stopPropagation()}>
            <img src={qr} alt="QR code to open this preview in the Pulsar app" />
            <p>Scan with the Pulsar app</p>
            <button className="qr-overlay-close" onClick={() => setExpanded(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
