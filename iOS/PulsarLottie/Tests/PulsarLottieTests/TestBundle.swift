import Foundation

enum TestBundle {

  static let lottieJSON = """
    {"v":"5.7.4","fr":30,"ip":0,"op":60,"w":100,"h":100,"nm":"empty","ddd":0,"assets":[],"layers":[]}
    """

  private static let hapticsJSON = """
    {"continuousPattern":{"amplitude":[{"time":0,"value":0.0},{"time":800,"value":1.0}],\
    "frequency":[{"time":0,"value":0.3}]},\
    "discretePattern":[{"time":250,"amplitude":1.0,"frequency":0.5},\
    {"time":600,"amplitude":0.4,"frequency":0.2}]}
    """

  static func data(
    durationMs: Double = 1500,
    withAudio: Bool = false,
    withAnimation: Bool = true
  ) -> Data {
    let audio = withAudio ? #","audio":{"src":"audio/boom.ogg","volume":1.0,"offset":0}"# : ""
    let animation = withAnimation
      ? #","animation":{"src":"anim/celebration.json","frameRate":30,"totalFrames":60}"#
      : ""
    let manifest = """
      {"schema":"pulsar.bundle/1","id":"com.acme.haptics","name":"Acme Pack","revision":7,\
      "hash":"sha256-test","presets":[{"id":"celebration","name":"Celebration",\
      "duration":\(durationMs),"haptics":"haptics/celebration.json"\(audio)\(animation)}]}
      """

    var entries: [(String, String)] = [
      ("manifest.json", manifest),
      ("haptics/celebration.json", hapticsJSON),
    ]
    if withAudio { entries.append(("audio/boom.ogg", "not-really-audio")) }
    if withAnimation { entries.append(("anim/celebration.json", lottieJSON)) }
    return storedZip(entries)
  }

  private static func crc32(_ bytes: [UInt8]) -> UInt32 {
    var table = [UInt32](repeating: 0, count: 256)
    for i in 0..<256 {
      var c = UInt32(i)
      for _ in 0..<8 { c = (c & 1) != 0 ? (0xEDB8_8320 ^ (c >> 1)) : (c >> 1) }
      table[i] = c
    }
    var c: UInt32 = 0xFFFF_FFFF
    for b in bytes { c = table[Int((c ^ UInt32(b)) & 0xFF)] ^ (c >> 8) }
    return c ^ 0xFFFF_FFFF
  }

  private static func le16(_ v: Int) -> [UInt8] { [UInt8(v & 0xFF), UInt8((v >> 8) & 0xFF)] }

  private static func le32(_ v: UInt32) -> [UInt8] {
    [UInt8(v & 0xFF), UInt8((v >> 8) & 0xFF), UInt8((v >> 16) & 0xFF), UInt8((v >> 24) & 0xFF)]
  }

  private static func storedZip(_ entries: [(String, String)]) -> Data {
    var local: [UInt8] = []
    var central: [UInt8] = []
    var offset = 0

    for (name, content) in entries {
      let nameBytes = Array(name.utf8)
      let payload = Array(content.utf8)
      let crc = crc32(payload)
      let size = UInt32(payload.count)

      var header = le32(0x0403_4B50) + le16(20) + le16(0) + le16(0) + le16(0) + le16(0)
      header += le32(crc) + le32(size) + le32(size) + le16(nameBytes.count) + le16(0)
      local += header + nameBytes + payload

      var entry = le32(0x0201_4B50) + le16(20) + le16(20) + le16(0) + le16(0) + le16(0) + le16(0)
      entry += le32(crc) + le32(size) + le32(size)
      entry += le16(nameBytes.count) + le16(0) + le16(0) + le16(0) + le16(0)
      entry += le32(0) + le32(UInt32(offset))
      central += entry + nameBytes

      offset += header.count + nameBytes.count + payload.count
    }

    let eocd = le32(0x0605_4B50) + le16(0) + le16(0) + le16(entries.count) + le16(entries.count)
      + le32(UInt32(central.count)) + le32(UInt32(local.count)) + le16(0)
    return Data(local + central + eocd)
  }
}
