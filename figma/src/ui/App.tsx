import styles from './App.module.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import PRESETS from './presets-data';
import { CUSTOM_TAG, type BoundItem, type CatalogEntry, type SelectionInfo, type Settings } from '../shared/types';
import { onMessage, send } from './figmaBridge';
import Filters, {
  applyFilter,
  filterRevealing,
  useFilterStateInit,
  type FilterState
} from './components/Filters';
import PresetCard from './components/PresetCard';
import PresetDetail from './components/PresetDetail';
import LivePreviewPanel from './components/LivePreviewPanel';
import BoundComponentsPanel from './components/BoundComponentsPanel';
import AddCustomPreset from './components/AddCustomPreset';
import PhonePanel, { broadcastToPhone } from './components/PhonePanel';
import SelectionBar from './components/SelectionBar';
import PulsarLogo from './components/PulsarLogo';
import ResizeHandle from './components/ResizeHandle';
import { useToast } from './components/Toast';
import { playPreset, stopAll } from './audio/player';
import iconLayoutFull from './assets/icon-layout-full.svg';
import iconLayoutCompact from './assets/icon-layout-compact.svg';
import iconArrowUp from './assets/icon-arrow-up.svg';

type Tab = 'presets' | 'bound' | 'preview';

// Live-preview sync state, surfaced as a pill in the Live preview tab.
//   idle     — nothing shared for this file yet (no server row).
//   syncing  — a push/fetch is in flight.
//   synced   — local state matches what's on the server.
//   unsynced — local edits not yet pushed (a debounced save is pending).
//   error    — last sync attempt failed (will retry on the next change).
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'unsynced' | 'error';

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
  : 'https://docs.swmansion.com/pulsar/figma-preview/';

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

// Server <-> client sync state. The server keeps a monotonic `revision` per
// project; the client remembers the revision it last synced (its "base") so it
// can detect when the row changed underneath it and reconcile.

// POST the preview payload. Returns the secret edit token, a read-only
// publicToken for share links, and the revision.
async function createProject(
  payload: unknown
): Promise<{ token: string; publicToken: string; revision: number }> {
  const res = await fetch(`${API_SERVER_URL}/figma-project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: payload })
  });
  const data = (await res.json().catch(() => null)) as
    | {
        success: boolean;
        token?: string;
        publicToken?: string;
        revision?: number;
        error?: string;
        detail?: string;
      }
    | null;
  if (!res.ok) {
    const msg = data?.error ?? `Server responded ${res.status}`;
    throw new Error(data?.detail ? `${msg} (${data.detail})` : msg);
  }
  if (!data?.success || !data.token || !data.publicToken) {
    throw new Error(data?.error || 'No token returned');
  }
  return { token: data.token, publicToken: data.publicToken, revision: data.revision ?? 0 };
}

// Result of a conditional update: applied (new revision), gone (404, caller
// should recreate), or conflict (server moved on — carries the current
// snapshot so the caller can reconcile).
type UpdateResult =
  | { kind: 'ok'; revision: number }
  | { kind: 'gone' }
  | { kind: 'conflict'; config: unknown; revision: number };

// PUT the payload at an existing token. When `baseRevision` is non-null the
// update is conditional and a server-side change yields a 'conflict'.
async function updateProject(
  token: string,
  payload: unknown,
  baseRevision: number | null
): Promise<UpdateResult> {
  const res = await fetch(`${API_SERVER_URL}/figma-project/${encodeURIComponent(token)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: payload, baseRevision })
  });
  if (res.status === 404) return { kind: 'gone' };
  const data = (await res.json().catch(() => null)) as
    | { success: boolean; revision?: number; config?: unknown; error?: string; detail?: string }
    | null;
  if (res.status === 409) {
    return { kind: 'conflict', config: data?.config ?? null, revision: data?.revision ?? 0 };
  }
  if (!res.ok) {
    const msg = data?.error ?? `Server responded ${res.status}`;
    throw new Error(data?.detail ? `${msg} (${data.detail})` : msg);
  }
  if (!data?.success) throw new Error(data?.error || 'Update failed');
  return { kind: 'ok', revision: data.revision ?? 0 };
}

