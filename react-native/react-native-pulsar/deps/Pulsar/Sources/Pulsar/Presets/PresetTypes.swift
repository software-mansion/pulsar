import Foundation

@objc public protocol Preset {
  func play()
  func enableSound(state: Bool)
  static func getInstance(haptics: Pulsar) -> Preset
  static var name: String { get }
}