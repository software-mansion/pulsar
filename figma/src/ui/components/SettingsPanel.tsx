import type { Settings } from '../../shared/types';

export default function SettingsPanel({
  settings,
  onChange
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
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
          checked={settings.compactLayout}
          onChange={(e) => set('compactLayout', e.target.checked)}
        />
        <span>Compact preset layout</span>
      </label>
    </div>
  );
}
