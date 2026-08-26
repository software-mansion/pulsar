import Foundation

extension Pulsar {
  /// Load a `.pulsar` bundle from raw bytes (used by the React Native / Flutter bridges).
  @objc public func loadBundle(data: Data) throws -> LoadedBundle {
    let files = try PulsarUnzip.read(data)
    guard let manifestData = files["manifest.json"] else { throw PulsarBundleError.missingManifest }
    let manifest = try JSONDecoder().decode(BundleManifest.self, from: manifestData)
    guard manifest.schema == "pulsar.bundle/1" else {
      throw PulsarBundleError.unsupportedSchema(manifest.schema)
    }

    let mediaDir = try Self.bundleMediaDir(for: manifest.id)
    var handles: [String: PresetHandle] = [:]

    for preset in manifest.presets {
      guard let hapticsData = files[preset.haptics] else {
        throw PulsarBundleError.missingEntry(preset.haptics)
      }
      // The haptics payload uses the device wire shape, which decodes directly into PatternData.
      let pattern = try JSONDecoder().decode(PatternData.self, from: hapticsData)

      var sound: ResolvedSound?
      if let audio = preset.audio, let audioBytes = files[audio.src] {
        // Core Haptics needs a file URL for audio resources — extract to the caches dir.
        let dest = mediaDir.appendingPathComponent((audio.src as NSString).lastPathComponent)
        try audioBytes.write(to: dest, options: .atomic)
        sound = ResolvedSound(uri: dest.path, volume: audio.volume ?? 1, offset: audio.offset ?? 0)
      }

      var animation: BundleAnimation?
      if let anim = preset.animation, let animBytes = files[anim.src] {
        animation = BundleAnimation(data: animBytes, frameRate: anim.frameRate ?? 0, totalFrames: anim.totalFrames ?? 0)
      }

      handles[preset.id] = PresetHandle(
        id: preset.id,
        duration: preset.duration ?? 0,
        pulsar: self,
        pattern: pattern,
        sound: sound,
        animation: animation
      )
    }

    return LoadedBundle(
      id: manifest.id,
      contentHash: manifest.hash ?? "",
      revision: manifest.revision ?? 0,
      handles: handles
    )
  }

  /// Load a `.pulsar` bundle from a file path (used by the React Native / Flutter bridges).
  @objc public func loadBundle(path: String) throws -> LoadedBundle {
    let data = try Data(contentsOf: URL(fileURLWithPath: path))
    return try loadBundle(data: data)
  }

  /// Typed load for native Swift consumers, using a `pulsar-gen`-generated descriptor.
  /// Resolves `<assetName>.pulsar` from the app's main bundle.
  ///
  ///     let bundle = try pulsar.loadBundle(AcmePack.descriptor)
  ///     bundle.heartbeatV2.play()
  public func loadBundle<P>(_ descriptor: BundleDescriptor<P>, strict: Bool = false) throws -> PulsarBundle<P> {
    guard let url = Foundation.Bundle.main.url(forResource: descriptor.assetName, withExtension: "pulsar") else {
      throw PulsarBundleError.resourceNotFound(descriptor.assetName)
    }
    let loaded = try loadBundle(path: url.path)

    if strict, !descriptor.contentHash.isEmpty, loaded.contentHash != descriptor.contentHash {
      throw PulsarBundleError.hashMismatch(expected: descriptor.contentHash, actual: loaded.contentHash)
    }

    let missing = descriptor.presetIds.filter { loaded.handle($0) == nil }
    guard missing.isEmpty else { throw PulsarBundleError.missingPresets(missing) }

    let presets = descriptor.build(BundleResolver(loaded))
    return PulsarBundle(loaded: loaded, presets: presets)
  }

  private static func bundleMediaDir(for bundleId: String) throws -> URL {
    let base = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
      .appendingPathComponent("PulsarBundles", isDirectory: true)
      .appendingPathComponent(bundleId, isDirectory: true)
    try FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
    return base
  }
}
