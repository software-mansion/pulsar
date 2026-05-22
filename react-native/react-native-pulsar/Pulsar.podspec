require "json"
require "fileutils"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
pulsar_ios_pod_version = ENV["PULSAR_IOS_POD_VERSION"] || "1.1.2"

# By default depend on the published `Pulsar-haptics` CocoaPod.
# Set USE_LOCAL_PULSAR_IOS=1 to build against the in-repo `iOS/Pulsar` sources instead.
#
# CocoaPods only compiles files that live inside the pod's own root — its PathList
# indexes files with a `**/*` glob that does not follow symlinks — so for the local
# build we copy the sources into `deps/` (matching the historical layout) and compile
# them straight into the `Pulsar` module the bridge imports.
use_local_pulsar_ios = ENV["USE_LOCAL_PULSAR_IOS"] == "1"
local_pulsar_ios_sources_dir = File.expand_path(File.join(__dir__, "..", "..", "iOS", "Pulsar", "Sources", "Pulsar"))
deps_dir = File.join(__dir__, "deps")

FileUtils.rm_rf(deps_dir)
if use_local_pulsar_ios
  unless File.directory?(local_pulsar_ios_sources_dir)
    raise "USE_LOCAL_PULSAR_IOS=1 but local Pulsar iOS sources were not found at #{local_pulsar_ios_sources_dir}"
  end
  FileUtils.mkdir_p(File.join(deps_dir, "Pulsar", "Sources"))
  FileUtils.cp_r(local_pulsar_ios_sources_dir, File.join(deps_dir, "Pulsar", "Sources"))
  Pod::UI.puts "Using local Pulsar iOS sources from #{local_pulsar_ios_sources_dir}".green
else
  Pod::UI.puts "Using published Pulsar-haptics pod #{pulsar_ios_pod_version}".green
end

Pod::Spec.new do |s|
  s.name         = "Pulsar"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = { :type => package["license"], :file => "LICENSE" }
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/software-mansion/pulsar.git", :tag => "#{s.version}" }

  source_files = ["ios/**/*.{h,m,mm,cpp,swift}"]
  source_files << "deps/Pulsar/Sources/Pulsar/**/*.swift" if use_local_pulsar_ios
  s.source_files = source_files
  s.private_header_files = "ios/**/*.h"

  s.pod_target_xcconfig = {
    "DEFINES_MODULE" => "YES",
  }

  if use_local_pulsar_ios
    s.frameworks = "AVFoundation", "CoreHaptics", "UIKit"
  else
    s.dependency "Pulsar-haptics", pulsar_ios_pod_version
  end

  install_modules_dependencies(s)
end
