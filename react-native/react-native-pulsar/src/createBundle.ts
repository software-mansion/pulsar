import { Image } from 'react-native';
import Pulsar from './NativeRNPulsar';

/** A single playable preset from a loaded bundle. */
export type PresetHandle = {
  readonly id: string;
  play: () => void;
  stop: () => void;
};

/** The typed bundle returned by `loadBundle`. */
export type Bundle<P> = {
  readonly presets: P;
  readonly id: string;
  readonly contentHash: string;
  get: (id: string) => PresetHandle | undefined;
  dispose: () => void;
};

type SidecarPreset = {
  name: string;
  duration?: number;
  audio: boolean;
  animation: boolean;
};

/** Shape of the generated `*.presets.json` sidecar (emitted by pulsar-gen --target rn). */
export type BundleSidecar = {
  id: string;
  contentHash: string;
  revision?: number;
  presets: Record<string, SidecarPreset>;
};

/** Binds a sidecar (types) to a required `.pulsar` asset (runtime). */
export type BundleDescriptor<P> = {
  readonly asset: number;
  readonly bundleId: string;
  readonly contentHash: string;
  readonly presetIds: string[];
  /** Phantom type carrying the preset keys — never read at runtime. */
  readonly __presets?: P;
};

/**
 * Create a typed bundle descriptor. Types come from `keyof` over the imported sidecar (the
 * nano-icons approach) — no code generation of `.d.ts`.
 *
 *     import sidecar from './assets/acme-pack.presets.json';
 *     export const AcmePack = createBundle(sidecar, require('./assets/acme-pack.pulsar'));
 */
export function createBundle<M extends BundleSidecar>(
  sidecar: M,
  asset: number
): BundleDescriptor<{ [K in keyof M['presets']]: PresetHandle }> {
  return {
    asset,
    bundleId: sidecar.id,
    contentHash: sidecar.contentHash,
    presetIds: Object.keys(sidecar.presets),
  };
}

/**
 * Load a bundle at runtime and return its typed presets view.
 *
 *     const bundle = await loadBundle(AcmePack);
 *     bundle.presets.heartbeatV2.play();   // ← autocompletes
 */
export async function loadBundle<P>(
  descriptor: BundleDescriptor<P>
): Promise<Bundle<P>> {
  const base64 = await assetToBase64(descriptor.asset);
  const token = Pulsar.Pulsar_loadBundle(base64);
  if (!token) {
    throw new Error(`Pulsar: failed to load bundle "${descriptor.bundleId}"`);
  }

  const presets: Record<string, PresetHandle> = {};
  for (const id of descriptor.presetIds) {
    presets[id] = {
      id,
      play: () => Pulsar.Pulsar_playBundlePreset(token, id),
      stop: () => Pulsar.Pulsar_stopBundlePreset(token, id),
    };
  }

  return {
    presets: presets as P,
    id: token,
    contentHash: descriptor.contentHash,
    get: (id: string) => presets[id],
    dispose: () => Pulsar.Pulsar_disposeBundle(token),
  };
}

async function assetToBase64(moduleId: number): Promise<string> {
  const source = Image.resolveAssetSource(moduleId);
  if (!source?.uri) {
    throw new Error('Pulsar: could not resolve .pulsar asset — is it required() and in metro assetExts?');
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
