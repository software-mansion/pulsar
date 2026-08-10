// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "pulsar_haptics",
    platforms: [
        .iOS(.v13),
    ],
    products: [
        // Flutter's generated SwiftPM integration may request the plugin product
        // using a hyphenated name derived from the pub package name.
        .library(name: "pulsar-haptics", targets: ["pulsar_haptics"]),
        .library(name: "pulsar_haptics", targets: ["pulsar_haptics"]),
    ],
    dependencies: [
        .package(url: "https://github.com/software-mansion-labs/pulsar-ios", from: "1.1.4"),
    ],
    targets: [
        .target(
            name: "pulsar_haptics",
            dependencies: [.product(name: "Pulsar", package: "pulsar-ios")],
            path: "Sources/pulsar_haptics",
            linkerSettings: [
                .linkedFramework("CoreHaptics"),
                .linkedFramework("AudioToolbox"),
                .linkedFramework("AVFoundation"),
            ]
        ),
    ]
)
