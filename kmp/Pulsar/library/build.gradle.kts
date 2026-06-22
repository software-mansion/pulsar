import com.android.build.api.dsl.androidLibrary
import java.util.Base64

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.android.kotlin.multiplatform.library)
    alias(libs.plugins.vanniktech.mavenPublish)
    signing
}

group = "com.swmansion"
version = System.getenv("LIB_VERSION") ?: "0.0.3" // pulsar-sync:kmp-version

fun stringPropertyOrEnv(name: String, defaultValue: String): String =
    (findProperty(name) as String?) ?: System.getenv(name) ?: defaultValue

// Android: by default depend on the published `com.swmansion:pulsar` Maven artifact.
// Set USE_LOCAL_PULSAR_ANDROID=1 to compile against the local `Android/Pulsar` sources instead.
val useLocalPulsarAndroid = stringPropertyOrEnv("USE_LOCAL_PULSAR_ANDROID", "0") == "1"
val pulsarAndroidVersion = stringPropertyOrEnv("PULSAR_ANDROID_MAVEN_VERSION", "1.1.1") // pulsar-sync:kmp-pulsar-android
val localPulsarAndroidSourceDir = rootDir.resolve("../../Android/Pulsar/src/main/java")

// When compiling the local Android sources we must also provide the `com.swmansion.pulsar.BuildConfig`
// they reference — the standalone `Android/Pulsar` module generates it, but this KMP module (namespace
// `com.swmansion.pulsar.kmp`) does not. Generate a minimal shim into a dedicated source dir.
val localPulsarAndroidBuildConfigDir = layout.buildDirectory.dir("generated/localPulsarAndroid").get().asFile

if (useLocalPulsarAndroid) {
    if (!localPulsarAndroidSourceDir.exists()) {
        throw GradleException(
            "USE_LOCAL_PULSAR_ANDROID=1 but local Pulsar Android sources were not found at $localPulsarAndroidSourceDir"
        )
    }
    logger.lifecycle("Using local Pulsar Android sources from $localPulsarAndroidSourceDir")
    val buildConfigFile = localPulsarAndroidBuildConfigDir.resolve("com/swmansion/pulsar/BuildConfig.kt")
    buildConfigFile.parentFile.mkdirs()
    buildConfigFile.writeText(
        """
        package com.swmansion.pulsar

        internal object BuildConfig {
            const val DEBUG = true
        }
        """.trimIndent() + "\n"
    )
} else {
    logger.lifecycle("Using published Pulsar Android artifact com.swmansion:pulsar:$pulsarAndroidVersion")
}

kotlin {
    androidLibrary {
        namespace = "com.swmansion.pulsar.kmp"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
        minSdk = libs.versions.android.minSdk.get().toInt()

        withJava() // enable java compilation support
        withHostTestBuilder {}.configure {}
        withDeviceTestBuilder {
            sourceSetTreeName = "test"
        }
    }
    iosX64()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        commonMain.dependencies {
            implementation(libs.kotlinx.coroutines.core)
        }

        androidMain {
            if (useLocalPulsarAndroid) {
                kotlin.srcDir(localPulsarAndroidSourceDir)
                kotlin.srcDir(localPulsarAndroidBuildConfigDir)
            }
            dependencies {
                implementation(libs.androidx.core.ktx)
                implementation(libs.kotlinx.coroutines.core)
                if (!useLocalPulsarAndroid) {
                    implementation("com.swmansion:pulsar:$pulsarAndroidVersion")
                }
            }
        }

        commonTest.dependencies {
            implementation(libs.kotlin.test)
        }
    }
}

mavenPublishing {
    publishToMavenCentral(automaticRelease = true)

    signAllPublications()

    coordinates(group.toString(), "pulsar-kmp", version.toString())

    pom {
        name = "Pulsar"
        description = "Kotlin Multiplatform haptics library for Android and iOS."
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
