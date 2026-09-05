Pod::Spec.new do |s|
  s.name             = 'PulsarLottie'
  s.version          = '0.1.0' # pulsar-sync:ios-lottie-version
  s.summary          = 'Play Pulsar haptics in sync with a Lottie animation on iOS.'
  s.description      = <<-DESC
PulsarLottie drives Pulsar haptics from a Lottie animation timeline — a
HapticLottieController and a SwiftUI HapticLottieView built on PulsarHaptics
and lottie-ios.
  DESC
  s.homepage         = 'https://docs.swmansion.com/pulsar'
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { 'Software Mansion' => 'krzysztof.piaskowy@swmansion.com' }
  s.source           = {
    :git => 'https://github.com/software-mansion-labs/pulsar-lottie-ios.git',
    :tag => s.version.to_s
  }

  s.platform         = :ios, '13.0'
  s.swift_version    = '5.9'
  s.source_files     = 'Sources/PulsarLottie/**/*.swift'
  s.frameworks       = 'UIKit', 'SwiftUI', 'QuartzCore'
  s.dependency 'PulsarHaptics'
  s.dependency 'lottie-ios'
  s.requires_arc     = true
end
