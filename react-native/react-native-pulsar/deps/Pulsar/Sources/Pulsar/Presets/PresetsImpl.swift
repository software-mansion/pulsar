import UIKit
import Foundation

@objc public class EarthquakePreset : Player, Preset {
  public static let name: String = "Earthquake"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics, 
      rawContinuesPattern: [
        [[0.0, 0.0], [0.3, 0.8], [0.3, 0.0], [0.4, 0.0], [0.6, 0.8], [0.6, 0.0]],
        [[0.0, 0.8], [0.6, 0.8]],
      ], 
      rawDiscretePattern: [
        [0.0, 1.0, 1.0]
      ]
    )
  }
  
  public static func getInstance(haptics: Pulsar) -> Preset {
    return EarthquakePreset(haptics)
  }
}

@objc public class SuccessPreset : Player, Preset {
  public static let name: String = "Success"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics, 
      rawContinuesPattern: [[], []], 
      rawDiscretePattern: [
        [0, 0.5, 0.5],
        [0.127, 0.5, 0.5],
        [0.31, 1, 1],
      ]
    )
  }
  
  public static func getInstance(haptics: Pulsar) -> Preset {
    return SuccessPreset(haptics)
  }
}

@objc public class FailPreset : Player, Preset {
  public static let name: String = "Fail"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics, 
      rawContinuesPattern: [[], []], 
      rawDiscretePattern: [
        [0, 0.5, 0.5],
        [0.127, 0.5, 0.5],
        [0.31, 1, 0.2],
      ]
    )
  }
  
  public static func getInstance(haptics: Pulsar) -> Preset {
    return FailPreset(haptics)
  }
}

@objc public class TapPreset : Player, Preset {
  public static let name: String = "Tap"
  
  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics, 
      rawContinuesPattern: [[], []], 
      rawDiscretePattern: [
        [0, 0.5, 0.5],
      ]
    )
  }
  
  public static func getInstance(haptics: Pulsar) -> Preset {
    return TapPreset(haptics)
  }
}
