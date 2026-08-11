// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "PulsarLottie",
    platforms: [
        .iOS(.v13)
    ],
    products: [
        .library(
            name: "PulsarLottie",
            targets: ["PulsarLottie"]
        ),
    ],
    dependencies: [
        // The Pulsar core haptic engine (reused — no haptics reimplemented).
        .package(path: "../Pulsar"),
        .package(url: "https://github.com/airbnb/lottie-ios.git", from: "4.5.0"),
    ],
    targets: [
        .target(
            name: "PulsarLottie",
            dependencies: [
                .product(name: "Pulsar", package: "Pulsar"),
                .product(name: "Lottie", package: "lottie-ios"),
            ]
        ),
        .testTarget(
            name: "PulsarLottieTests",
            dependencies: ["PulsarLottie"]
        ),
    ]
)
