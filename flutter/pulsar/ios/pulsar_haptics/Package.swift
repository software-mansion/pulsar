// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "pulsar_haptics",
    platforms: [
        .iOS(.v13),
    ],
    products: [
        .library(name: "pulsar_haptics", targets: ["pulsar_haptics"]),
    ],
    targets: [
        .target(
            name: "pulsar_haptics",
            path: "Sources/pulsar_haptics",
            linkerSettings: [
                .linkedFramework("CoreHaptics"),
                .linkedFramework("AudioToolbox"),
                .linkedFramework("AVFoundation"),
            ]
        ),
    ]
)
