import Foundation

// MARK: - Manifest (Codable mirror of manifest.json)

struct BundleManifest: Codable {
  let schema: String
  let generator: String?
  let id: String
  let name: String
  let revision: Int?
  let hash: String?
  let presets: [BundlePresetEntry]
}

struct BundlePresetEntry: Codable {
  let id: String
  let name: String
  let duration: Double?
  let haptics: String
  let audio: BundleAudioRef?
  let animation: BundleAnimationRef?
}

struct BundleAudioRef: Codable {
  let src: String
  let volume: Float?
  let offset: Double?
}

struct BundleAnimationRef: Codable {
  let src: String
  let frameRate: Double?
  let totalFrames: Int?
}

// MARK: - Runtime handles

/// Lottie bytes + timing for a preset's animation. Pulsar carries and time-aligns it;
/// the host app's own Lottie view renders it.
@objc public final class BundleAnimation: NSObject {
  @objc public let data: Data
  @objc public let frameRate: Double
  @objc public let totalFrames: Int
  init(data: Data, frameRate: Double, totalFrames: Int) {
    self.data = data
    self.frameRate = frameRate
    self.totalFrames = totalFrames
  }
}

struct ResolvedSound {
  let uri: String
  let volume: Float
  let offset: Double
}

/// A single playable preset from a loaded bundle. Parses its pattern lazily on first play.
@objc public final class PresetHandle: NSObject {
  @objc public let id: String
  /// Human label the preset was authored under.
  @objc public let name: String
  @objc public let duration: Double
  @objc public let animation: BundleAnimation?
  /// The authored pattern. Read it to drive a timeline yourself — the Lottie SDK samples it per
  /// frame in realtime mode. ``play()`` stays the pre-parsed, engine-native route.
  @objc public let pattern: PatternData
  /// Whether the preset carries a synced audio track, which ``play()`` plays alongside the haptics.
  @objc public var hasAudio: Bool { sound != nil }
  /// Whether the preset carries a Lottie animation, exposed as ``animation``.
  @objc public var hasAnimation: Bool { animation != nil }

  private weak var pulsar: Pulsar?
  private let sound: ResolvedSound?
  private var composer: PatternComposer?
  /// The seek position the cached ``composer`` is currently parsed at, or nil while unparsed.
  private var parsedFromMs: Double?

  init(id: String, name: String, duration: Double, pulsar: Pulsar, pattern: PatternData, sound: ResolvedSound?, animation: BundleAnimation?) {
    self.id = id
    self.name = name
    self.duration = duration
    self.pulsar = pulsar
    self.pattern = pattern
    self.sound = sound
    self.animation = animation
  }

  /// Parses at `fromMs`, reusing the cached parse when the position has not moved. A preset
  /// played only from the start therefore still parses exactly once, as it always has.
  private func ensureParsed(fromMs: Double) {
    guard composer == nil || parsedFromMs != fromMs, let pulsar = pulsar else { return }
    let c = composer ?? pulsar.getPatternComposer()
    let seeked = PatternSeek.pattern(pattern, from: fromMs)
    if let s = sound {
      let window = PatternSeek.soundWindow(offset: s.offset, from: fromMs)
      c.parsePatternWithSound(
        hapticsData: seeked,
        uri: s.uri,
        volume: s.volume,
        offset: window.offset,
        start: window.start,
        duration: 0
      )
    } else {
      c.parsePattern(hapticsData: seeked)
    }
    composer = c
    parsedFromMs = fromMs
  }

  /// Plays the preset from its start — haptics plus its synced audio, if it has one.
  @objc public func play() {
    play(fromMs: 0)
  }

  /// Plays the preset from `fromMs` into its timeline, audio and haptics together.
  ///
  /// The pattern is re-anchored and re-parsed on every non-zero seek; `fromMs: 0` keeps the
  /// parse cached, so repeat plays from the start cost nothing extra.
  @objc public func play(fromMs: Double) {
    ensureParsed(fromMs: max(0, fromMs))
    composer?.play()
  }

  @objc public func stop() {
    composer?.stop()
  }

  func dispose() {
    composer?.dispose()
    composer = nil
    parsedFromMs = nil
  }
}

