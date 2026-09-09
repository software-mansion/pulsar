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

/** Definition embedded in a generated `*.bundle.ts` module. */
export type BundleDefinition = {
  schema: string;
  id: string;
  contentHash: string;
  revision?: number;
  presets: Record<string, SidecarPreset>;
  asset: number;
};

type PresetsOf<M extends BundleDefinition> = {
  [K in keyof M['presets']]: PresetHandle;
};

type LoadedBundle<M extends BundleDefinition> = Bundle<PresetsOf<M>>;

export interface BundleLoaders<M extends BundleDefinition> {
  /** `includeAssets` reads the `.pulsar` on the calling thread — in dev, that blocks on Metro. */
  loadBundleSync(includeAssets?: boolean): LoadedBundle<M>;
  loadBundleWithAssetsAsync(): Promise<LoadedBundle<M>>;
}

function assertDefinition(definition: BundleDefinition | undefined): void {
  if (definition?.schema !== SIDECAR_SCHEMA) {
    throw new Error(
      `Pulsar: expected a generated "${SIDECAR_SCHEMA}" bundle but got ` +
        `"${definition?.schema ?? 'undefined'}". Regenerate it with \`npx pulsar-gen-rn\`.`
    );
  }
}

function withNonEnumerableMeta<P extends object>(
  presets: P,
  meta: BundleMeta
): Bundle<P> {
  const descriptors = Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [
      key,
      { value, enumerable: false },
    ])
  );
  return Object.defineProperties(presets, descriptors) as Bundle<P>;
}

function resolveAssetUri(definition: BundleDefinition): string {
  const source = Image.resolveAssetSource(definition.asset);
  if (!source?.uri) {
    throw new Error(
      'Pulsar: could not resolve .pulsar asset — is withPulsar() configured in metro.config.js?'
    );
  }
  return source.uri;
}

function assertToken(token: string, definition: BundleDefinition): string {
  if (!token) {
    throw new Error(
      `Pulsar: failed to load bundle "${definition.id}" — see the native log for the cause.`
    );
  }
  return token;
}

/** Called by a generated `*.bundle.ts` module, which re-exports the two loaders. */
export function defineBundle<M extends BundleDefinition>(
  definition: M
): BundleLoaders<M> {
  assertDefinition(definition);

  return {
    loadBundleSync: (includeAssets = false) => {
      if (!includeAssets) return createLoadedBundle(definition);
      const uri = resolveAssetUri(definition);
      const token = Pulsar.Pulsar_loadBundleFromUriSync(uri);
      return createLoadedBundle(definition, assertToken(token, definition));
    },
    loadBundleWithAssetsAsync: async () => {
      const uri = resolveAssetUri(definition);
      const token = await Pulsar.Pulsar_loadBundleFromUri(uri);
      return createLoadedBundle(definition, assertToken(token, definition));
    },
  };
}

function createLoadedBundle<M extends BundleDefinition>(
  definition: M,
  bundleToken?: string
): Bundle<PresetsOf<M>> {
  const parsedIds = new Map<string, number>();
  const presets: Record<string, PresetHandle> = {};
  let disposed = false;

  const warnDisposed = (action: string, id: string) => {
    if (__DEV__) {
      console.warn(
        `Pulsar: ignored ${action}() on preset "${id}" — bundle "${definition.id}" is disposed.`
      );
    }
  };

  for (const [id, preset] of Object.entries(definition.presets)) {
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
      play: () => {
        if (disposed) return warnDisposed('play', id);
        if (bundleToken) {
          Pulsar.Pulsar_playBundlePreset(bundleToken, id);
          return;
        }
        Pulsar.PatternComposer_play(parseOnce());
      },
      stop: () => {
        if (disposed) return warnDisposed('stop', id);
        if (bundleToken) {
          Pulsar.Pulsar_stopBundlePreset(bundleToken, id);
          return;
        }
        const parsedId = parsedIds.get(id);
        if (parsedId !== undefined) Pulsar.PatternComposer_stop(parsedId);
      },
    };
  }

  return withNonEnumerableMeta(presets as PresetsOf<M>, {
    id: definition.id,
    contentHash: definition.contentHash,
    get: (id: string) => presets[id],
    dispose: () => {
      if (disposed) return;
      disposed = true;
      if (bundleToken) Pulsar.Pulsar_disposeBundle(bundleToken);
      for (const parsedId of parsedIds.values()) {
        Pulsar.PatternComposer_release(parsedId);
      }
      parsedIds.clear();
    },
  });
}
