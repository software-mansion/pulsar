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
class BundleResolver {
  BundleResolver(this._token);

  final String _token;

  PresetHandle operator [](String id) => PresetHandle(_token, id);
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
class Bundle<P> {
  Bundle._({
    required String token,
    required this.presets,
    required this.id,
    required this.contentHash,
  }) : _token = token;

  final String _token;
  final P presets;
  final String id;
  final String contentHash;

  void dispose() => unawaited(PulsarPlatform.instance.disposeBundle(_token));
}

/// Bundle loading for [Pulsar].
extension PulsarBundleLoader on Pulsar {
  /// Load a `.pulsar` bundle asset and return its typed presets view.
  ///
  /// ```dart
  /// final bundle = await pulsar.loadBundle(acmePack); // acmePack is generated
  /// bundle.presets.heartbeatV2.play();
  /// ```
  Future<Bundle<P>> loadBundle<P>(
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
    return Bundle<P>._(
      token: token,
      presets: descriptor.build(BundleResolver(token)),
      id: descriptor.bundleId,
      contentHash: descriptor.contentHash,
    );
  }
}