// Outcome of an owner GET: the stored snapshot, a revoked (private) link, or a
// missing row. Only 'missing' means forget the token. ('private' is only
// reachable against an older server that still 403s the owner read.)
type FetchResult =
  | { kind: 'ok'; config: unknown; revision: number; isPublic: boolean; publicToken: string | null }
  | { kind: 'private' }
  | { kind: 'missing' };

// GET the owner's project by its secret edit token. Also returns the read-only
// publicToken so the plugin can (re)learn the share token for a legacy share.
async function fetchProject(token: string): Promise<FetchResult> {
  const res = await fetch(`${API_SERVER_URL}/figma-project/${encodeURIComponent(token)}`);
  if (res.status === 404) return { kind: 'missing' };
  // Only an older (pre-split) server 403s the owner read; treat as private.
  if (res.status === 403) return { kind: 'private' };
  const data = (await res.json().catch(() => null)) as
    | {
        success: boolean;
        config?: unknown;
        revision?: number;
        isPublic?: boolean;
        publicToken?: string;
        error?: string;
        detail?: string;
      }
    | null;
  if (!res.ok) {
    const msg = data?.error ?? `Server responded ${res.status}`;
    throw new Error(data?.detail ? `${msg} (${data.detail})` : msg);
  }
  if (!data?.success) throw new Error(data?.error || 'Fetch failed');
  return {
    kind: 'ok',
    config: data.config ?? null,
    revision: data.revision ?? 0,
    isPublic: data.isPublic ?? true,
    publicToken: data.publicToken ?? null
  };
}

