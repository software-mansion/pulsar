import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import PRESETS from './presets-data';
import { CUSTOM_TAG, type BoundItem, type CatalogEntry, type SelectionInfo, type Settings } from '../shared/types';
import { onMessage, send } from './figmaBridge';
import Filters, { applyFilter, useFilterStateInit, type FilterState } from './components/Filters';
import PresetCard from './components/PresetCard';
import PresetDetail from './components/PresetDetail';
import LivePreviewPanel from './components/LivePreviewPanel';
import BoundComponentsPanel from './components/BoundComponentsPanel';
import AddCustomPreset from './components/AddCustomPreset';
import PhonePanel, { broadcastToPhone } from './components/PhonePanel';
import SelectionBar from './components/SelectionBar';
import PulsarLogo from './components/PulsarLogo';
import ResizeHandle from './components/ResizeHandle';
import { playPreset, stopAll } from './audio/AudioPatternUtility';

type Tab = 'presets' | 'bound' | 'phone' | 'preview';

const DEFAULT_SETTINGS: Settings = {
  soundInEdit: true,
  compactLayout: false,
  fileKeyOverride: '',
  previewBaseUrlOverride: ''
};

// Default live-preview app URL. Pinned at build time: localhost while
// developing the plugin (vite dev → import.meta.env.DEV === true), production
// host otherwise. The user can also override this per-install via
// Settings → Live preview (Preview base URL override) — handy for pointing a
// production-built plugin at a locally-hosted docs/preview instance.
const DEFAULT_PREVIEW_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5173/'
  : 'https://docs.swmansion.com/figma-preview/';

function resolvePreviewBaseUrl(override: string): string {
  const trimmed = override.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_PREVIEW_BASE_URL;
}

// Accept either a raw file key or a full Figma URL and return the key.
function extractFileKey(input: string): string {
  const m = input.match(/figma\.com\/(?:file|design|proto)\/([A-Za-z0-9]+)/);
  return (m ? m[1] : input).trim();
}

// Pulsar backend that stores the preview payload by token. Kept in sync with
// PhonePanel.API_SERVER_URL.
const API_SERVER_URL = 'https://pulsar-server.swmansion.com';

