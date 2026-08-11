import Testing
import Foundation
@testable import Pulsar

/// Loading a `.pulsar` bundle: unzip → manifest decode → PatternData decode → typed view.
/// Uses a STORE-only in-memory zip so the test needs no zip writer from the SDK.
@Suite struct BundleTests {

  // MARK: - Minimal STORE-only zip writer (test helper)

  private static func crc32(_ bytes: [UInt8]) -> UInt32 {
    var table = [UInt32](repeating: 0, count: 256)
    for n in 0..<256 {
      var c = UInt32(n)
      for _ in 0..<8 { c = (c & 1) != 0 ? 0xEDB8_8320 ^ (c >> 1) : c >> 1 }
      table[n] = c
    }
    var c: UInt32 = 0xFFFF_FFFF
    for b in bytes { c = table[Int((c ^ UInt32(b)) & 0xFF)] ^ (c >> 8) }
    return c ^ 0xFFFF_FFFF
  }

  private static func le16(_ v: Int) -> [UInt8] { [UInt8(v & 0xFF), UInt8((v >> 8) & 0xFF)] }
  private static func le32(_ v: UInt32) -> [UInt8] {
    [UInt8(v & 0xFF), UInt8((v >> 8) & 0xFF), UInt8((v >> 16) & 0xFF), UInt8((v >> 24) & 0xFF)]
  }

  private static func makeZip(_ entries: [(String, Data)]) -> Data {
    var local: [UInt8] = []
    var central: [UInt8] = []
    var offset = 0
    for (name, content) in entries {
      let nameBytes = Array(name.utf8)
      let data = [UInt8](content)
      let crc = crc32(data)
      var lh: [UInt8] = le32(0x0403_4b50) + le16(20) + le16(0) + le16(0) + le16(0) + le16(0)
      lh += le32(crc) + le32(UInt32(data.count)) + le32(UInt32(data.count)) + le16(nameBytes.count) + le16(0)
      lh += nameBytes + data
      var ch: [UInt8] = le32(0x0201_4b50) + le16(20) + le16(20) + le16(0) + le16(0) + le16(0) + le16(0)
      ch += le32(crc) + le32(UInt32(data.count)) + le32(UInt32(data.count))
      ch += le16(nameBytes.count) + le16(0) + le16(0) + le16(0) + le16(0) + le32(0) + le32(UInt32(offset))
      ch += nameBytes
      offset += lh.count
      local += lh
      central += ch
    }
    var eocd: [UInt8] = le32(0x0605_4b50) + le16(0) + le16(0)
    eocd += le16(entries.count) + le16(entries.count) + le32(UInt32(central.count)) + le32(UInt32(local.count)) + le16(0)
    return Data(local + central + eocd)
  }

  private static func fixture() -> Data {
    let manifest = """
    {"schema":"pulsar.bundle/1","id":"com.acme.haptics","name":"Acme Pack","revision":7,
     "hash":"sha256-test","presets":[
       {"id":"heartbeatV2","name":"Heartbeat V2","duration":1200,"haptics":"haptics/heartbeatV2.json"},
       {"id":"explosion","name":"Explosion","duration":800,"haptics":"haptics/explosion.json"}]}
    """
    let heartbeat = """
    {"continuousPattern":{"amplitude":[{"time":0,"value":0},{"time":10,"value":0.8}],
     "frequency":[{"time":0,"value":0.2}]},"discretePattern":[{"time":0,"amplitude":0.9,"frequency":0.2}]}
    """
    let explosion = """
    {"continuousPattern":{"amplitude":[{"time":0,"value":1}],"frequency":[{"time":0,"value":0.8}]},
     "discretePattern":[{"time":0,"amplitude":1,"frequency":0.9}]}
    """
    return makeZip([
      ("manifest.json", Data(manifest.utf8)),
      ("haptics/heartbeatV2.json", Data(heartbeat.utf8)),
      ("haptics/explosion.json", Data(explosion.utf8)),
    ])
  }

  // MARK: - Tests

  @Test func unzipReadsAllEntries() throws {
    let files = try PulsarUnzip.read(Self.fixture())
    #expect(files["manifest.json"] != nil)
    #expect(files["haptics/heartbeatV2.json"] != nil)
    #expect(files["haptics/explosion.json"] != nil)
  }

  @Test func loadBundleExposesEveryPreset() throws {
    let loaded = try Pulsar().loadBundle(data: Self.fixture())
    #expect(loaded.id == "com.acme.haptics")
    #expect(loaded.contentHash == "sha256-test")
    #expect(loaded.revision == 7)
    #expect(Set(loaded.presetIds) == ["heartbeatV2", "explosion"])
    #expect(loaded.handle("heartbeatV2") != nil)
    #expect(loaded.handle("heartbeatV2")?.duration == 1200)
    #expect(loaded.handle("missing") == nil)
  }

  @Test func typedDescriptorBuildsPresetsView() throws {
    struct Presets { let heartbeatV2: PresetHandle; let explosion: PresetHandle }
    let loaded = try Pulsar().loadBundle(data: Self.fixture())
    let resolver = BundleResolver(loaded)
    let presets = Presets(heartbeatV2: resolver["heartbeatV2"], explosion: resolver["explosion"])
    #expect(presets.heartbeatV2.id == "heartbeatV2")
    #expect(presets.explosion.id == "explosion")
  }

  @Test func rejectsUnsupportedSchema() {
    let bad = Self.makeZip([("manifest.json", Data(#"{"schema":"pulsar.bundle/2","id":"x","name":"y","presets":[]}"#.utf8))])
    #expect(throws: PulsarBundleError.self) { _ = try Pulsar().loadBundle(data: bad) }
  }
}
