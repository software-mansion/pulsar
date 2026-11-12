part of 'package:pulsar_haptics/pulsar.dart';

/// Lottie bytes + timing for a preset's animation; the host app's own Lottie
/// widget renders it. The Lottie SDK's `HapticLottie.preset` does it for you.
class BundleAnimation {
  /// Creates a [BundleAnimation] from raw Lottie bytes and its authored timing.
  const BundleAnimation({
    required this.data,
    required this.frameRate,
    required this.totalFrames,
  });

  /// Rebuilds a [BundleAnimation] from the wire shape the native side sends.
  factory BundleAnimation.fromMap(Map<dynamic, dynamic> map) => BundleAnimation(
    data: map['data'] as Uint8List,
    frameRate: (map['frameRate'] as num?)?.toDouble() ?? 0,
    totalFrames: (map['totalFrames'] as num?)?.toInt() ?? 0,
  );

  /// The raw Lottie JSON bytes, ready for `Lottie.memory`.
  final Uint8List data;

  /// Frames per second the animation was authored at.
  final double frameRate;

  /// Total frame count of the animation.
  final int totalFrames;
}

/// A preset's MP4, extracted natively to a local file for the app's own video
/// player. Its time runs 1:1 with the preset's, so seek it to the same `fromMs`
/// you pass to [PresetHandle.play].
class BundleVideo {
  /// Creates a [BundleVideo] over the extracted file at [path].
  const BundleVideo({
    required this.path,
    this.width = 0,
    this.height = 0,
    this.isMuted = false,
  });

  /// Rebuilds a [BundleVideo] from the wire shape the native side sends.
  factory BundleVideo.fromMap(Map<dynamic, dynamic> map) => BundleVideo(
    path: map['path'] as String,
    width: (map['width'] as num?)?.toInt() ?? 0,
    height: (map['height'] as num?)?.toInt() ?? 0,
    isMuted: (map['muted'] as bool?) ?? false,
  );

  /// Absolute path of the extracted MP4, ready for `VideoPlayerController.file`.
  final String path;

  /// Authored width in pixels, or 0 when the bundle carries no hint.
  final int width;

  /// Authored height in pixels, or 0 when the bundle carries no hint.
  final int height;

  /// The preset's bundle audio replaces the video's own sound, so the player
  /// must stay muted.
  final bool isMuted;
}

/// A single playable preset from a loaded bundle.
///
/// [play] and [stop] run the preset natively — haptics plus its synced audio, if
/// it has any. [pattern], [animation] and [duration] expose what the preset was
/// authored from, so a Lottie view can sample the pattern against the animation
/// timeline itself.
class PresetHandle {
  /// Creates a handle over the preset [id] in the bundle held under [token].
  PresetHandle(
    this._token,
    this.id, {
    this.name = '',
    this.duration = 0,
    PatternData? pattern,
    this.animation,
    this.hasAudio = false,
    this.video,
  }) : pattern = pattern ?? _emptyPattern;

  /// Rebuilds a [PresetHandle] from the wire shape the native side sends.
  factory PresetHandle.fromMap(String token, Map<dynamic, dynamic> map) {
    final animation = map['animation'] as Map<dynamic, dynamic>?;
    final video = map['video'] as Map<dynamic, dynamic>?;
    return PresetHandle(
      token,
      map['id'] as String,
      name: (map['name'] as String?) ?? '',
      duration: (map['duration'] as num?)?.toDouble() ?? 0,
      pattern: PatternData.fromMap(
        (map['pattern'] as Map<dynamic, dynamic>?) ?? const {},
      ),
      animation: animation == null ? null : BundleAnimation.fromMap(animation),
      hasAudio: (map['hasAudio'] as bool?) ?? false,
      video: video == null ? null : BundleVideo.fromMap(video),
    );
  }

  static const _emptyPattern = PatternData(
    continuousPattern: ContinuousPattern(amplitude: [], frequency: []),
    discretePattern: [],
  );

  final String _token;

  /// Code-safe id the preset is addressed by.
  final String id;

  /// Human label the preset was authored under.
  final String name;

  /// Authored length in milliseconds, or 0 when the bundle carries no hint.
  final double duration;

  /// The authored pattern. Read it to drive a timeline yourself — the Lottie SDK
  /// samples it per frame in realtime mode. [play] stays the engine-native route.
  final PatternData pattern;

  /// The Lottie animation the preset was authored against, when it has one.
  final BundleAnimation? animation;

  /// Whether the preset carries a synced audio track, which [play] plays
  /// alongside the haptics.
  final bool hasAudio;

