import Foundation

// MARK: - Manifest (Codable mirror of manifest.json — see docs/bundle-format.md)

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
  @objc public let duration: Double
  @objc public let animation: BundleAnimation?

  private weak var pulsar: Pulsar?
  private let pattern: PatternData
  private let sound: ResolvedSound?
  private var composer: PatternComposer?

  init(id: String, duration: Double, pulsar: Pulsar, pattern: PatternData, sound: ResolvedSound?, animation: BundleAnimation?) {
    self.id = id
    self.duration = duration
    self.pulsar = pulsar
    self.pattern = pattern
    self.sound = sound
    self.animation = animation
  }

  private func ensureParsed() {
    guard composer == nil, let pulsar = pulsar else { return }
    let c = pulsar.getPatternComposer()
    if let s = sound {
      c.parsePatternWithSound(hapticsData: pattern, uri: s.uri, volume: s.volume, offset: s.offset)
    } else {
      c.parsePattern(hapticsData: pattern)
    }
    composer = c
  }

  @objc public func play() {
    ensureParsed()
    composer?.play()
  }

  @objc public func stop() {
    composer?.stop()
  }

  func dispose() {
    composer?.dispose()
    composer = nil
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
    guard let h = handles[id] else { return false }
    h.play()
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

/// The typed bundle returned by `pulsar.loadBundle(SomeBundle.descriptor)`.
/// (Named `PulsarBundle` to avoid colliding with `Foundation.Bundle`.)
/// A loaded bundle. Presets are reachable directly — `bundle.heartbeatV2.play()` — via
/// `@dynamicMemberLookup` over the generated `Presets` type, so they read the same way as on the
/// other SDKs. `presets` stays available for code that wants the struct itself.
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
