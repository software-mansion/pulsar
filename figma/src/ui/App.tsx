import { useEffect, useMemo, useState } from 'react';
import PRESETS from './presets-data';
import type { CatalogEntry, SelectionInfo, Settings } from '../shared/types';
import { onMessage, send } from './figmaBridge';
import Filters, { applyFilter, useFilterStateInit, type FilterState } from './components/Filters';
import PresetCard from './components/PresetCard';
import PresetDetail from './components/PresetDetail';
import SettingsPanel from './components/SettingsPanel';
import PhonePanel, { broadcastToPhone } from './components/PhonePanel';
import SelectionBar from './components/SelectionBar';
import { playPreset, stopAll } from './audio/AudioPatternUtility';

type Tab = 'presets' | 'phone' | 'settings';

const DEFAULT_SETTINGS: Settings = {
  soundInEdit: true,
  soundInPreview: true,
  compactLayout: false,
  videoPreviewUrl:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
};

export default function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hapticsToken, setHapticsToken] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [tab, setTab] = useState<Tab>('presets');
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>(useFilterStateInit());

  const presetById = useMemo(() => {
    const m = new Map<string, CatalogEntry>();
    for (const p of PRESETS) m.set(p.id, p);
    return m;
  }, []);

  // Wire up the bridge once.
  useEffect(() => {
    const off = onMessage((m) => {
      if (m.type === 'init') {
        setSettings(m.settings);
        setHapticsToken(m.hapticsToken);
      }
      if (m.type === 'selection') setSelection(m.node);
      // play-preset is handled in a separate effect that re-binds when
      // settings/token change, so it always reads fresh values.
    });
    send({ type: 'ui-ready' });
    return off;
    // We intentionally don't depend on settings/hapticsToken — see the play handler effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist settings whenever they change (skip the very first render to avoid
  // overwriting what the main thread loaded).
  const [didInit, setDidInit] = useState(false);
  useEffect(() => {
    if (!didInit) {
      setDidInit(true);
      return;
    }
    send({ type: 'persist-settings', settings });
  }, [settings]);

  useEffect(() => {
    send({ type: 'persist-haptics-token', token: hapticsToken });
  }, [hapticsToken]);

  // The play-preset handler captured stale settings/token on mount. Rebind it on changes.
  useEffect(() => {
    const off = onMessage((m) => {
      if (m.type !== 'play-preset') return;
      const p = presetById.get(m.presetId);
      if (!p) return;
      if (settings.soundInEdit) playPreset(p.id, p.data).catch(() => {});
      if (hapticsToken) broadcastToPhone(hapticsToken, p.data.name);
    });
    return off;
  }, [settings.soundInEdit, hapticsToken, presetById]);

  const filtered = useMemo(() => applyFilter(PRESETS, filter), [filter]);
  const openEntry = openId ? presetById.get(openId) ?? null : null;

  const playEntry = async (e: CatalogEntry) => {
    stopAll();
    if (settings.soundInEdit) {
      try {
        await playPreset(e.id, e.data);
      } catch {}
    }
    if (hapticsToken) broadcastToPhone(hapticsToken, e.data.name);
  };

  const bindEntry = (e: CatalogEntry) => {
    send({
      type: 'bind-preset',
      binding: { presetId: e.id, presetName: e.data.name }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div
        className="row"
        style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}
      >
        <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Pulsar</div>
        <div className="spacer" />
        {(['presets', 'phone', 'settings'] as const).map((t) => (
          <span
            key={t}
            className={`tag ${tab === t ? 'active' : ''}`}
            onClick={() => {
              setTab(t);
              setOpenId(null);
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <SelectionBar
        selection={selection}
        onUnbind={() => send({ type: 'unbind-preset' })}
      />

      {tab === 'presets' && !openEntry && (
        <>
          <Filters
            state={filter}
            setState={setFilter}
            total={PRESETS.length}
            visible={filtered.length}
          />
          <div className="row" style={{ padding: '4px 8px', gap: 6 }}>
            <span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>Layout:</span>
            <span
              className={`tag ${!settings.compactLayout ? 'active' : ''}`}
              onClick={() => setSettings({ ...settings, compactLayout: false })}
            >
              full
            </span>
            <span
              className={`tag ${settings.compactLayout ? 'active' : ''}`}
              onClick={() => setSettings({ ...settings, compactLayout: true })}
            >
              compact
            </span>
          </div>
          <div className="scroll" style={{ flex: 1, paddingTop: settings.compactLayout ? 0 : 8 }}>
            {filtered.map((e) => (
              <PresetCard
                key={e.id}
                entry={e}
                compact={settings.compactLayout}
                isBound={selection?.binding?.presetId === e.id}
                onPlay={() => playEntry(e)}
                onBind={() => bindEntry(e)}
                onOpen={() => setOpenId(e.id)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="muted" style={{ padding: 16 }}>No presets match.</p>
            )}
          </div>
        </>
      )}

      {tab === 'presets' && openEntry && (
        <PresetDetail
          entry={openEntry}
          onClose={() => setOpenId(null)}
          onPlay={() => playEntry(openEntry)}
          onPlayOnPhone={() =>
            hapticsToken && broadcastToPhone(hapticsToken, openEntry.data.name)
          }
          canPlayOnPhone={!!hapticsToken}
          onBind={() => bindEntry(openEntry)}
        />
      )}

      {tab === 'phone' && (
        <PhonePanel token={hapticsToken} onTokenChange={setHapticsToken} />
      )}

      {tab === 'settings' && (
        <SettingsPanel settings={settings} onChange={setSettings} />
      )}
    </div>
  );
}
