import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import PRESETS from './presets-data';
import type { CatalogEntry, SelectionInfo, Settings } from '../shared/types';
import { onMessage, send } from './figmaBridge';
import Filters, { applyFilter, useFilterStateInit, type FilterState } from './components/Filters';
import PresetCard from './components/PresetCard';
import PresetDetail from './components/PresetDetail';
import SettingsPanel from './components/SettingsPanel';
import LivePreviewPanel from './components/LivePreviewPanel';
import PhonePanel, { broadcastToPhone } from './components/PhonePanel';
import SelectionBar from './components/SelectionBar';
import { playPreset, stopAll } from './audio/AudioPatternUtility';

type Tab = 'presets' | 'phone' | 'preview' | 'settings';

const DEFAULT_SETTINGS: Settings = {
  soundInEdit: true,
  compactLayout: false,
  previewBaseUrl: 'https://docs.swmansion.com/figma-preview/',
  fileKeyOverride: ''
};

// Accept either a raw file key or a full Figma URL and return the key.
function extractFileKey(input: string): string {
  const m = input.match(/figma\.com\/(?:file|design|proto)\/([A-Za-z0-9]+)/);
  return (m ? m[1] : input).trim();
}

// base64-encode a unicode-safe JSON string for stuffing into the preview URL hash.
function encodePayload(payload: unknown): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

