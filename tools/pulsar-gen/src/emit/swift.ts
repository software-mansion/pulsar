// Swift emitter — `enum <Name>` exposing a typed BundleDescriptor. Portable (no Node APIs).

import type { BundleManifest, GenerateOptions, GeneratedFile } from '../types.ts';
import { pascalCase } from '../naming.ts';
import { DO_NOT_EDIT, resolveAssetName, contentHash } from './shared.ts';

export function emitSwift(manifest: BundleManifest, opts: GenerateOptions = {}): GeneratedFile {
  const typeName = pascalCase(manifest.name);
  const asset = resolveAssetName(manifest, opts);
  const ids = manifest.presets.map((p) => p.id);

  const presetFields = ids.map((id) => `        public let ${id}: PresetHandle`).join('\n');
  const resolverArgs = ids.map((id) => `${id}: r["${id}"]`).join(', ');
  const idList = ids.map((id) => `"${id}"`).join(', ');

  const content = `// ${DO_NOT_EDIT}
// Bundle: ${manifest.id} (${manifest.presets.length} preset${manifest.presets.length === 1 ? '' : 's'})
import Pulsar

public enum ${typeName} {
    public static let assetName = "${asset}"
    public static let bundleId = "${manifest.id}"
    public static let contentHash = "${contentHash(manifest)}"

    public struct Presets {
${presetFields}
    }

    public static let descriptor = BundleDescriptor<Presets>(
        assetName: assetName,
        bundleId: bundleId,
        contentHash: contentHash,
        presetIds: [${idList}],
        build: { r in Presets(${resolverArgs}) }
    )
}
`;
  return { filename: `${typeName}.swift`, content };
}
