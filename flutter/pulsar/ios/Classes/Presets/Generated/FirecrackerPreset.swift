import UIKit
import Foundation

@objc public class FirecrackerPreset : Player, Preset {
  public static let name: String = "Firecracker"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 1.0],
        [75, 1.0, 1.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FirecrackerPreset(haptics)
  }
}
