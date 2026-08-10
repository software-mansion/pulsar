#
# To learn more about a Podspec see http://guides.cocoapods.org/syntax/podspec.html.
# Run `pod lib lint pulsar_haptics.podspec` to validate before publishing.
#
# File name and `s.name` must stay equal to the pub package name — Flutter
# derives both the podspec path it looks for and the module it imports from it.
#
pulsar_ios_pod_version = ENV['PULSAR_IOS_POD_VERSION'] || '1.3.0' # pulsar-sync:flutter-pulsar-ios

Pod::Spec.new do |s|
  s.name             = 'pulsar_haptics'
  s.version          = '0.1.0' # pulsar-sync:flutter-version
  s.summary          = 'Rich haptic feedback for Flutter with presets, pattern playback, and realtime control.'
  s.description      = <<-DESC
Pulsar gives you 150+ ready-to-play haptic presets, a pattern composer for fully custom
sequences, and a realtime composer for gesture-driven feedback — all behind a single
Dart-friendly API that bridges to native CoreHaptics on iOS.
                       DESC
  s.homepage         = 'https://github.com/software-mansion/pulsar'
  s.license          = { :file => '../LICENSE' }
  s.author           = { 'Software Mansion' => 'projects@swmansion.com' }
  s.source           = { :path => '.' }
  # Only the Flutter bridge lives here; the haptics implementation comes from the
  # published PulsarHaptics CocoaPod (or a local override, see the example Podfile).
  s.source_files = 'Classes/**/*'
  s.dependency 'Flutter'
  s.dependency 'PulsarHaptics', pulsar_ios_pod_version
  s.platform = :ios, '13.0'
  s.frameworks = 'CoreHaptics', 'AudioToolbox', 'AVFoundation'

  # Flutter.framework does not contain a i386 slice.
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES', 'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'i386' }
  s.swift_version = '5.0'

  # If your plugin requires a privacy manifest, for example if it uses any
  # required reason APIs, update the PrivacyInfo.xcprivacy file to describe your
  # plugin's privacy impact, and then uncomment this line. For more information,
  # see https://developer.apple.com/documentation/bundleresources/privacy_manifest_files
  # s.resource_bundles = {'pulsar_privacy' => ['Resources/PrivacyInfo.xcprivacy']}
end
