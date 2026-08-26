import { Image } from 'react-native';
import Pulsar from './NativeRNPulsar';
import type { Pattern } from './types';

// workaround for RN prototype caching issue
Pulsar.PatternComposer_play;

/** Sidecar format tag emitted by pulsar-gen; guards against a stale generated file. */
const SIDECAR_SCHEMA = 'pulsar.sidecar/1';

/** A Lottie animation carried by a preset, ready for `lottie-react-native`. */
export type PresetAnimation = {
  /** The parsed Lottie JSON — pass straight to a Lottie view's `source`. */
  readonly source: object;
  readonly frameRate?: number;
  readonly totalFrames?: number;
};

/** A single playable preset from a bundle. */
export type PresetHandle = {
  readonly id: string;
  /** Human label from the bundle manifest. */
  readonly name: string;
  /** Authored length in ms, when the manifest records one. */
  readonly duration?: number;
  /**
   * The raw device pattern. Exposed so callers can drive it themselves — e.g. sampling it per
   * frame to keep haptics locked to an animation timeline. `undefined` on the binary path, where
   * the pattern lives natively.
   */
  readonly pattern?: Pattern;
  /**
   * The preset's Lottie animation, when the bundle carries it in JS. Present on the inline path
   * for JSON animations; `undefined` for a dotLottie or on the binary path. Check
   * {@link PresetHandle.hasAnimation} to tell "no animation" from "not carried here".
   */
  readonly animation?: PresetAnimation;
  /**
   * The preset was authored with a synced sound. It only plays on the binary path
   * (`createBundleFromAsset` + `loadBundle`) — an inline bundle plays the haptics alone.
   */
  readonly hasAudio: boolean;
  /** The preset was authored with a Lottie animation. Carried by the binary path only. */
  readonly hasAnimation: boolean;
  play: () => void;
  stop: () => void;
};

/**
 * Bundle-level members. Preset ids can never shadow these — pulsar-gen rejects a manifest that
 * names a preset after one of them. They are non-enumerable, so `Object.keys(bundle)` is exactly
 * the preset ids.
 */
export type BundleMeta = {
  readonly id: string;
  readonly contentHash: string;
  /** Look a preset up by an id only known at runtime. */
  get: (id: string) => PresetHandle | undefined;
  /** Release the native patterns this bundle has parsed. Playing again re-parses them. */
  dispose: () => void;
};

/** A bundle: its presets as direct members, plus the bundle-level members. */
export type Bundle<P> = P & BundleMeta;

type SidecarPreset = {
  name: string;
  duration?: number;
  /** The device pattern, inlined by pulsar-gen. */
  pattern: Pattern;
  audio: boolean;
  animation: boolean;
  /** The inlined Lottie, when the preset has a JSON animation. */
  lottie?: { source: object; frameRate?: number; totalFrames?: number };
};

/** Shape of the generated `*.bundle.json` sidecar (emitted by pulsar-gen --target rn). */
export type BundleSidecar = {
  schema: string;
  id: string;
  contentHash: string;
  revision?: number;
  presets: Record<string, SidecarPreset>;
};

/** Maps a sidecar's preset keys onto handles — the source of `bundle.<id>` autocomplete. */
type PresetsOf<M extends BundleSidecar> = {
  [K in keyof M['presets']]: PresetHandle;
};

function assertSidecar(sidecar: BundleSidecar | undefined): void {
  if (sidecar?.schema !== SIDECAR_SCHEMA) {
    throw new Error(
      `Pulsar: expected a "${SIDECAR_SCHEMA}" sidecar but got "${sidecar?.schema ?? 'undefined'}". ` +
        'Regenerate it with `npx pulsar-gen-rn` — sidecars written before the inline format ' +
        '(`*.presets.json`) carry no patterns.'
    );
  }
}

/** Attach the bundle-level members without making them show up in `Object.keys`. */
function withMeta<P extends object>(presets: P, meta: BundleMeta): Bundle<P> {
  return Object.defineProperties(presets, {
    id: { value: meta.id, enumerable: false },
    contentHash: { value: meta.contentHash, enumerable: false },
    get: { value: meta.get, enumerable: false },
    dispose: { value: meta.dispose, enumerable: false },
  }) as Bundle<P>;
}

/**
 * Create a bundle from a generated sidecar. Synchronous and self-contained: the patterns are
 * inlined in the JSON, so there is no `.pulsar` asset to resolve and nothing to await.
 *
 *     import sidecar from './assets/acme-pack.bundle.json';
 *     const AcmePack = createBundle(sidecar);
 *     AcmePack.heartbeatV2.play();   // ← autocompletes
 *
 * Types come from `keyof` over the imported JSON (the nano-icons approach) — no code generation
 * of `.d.ts`. Each pattern is handed to the native composer lazily, on its first `play()`.
 *
 * Presets with audio or animation play their **haptics only** here (`hasAudio` / `hasAnimation`
 * tell you which); use `loadBundle` with the `.pulsar` binary if you need the media.
 */
