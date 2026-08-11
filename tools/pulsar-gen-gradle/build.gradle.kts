plugins {
    `kotlin-dsl`
    `java-gradle-plugin`
}

group = "com.swmansion.pulsar"
version = "0.1.0"

gradlePlugin {
    plugins {
        create("pulsarGen") {
            id = "com.swmansion.pulsar.gen"
            implementationClass = "com.swmansion.pulsar.gradle.PulsarGenPlugin"
            displayName = "Pulsar bundle codegen"
            description = "Generates typed Kotlin accessors for .pulsar bundles and packages them into assets."
        }
    }
}

repositories {
    mavenCentral()
    google()
}

dependencies {
    // AGP types for wiring generated sources/assets into the Android build (not shipped).
    compileOnly("com.android.tools.build:gradle:8.7.2")
}