// Clipboard inside the Figma plugin iframe: navigator.clipboard is often blocked,
// so fall back to a temporary textarea + execCommand('copy').
function copyToClipboard(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hapticsToken, setHapticsToken] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [tab, setTab] = useState<Tab>('presets');
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>(useFilterStateInit());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [favouritesOnly, setFavouritesOnly] = useState(false);

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
        setFavourites(new Set(m.favourites));
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

  // Persist favourites on change, skipping the first render so we don't clobber
  // the stored set before `init` arrives from the main thread.
  const [didInitFav, setDidInitFav] = useState(false);
  useEffect(() => {
    if (!didInitFav) {
      setDidInitFav(true);
      return;
    }
    send({ type: 'persist-favourites', favourites: [...favourites] });
  }, [favourites]);

  const toggleFavourite = (id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

  // Build the live-preview URL once the main thread sends bound-node data, then
  // hand it back to the main thread to open externally (figma.openExternal).
  // Rebind on changes so it reads fresh presets/preview URL.
  useEffect(() => {
    const off = onMessage((m) => {
      if (m.type !== 'preview-data') return;
      const fileKey = m.fileKey ?? (settings.fileKeyOverride ? extractFileKey(settings.fileKeyOverride) : '');
      if (!fileKey) {
        send({
          type: 'notify',
          message:
            'No file key available. Paste this file’s share URL in Settings → Live preview (File key override).'
        });
        return;
      }
      const bindings: Record<string, unknown> = {};
      // owner maps every node id (a bound node and its descendants) to the bound
      // node it belongs to, so a tap on a child resolves to the right element.
      const owner: Record<string, string> = {};
      // Pass 1: fill descendants so a tap on a child layer (text/icon) resolves
      // to its bound ancestor. Pass 2: explicit node bindings win over inherited.
      for (const b of m.bindings) {
        const data = b.customPattern ?? presetById.get(b.presetId)?.data;
        if (!data) continue;
        for (const descId of b.descendantIds) {
          bindings[descId] = data;
          owner[descId] = b.nodeId;
        }
      }
      // One entry per bound node, for the panel list + on-canvas highlights.
      const elements = [];
      for (const b of m.bindings) {
        const data = b.customPattern ?? presetById.get(b.presetId)?.data;
        if (!data) continue;
        bindings[b.nodeId] = data;
        owner[b.nodeId] = b.nodeId;
        elements.push({ id: b.nodeId, name: b.nodeName, presetName: b.presetName, box: b.box });
      }
      if (elements.length === 0) {
        send({ type: 'notify', message: 'No haptic bindings on this page yet.' });
        return;
      }
      const payload = {
        fileKey,
        nodeId: m.presentNodeId,
        frame: m.presentNodeBox,
        elements,
        owner,
        bindings
      };
      const base = (settings.previewBaseUrl || DEFAULT_SETTINGS.previewBaseUrl).replace(/#.*$/, '');
      const url = `${base}#data=${encodePayload(payload)}`;
      if (previewActionRef.current === 'copy') {
        const ok = copyToClipboard(url);
        send({
          type: 'notify',
          message: ok ? 'Share link copied to clipboard.' : 'Could not copy the share link.'
        });
      } else if (previewActionRef.current === 'qr') {
        QRCode.toDataURL(url, { margin: 1, width: 240, errorCorrectionLevel: 'L' })
          .then((dataUrl) => setShareQr(dataUrl))
          .catch(() => {
            setShareQr(null);
            send({
              type: 'notify',
              message:
                'Link too long to encode as a QR code. Use "Copy share link" instead, or reduce the number of bound nodes.'
            });
          });
      } else {
        send({ type: 'open-external', url });
      }
    });
    return off;
  }, [settings.previewBaseUrl, settings.fileKeyOverride, presetById]);

  // Whether the pending preview-data response should open / copy / QR-encode the link.
  const previewActionRef = useRef<'open' | 'copy' | 'qr'>('open');
  const [shareQr, setShareQr] = useState<string | null>(null);
  const showInLivePreview = () => {
    previewActionRef.current = 'open';
    send({ type: 'request-preview-data' });
  };
  const copyShareLink = () => {
    previewActionRef.current = 'copy';
    send({ type: 'request-preview-data' });
  };
  const showQrCode = () => {
    previewActionRef.current = 'qr';
    setShareQr(null);
    send({ type: 'request-preview-data' });
  };

  const filtered = useMemo(() => {
    const base = applyFilter(PRESETS, filter);
    return favouritesOnly ? base.filter((e) => favourites.has(e.id)) : base;
  }, [filter, favouritesOnly, favourites]);
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
        style={{ padding: '8px 10px 0', gap: 0, borderBottom: '1px solid var(--border)' }}
      >
        <div style={{ fontWeight: 700, color: 'var(--color-primary)', paddingBottom: 8 }}>
          Pulsar
        </div>
        <div className="spacer" />
        {(['presets', 'phone', 'preview', 'settings'] as const).map((t) => (
          <span
            key={t}
            className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => {
              setTab(t);
              setOpenId(null);
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {(tab !== 'presets' || !!openEntry) && (
        <SelectionBar
          selection={selection}
          onUnbind={() => send({ type: 'unbind-preset' })}
        />
      )}

      {tab === 'presets' && !openEntry && (
        <div
          className="scroll"
          style={{ flex: 1 }}
          ref={scrollRef}
          onScroll={(e) => setShowScrollTop(e.currentTarget.scrollTop > 300)}
        >
          <SelectionBar
            selection={selection}
            onUnbind={() => send({ type: 'unbind-preset' })}
          />
          <Filters
            state={filter}
            setState={setFilter}
            favouritesOnly={favouritesOnly}
            onFavouritesOnlyChange={setFavouritesOnly}
          />
          <div className="row" style={{ padding: '4px 8px', gap: 6, marginTop: 8 }}>
            <span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>{filtered.length} results</span>
            <div className="spacer" />
            <span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>Layout:</span>
            <button
              className={`icon ${settings.compactLayout ? 'ghost' : 'primary'}`}
              title="Full cards"
              aria-pressed={!settings.compactLayout}
              onClick={() => setSettings({ ...settings, compactLayout: false })}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="4" width="18" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
                <rect x="3" y="13" width="18" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button
              className={`icon ${settings.compactLayout ? 'primary' : 'ghost'}`}
              title="Compact rows"
              aria-pressed={settings.compactLayout}
              onClick={() => setSettings({ ...settings, compactLayout: true })}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div style={{ paddingTop: settings.compactLayout ? 0 : 8 }}>
            {filtered.map((e) => (
              <PresetCard
                key={e.id}
                entry={e}
                compact={settings.compactLayout}
                isBound={selection?.binding?.presetId === e.id}
                isFavourite={favourites.has(e.id)}
                onToggleFavourite={() => toggleFavourite(e.id)}
                onPlay={() => playEntry(e)}
                onBind={() => bindEntry(e)}
                onOpen={() => setOpenId(e.id)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="muted" style={{ padding: 16 }}>No presets match.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'presets' && !openEntry && showScrollTop && (
        <button
          className="scroll-top"
          aria-label="Scroll to top"
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 19V5M12 5l-6 6M12 5l6 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
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

      {tab === 'preview' && (
        <LivePreviewPanel
          settings={settings}
          onChange={setSettings}
          onShowLivePreview={showInLivePreview}
          onCopyShareLink={copyShareLink}
          onShowQrCode={showQrCode}
          qrDataUrl={shareQr}
          onClearQr={() => setShareQr(null)}
        />
      )}

      {tab === 'settings' && (
        <SettingsPanel settings={settings} onChange={setSettings} />
      )}
    </div>
  );
}
