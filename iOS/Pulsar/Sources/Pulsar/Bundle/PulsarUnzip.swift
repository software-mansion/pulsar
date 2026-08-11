import Foundation
import Compression

/// Minimal, dependency-free ZIP reader for `.pulsar` bundles. Supports STORE (method 0) and
/// DEFLATE (method 8, via the `Compression` framework's raw-zlib codec). Central-directory based.
enum PulsarUnzip {
  enum ZipError: Error, CustomStringConvertible {
    case notAZip
    case corrupt(String)
    case inflateFailed(String)
    var description: String {
      switch self {
      case .notAZip: return "Not a .pulsar/zip archive (End Of Central Directory not found)"
      case .corrupt(let m): return "Corrupt .pulsar archive: \(m)"
      case .inflateFailed(let m): return "Failed to inflate zip entry: \(m)"
      }
    }
  }

  private static let localSig: UInt32 = 0x0403_4b50
  private static let cenSig: UInt32 = 0x0201_4b50
  private static let eocdSig: UInt32 = 0x0605_4b50

  /// Returns a map of entry path -> uncompressed bytes.
  static func read(_ data: Data) throws -> [String: Data] {
    let bytes = [UInt8](data)
    let count = bytes.count

    func u16(_ off: Int) -> Int { Int(bytes[off]) | (Int(bytes[off + 1]) << 8) }
    func u32(_ off: Int) -> UInt32 {
      UInt32(bytes[off]) | (UInt32(bytes[off + 1]) << 8) | (UInt32(bytes[off + 2]) << 16) | (UInt32(bytes[off + 3]) << 24)
    }

    // Locate EOCD by scanning backward.
    var eocd = -1
    var i = count - 22
    while i >= 0 {
      if u32(i) == eocdSig { eocd = i; break }
      i -= 1
    }
    guard eocd >= 0 else { throw ZipError.notAZip }

    let entryCount = u16(eocd + 10)
    var ptr = Int(u32(eocd + 16)) // central directory offset

    var result: [String: Data] = [:]
    for _ in 0..<entryCount {
      guard ptr + 46 <= count, u32(ptr) == cenSig else { throw ZipError.corrupt("bad central directory signature") }
      let method = u16(ptr + 10)
      let compSize = Int(u32(ptr + 20))
      let uncompSize = Int(u32(ptr + 24))
      let nameLen = u16(ptr + 28)
      let extraLen = u16(ptr + 30)
      let commentLen = u16(ptr + 32)
      let localOff = Int(u32(ptr + 42))
      guard ptr + 46 + nameLen <= count else { throw ZipError.corrupt("truncated central directory") }
      let name = String(decoding: bytes[(ptr + 46)..<(ptr + 46 + nameLen)], as: UTF8.self)

      guard localOff + 30 <= count, u32(localOff) == localSig else { throw ZipError.corrupt("bad local header signature") }
      let lNameLen = u16(localOff + 26)
      let lExtraLen = u16(localOff + 28)
      let dataStart = localOff + 30 + lNameLen + lExtraLen
      guard dataStart + compSize <= count else { throw ZipError.corrupt("entry data out of range") }
      let raw = Data(bytes[dataStart..<(dataStart + compSize)])

      if !name.hasSuffix("/") {
        if method == 0 {
          result[name] = raw
        } else if method == 8 {
          result[name] = try inflate(raw, uncompressedSize: uncompSize)
        } else {
          throw ZipError.corrupt("unsupported compression method \(method) for \(name)")
        }
      }
      ptr += 46 + nameLen + extraLen + commentLen
    }
    return result
  }

  /// Raw DEFLATE inflate (RFC 1951) — Apple's `COMPRESSION_ZLIB` is header-less raw deflate,
  /// matching zip method 8.
  private static func inflate(_ data: Data, uncompressedSize: Int) throws -> Data {
    if uncompressedSize == 0 { return Data() }
    var dst = Data(count: uncompressedSize)
    let written = dst.withUnsafeMutableBytes { (dstPtr: UnsafeMutableRawBufferPointer) -> Int in
      data.withUnsafeBytes { (srcPtr: UnsafeRawBufferPointer) -> Int in
        compression_decode_buffer(
          dstPtr.bindMemory(to: UInt8.self).baseAddress!, uncompressedSize,
          srcPtr.bindMemory(to: UInt8.self).baseAddress!, data.count,
          nil, COMPRESSION_ZLIB
        )
      }
    }
    guard written == uncompressedSize else {
      throw ZipError.inflateFailed("expected \(uncompressedSize) bytes, got \(written)")
    }
    return dst
  }
}
