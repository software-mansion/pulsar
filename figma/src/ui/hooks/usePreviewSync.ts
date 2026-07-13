import { useCallback, useEffect, useRef, useState } from 'react';
import { CUSTOM_TAG, type CatalogEntry, type Settings } from '../../shared/types';
import { onMessage, send } from '../figmaBridge';
import { copyToClipboard } from '../lib/clipboard';
import { extractFileKey, isFileKeyValid } from '../lib/fileKey';
import { stableStringify } from '../lib/stableStringify';
import {
  diffPayloads,
  isEmptyDiff,
  type PreviewPayload,
  type PreviewUpdateMessage
} from '../lib/diffPayload';
import {
  createProject,
  fetchProject,
  resolvePreviewBaseUrl,
  setProjectVisibility,
  updateProject
} from '../lib/previewServer';
import type { ToastOptions } from '../components/Toast';

// Above this serialized size a binding-config diff is considered "complicated"
// and we tell the preview to refetch the whole config from the server instead
// of relaying the delta - keeps a single socket message well under any payload
// limit on the relay.
const PREVIEW_DIFF_MAX_BYTES = 24_000;

// Live-preview sync state, surfaced as a pill in the Live preview tab.
//   idle     - no server row yet (transient before first-open provisioning
//              completes, or if that provisioning couldn't run/failed).
//   syncing  - a push/fetch is in flight.
//   synced   - local state matches what's on the server.
//   unsynced - local edits not yet pushed (a debounced save is pending).
//   error    - last sync attempt failed (will retry on the next change).
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'unsynced' | 'error';

type Notify = (message: string, opts?: ToastOptions) => void;

interface Params {
  // Latest settings - the publish handler reads the preview-URL override, so the
  // effect rebinds when it changes.
  settings: Settings;
  // The real Figma file key (or share URL) for this document, supplied by the
  // user and remembered per-file. Needed to build the embed; the effect rebinds
  // when it changes.
  figmaFileKey: string;
  // Resolves a preset id to its pattern data when building the payload.
  presetById: Map<string, CatalogEntry>;
  notify: Notify;
  // Called after a publish is persisted by the server (a new revision is
  // confirmed) with a diff/refetch message to relay to an open live preview.
  // The caller decides whether a phone is connected before broadcasting.
  onPublished?: (message: PreviewUpdateMessage) => void;
}

