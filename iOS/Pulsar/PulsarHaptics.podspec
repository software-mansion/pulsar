Pod::Spec.new do |s|
  s.name             = 'PulsarHaptics'
  # `s.version` is the iOS SDK release version. CI's separate-pod guard
  # (react-native/PulsarApp) compiles these local sources as the published
  # `PulsarHaptics` pod the RN bridge depends on, whose version tracks
  # `reactNative.pulsarCore.iosPodVersion` and can lag this release version. That
  # build sets PULSAR_HAPTICS_POD_VERSION so CocoaPods can resolve the local pod
  # against the bridge's `= <iosPodVersion>` dependency.
  s.version          = ENV['PULSAR_HAPTICS_POD_VERSION'] || '1.4.0' # pulsar-sync:ios-version
  s.summary          = 'A haptic feedback SDK for iOS, written in Swift.'
  s.description      = <<-DESC
Pulsar provides ready-to-use haptic presets, a pattern composer for custom
haptic sequences, and a real-time composer for gesture-driven feedback.
  DESC
  s.homepage         = 'https://docs.swmansion.com/pulsar'
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { 'Software Mansion' => 'krzysztof.piaskowy@swmansion.com' }
  s.source           = {
    :git => 'https://github.com/software-mansion-labs/pulsar-ios.git',
    :tag => s.version.to_s
  }

  s.platform         = :ios, '13.0'
  s.swift_version    = '5.9'
  s.source_files     = 'Sources/Pulsar/**/*.swift'
  s.frameworks       = 'AVFoundation', 'CoreHaptics', 'UIKit'
  s.requires_arc     = true
end
