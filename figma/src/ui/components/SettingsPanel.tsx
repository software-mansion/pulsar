import type { Settings } from '../../shared/types';

export default function SettingsPanel({
  settings,
  onChange,
  onShowLivePreview
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
  onShowLivePreview: () => void;
}) {
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    onChange({ ...settings, [k]: v });

  return (
    <div className="col" style={{ padding: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>Settings</div>

      <label className="row">
        <input
          type="checkbox"
          checked={settings.soundInEdit}
          onChange={(e) => set('soundInEdit', e.target.checked)}
        />
        <span>Play audio in edit mode</span>
      </label>
      <p className="muted" style={{ margin: '-4px 0 4px 22px', fontSize: 'var(--fs-2xs)' }}>
        Uses Web Audio inside the plugin window when you select a bound node.
      </p>

      <label className="row">
        <input
          type="checkbox"
          checked={settings.soundInPreview}
          onChange={(e) => set('soundInPreview', e.target.checked)}
        />
        <span>Play audio in prototype/preview mode</span>
      </label>
      <p className="muted" style={{ margin: '-4px 0 4px 22px', fontSize: 'var(--fs-2xs)' }}>
        Attaches a hidden video fill so prototype playback can produce sound on tap.
      </p>

      <label className="row">
        <input
          type="checkbox"
          checked={settings.compactLayout}
          onChange={(e) => set('compactLayout', e.target.checked)}
        />
        <span>Compact preset layout</span>
      </label>

      <hr />

      <div className="col" style={{ gap: 4 }}>
        <div className="muted" style={{ fontSize: 'var(--fs-xs)' }}>
          Preview-mode video URL (placeholder until per-preset videos exist)
        </div>
        <input
          type="url"
          value={settings.videoPreviewUrl}
          onChange={(e) => set('videoPreviewUrl', e.target.value)}
        />
      </div>

      <hr />

      <div className="col" style={{ gap: 6 }}>
        <div style={{ fontWeight: 600 }}>Live preview</div>
        <div className="muted" style={{ fontSize: 'var(--fs-2xs)' }}>
          Base URL of the standalone preview web app (figma/preview). Opens the
          current design in an embedded prototype and plays bound haptics on tap.
        </div>
        <input
          type="url"
          value={settings.previewBaseUrl}
          onChange={(e) => set('previewBaseUrl', e.target.value)}
        />
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
        <button className="primary" onClick={onShowLivePreview}>
          Show in live preview
        </button>
      </div>
    </div>
  );
}