export function createBundle<M extends BundleSidecar>(
  sidecar: M
): Bundle<PresetsOf<M>> {
  assertSidecar(sidecar);

  const parsed = new Map<string, number>();
  const presets: Record<string, PresetHandle> = {};

  for (const [id, preset] of Object.entries(sidecar.presets)) {
    const patternId = () => {
      let existing = parsed.get(id);
      if (existing === undefined) {
        existing = Pulsar.PatternComposer_parsePattern(preset.pattern);
        parsed.set(id, existing);
      }
      return existing;
    };

    presets[id] = {
      id,
      name: preset.name,
      duration: preset.duration,
      pattern: preset.pattern,
      animation: preset.lottie,
      hasAudio: preset.audio,
      hasAnimation: preset.animation,
      play: () => Pulsar.PatternComposer_play(patternId()),
      stop: () => {
        // Nothing to stop until the pattern has been parsed by a first play().
        const existing = parsed.get(id);
        if (existing !== undefined) Pulsar.PatternComposer_stop(existing);
      },
    };
  }

  return withMeta(presets as PresetsOf<M>, {
    id: sidecar.id,
    contentHash: sidecar.contentHash,
    get: (id: string) => presets[id],
    dispose: () => {
      for (const patternId of parsed.values()) {
        Pulsar.PatternComposer_release(patternId);
      }
      parsed.clear();
    },
  });
}

/** Per-preset facts carried through the descriptor so `loadBundle` can fill in its handles. */
export type PresetMedia = {
  name: string;
  duration?: number;
  audio: boolean;
  animation: boolean;
};

/** Binds a sidecar (types) to a required `.pulsar` asset (runtime), for `loadBundle`. */
export type BundleDescriptor<P> = {
  readonly asset: number;
  readonly bundleId: string;
  readonly contentHash: string;
  readonly presetIds: string[];
  readonly media: Record<string, PresetMedia>;
  /** Phantom type carrying the preset keys — never read at runtime. */
  readonly __presets?: P;
};

/**
 * Bind a sidecar to its `.pulsar` binary, for bundles whose presets carry audio or animation.
 * Needs `withPulsar` in metro.config.js so `require('./x.pulsar')` resolves.
 *
 *     const AcmePack = createBundleFromAsset(sidecar, require('./assets/acme-pack.pulsar'));
 *     const bundle = await loadBundle(AcmePack);
 *
 * For haptics-only bundles prefer `createBundle` — it needs no asset and no await.
 */
export function createBundleFromAsset<M extends BundleSidecar>(
  sidecar: M,
  asset: number
): BundleDescriptor<PresetsOf<M>> {
  assertSidecar(sidecar);
  const media: Record<string, PresetMedia> = {};
  for (const [id, preset] of Object.entries(sidecar.presets)) {
    media[id] = {
      name: preset.name,
      duration: preset.duration,
      audio: preset.audio,
      animation: preset.animation,
    };
  }
  return {
    asset,
    bundleId: sidecar.id,
    contentHash: sidecar.contentHash,
    presetIds: Object.keys(sidecar.presets),
    media,
  };
}

/**
 * Load a `.pulsar` binary at runtime and return its typed presets view. Carries audio and
 * animation; `createBundle` is the lighter path when a bundle is haptics-only.
 */
export async function loadBundle<P extends object>(
  descriptor: BundleDescriptor<P>
): Promise<Bundle<P>> {
  const base64 = await assetToBase64(descriptor.asset);
  const token = Pulsar.Pulsar_loadBundle(base64);
  if (!token) {
    throw new Error(`Pulsar: failed to load bundle "${descriptor.bundleId}"`);
  }

  const presets: Record<string, PresetHandle> = {};
  for (const id of descriptor.presetIds) {
    const media = descriptor.media[id];
    presets[id] = {
      id,
      name: media?.name ?? id,
      duration: media?.duration,
      // The pattern and the Lottie bytes stay native on this path.
      hasAudio: media?.audio ?? false,
      hasAnimation: media?.animation ?? false,
      play: () => Pulsar.Pulsar_playBundlePreset(token, id),
      stop: () => Pulsar.Pulsar_stopBundlePreset(token, id),
    };
  }

  return withMeta(presets as P, {
    id: descriptor.bundleId,
    contentHash: descriptor.contentHash,
    get: (id: string) => presets[id],
    dispose: () => Pulsar.Pulsar_disposeBundle(token),
  });
}

async function assetToBase64(moduleId: number): Promise<string> {
  const source = Image.resolveAssetSource(moduleId);
  if (!source?.uri) {
    throw new Error(
      'Pulsar: could not resolve .pulsar asset — is it required() and in metro assetExts?'
    );
  }
  const response = await fetch(source.uri);
  const blob = await response.blob();
  return blobToBase64(blob);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string; // data:...;base64,XXXX
      resolve(result.substring(result.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });
}
