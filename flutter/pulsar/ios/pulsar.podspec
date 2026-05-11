#
# To learn more about a Podspec see http://guides.cocoapods.org/syntax/podspec.html.
# Run `pod lib lint pulsar.podspec` to validate before publishing.
#
Pod::Spec.new do |s|
  s.name             = 'pulsar'
  s.version          = '0.0.1'
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
  s.source_files = 'Classes/**/*'
  s.dependency 'Flutter'
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
