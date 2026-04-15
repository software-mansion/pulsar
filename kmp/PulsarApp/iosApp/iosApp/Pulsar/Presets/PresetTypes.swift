import Foundation

@objc public protocol Preset {
  func play()
  static func getInstance(haptics: Pulsar) -> Preset
  static var name: String { get }
}
