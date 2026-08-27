import { Image } from 'react-native';
import Pulsar from './NativeRNPulsar';
import type { Pattern } from './types';

// workaround for RN prototype caching issue
Pulsar.PatternComposer_play;

const SIDECAR_SCHEMA = 'pulsar.sidecar/1';

export type PresetAnimation = {
  readonly source: object;
  readonly frameRate?: number;
  readonly totalFrames?: number;
};

/**
 * A playable preset. `hasAudio` / `hasAnimation` describe how it was *authored*; `pattern` and
 * `animation` hold the payloads, and are populated only by `createBundle` — on the `loadBundle`
 * path both live natively.
 */
export type PresetHandle = {
  readonly id: string;
  readonly name: string;
  readonly duration?: number;
  readonly pattern?: Pattern;
  readonly animation?: PresetAnimation;
  readonly hasAudio: boolean;
  readonly hasAnimation: boolean;
  play: () => void;
  stop: () => void;
};

export type BundleMeta = {
  readonly id: string;
  readonly contentHash: string;
  get: (id: string) => PresetHandle | undefined;
  dispose: () => void;
};

export type Bundle<P> = P & BundleMeta;

type SidecarPreset = {
  name: string;
  duration?: number;
  pattern: Pattern;
  audio: boolean;
  animation: boolean;
  lottie?: { source: object; frameRate?: number; totalFrames?: number };
};

/** Shape of the generated `*.bundle.json`. */
export type BundleSidecar = {
  schema: string;
  id: string;
  contentHash: string;
  revision?: number;
  presets: Record<string, SidecarPreset>;
};

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

function withNonEnumerableMeta<P extends object>(presets: P, meta: BundleMeta): Bundle<P> {
  const descriptors = Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [key, { value, enumerable: false }])
  );
  return Object.defineProperties(presets, descriptors) as Bundle<P>;
}

/**
 *     const AcmePack = createBundle(sidecar);
 *     AcmePack.heartbeatV2.play();
 *
 * Presets with audio play their haptics only here; `loadBundle` is the path that carries it.
 */
export function createBundle<M extends BundleSidecar>(
  sidecar: M
): Bundle<PresetsOf<M>> {
  assertSidecar(sidecar);

  const parsedIds = new Map<string, number>();
  const presets: Record<string, PresetHandle> = {};

  for (const [id, preset] of Object.entries(sidecar.presets)) {
    const parseOnce = () => {
      const alreadyParsed = parsedIds.get(id);
      if (alreadyParsed !== undefined) return alreadyParsed;

      const parsedId = Pulsar.PatternComposer_parsePattern(preset.pattern);
      parsedIds.set(id, parsedId);
      return parsedId;
    };

    presets[id] = {
      id,
      name: preset.name,
      duration: preset.duration,
      pattern: preset.pattern,
      animation: preset.lottie,
      hasAudio: preset.audio,
      hasAnimation: preset.animation,
      play: () => Pulsar.PatternComposer_play(parseOnce()),
      stop: () => {
        const parsedId = parsedIds.get(id);
        if (parsedId !== undefined) Pulsar.PatternComposer_stop(parsedId);
      },
    };
  }

  return withNonEnumerableMeta(presets as PresetsOf<M>, {
    id: sidecar.id,
    contentHash: sidecar.contentHash,
    get: (id: string) => presets[id],
    dispose: () => {
      for (const parsedId of parsedIds.values()) {
        Pulsar.PatternComposer_release(parsedId);
      }
      parsedIds.clear();
    },
  });
}

export type PresetMedia = {
  name: string;
  duration?: number;
  audio: boolean;
  animation: boolean;
};

export type BundleDescriptor<P> = {
  readonly asset: number;
  readonly bundleId: string;
  readonly contentHash: string;
  readonly presetIds: string[];
  readonly media: Record<string, PresetMedia>;
  /** Phantom: carries the preset keys through to `loadBundle`. Never read at runtime. */
  readonly __presets?: P;
};

/**
 * Binds a sidecar to its `.pulsar` binary. Needs `withPulsar` in metro.config.js so the
 * `require` resolves.
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

/** Loads the `.pulsar` binary, so authored audio plays alongside the haptics. */
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
      hasAudio: media?.audio ?? false,
      hasAnimation: media?.animation ?? false,
      play: () => Pulsar.Pulsar_playBundlePreset(token, id),
      stop: () => Pulsar.Pulsar_stopBundlePreset(token, id),
    };
  }

  return withNonEnumerableMeta(presets as P, {
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
