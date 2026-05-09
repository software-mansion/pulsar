import UIKit
import Foundation

@objc public class PassingCarPreset : Player, Preset {
  public static let name: String = "PassingCar"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [80, 0.1], [200, 0.35], [350, 0.75], [450, 1.0], [550, 0.7], [700, 0.3], [900, 0.08], [1100, 0.0]],
        [[0, 0.35], [200, 0.42], [450, 0.38], [700, 0.3], [1100, 0.22]],
      ],
      rawDiscretePattern: [

      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PassingCarPreset(haptics)
  }
}
