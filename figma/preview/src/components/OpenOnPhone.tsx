import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// Sidebar footer that lets the user open this exact preview in the Pulsar mobile
// app: a QR encoding the app's deep link (carrying the same share token as this
// page). Scanning it on a phone with the Pulsar app installed routes straight
// into the in-app Figma WebView so the real device haptics fire on tap.
// Tapping the QR enlarges it in a centered overlay so it's easier to scan.
export function OpenOnPhone({ deepLink }: { deepLink: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Render at a generous resolution so the enlarged overlay stays crisp; the
    // footer just downscales the same image.
    QRCode.toDataURL(deepLink, {
      margin: 1,
      width: 360,
      errorCorrectionLevel: 'L',
      // Navy modules on white, matching the app's palette.
      color: { dark: '#001a72', light: '#ffffff' }
    })
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

  // Close the enlarged view on Escape.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  // Don't render the section until the QR is ready (avoids an empty box flash).
  if (!qr) return null;

  return (
    <div className="open-on-phone">
      <div className="open-on-phone-text">
        <div className="open-on-phone-title">Open on your phone</div>
        <p>Scan with the Pulsar app to feel the real haptics on your device.</p>
      </div>
      <button
        className="open-on-phone-qr"
        onClick={() => setExpanded(true)}
        title="Tap to enlarge"
        aria-label="Enlarge QR code"
      >
        <img src={qr} alt="QR code to open this preview in the Pulsar app" width={96} height={96} />
      </button>

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