  /// Whether the preset carries a Lottie animation, exposed as [animation].
  bool get hasAnimation => animation != null;

  /// The video the preset was authored against, when it has one.
  final BundleVideo? video;

  /// Whether the preset carries a video, exposed as [video].
  bool get hasVideo => video != null;

  /// Play the preset from [fromMs] into its timeline — haptics, plus its synced
  /// audio when it has any.
  void play({double fromMs = 0}) => unawaited(
    PulsarPlatform.instance.playBundlePreset(_token, id, fromMs: fromMs),
  );

  /// Stop a preset started with [play].
  void stop() =>
      unawaited(PulsarPlatform.instance.stopBundlePreset(_token, id));
}

/// Looks up preset handles by id when a generated descriptor builds its typed presets view.
/// Backs a generated presets class.
class BundleResolver {
  /// Creates a resolver over the bundle held natively under [_token].
  BundleResolver(this._token, this.bundleId, this.contentHash);

  final String _token;

  /// Reverse-DNS identity of the loaded bundle.
  final String bundleId;

  /// Content hash the generated descriptor was built against.
  final String contentHash;

  Map<String, PresetHandle> _handles = const {};

  /// Resolve a preset the descriptor already guaranteed exists.
  PresetHandle operator [](String id) =>
      _handles[id] ?? PresetHandle(_token, id);

  /// Look a preset up by an id only known at runtime.
  PresetHandle? handle(String id) => _handles[id];

  /// Release the native patterns this bundle parsed.
  void dispose() => unawaited(PulsarPlatform.instance.disposeBundle(_token));

  // ignore: use_setters_to_change_properties
  /// Called by the loader with the metadata read back from the native bundle.
  void bindPresets(Map<String, PresetHandle> handles) => _handles = handles;
}

/// Emitted by pulsar-gen: binds a bundle asset + hash to a typed presets builder.
/// See the generated `*.bundle.dart`.
class BundleDescriptor<P> {
  /// Creates a descriptor for the bundle asset at [assetName].
  const BundleDescriptor({
    required this.assetName,
    required this.bundleId,
    required this.contentHash,
    required this.presetIds,
    required this.build,
  });

  /// Flutter asset path, e.g. `assets/pulsar/acme-pack.pulsar`.
  final String assetName;

  /// Reverse-DNS identity of the bundle.
  final String bundleId;

  /// Content hash the generated types were built against.
  final String contentHash;

  /// Every preset id the generated types expect to find.
  final List<String> presetIds;

  /// Builds the generated presets class from a resolver.
  final P Function(BundleResolver resolver) build;
}

/// The typed bundle returned by [PulsarBundleLoader.loadBundleAsync].
// It returns the generated presets class itself: Dart cannot forward typed members through a
// wrapper, so the generator emits the bundle-level members onto it.

/// Bundle loading for [Pulsar].
extension PulsarBundleLoader on Pulsar {
  /// Load a `.pulsar` bundle asset and return its typed presets view.
  ///
  /// ```dart
  /// final bundle = await pulsar.loadBundleAsync(acmePack); // acmePack is generated
  /// bundle.heartbeatV2.play();
  /// ```
  ///
  /// Pass `includeAnimations: false` to skip reading each preset's Lottie bytes
  /// back across the platform channel when nothing will render them.
  Future<P> loadBundleAsync<P>(
    BundleDescriptor<P> descriptor, {
    bool strict = true,
    bool includeAnimations = true,
  }) async {
    final data = await rootBundle.load(descriptor.assetName);
    final bytes = Uint8List.view(
      data.buffer,
      data.offsetInBytes,
      data.lengthInBytes,
    );
    final token = await PulsarPlatform.instance.loadBundle(bytes);
    if (token.isEmpty) {
      throw StateError(
        'Pulsar: failed to load bundle "${descriptor.bundleId}"',
      );
    }
    final raw = await PulsarPlatform.instance.bundlePresets(
      token,
      includeAnimations: includeAnimations,
    );
    final handles = {
      for (final entry in raw)
        entry['id'] as String: PresetHandle.fromMap(token, entry),
    };
    if (strict) {
      final missing = descriptor.presetIds
          .where((id) => !handles.containsKey(id))
          .toList();
      if (missing.isNotEmpty) {
        throw StateError(
          'Pulsar: bundle "${descriptor.bundleId}" is missing preset(s) '
          '$missing — regenerate types with pulsar-gen.',
        );
      }
    }
    final resolver = BundleResolver(
      token,
      descriptor.bundleId,
      descriptor.contentHash,
    )..bindPresets(handles);
    return descriptor.build(resolver);
  }
}
