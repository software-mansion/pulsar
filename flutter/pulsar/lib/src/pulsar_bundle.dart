part of 'package:pulsar_haptics/pulsar.dart';

/// A single playable preset from a loaded bundle.
class PresetHandle {
  PresetHandle(this._token, this.id);

  final String _token;
  final String id;

  void play() => unawaited(PulsarPlatform.instance.playBundlePreset(_token, id));
  void stop() => unawaited(PulsarPlatform.instance.stopBundlePreset(_token, id));
}

/// Looks up preset handles by id when a generated descriptor builds its typed presets view.
/// Backs a generated presets class: resolves each preset by id, and carries the bundle-level
/// members the generated class re-exposes so presets can sit at the top level
/// (`bundle.heartbeatV2`). Dart cannot forward arbitrary typed members through a wrapper.
class BundleResolver {
  BundleResolver(this._token, this.bundleId, this.contentHash);

  final String _token;

  /// Reverse-DNS identity of the loaded bundle.
  final String bundleId;
  final String contentHash;

  PresetHandle operator [](String id) => PresetHandle(_token, id);

  /// Look a preset up by an id only known at runtime.
  PresetHandle? handle(String id) => _presetIds.contains(id) ? PresetHandle(_token, id) : null;

  /// Release the native patterns this bundle parsed.
  void dispose() => unawaited(PulsarPlatform.instance.disposeBundle(_token));

  Set<String> _presetIds = const {};
  // ignore: use_setters_to_change_properties
  void bindPresetIds(Set<String> ids) => _presetIds = ids;
}

/// Emitted by pulsar-gen: binds a bundle asset + hash to a typed presets builder.
/// See the generated `*.bundle.dart`.
class BundleDescriptor<P> {
  const BundleDescriptor({
    required this.assetName,
    required this.bundleId,
    required this.contentHash,
    required this.presetIds,
    required this.build,
  });

  /// Flutter asset path, e.g. `assets/pulsar/acme-pack.pulsar`.
  final String assetName;
  final String bundleId;
  final String contentHash;
  final List<String> presetIds;
  final P Function(BundleResolver resolver) build;
}

/// The typed bundle returned by [Pulsar.loadBundle].
// `pulsar.loadBundle(descriptor)` returns the generated presets class itself, which carries both
// the presets and the bundle-level members (`id`, `contentHash`, `get`, `dispose`).

/// Bundle loading for [Pulsar].
extension PulsarBundleLoader on Pulsar {
  /// Load a `.pulsar` bundle asset and return its typed presets view.
  ///
  /// ```dart
  /// final bundle = await pulsar.loadBundle(acmePack); // acmePack is generated
  /// bundle.heartbeatV2.play();
  /// ```
  Future<P> loadBundle<P>(
    BundleDescriptor<P> descriptor, {
    bool strict = false,
  }) async {
    final data = await rootBundle.load(descriptor.assetName);
    final bytes = Uint8List.view(
      data.buffer,
      data.offsetInBytes,
      data.lengthInBytes,
    );
    final token = await PulsarPlatform.instance.loadBundle(bytes);
    if (token.isEmpty) {
      throw StateError('Pulsar: failed to load bundle "${descriptor.bundleId}"');
    }
    final resolver = BundleResolver(token, descriptor.bundleId, descriptor.contentHash)
      ..bindPresetIds(descriptor.presetIds.toSet());
    return descriptor.build(resolver);
  }
}
