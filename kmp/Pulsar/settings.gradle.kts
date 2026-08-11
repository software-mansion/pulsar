pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Pulsar"
include(":library")
include(":PulsarLottie")
project(":PulsarLottie").projectDir = file("../PulsarLottie")
