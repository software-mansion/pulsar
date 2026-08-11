import com.android.build.api.dsl.androidLibrary
import java.util.Base64

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.android.kotlin.multiplatform.library)
    alias(libs.plugins.compose.compiler)
    alias(libs.plugins.vanniktech.mavenPublish)
    signing
}

group = "com.swmansion"
version = "0.1.0" // pulsar-sync:kmp-lottie-version

kotlin {
    androidLibrary {
        namespace = "com.swmansion.pulsar.lottie"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
        minSdk = libs.versions.android.minSdk.get().toInt()

        withHostTestBuilder {}.configure {}
    }
    iosX64()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        commonMain.dependencies {
            // Reuse the Pulsar core haptic engine (no reimplementation). `api` so
            // the core's PatternData types are visible in this library's public API.
            api(project(":library"))
            implementation(libs.compose.runtime)
        }

        commonTest.dependencies {
            implementation(libs.kotlin.test)
        }
    }
}

mavenPublishing {
    publishToMavenCentral(automaticRelease = true)

    signAllPublications()

    coordinates(group.toString(), "pulsar-kmp-lottie", version.toString())

    pom {
        name = "Pulsar Lottie"
        description = "Play Pulsar haptics in sync with a Lottie animation in Compose Multiplatform."
        inceptionYear = "2025"
        url = "https://github.com/software-mansion/pulsar"
        licenses {
            license {
                name = "MIT License"
                url = "https://github.com/software-mansion/pulsar/blob/main/LICENSE"
                distribution = "repo"
            }
        }
        developers {
            developer {
                id = "piaskowyk"
                name = "Krzysztof Piaskowy"
                url = "https://github.com/piaskowyk"
            }
        }
        scm {
            url = "https://github.com/software-mansion/pulsar"
            connection = "scm:git:https://github.com/software-mansion/pulsar.git"
            developerConnection = "scm:git:ssh://git@github.com/software-mansion/pulsar.git"
        }
    }
}

signing {
    val rawKey = System.getenv("GPG_PRIVATE_KEY")
    val passphrase = System.getenv("GPG_PASSPHRASE")
    if (!rawKey.isNullOrBlank() && !passphrase.isNullOrBlank()) {
        val armoredKey = if (rawKey.contains("BEGIN PGP PRIVATE KEY BLOCK")) {
            rawKey
        } else {
            runCatching { String(Base64.getDecoder().decode(rawKey.trim())) }
                .getOrNull()
                ?.takeIf { it.contains("BEGIN PGP PRIVATE KEY BLOCK") }
                ?: error("GPG_PRIVATE_KEY is neither ASCII-armored PGP nor base64-encoded armored PGP")
        }
        useInMemoryPgpKeys(armoredKey, passphrase)
    }
}