// POST the preview payload to the server and return a short token to embed in
// the share URL instead of the (potentially huge) base64 blob.
async function createFigmaProjectToken(payload: unknown): Promise<string> {
  const res = await fetch(`${API_SERVER_URL}/figma-project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: payload })
  });
  const data = (await res.json().catch(() => null)) as
    | { success: boolean; token?: string; error?: string; detail?: string }
    | null;
  if (!res.ok) {
    const msg = data?.error ?? `Server responded ${res.status}`;
    throw new Error(data?.detail ? `${msg} (${data.detail})` : msg);
  }
  if (!data?.success || !data.token) throw new Error(data?.error || 'No token returned');
  return data.token;
}

// PUT the payload at an existing token. Returns false on 404 (token gone from
// the server — caller should re-create), throws on any other error.
async function updateFigmaProjectToken(token: string, payload: unknown): Promise<boolean> {
  const res = await fetch(`${API_SERVER_URL}/figma-project/${encodeURIComponent(token)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: payload })
  });
  if (res.status === 404) return false;
  const data = (await res.json().catch(() => null)) as
    | { success: boolean; error?: string; detail?: string }
    | null;
  if (!res.ok) {
    const msg = data?.error ?? `Server responded ${res.status}`;
    throw new Error(data?.detail ? `${msg} (${data.detail})` : msg);
  }
  if (!data?.success) throw new Error(data?.error || 'Update failed');
  return true;
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
  // Server-side project token. Persisted via the main thread so a single
  // project row is reused across share clicks instead of creating a new row
  // every time. Kept in a ref so the preview-data handler always sees the
  // latest value without re-binding the bridge subscription.
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const previewTokenRef = useRef<string | null>(null);
  useEffect(() => {
    previewTokenRef.current = previewToken;
  }, [previewToken]);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [tab, setTab] = useState<Tab>('presets');
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>(useFilterStateInit());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [boundItems, setBoundItems] = useState<BoundItem[]>([]);
  const [customPresets, setCustomPresets] = useState<CatalogEntry[]>([]);

  // Custom presets first, then the bundled catalogue.
  const allPresets = useMemo(() => [...customPresets, ...PRESETS], [customPresets]);

  const presetById = useMemo(() => {
    const m = new Map<string, CatalogEntry>();
    for (const p of allPresets) m.set(p.id, p);
    return m;
  }, [allPresets]);

  // Wire up the bridge once.
  useEffect(() => {
    const off = onMessage((m) => {
      if (m.type === 'init') {
        setSettings(m.settings);
        setHapticsToken(m.hapticsToken);
        setPreviewToken(m.previewToken ?? null);
        setFavourites(new Set(m.favourites));
        setCustomPresets(m.customPresets ?? []);
      }
      if (m.type === 'selection') setSelection(m.node);
      if (m.type === 'bound-list') setBoundItems(m.items);
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

  // Persist custom presets on change, skipping the first render so we don't
  // clobber what `init` loaded.
  const [didInitCustom, setDidInitCustom] = useState(false);
  useEffect(() => {
    if (!didInitCustom) {
      setDidInitCustom(true);
      return;
    }
    send({ type: 'persist-custom-presets', presets: customPresets });
  }, [customPresets]);

  const addCustomPreset = (entry: CatalogEntry) => setCustomPresets((prev) => [entry, ...prev]);
  const updateCustomPreset = (id: string, entry: CatalogEntry) =>
    setCustomPresets((prev) => prev.map((e) => (e.id === id ? entry : e)));
  const removeCustomPreset = (id: string) =>
    setCustomPresets((prev) => prev.filter((e) => e.id !== id));

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
      // Wrap in an async IIFE so we can await the token round-trip without
      // refactoring the bridge subscription itself.
      void (async () => {
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
        elements.push({
          id: b.nodeId,
          name: b.nodeName,
          presetName: b.presetName,
          box: b.box,
          frameId: b.frameId,
          // Marked custom when the binding inlines a custom pattern (always
          // user-defined) or when the resolved preset carries the Custom tag.
          isCustom: !!b.customPattern || (Array.isArray(data.tags) && data.tags.includes(CUSTOM_TAG))
        });
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
        bindings,
        frames: m.frames
      };
      // Strip any existing query/hash so we don't duplicate or stack tokens
      // when the user has manually visited the preview before.
      const base = resolvePreviewBaseUrl(settings.previewBaseUrlOverride).replace(/[?#].*$/, '');
      let token: string;
      try {
        const existing = previewTokenRef.current;
        if (existing) {
          // Reuse the persisted token: update the row in place. If the server
          // no longer knows about it (404 → returns false), fall through to a
          // fresh create.
          const updated = await updateFigmaProjectToken(existing, payload);
          if (updated) {
            token = existing;
          } else {
            token = await createFigmaProjectToken(payload);
            send({ type: 'persist-preview-token', token });
            setPreviewToken(token);
          }
        } else {
          token = await createFigmaProjectToken(payload);
          send({ type: 'persist-preview-token', token });
          setPreviewToken(token);
        }
      } catch (err) {
        send({
          type: 'notify',
          message: `Could not upload preview data: ${(err as Error).message}`
        });
        return;
      }
      const url = `${base}?token=${encodeURIComponent(token)}`;
      // The QR is scanned by a phone with PulsarApp installed. Encode the
      // app's deep-link scheme instead of the web URL so it routes straight
      // into the in-app Figma WebView screen.
      const appDeepLink = `pulsarapp://figma?token=${encodeURIComponent(token)}`;
      if (previewActionRef.current === 'copy') {
        const ok = copyToClipboard(url);
        send({
          type: 'notify',
          message: ok ? 'Share link copied to clipboard.' : 'Could not copy the share link.'
        });
      } else if (previewActionRef.current === 'qr') {
        try {
          const dataUrl = await QRCode.toDataURL(appDeepLink, {
            margin: 1,
            width: 240,
            errorCorrectionLevel: 'L'
          });
          setShareQr(dataUrl);
        } catch {
          setShareQr(null);
          send({
            type: 'notify',
            message: 'Could not generate a QR code for the share link.'
          });
        }
      } else {
        send({ type: 'open-external', url });
      }
      })();
    });
    return off;
  }, [settings.fileKeyOverride, settings.previewBaseUrlOverride, presetById]);

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
    const base = applyFilter(allPresets, filter);
    return favouritesOnly ? base.filter((e) => favourites.has(e.id)) : base;
  }, [allPresets, filter, favouritesOnly, favourites]);
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
      // Inline the pattern for custom presets so a binding survives even if the
      // custom preset is later removed from the list.
      binding: {
        presetId: e.id,
        presetName: e.data.name,
        ...(e.category === 'custom' ? { customPattern: e.data } : {})
      }
    });
  };

  // Escape closes the open preset-info modal.
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId]);

  const refreshBoundList = () => send({ type: 'request-bound-list' });

  // Refresh the bound list when opening the tab, and whenever the selection (and
  // thus a possible bind/unbind) changes while it's open.
  useEffect(() => {
    if (tab === 'bound') refreshBoundList();
  }, [tab, selection]);

  // Click a bound component: hear its preset (always, since it's an explicit
  // action) and jump to + highlight it on the canvas.
  const selectBoundItem = (item: BoundItem) => {
    const entry = presetById.get(item.presetId);
    if (entry) {
      stopAll();
      playPreset(entry.id, entry.data).catch(() => {});
      if (hapticsToken) broadcastToPhone(hapticsToken, entry.data.name);
    }
    send({ type: 'focus-node', nodeId: item.nodeId });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div
        className="row"
        style={{ padding: '8px 10px 0', gap: 0, borderBottom: '1px solid var(--border)' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700,
            color: 'var(--color-primary)',
            paddingBottom: 8
          }}
        >
          <PulsarLogo size={22} />
          <span>Pulsar</span>
        </div>
        <div className="spacer" />
        {(['presets', 'bound', 'phone', 'preview'] as const).map((t) => (
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

      {tab !== 'presets' && (
        <SelectionBar
          selection={selection}
          onUnbind={() => send({ type: 'unbind-preset' })}
        />
      )}

      {tab === 'presets' && (
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
          <AddCustomPreset
            customPresets={customPresets}
            onAdd={addCustomPreset}
            onUpdate={updateCustomPreset}
            onRemove={removeCustomPreset}
          />
          <div className="row" style={{ padding: '4px 8px', gap: 6, marginTop: 8 }}>
            <span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>{filtered.length} results</span>
            <label
              className="row"
              style={{ gap: 4, marginLeft: 8, fontSize: 'var(--fs-xs)', cursor: 'pointer', userSelect: 'none' }}
              title="Play audio when selecting a bound node in the editor"
            >
              <input
                type="checkbox"
                checked={settings.soundInEdit}
                onChange={(e) => setSettings({ ...settings, soundInEdit: e.target.checked })}
              />
              Sound
            </label>
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

      {openEntry && (
        <div className="modal-backdrop" onClick={() => setOpenId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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
          </div>
        </div>
      )}

      {tab === 'bound' && (
        <BoundComponentsPanel
          items={boundItems}
          onRefresh={refreshBoundList}
          onSelect={selectBoundItem}
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

      <ResizeHandle />
    </div>
  );
}