// Owns everything about publishing the current document's bindings to the Pulsar
// preview server and the share actions built on top of it (open / copy link /
// copy token / QR / visibility toggle). Keeps the per-file token + revision
// bookkeeping in refs so the (rebinding) message handlers always read fresh
// values, and exposes the sync status + share affordances for the UI.
export function usePreviewSync({ settings, figmaFileKey, presetById, notify, onPublished }: Params) {
  // --- Per-file server-sync state ---------------------------------------
  // The file we're editing. Tokens + cached config are keyed by this so a
  // different design file gets its own server row instead of overwriting the
  // first. Resolved from figma.fileKey (or the file-key override).
  const fileKeyRef = useRef<string>('');
  // Current file's secret edit token (write access). Kept in a ref so the
  // (rebound) preview-data and doc-changed handlers always read the latest value.
  const tokenRef = useRef<string | null>(null);
  // Current file's read-only share token - what goes into share links. Rotated
  // server-side whenever a revoked link is re-published.
  const publicTokenRef = useRef<string | null>(null);
  // Current file's read-only private preview token - what goes into the pairing
  // QR + the live-update relay. Unlike the share token it always resolves
  // (ignores the public/private toggle) and is never rotated, so a paired
  // phone's live preview survives the share link being made private.
  const previewTokenRef = useRef<string | null>(null);
  // Server revision our local state is based on (for conflict detection).
  const baseRevisionRef = useRef<number | null>(null);
  // stableStringify of the payload we last successfully pushed - lets us skip a
  // network round-trip when nothing actually changed.
  const lastSyncedJsonRef = useRef<string | null>(null);
  // The payload object behind lastSyncedJsonRef - the basis we diff the next
  // publish against when relaying a live update to the preview. Kept in lockstep
  // with lastSyncedJsonRef (set/cleared together).
  const lastSyncedPayloadRef = useRef<PreviewPayload | null>(null);
  // Always-fresh handle to the publish callback so the (rebinding) preview-data
  // effect never goes stale on it and we don't rebind just because the parent
  // passes a new closure each render.
  const onPublishedRef = useRef(onPublished);
  onPublishedRef.current = onPublished;
  // Promise chain that serializes all publishes, so concurrent triggers (cold
  // start + a doc-change) can't both create a token and orphan a server row.
  const syncLockRef = useRef<Promise<void>>(Promise.resolve());
  // Debounce timer for background auto-save.
  const autosyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Flips true once this file's persisted project state has loaded (handleProject
  // ran, or there was no server id to load). Gates the "configuring the live
  // preview auto-starts sync" trigger so a user-typed file key can't create a
  // second server row before the stored token has been read back in.
  const projectReadyRef = useRef(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  // Share-link visibility for the current file. true = anyone with the link can
  // view; false = the link is revoked server-side until the user shares again.
  // Defaults to public (the historical behaviour) and is reconciled with the
  // server on cold start and on every explicit share.
  const [isPublic, setIsPublic] = useState(true);
  // Mirror of publicTokenRef as state so the phone-pairing panel can react when
  // a share token first appears (or changes) for this file and fold it into the
  // unified QR / relay it over an already-paired connection.
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const rememberPublicToken = useCallback((t: string | null) => {
    publicTokenRef.current = t;
    setPublicToken(t);
  }, []);
  // Mirror of previewTokenRef as state so the phone-pairing panel can fold the
  // private preview token into the unified QR / relay it to a paired phone.
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const rememberPreviewToken = useCallback((t: string | null) => {
    previewTokenRef.current = t;
    setPreviewToken(t);
  }, []);
  // Resolver for an in-flight ensureShared() request (the 'pair' purpose), so
  // the async preview-data round-trip can hand its result back to the caller.
  const pairResolveRef = useRef<((t: string | null) => void) | null>(null);
  const settlePair = useCallback((t: string | null) => {
    const r = pairResolveRef.current;
    pairResolveRef.current = null;
    r?.(t);
  }, []);

  // Cold-start reconcile for a file. The server is the source of truth: if we
  // have no local cache but do have a token, fetch the server copy and seed the
  // cache. Either way, finish by kicking a silent auto-sync so any local design
  // drift since the last snapshot gets published (the Figma doc is live truth).
  const handleProject = async (m: {
    fileKey: string;
    token: string | null;
    publicToken: string | null;
    previewToken: string | null;
    config: unknown | null;
    baseRevision: number | null;
    isPublic: boolean;
  }) => {
    fileKeyRef.current = m.fileKey;
    tokenRef.current = m.token;
    rememberPublicToken(m.publicToken);
    rememberPreviewToken(m.previewToken);
    baseRevisionRef.current = m.baseRevision;
    // Seed the toggle from the cached value; the server-fetch branch below
    // reconciles it with the source of truth when there's a token to check.
    setIsPublic(m.isPublic);
    if (m.config != null) {
      lastSyncedJsonRef.current = stableStringify(m.config);
      lastSyncedPayloadRef.current = m.config as PreviewPayload;
      setSyncStatus(m.token ? 'synced' : 'idle');
    } else if (m.token) {
      setSyncStatus('syncing');
      try {
        const got = await fetchProject(m.token);
        if (got.kind === 'ok') {
          baseRevisionRef.current = got.revision;
          lastSyncedJsonRef.current = stableStringify(got.config);
          lastSyncedPayloadRef.current = got.config as PreviewPayload;
          setIsPublic(got.isPublic);
          // Recover/refresh the read-only share + preview tokens from the server.
          const recoveredPublic = got.publicToken ?? publicTokenRef.current;
          const recoveredPreview = got.previewToken ?? previewTokenRef.current;
          if (
            (got.publicToken && got.publicToken !== publicTokenRef.current) ||
            (got.previewToken && got.previewToken !== previewTokenRef.current)
          ) {
            if (got.publicToken) rememberPublicToken(got.publicToken);
            if (got.previewToken) rememberPreviewToken(got.previewToken);
            send({
              type: 'persist-project-token',
              fileKey: m.fileKey,
              token: m.token,
              publicToken: recoveredPublic ?? '',
              previewToken: recoveredPreview
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
          // - the next autosync will re-publish the live document's bindings.
          setIsPublic(false);
          send({ type: 'persist-project-visibility', fileKey: m.fileKey, isPublic: false });
          setSyncStatus('synced');
        } else {
          // Token no longer exists server-side - forget it; nothing is shared.
          tokenRef.current = null;
          rememberPublicToken(null);
          rememberPreviewToken(null);
          lastSyncedJsonRef.current = null;
          lastSyncedPayloadRef.current = null;
          baseRevisionRef.current = null;
          setSyncStatus('idle');
        }
      } catch {
        setSyncStatus('error');
      }
    } else {
      lastSyncedJsonRef.current = null;
      lastSyncedPayloadRef.current = null;
      setSyncStatus('idle');
    }
    // The persisted token (if any) is now loaded, so it's safe to let a
    // subsequent file-key configuration auto-create/sync without racing this.
    projectReadyRef.current = true;
    // No server row for this file yet → eagerly provision one now (first open),
    // so the token / share link / pairing QR exist from the start. Otherwise
    // just push any local drift since the last snapshot.
    send({
      type: 'request-preview-data',
      purpose: tokenRef.current ? 'autosync' : 'bootstrap'
    });
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

  // Register the project + doc-changed handlers once (they only touch refs and
  // setters, so they never need to rebind).
  useEffect(() => {
    const off = onMessage((m) => {
      if (m.type === 'project') void handleProject(m);
      if (m.type === 'doc-changed') handleDocChanged();
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      // ensureShared() request: resolve the file's public token (or null when
      // the file isn't preview-ready) and pair code-only without UI nagging.
      const isPair = purpose === 'pair';
      // First-open provisioning: create the backend row if this file has none
      // yet, before the file is even configured, and without any share/URL
      // side-effects or error toasts.
      const isBootstrap = purpose === 'bootstrap';

      // Two distinct keys:
      //  - `fileKey`: the plugin's stable minted id (m.fileKey), used purely to
      //    key our server tokens/cache.
      //  - `embedFileKey`: the *real* Figma file key the live preview needs to
      //    build the embed.figma.com/proto/<key> URL. The plugin can't read it
      //    without the private API, so the user supplies it via the file-key
      //    override (a full share URL or raw key).
      const fileKey = m.fileKey ?? '';
      const embedFileKey = figmaFileKey ? extractFileKey(figmaFileKey) : '';
      // Bootstrap provisions the row before the file is configured, so it runs
      // without the real Figma file key (the embed key is filled in later once
      // the user pastes it). Every other purpose needs it to build the embed.
      if (!fileKey || (!embedFileKey && !isBootstrap)) {
        // Pairing proceeds code-only when the file isn't preview-ready - resolve
        // null without nagging the user with a warning toast.
        if (isPair) {
          settlePair(null);
          return;
        }
        if (silent || isBootstrap) return;
        notify(
          'Add this file’s key in the Share tab (Figma file key) to enable the live preview.',
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
      // Bootstrap still provisions an (empty) row with no bindings - that's the
      // point of first-open provisioning; real bindings get pushed later.
      if (elements.length === 0 && !isBootstrap) {
        // No bindings → nothing to preview. Pair code-only, quietly.
        if (isPair) {
          settlePair(null);
          setSyncStatus(tokenRef.current ? 'synced' : 'idle');
          return;
        }
        if (silent || purpose === 'sync') {
          // Nothing to publish. Don't touch the (possibly stale) server row.
          setSyncStatus(tokenRef.current ? 'synced' : 'idle');
          return;
        }
        notify('No haptic bindings on this page yet.', { level: 'info' });
        return;
      }
      const payload = {
        // The preview embeds this as the Figma file key - the real key once
        // configured, or empty for a first-open bootstrap row (filled in later).
        fileKey: embedFileKey,
        nodeId: m.presentNodeId,
        frame: m.presentNodeBox,
        elements,
        owner,
        bindings,
        frames: m.frames
      };

      // Publish `payload` to the server, reconciling against its current state.
      // Returns the token (or null when nothing is shared yet and create isn't
      // allowed - i.e. a background auto-sync of a never-shared file).
      const ensurePublished = async (allowCreate: boolean): Promise<string | null> => {
        const json = stableStringify(payload);
        // Capture the basis to diff the live-preview update against before any
        // branch below overwrites our last-synced snapshot.
        const prevPayload = lastSyncedPayloadRef.current;
        const prevRevision = baseRevisionRef.current;
        const nextPayload = payload as unknown as PreviewPayload;

        // Relay the just-persisted change to an open live preview. `forced` (we
        // resolved a conflict by re-publishing on the server's revision) always
        // refetches - our local basis may not match what the preview last read.
        // Otherwise diff the render-relevant config and relay only the delta,
        // falling back to a full refetch when there's no basis, the file key
        // changed (a different prototype), or the diff is too large for one
        // socket message. Only ever called once the server has confirmed the
        // write (a new revision), so a refetch can't read stale data.
        const emitUpdate = (toRevision: number, forced: boolean) => {
          const cb = onPublishedRef.current;
          if (!cb) return;
          // Relay against the private preview token so a paired phone refetches
          // through the always-on read path, even if the share link is private.
          const previewToken = previewTokenRef.current ?? undefined;
          if (
            !forced &&
            prevPayload != null &&
            prevRevision != null &&
            prevPayload.fileKey === nextPayload.fileKey
          ) {
            const diff = diffPayloads(prevPayload, nextPayload);
            if (isEmptyDiff(diff)) return; // nothing the preview renders changed
            if (stableStringify(diff).length <= PREVIEW_DIFF_MAX_BYTES) {
              cb({
                kind: 'preview-haptics-diff',
                previewToken,
                fromRevision: prevRevision,
                toRevision,
                diff
              });
              return;
            }
          }
          cb({ kind: 'preview-haptics-refetch', previewToken, toRevision });
        };

        const adopt = (
          t: string,
          publicToken: string,
          previewToken: string,
          revision: number
        ) => {
          tokenRef.current = t;
          rememberPublicToken(publicToken);
          rememberPreviewToken(previewToken);
          baseRevisionRef.current = revision;
          lastSyncedJsonRef.current = json;
          lastSyncedPayloadRef.current = nextPayload;
          send({ type: 'persist-project-token', fileKey, token: t, publicToken, previewToken });
          send({ type: 'persist-project-cache', fileKey, config: payload, baseRevision: revision });
        };

        const token = tokenRef.current;

        // Create a fresh server row and adopt its tokens/revision. (No preview
        // can be open against a token that didn't exist yet, so nothing to relay.)
        const createAndAdopt = async (): Promise<string> => {
          const created = await createProject(payload);
          adopt(created.token, created.publicToken, created.previewToken, created.revision);
          return created.token;
        };
        // The server row is gone and we can't/shouldn't recreate it now - drop
        // the local token + revision snapshot so the next change starts clean.
        const forgetToken = (): null => {
          tokenRef.current = null;
          baseRevisionRef.current = null;
          lastSyncedJsonRef.current = null;
          lastSyncedPayloadRef.current = null;
          return null;
        };
        // Record a confirmed update: adopt the new revision, refresh the cache,
        // and relay the change to any open preview.
        const commitUpdate = (revision: number, forced: boolean): string => {
          baseRevisionRef.current = revision;
          lastSyncedJsonRef.current = json;
          lastSyncedPayloadRef.current = nextPayload;
          send({ type: 'persist-project-cache', fileKey, config: payload, baseRevision: revision });
          emitUpdate(revision, forced);
          return token as string;
        };

        // Skip the round-trip when nothing actually changed since last sync.
        if (token && json === lastSyncedJsonRef.current) return token;
        if (!token) return allowCreate ? createAndAdopt() : null;

        const res = await updateProject(token, payload, baseRevisionRef.current);
        if (res.kind === 'ok') return commitUpdate(res.revision, false);
        // Token vanished server-side: recreate when allowed, else forget it.
        if (res.kind === 'gone') return allowCreate ? createAndAdopt() : forgetToken();

        // Conflict: someone changed the row since our base. Adopt the server's
        // revision (it's the source of truth for the base) but re-publish our
        // payload on top - the Figma document is the live design (last-writer-wins).
        const forced = await updateProject(token, payload, res.revision);
        if (forced.kind === 'ok') return commitUpdate(forced.revision, true);
        if (forced.kind === 'gone') return allowCreate ? createAndAdopt() : forgetToken();

        // Lost a second race - bail; the next change will retry from the new base.
        baseRevisionRef.current = forced.revision;
        throw new Error('Sync conflict - will retry on the next change.');
      };

      void runExclusive(async () => {
        // Bootstrap only provisions a *missing* row: if a token already exists
        // (created since we fired, or loaded from cache), there's nothing to do
        // and we must not push the empty bootstrap payload over real data.
        if (isBootstrap && tokenRef.current) {
          setSyncStatus('synced');
          return;
        }
        setSyncStatus('syncing');
        let token: string | null;
        try {
          // A configured live preview (valid Figma file key) is treated as intent
          // to share, so even a silent autosync may create the server row and
          // start syncing - the user no longer has to explicitly copy a link or
          // pair a phone first for the sync indicator to go live. Bootstrap always
          // creates (that's its whole job).
          const configured = isFileKeyValid(figmaFileKey);
          token = await ensurePublished(!silent || configured || isBootstrap);
        } catch (err) {
          // Bootstrap is a silent first-open convenience: on failure just fall
          // back to idle and let a later configure/sync retry - no error pill.
          setSyncStatus(isBootstrap ? 'idle' : 'error');
          if (isPair) {
            settlePair(null);
            return;
          }
          if (!silent && !isBootstrap) {
            notify(`Could not upload preview data: ${(err as Error).message}`, { level: 'error' });
          }
          return;
        }
        if (!token) {
          // Background auto-sync of a file that was never shared - nothing to do.
          if (isPair) settlePair(null);
          setSyncStatus('idle');
          return;
        }
        setSyncStatus('synced');

        // Pairing a phone hands the designer their PRIVATE preview token, which
        // the QR encodes and the phone reads through the always-on path. It must
        // NOT touch the share link's visibility (pairing a phone is unrelated to
        // who can open a shared link). Recover the token from the server if it
        // isn't cached (e.g. a legacy share or a phone re-paired after restart).
        if (isPair) {
          let pairToken = previewTokenRef.current;
          if (!pairToken) {
            const got = await fetchProject(token);
            if (got.kind === 'ok' && got.previewToken) {
              pairToken = got.previewToken;
              rememberPreviewToken(pairToken);
              if (got.publicToken) rememberPublicToken(got.publicToken);
              send({
                type: 'persist-project-token',
                fileKey,
                token,
                publicToken: got.publicToken ?? publicTokenRef.current ?? '',
                previewToken: pairToken
              });
            }
          }
          settlePair(pairToken ?? null);
          return;
        }

        // Beyond the sync itself, share actions also need a URL / QR / clipboard.
        // Bootstrap is provisioning-only - it never opens/copies or touches the
        // share-link visibility.
        if (purpose === 'autosync' || purpose === 'sync' || isBootstrap) return;

        // Any explicit share re-opens the link to the public: if the user had
        // made it private, handing the link out again necessarily makes it
        // viewable, so flip the toggle back on. Re-publishing a previously-private
        // link rotates the share token server-side (the old link stays dead), so
        // adopt whatever token the PATCH returns before building the URL.
        setIsPublic(true);
        send({ type: 'persist-project-visibility', fileKey, isPublic: true });
        const vis = await setProjectVisibility(token, true).catch(() => null);
        if (vis?.ok && vis.publicToken && vis.publicToken !== publicTokenRef.current) {
          rememberPublicToken(vis.publicToken);
          send({
            type: 'persist-project-token',
            fileKey,
            token,
            publicToken: vis.publicToken,
            previewToken: previewTokenRef.current
          });
        }

        // Everything we hand out carries the read-only public token, never the
        // edit token. Recover it from the server if not cached (e.g. legacy share).
        // Named `shareToken` to avoid shadowing the hook-level `publicToken` state.
        let shareToken = publicTokenRef.current;
        if (!shareToken) {
          const got = await fetchProject(token);
          if (got.kind === 'ok' && got.publicToken) {
            shareToken = got.publicToken;
            rememberPublicToken(shareToken);
            send({
              type: 'persist-project-token',
              fileKey,
              token,
              publicToken: shareToken,
              previewToken: got.previewToken ?? previewTokenRef.current
            });
          }
        }
        if (!shareToken) {
          notify('Could not resolve the share link. Try “Sync now” and retry.', { level: 'error' });
          return;
        }

        // Strip any existing query/hash so we don't duplicate or stack tokens
        // when the user has manually visited the preview before.
        const base = resolvePreviewBaseUrl(settings.previewBaseUrlOverride).replace(/[?#].*$/, '');
        const url = `${base}?token=${encodeURIComponent(shareToken)}`;
        if (purpose === 'copy') {
          const ok = copyToClipboard(url);
          notify(ok ? 'Share link copied to clipboard.' : 'Could not copy the share link.', {
            level: ok ? 'success' : 'error'
          });
        } else if (purpose === 'copy-token') {
          // Just the raw read-only token - handy for pasting into other
          // figma-preview URLs (e.g. a local dev instance) or debugging.
          const ok = copyToClipboard(shareToken);
          notify(ok ? 'Share token copied to clipboard.' : 'Could not copy the share token.', {
            level: ok ? 'success' : 'error'
          });
        } else {
          send({ type: 'open-external', url });
        }
      });
    });
    return off;
  }, [figmaFileKey, settings.previewBaseUrlOverride, presetById, notify, settlePair]);

  // Called from the `init` message handler once the file key is resolved: pull
  // this file's persisted token + cached config (or settle to idle).
  const initProject = (fileKey: string) => {
    fileKeyRef.current = fileKey;
    if (fileKey) {
      send({ type: 'get-project', fileKey });
    } else {
      // No server id to load - nothing to race, so the configure-to-sync trigger
      // can run immediately.
      projectReadyRef.current = true;
      setSyncStatus('idle');
    }
  };

  // Configuring the live preview auto-starts syncing: the moment the Figma file
  // key becomes valid, publish to the backend so the sync indicator goes live
  // without the user having to copy a share link or pair a phone first. Only on
  // the false→true transition (not every keystroke once valid), and only after
  // the persisted project state has loaded, so we never create a duplicate row
  // ahead of the stored token (the init/reopen path syncs via handleProject).
  const fileKeyValidRef = useRef(false);
  useEffect(() => {
    const valid = isFileKeyValid(figmaFileKey);
    const wasValid = fileKeyValidRef.current;
    fileKeyValidRef.current = valid;
    if (valid && !wasValid && projectReadyRef.current) {
      send({ type: 'request-preview-data', purpose: 'autosync' });
    }
  }, [figmaFileKey]);

  const showInLivePreview = () => send({ type: 'request-preview-data', purpose: 'open' });
  const copyShareLink = () => send({ type: 'request-preview-data', purpose: 'copy' });
  const copyShareToken = () => send({ type: 'request-preview-data', purpose: 'copy-token' });
  // Resolve the file's private preview token for the unified phone-pairing QR,
  // publishing the project first if needed. This is the always-on token (never
  // revoked or rotated by the share-link toggle), so a paired phone keeps its
  // live preview regardless of the link's visibility. Resolves null when the
  // file isn't preview-ready (no Figma file key / no bindings) so the caller
  // pairs the phone with the code alone.
  const ensureShared = useCallback((): Promise<string | null> => {
    // Supersede any in-flight pairing request.
    settlePair(null);
    return new Promise<string | null>((resolve) => {
      pairResolveRef.current = resolve;
      setSyncStatus('syncing');
      send({ type: 'request-preview-data', purpose: 'pair' });
      // Safety net: never leave the caller hanging if no reply ever arrives.
      setTimeout(() => {
        if (pairResolveRef.current === resolve) settlePair(null);
      }, 8000);
    });
  }, [settlePair]);
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
    if (!token) return; // nothing shared yet - nothing to make private/public
    setIsPublic(next);
    send({ type: 'persist-project-visibility', fileKey, isPublic: next });
    void (async () => {
      let res: Awaited<ReturnType<typeof setProjectVisibility>> | null = null;
      try {
        res = await setProjectVisibility(token, next);
      } catch {
        res = null;
      }
      if (!res?.ok) {
        setIsPublic(!next);
        send({ type: 'persist-project-visibility', fileKey, isPublic: !next });
        notify('Could not update the preview’s visibility. Please try again.', { level: 'error' });
        return;
      }
      // Re-publishing (private → public) rotates the share token: adopt the fresh
      // one so the next "copy link" hands out a working URL. (The private preview
      // token the paired phone uses is untouched, so its live preview survives.)
      if (next && res.publicToken && res.publicToken !== publicTokenRef.current) {
        rememberPublicToken(res.publicToken);
        send({
          type: 'persist-project-token',
          fileKey,
          token,
          publicToken: res.publicToken,
          previewToken: previewTokenRef.current
        });
      }
      notify(
        next
          ? 'Preview link is public - anyone with the link can view it.'
          : 'Preview link is now private - the link won’t work until you share again.',
        { level: 'success' }
      );
    })();
  };

  return {
    syncStatus,
    isPublic,
    // The current file's read-only share token (null until shared), surfaced for
    // the share-link UI (copy link / copy token).
    publicToken,
    // The current file's private preview token (null until shared), surfaced so
    // the phone-pairing panel can fold it into the unified QR / relay it. Unlike
    // publicToken it's never revoked or rotated by the visibility toggle.
    previewToken,
    ensureShared,
    initProject,
    showInLivePreview,
    copyShareLink,
    copyShareToken,
    syncNow,
    setVisibility
  };
}
