// Kotlin emitter — `object <Name>` exposing a typed BundleDescriptor. Portable (no Node APIs).

import type { BundleManifest, GenerateOptions, GeneratedFile } from '../types.ts';
import { pascalCase } from '../naming.ts';
import { DO_NOT_EDIT, resolveAssetName, contentHash } from './shared.ts';

export function emitKotlin(manifest: BundleManifest, opts: GenerateOptions = {}): GeneratedFile {
  const typeName = pascalCase(manifest.name);
  const asset = `${resolveAssetName(manifest, opts)}.pulsar`;
  const pkg = opts.packageName ?? 'com.swmansion.pulsar.bundles';
  // Android's SDK and KMP's ship the same bundle API under different packages.
  const runtime = opts.runtimePackage ?? 'com.swmansion.pulsar.bundle';
  const ids = manifest.presets.map((p) => p.id);

  const presetFields = ids
    .map((id) => `        val ${id}: PresetHandle = r["${id}"]`)
    .join('\n');
  const idList = ids.map((id) => `"${id}"`).join(', ');

  const content = `// ${DO_NOT_EDIT}
// Bundle: ${manifest.id} (${manifest.presets.length} preset${manifest.presets.length === 1 ? '' : 's'})
package ${pkg}

import ${runtime}.BundleDescriptor
import ${runtime}.BundleResolver
import ${runtime}.PresetHandle

object ${typeName} {
    const val assetName = "${asset}"
    const val bundleId = "${manifest.id}"
    const val contentHash = "${contentHash(manifest)}"

    class Presets(r: BundleResolver) {
${presetFields}
    }

    val descriptor = BundleDescriptor(
        assetName = assetName,
        bundleId = bundleId,
        contentHash = contentHash,
        presetIds = listOf(${idList}),
        build = ::Presets,
    )
}
`;
  return { filename: `${typeName}.kt`, content };
}
