import type { Settings } from '../../shared/types';

export default function LivePreviewPanel({
  settings,
  onChange,
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
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    onChange({ ...settings, [k]: v });

  return (
    <div className="col" style={{ padding: 12, gap: 6 }}>
      <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>Live preview</div>
      <p className="muted" style={{ margin: 0, fontSize: 'var(--fs-xs)' }}>
        Opens the current design in the standalone preview app, embedded as a
        prototype, and plays the bound haptics when you tap an element.
      </p>

      <div className="muted" style={{ fontSize: 'var(--fs-2xs)', marginTop: 4 }}>
        File key override (optional) — paste this file’s share URL or key. Only
        needed if the file key can’t be read automatically.
      </div>
      <input
        type="text"
        placeholder="https://www.figma.com/design/<key>/…"
        value={settings.fileKeyOverride}
        onChange={(e) => set('fileKeyOverride', e.target.value)}
      />

      <div className="row" style={{ gap: 6, marginTop: 6 }}>
        <button className="primary" style={{ flex: 1 }} onClick={onShowLivePreview}>
          Show in live preview
        </button>
        <button className="ghost" onClick={onCopyShareLink}>
          Copy share link
        </button>
      </div>
      <button className="ghost" onClick={onShowQrCode}>
        Show QR code
      </button>

      {qrDataUrl && (
        <div className="col" style={{ alignItems: 'center', gap: 6, marginTop: 8 }}>
          <img
            src={qrDataUrl}
            alt="Scan to open the live preview on your phone"
            style={{ width: 220, height: 220, borderRadius: 4, background: '#fff' }}
          />
          <span className="muted" style={{ fontSize: 'var(--fs-2xs)', textAlign: 'center' }}>
            Scan with your phone’s camera to open the live preview.
          </span>
          <button className="ghost" onClick={onClearQr}>
            Hide QR code
          </button>
        </div>
      )}
    </div>
  );
}