// PATCH a token's share-link visibility (public ⇄ private). Returns whether the
// server accepted the change. Separate from updateProject so a config sync and
// a visibility toggle never get conflated.
async function setProjectVisibility(token: string, isPublic: boolean): Promise<boolean> {
  const res = await fetch(`${API_SERVER_URL}/figma-project/${encodeURIComponent(token)}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isPublic })
  });
  if (!res.ok) return false;
  const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
  return !!data?.success;
}

// Deterministic JSON: keys sorted recursively so two structurally-equal
// payloads (built locally vs. parsed back from the server) stringify
// identically. Used purely for "did anything actually change?" comparisons.
function stableStringify(value: unknown): string {
  const seen = new WeakSet();
  const norm = (v: unknown): unknown => {
    if (v === null || typeof v !== 'object') return v;
    if (seen.has(v as object)) return null;
    seen.add(v as object);
    if (Array.isArray(v)) return v.map(norm);
    const obj = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) out[k] = norm(obj[k]);
    return out;
  };
  return JSON.stringify(norm(value));
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
  const { notify } = useToast();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hapticsToken, setHapticsToken] = useState<string | null>(null);
  // Live link to the paired phone (PhonePanel reports this). Broadcasting only
  // makes sense while the phone is actually connected, not merely paired.
  const [phoneConnected, setPhoneConnected] = useState(false);

  // --- Per-file server-sync state ---------------------------------------
  // The file we're editing. Tokens + cached config are keyed by this so a
  // different design file gets its own server row instead of overwriting the
  // first. Resolved from figma.fileKey (or the file-key override).
  const fileKeyRef = useRef<string>('');
  // Current file's secret edit token (write access). Kept in a ref so the
  // (rebound) preview-data and doc-changed handlers always read the latest value.
  const tokenRef = useRef<string | null>(null);
  // Current file's read-only share token — what goes into share links/QRs.
  const publicTokenRef = useRef<string | null>(null);
  // Server revision our local state is based on (for conflict detection).
  const baseRevisionRef = useRef<number | null>(null);
  // stableStringify of the payload we last successfully pushed — lets us skip a
  // network round-trip when nothing actually changed.
  const lastSyncedJsonRef = useRef<string | null>(null);
  // Promise chain that serializes all publishes, so concurrent triggers (cold
  // start + a doc-change) can't both create a token and orphan a server row.
  const syncLockRef = useRef<Promise<void>>(Promise.resolve());
  // Debounce timer for background auto-save.
  const autosyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  // Share-link visibility for the current file. true = anyone with the link can
  // view; false = the link is revoked server-side until the user shares again.
  // Defaults to public (the historical behaviour) and is reconciled with the
  // server on cold start and on every explicit share.
  const [isPublic, setIsPublic] = useState(true);

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
        setFavourites(new Set(m.favourites));
        setCustomPresets(m.customPresets ?? []);
        // Resolve this file's key and pull its persisted token + cached config.
        const fk =
          m.fileKey ?? (m.settings.fileKeyOverride ? extractFileKey(m.settings.fileKeyOverride) : '');
        fileKeyRef.current = fk;
        if (fk) send({ type: 'get-project', fileKey: fk });
        else setSyncStatus('idle');
      }
      if (m.type === 'selection') setSelection(m.node);
      if (m.type === 'bound-list') setBoundItems(m.items);
      if (m.type === 'project') void handleProject(m);
      if (m.type === 'doc-changed') handleDocChanged();
      if (m.type === 'toast') notify(m.message, { level: m.level, duration: m.duration });
      // play-preset and preview-data are handled in separate effects that
      // re-bind when settings/token change, so they always read fresh values.
    });
    send({ type: 'ui-ready' });
    return off;
    // We intentionally don't depend on settings/hapticsToken — see the play handler effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cold-start reconcile for a file. The server is the source of truth: if we
  // have no local cache but do have a token, fetch the server copy and seed the
  // cache. Either way, finish by kicking a silent auto-sync so any local design
  // drift since the last snapshot gets published (the Figma doc is live truth).
  const handleProject = async (m: {
    fileKey: string;
    token: string | null;
    publicToken: string | null;
    config: unknown | null;
    baseRevision: number | null;
    isPublic: boolean;
  }) => {
    fileKeyRef.current = m.fileKey;
    tokenRef.current = m.token;
    publicTokenRef.current = m.publicToken;
    baseRevisionRef.current = m.baseRevision;
    // Seed the toggle from the cached value; the server-fetch branch below
    // reconciles it with the source of truth when there's a token to check.
    setIsPublic(m.isPublic);
    if (m.config != null) {
      lastSyncedJsonRef.current = stableStringify(m.config);
      setSyncStatus(m.token ? 'synced' : 'idle');
    } else if (m.token) {
      setSyncStatus('syncing');
      try {
        const got = await fetchProject(m.token);
        if (got.kind === 'ok') {
          baseRevisionRef.current = got.revision;
          lastSyncedJsonRef.current = stableStringify(got.config);
          setIsPublic(got.isPublic);
          // Recover/refresh the read-only share token from the server.
          if (got.publicToken && got.publicToken !== publicTokenRef.current) {
            publicTokenRef.current = got.publicToken;
            send({
              type: 'persist-project-token',
              fileKey: m.fileKey,
              token: m.token,
              publicToken: got.publicToken
            });
          }
          send({ type: 'persist-project-visibility', fileKey: m.fileKey, isPublic: got.isPublic });
          send({
            type: 'persist-project-cache',
            fileKey: m.fileKey,
            config: got.config,
            baseRevision: got.revision
          });
          setSyncStatus('synced');
        } else if (got.kind === 'private') {
          // The link is revoked. Keep the token (the user can re-share to
          // re-open it) and reflect the private state in the toggle. We can't
          // read the server config while private, so leave lastSyncedJson empty
          // — the next autosync will re-publish the live document's bindings.
          setIsPublic(false);
          send({ type: 'persist-project-visibility', fileKey: m.fileKey, isPublic: false });
          setSyncStatus('synced');
        } else {
          // Token no longer exists server-side — forget it; nothing is shared.
          tokenRef.current = null;
          publicTokenRef.current = null;
          lastSyncedJsonRef.current = null;
          baseRevisionRef.current = null;
          setSyncStatus('idle');
        }
      } catch {
        setSyncStatus('error');
      }
    } else {
      lastSyncedJsonRef.current = null;
      setSyncStatus('idle');
    }
    send({ type: 'request-preview-data', purpose: 'autosync' });
  };

  // A local edit happened. Mark the file dirty (only meaningful once it has a
  // token) and debounce a background save.
  const handleDocChanged = () => {
    if (tokenRef.current) setSyncStatus((s) => (s === 'syncing' ? s : 'unsynced'));
    if (autosyncTimerRef.current) clearTimeout(autosyncTimerRef.current);
    autosyncTimerRef.current = setTimeout(() => {
      autosyncTimerRef.current = null;
      send({ type: 'request-preview-data', purpose: 'autosync' });
    }, 1500);
  };

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
      if (hapticsToken && phoneConnected) broadcastToPhone(hapticsToken, p.data.name);
    });
    return off;
  }, [settings.soundInEdit, hapticsToken, phoneConnected, presetById]);

  const [shareQr, setShareQr] = useState<string | null>(null);

  // Handle a preview-data reply: build the payload, publish it to the server
  // (create/update with conflict reconciliation), then carry out the action the
  // request was made for. Rebind on changes so it reads fresh presets/preview
  // URL/file-key override.
  useEffect(() => {
    // Serialize every publish through one promise chain. Two concurrent
    // triggers (e.g. cold-start reconcile + a doc-change) must not both POST,
    // which would create two server rows and orphan one.
    const runExclusive = (fn: () => Promise<void>): Promise<void> => {
      const next = syncLockRef.current.then(fn, fn);
      syncLockRef.current = next.then(
        () => {},
        () => {}
      );
      return next;
    };

    const off = onMessage((m) => {
      if (m.type !== 'preview-data') return;
      const purpose = m.purpose;
      const silent = purpose === 'autosync';

      const fileKey =
        m.fileKey ?? (settings.fileKeyOverride ? extractFileKey(settings.fileKeyOverride) : '');
      if (!fileKey) {
        if (silent) return;
        notify(
          'No file key available. Paste this file’s share URL in Settings → Live preview (File key override).',
          { level: 'warning' }
        );
        return;
      }
      fileKeyRef.current = fileKey;

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
        if (silent || purpose === 'sync') {
          // Nothing to publish. Don't touch the (possibly stale) server row.
          setSyncStatus(tokenRef.current ? 'synced' : 'idle');
          return;
        }
        notify('No haptic bindings on this page yet.', { level: 'info' });
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

      // Publish `payload` to the server, reconciling against its current state.
      // Returns the token (or null when nothing is shared yet and create isn't
      // allowed — i.e. a background auto-sync of a never-shared file).
      const ensurePublished = async (allowCreate: boolean): Promise<string | null> => {
        const json = stableStringify(payload);
        const adopt = (t: string, publicToken: string, revision: number) => {
          tokenRef.current = t;
          publicTokenRef.current = publicToken;
          baseRevisionRef.current = revision;
          lastSyncedJsonRef.current = json;
          send({ type: 'persist-project-token', fileKey, token: t, publicToken });
          send({ type: 'persist-project-cache', fileKey, config: payload, baseRevision: revision });
        };

        let token = tokenRef.current;
        // Skip the round-trip when nothing actually changed since last sync.
        if (token && json === lastSyncedJsonRef.current) return token;

        if (!token) {
          if (!allowCreate) return null;
          const created = await createProject(payload);
          adopt(created.token, created.publicToken, created.revision);
          return created.token;
        }

        const res = await updateProject(token, payload, baseRevisionRef.current);
        if (res.kind === 'ok') {
          baseRevisionRef.current = res.revision;
          lastSyncedJsonRef.current = json;
          send({ type: 'persist-project-cache', fileKey, config: payload, baseRevision: res.revision });
          return token;
        }
        if (res.kind === 'gone') {
          // Token vanished server-side. Recreate when allowed, else forget it.
          if (!allowCreate) {
            tokenRef.current = null;
            baseRevisionRef.current = null;
            lastSyncedJsonRef.current = null;
            return null;
          }
          const created = await createProject(payload);
          adopt(created.token, created.publicToken, created.revision);
          return created.token;
        }
        // Conflict: someone changed the row since our base. The server is the
        // source of truth for the base revision, so adopt it — but the Figma
        // document is the live design, so re-publish our payload on top
        // (last-writer-wins, now that we're rebased on the server's revision).
        const forced = await updateProject(token, payload, res.revision);
        if (forced.kind === 'ok') {
          baseRevisionRef.current = forced.revision;
          lastSyncedJsonRef.current = json;
          send({ type: 'persist-project-cache', fileKey, config: payload, baseRevision: forced.revision });
          return token;
        }
        if (forced.kind === 'gone') {
          if (!allowCreate) {
            tokenRef.current = null;
            baseRevisionRef.current = null;
            lastSyncedJsonRef.current = null;
            return null;
          }
          const created = await createProject(payload);
          adopt(created.token, created.publicToken, created.revision);
          return created.token;
        }
        // Lost a second race — bail; the next change will retry from the new base.
        baseRevisionRef.current = forced.revision;
        throw new Error('Sync conflict — will retry on the next change.');
      };

      void runExclusive(async () => {
        setSyncStatus('syncing');
        let token: string | null;
        try {
          token = await ensurePublished(!silent);
        } catch (err) {
          setSyncStatus('error');
          if (!silent) {
            notify(`Could not upload preview data: ${(err as Error).message}`, { level: 'error' });
          }
          return;
        }
        if (!token) {
          // Background auto-sync of a file that was never shared — nothing to do.
          setSyncStatus('idle');
          return;
        }
        setSyncStatus('synced');

        // Beyond the sync itself, share actions also need a URL / QR / clipboard.
        if (purpose === 'autosync' || purpose === 'sync') return;

        // Any explicit share re-opens the link to the public: if the user had
        // made it private, handing the link out again necessarily makes it
        // viewable, so flip the toggle back on. Optimistic + best-effort — the
        // server is the source of truth, reconciled on the next cold start.
        setIsPublic(true);
        send({ type: 'persist-project-visibility', fileKey, isPublic: true });
        void setProjectVisibility(token, true).catch(() => {});

        // Everything we hand out carries the read-only public token, never the
        // edit token. Recover it from the server if not cached (e.g. legacy share).
        let publicToken = publicTokenRef.current;
        if (!publicToken) {
          const got = await fetchProject(token);
          if (got.kind === 'ok' && got.publicToken) {
            publicToken = got.publicToken;
            publicTokenRef.current = publicToken;
            send({ type: 'persist-project-token', fileKey, token, publicToken });
          }
        }
        if (!publicToken) {
          notify('Could not resolve the share link. Try “Sync now” and retry.', { level: 'error' });
          return;
        }

        // Strip any existing query/hash so we don't duplicate or stack tokens
        // when the user has manually visited the preview before.
        const base = resolvePreviewBaseUrl(settings.previewBaseUrlOverride).replace(/[?#].*$/, '');
        const url = `${base}?token=${encodeURIComponent(publicToken)}`;
        // The QR is scanned by a phone with PulsarApp installed. Encode the
        // app's deep-link scheme instead of the web URL so it routes straight
        // into the in-app Figma WebView screen.
        const appDeepLink = `pulsarapp://figma?token=${encodeURIComponent(publicToken)}`;
        if (purpose === 'copy') {
          const ok = copyToClipboard(url);
          notify(ok ? 'Share link copied to clipboard.' : 'Could not copy the share link.', {
            level: ok ? 'success' : 'error'
          });
        } else if (purpose === 'copy-token') {
          // Just the raw read-only token — handy for pasting into other
          // figma-preview URLs (e.g. a local dev instance) or debugging.
          const ok = copyToClipboard(publicToken);
          notify(ok ? 'Share token copied to clipboard.' : 'Could not copy the share token.', {
            level: ok ? 'success' : 'error'
          });
        } else if (purpose === 'qr') {
          try {
            const dataUrl = await QRCode.toDataURL(appDeepLink, {
              margin: 1,
              width: 240,
              errorCorrectionLevel: 'L',
              // Match the docs Connection.tsx palette: navy modules on a blue-10
              // background so the code visually merges into the .preview-qr-box
              // panel below (which uses the same blue-10 fill).
              color: { dark: '#001a72', light: '#e1f3fa' }
            });
            setShareQr(dataUrl);
          } catch {
            setShareQr(null);
            notify('Could not generate a QR code for the share link.', { level: 'error' });
          }
        } else {
          send({ type: 'open-external', url });
        }
      });
    });
    return off;
  }, [settings.fileKeyOverride, settings.previewBaseUrlOverride, presetById]);

  const showInLivePreview = () => send({ type: 'request-preview-data', purpose: 'open' });
  const copyShareLink = () => send({ type: 'request-preview-data', purpose: 'copy' });
  const copyShareToken = () => send({ type: 'request-preview-data', purpose: 'copy-token' });
  const showQrCode = () => {
    setShareQr(null);
    send({ type: 'request-preview-data', purpose: 'qr' });
  };
  // On-demand sync: flush any pending debounce and publish now (creating a
  // token if this file hasn't been shared yet).
  const syncNow = () => {
    if (autosyncTimerRef.current) {
      clearTimeout(autosyncTimerRef.current);
      autosyncTimerRef.current = null;
    }
    setSyncStatus('syncing');
    send({ type: 'request-preview-data', purpose: 'sync' });
  };

  // Flip the share-link visibility. Optimistic: update the toggle + local cache
  // immediately, then PATCH the server. On failure, roll the toggle back and
  // tell the user so the UI never claims a state the server didn't accept.
  const setVisibility = (next: boolean) => {
    const token = tokenRef.current;
    const fileKey = fileKeyRef.current;
    if (!token) return; // nothing shared yet — nothing to make private/public
    setIsPublic(next);
    send({ type: 'persist-project-visibility', fileKey, isPublic: next });
    void (async () => {
      let ok = false;
      try {
        ok = await setProjectVisibility(token, next);
      } catch {
        ok = false;
      }
      if (!ok) {
        setIsPublic(!next);
        send({ type: 'persist-project-visibility', fileKey, isPublic: !next });
        notify('Could not update the preview’s visibility. Please try again.', { level: 'error' });
        return;
      }
      notify(
        next
          ? 'Preview link is public — anyone with the link can view it.'
          : 'Preview link is now private — the link won’t work until you share again.',
        { level: 'success' }
      );
    })();
  };

  const filtered = useMemo(() => {
    const base = applyFilter(allPresets, filter);
    return favouritesOnly ? base.filter((e) => favourites.has(e.id)) : base;
  }, [allPresets, filter, favouritesOnly, favourites]);
  const openEntry = openId ? presetById.get(openId) ?? null : null;

  const playEntry = (e: CatalogEntry) => {
    stopAll();
    if (hapticsToken && phoneConnected) broadcastToPhone(hapticsToken, e.data.name);
    if (settings.soundInEdit) playPreset(e.id, e.data).catch(() => {});
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

  // Jump from the selection bar to a bound preset: switch to the list, clear any
  // filters hiding it, play it, and scroll it into view (the effect below does
  // the scrolling once the entry is actually rendered).
  const [scrollToId, setScrollToId] = useState<string | null>(null);
  const goToPreset = (presetId: string) => {
    const entry = presetById.get(presetId);
    if (!entry) return;
    playEntry(entry);
    setOpenId(null);
    setTab('presets');
    setFavouritesOnly(false);
    setFilter(filterRevealing(entry));
    setScrollToId(presetId);
  };

  // Scroll to (and briefly flash) the requested preset once it's in the list.
  // Runs after `filtered` updates so the reset filter has rendered the card.
  useEffect(() => {
    if (!scrollToId || tab !== 'presets') return;
    const el = scrollRef.current?.querySelector<HTMLElement>(
      `[data-preset-id="${CSS.escape(scrollToId)}"]`
    );
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('preset-flash');
    // Reflow so the animation restarts even if the class was just present.
    void el.offsetWidth;
    el.classList.add('preset-flash');
    setScrollToId(null);
  }, [scrollToId, tab, filtered]);

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
      if (hapticsToken && phoneConnected) broadcastToPhone(hapticsToken, entry.data.name);
    }
    send({ type: 'focus-node', nodeId: item.nodeId });
  };

  return (
    <div className={styles['app-shell']}>
      <div className={`row ${styles['app-header']}`}>
        <div className={styles['app-brand']}>
          <PulsarLogo size={22} />
          <span>Pulsar</span>
        </div>
        <div className="spacer" />
        {(['presets', 'bound', 'preview'] as const).map((t) => (
          <span
            key={t}
            className={`${styles['tab']} ${tab === t ? styles['active'] : ''}`}
            onClick={() => {
              setTab(t);
              setOpenId(null);
            }}
          >
            {t === 'bound' ? 'components' : t}
          </span>
        ))}
      </div>

      {/* Sticky selection section — sits above the scrollable list on every tab
          so the selected node + its bound preset stay visible while scrolling. */}
      <SelectionBar
        selection={selection}
        onUnbind={() => send({ type: 'unbind-preset' })}
        onFocusComponent={() => selection && send({ type: 'focus-node', nodeId: selection.id })}
        onOpenPreset={() => selection?.binding && goToPreset(selection.binding.presetId)}
      />

      {tab === 'presets' && (
        <div
          className={`scroll ${styles['preset-scroll']}`}
          ref={scrollRef}
          onScroll={(e) => setShowScrollTop(e.currentTarget.scrollTop > 300)}
        >
          <div className={styles['controls-section']}>
            <div className={styles['controls-search']}>
              <input
                type="text"
                placeholder="Search presets by name or description…"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
              {filter.search.length > 0 && (
                <span
                  className={`tag ${styles['controls-search-clear']}`}
                  onClick={() => setFilter({ ...filter, search: '' })}
                >
                  Clear
                </span>
              )}
            </div>
            <div className={styles['controls-card']}>
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
              <PhonePanel
                token={hapticsToken}
                onTokenChange={setHapticsToken}
                onConnectedChange={setPhoneConnected}
              />
            </div>
          </div>
          <div className={`row ${styles['list-toolbar']}`}>
            <span className={`muted ${styles['list-toolbar-meta']}`}>{filtered.length} results</span>
            <label
              className={`row ${styles['list-toolbar-toggle']}`}
              title="Play audio when selecting a bound node in the editor"
            >
              Sound
              <input
                type="checkbox"
                className="switch"
                checked={settings.soundInEdit}
                onChange={(e) => setSettings({ ...settings, soundInEdit: e.target.checked })}
              />
            </label>
            <div className="spacer" />
            <span className={`muted ${styles['list-toolbar-meta']}`}>Layout:</span>
            <button
              className={`icon ${settings.compactLayout ? 'ghost' : 'primary'}`}
              title="Full cards"
              aria-pressed={!settings.compactLayout}
              onClick={() => setSettings({ ...settings, compactLayout: false })}
            >
              <img src={iconLayoutFull} alt="" width={16} height={16} />
            </button>
            <button
              className={`icon ${settings.compactLayout ? 'primary' : 'ghost'}`}
              title="Compact rows"
              aria-pressed={settings.compactLayout}
              onClick={() => setSettings({ ...settings, compactLayout: true })}
            >
              <img src={iconLayoutCompact} alt="" width={16} height={16} />
            </button>
          </div>
          <div className={styles['preset-list']}>
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
              <p className={`muted ${styles['preset-list-empty']}`}>No presets match.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'presets' && !openEntry && showScrollTop && (
        <button
          className={styles['scroll-top']}
          aria-label="Scroll to top"
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src={iconArrowUp} alt="" width={20} height={20} />
        </button>
      )}

      {openEntry && (
        <div className={styles['modal-backdrop']} onClick={() => setOpenId(null)}>
          <div className={styles['modal-card']} onClick={(e) => e.stopPropagation()}>
            <PresetDetail
              entry={openEntry}
              onClose={() => setOpenId(null)}
              onPlay={() => playEntry(openEntry)}
              onPlayOnPhone={() =>
                hapticsToken &&
                phoneConnected &&
                broadcastToPhone(hapticsToken, openEntry.data.name)
              }
              canPlayOnPhone={!!hapticsToken && phoneConnected}
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

      {tab === 'preview' && (
        <LivePreviewPanel
          settings={settings}
          onChange={setSettings}
          syncStatus={syncStatus}
          onSyncNow={syncNow}
          isPublic={isPublic}
          isShared={syncStatus !== 'idle'}
          onToggleVisibility={setVisibility}
          onShowLivePreview={showInLivePreview}
          onCopyShareLink={copyShareLink}
          onCopyShareToken={copyShareToken}
          onShowQrCode={showQrCode}
          qrDataUrl={shareQr}
          onClearQr={() => setShareQr(null)}
        />
      )}

      <ResizeHandle />
    </div>
  );
}
