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

export type LoadBundleOptions =
  | { readonly withAssets: false }
  | { readonly withAssets: true };

type PresetsOf<M extends BundleDefinition> = {
  [K in keyof M['presets']]: PresetHandle;
};

type LoadedBundle<M extends BundleDefinition> = Bundle<PresetsOf<M>>;

export interface BundleLoader<M extends BundleDefinition> {
  (options: { withAssets: false }): LoadedBundle<M>;
  (options: { withAssets: true }): Promise<LoadedBundle<M>>;
  (options: LoadBundleOptions): LoadedBundle<M> | Promise<LoadedBundle<M>>;
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

/**
 * Called by a generated `*.bundle.ts` module. Applications import the bound
 * `loadBundle` from that module instead of importing this function directly.
 */
export function defineBundle<M extends BundleDefinition>(
  definition: M
): BundleLoader<M> {
  assertDefinition(definition);

  const load = ({
    withAssets,
  }: LoadBundleOptions): LoadedBundle<M> | Promise<LoadedBundle<M>> => {
    if (!withAssets) {
      return createLoadedBundle(definition);
    }
    return loadNativeBundle(definition);
  };

  return load as BundleLoader<M>;
}

async function loadNativeBundle<M extends BundleDefinition>(
  definition: M
): Promise<LoadedBundle<M>> {
  const source = Image.resolveAssetSource(definition.asset);
  if (!source?.uri) {
    throw new Error(
      'Pulsar: could not resolve .pulsar asset — is withPulsar() configured in metro.config.js?'
    );
  }
  const bundleToken = await Pulsar.Pulsar_loadBundleFromUri(source.uri);
  if (!bundleToken) {
    throw new Error(`Pulsar: failed to load bundle "${definition.id}"`);
  }
  return createLoadedBundle(definition, bundleToken);
}

function createLoadedBundle<M extends BundleDefinition>(
  definition: M,
  bundleToken?: string
): Bundle<PresetsOf<M>> {
  const parsedIds = new Map<string, number>();
  const presets: Record<string, PresetHandle> = {};
  const nativeToken = bundleToken;

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
      play: nativeToken
        ? () => Pulsar.Pulsar_playBundlePreset(nativeToken, id)
        : () => Pulsar.PatternComposer_play(parseOnce()),
      stop: () => {
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
      if (bundleToken) {
        Pulsar.Pulsar_disposeBundle(bundleToken);
        bundleToken = undefined;
      }
      for (const parsedId of parsedIds.values()) {
        Pulsar.PatternComposer_release(parsedId);
      }
      parsedIds.clear();
    },
  });
}