/// Untyped loaded bundle — the surface used by the React Native / Flutter bridges (string ids).
@objc public final class LoadedBundle: NSObject {
  @objc public let id: String
  @objc public let contentHash: String
  @objc public let revision: Int
  private let handles: [String: PresetHandle]

  init(id: String, contentHash: String, revision: Int, handles: [String: PresetHandle]) {
    self.id = id
    self.contentHash = contentHash
    self.revision = revision
    self.handles = handles
  }

  @objc public func handle(_ id: String) -> PresetHandle? { handles[id] }
  @objc public var presetIds: [String] { Array(handles.keys) }
  @objc public func play(_ id: String) -> Bool {
    play(id, fromMs: 0)
  }
  @objc public func play(_ id: String, fromMs: Double) -> Bool {
    guard let h = handles[id] else { return false }
    h.play(fromMs: fromMs)
    return true
  }
  @objc public func dispose() { handles.values.forEach { $0.dispose() } }
}

// MARK: - Typed view (native Swift consumers; produced by pulsar-gen)

/// Looks up preset handles by id when a generated descriptor builds its typed `Presets` struct.
/// `loadBundle` guarantees every id in the descriptor exists before this is used.
public final class BundleResolver {
  private let loaded: LoadedBundle
  init(_ loaded: LoadedBundle) { self.loaded = loaded }
  public subscript(_ id: String) -> PresetHandle { loaded.handle(id)! }
}

/// Emitted by pulsar-gen: binds a bundle asset + hash to a typed `Presets` builder.
public struct BundleDescriptor<Presets> {
  public let assetName: String
  public let bundleId: String
  public let contentHash: String
  public let presetIds: [String]
  public let build: (BundleResolver) -> Presets

  public init(
    assetName: String,
    bundleId: String,
    contentHash: String,
    presetIds: [String],
    build: @escaping (BundleResolver) -> Presets
  ) {
    self.assetName = assetName
    self.bundleId = bundleId
    self.contentHash = contentHash
    self.presetIds = presetIds
    self.build = build
  }
}

/// The typed bundle returned by `pulsar.loadBundleSync(SomeBundle.descriptor)`.
/// (Named `PulsarBundle` to avoid colliding with `Foundation.Bundle`.)
/// Presets are reachable directly (`bundle.heartbeatV2.play()`); `presets` exposes the struct.
@dynamicMemberLookup
public final class PulsarBundle<Presets> {
  public let presets: Presets

  public subscript<T>(dynamicMember keyPath: KeyPath<Presets, T>) -> T {
    presets[keyPath: keyPath]
  }
  public let id: String
  public let revision: Int
  public let contentHash: String
  private let loaded: LoadedBundle

  init(loaded: LoadedBundle, presets: Presets) {
    self.loaded = loaded
    self.presets = presets
    self.id = loaded.id
    self.revision = loaded.revision
    self.contentHash = loaded.contentHash
  }

  /// Dynamic escape hatch for ids not known at compile time.
  public func get(_ id: String) -> PresetHandle? { loaded.handle(id) }
  public func dispose() { loaded.dispose() }
}

public enum PulsarBundleError: Error, CustomStringConvertible {
  case missingManifest
  case unsupportedSchema(String)
  case missingEntry(String)
  case resourceNotFound(String)
  case missingPresets([String])
  case hashMismatch(expected: String, actual: String)

  public var description: String {
    switch self {
    case .missingManifest: return "Bundle is missing manifest.json"
    case .unsupportedSchema(let s): return "Unsupported bundle schema \"\(s)\" (expected pulsar.bundle/1)"
    case .missingEntry(let p): return "Bundle is missing referenced entry \"\(p)\""
    case .resourceNotFound(let n): return "Bundle resource \"\(n).pulsar\" not found in the app bundle"
    case .missingPresets(let ids): return "Bundle is missing preset(s) \(ids) — regenerate types with pulsar-gen"
    case .hashMismatch(let e, let a): return "Bundle content hash mismatch: generated types expect \(e) but the loaded bundle is \(a). Re-export the bundle or regenerate the types."
    }
  }
}
