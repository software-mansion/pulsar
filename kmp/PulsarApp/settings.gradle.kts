rootProject.name = "PulsarApp"
enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

pluginManagement {
    repositories {
        google {
            mavenContent {
                includeGroupAndSubgroups("androidx")
                includeGroupAndSubgroups("com.android")
                includeGroupAndSubgroups("com.google")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        google {
            mavenContent {
                includeGroupAndSubgroups("androidx")
                includeGroupAndSubgroups("com.android")
                includeGroupAndSubgroups("com.google")
            }
        }
        mavenCentral()
    }
}

include(":composeApp")

// By default the example app consumes the published `com.swmansion:pulsar-kmp`
// artifact from Maven Central. For local development against the Kotlin sources in
// `../Pulsar`, set `USE_LOCAL_PULSAR_KMP=1` to substitute the local `:library` project.
val useLocalPulsarKmp =
    (System.getenv("USE_LOCAL_PULSAR_KMP") ?: providers.gradleProperty("USE_LOCAL_PULSAR_KMP").orNull) == "1"
if (useLocalPulsarKmp) {
    includeBuild("../Pulsar") {
        dependencySubstitution {
            substitute(module("com.swmansion:pulsar-kmp"))
                .using(project(":library"))
        }
    }
}
