// Dart emitter — a typed BundleDescriptor + presets class. Portable (no Node APIs).

import type { BundleManifest, GenerateOptions, GeneratedFile } from '../types.ts';
import { pascalCase, lowerCamel, snakeCase } from '../naming.ts';
import { DO_NOT_EDIT, resolveAssetName, contentHash } from './shared.ts';

export function emitDart(manifest: BundleManifest, opts: GenerateOptions = {}): GeneratedFile {
  const typeName = pascalCase(manifest.name);
  const varName = lowerCamel(manifest.name);
  const asset = `assets/pulsar/${resolveAssetName(manifest, opts)}.pulsar`;
  const ids = manifest.presets.map((p) => p.id);

  const ctorInit = ids.map((id) => `        ${id} = r['${id}']`).join(',\n');
  const fields = ids.map((id) => `  final PresetHandle ${id};`).join('\n');
  const idList = ids.map((id) => `'${id}'`).join(', ');

  const content = `// ${DO_NOT_EDIT}
// Bundle: ${manifest.id} (${manifest.presets.length} preset${manifest.presets.length === 1 ? '' : 's'})
import 'package:pulsar_haptics/pulsar_haptics.dart';

/// The loaded bundle. Presets are direct members — bundle.${ids[0] ?? 'presetId'}.play() — and the
/// bundle's own members sit alongside them; pulsar-gen rejects a preset named after one.
class ${typeName}Presets {
  ${typeName}Presets(BundleResolver r)
      : _r = r${ctorInit ? ',' : ''}
${ctorInit};

  final BundleResolver _r;
${fields}

  String get id => _r.bundleId;
  String get contentHash => _r.contentHash;

  /// Look a preset up by an id only known at runtime.
  PresetHandle? get(String id) => _r.handle(id);

  /// Release the native patterns this bundle parsed.
  void dispose() => _r.dispose();
}

final ${varName} = BundleDescriptor<${typeName}Presets>(
  assetName: '${asset}',
  bundleId: '${manifest.id}',
  contentHash: '${contentHash(manifest)}',
  presetIds: const [${idList}],
  build: ${typeName}Presets.new,
);
`;
  return { filename: `${snakeCase(manifest.name)}.bundle.dart`, content };
}
