import java.util.Base64

plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    `maven-publish`
    signing
    alias(libs.plugins.nmcp)
}

android {
    namespace = "com.swmansion.pulsar.lottie"
    compileSdk = 36

    defaultConfig {
        minSdk = 24
        consumerProguardFiles("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlin {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11)
        }
    }
}

dependencies {
    // Reuse the Pulsar core haptic engine (no reimplementation). `api` so the
    // core's PatternData types are visible in this library's public API.
    api(project(":Pulsar"))
    implementation(libs.lottie)
    implementation(libs.androidx.core.ktx)
    testImplementation(libs.junit)
}

group = "com.swmansion"
version = "0.1.0" // pulsar-sync:android-lottie-version

afterEvaluate {
    publishing {
        publications {
            create<MavenPublication>("release") {
                from(components["release"])

                groupId = "com.swmansion"
                artifactId = "pulsar-lottie"
                version = version.toString()

                pom {
                    name.set("Pulsar Lottie")
                    description.set("Play Pulsar haptics in sync with a Lottie animation on Android")
                    url.set("https://github.com/software-mansion/pulsar")

                    licenses {
                        license {
                            name.set("MIT License")
                            url.set("https://github.com/software-mansion/pulsar/blob/main/LICENSE")
                        }
                    }

                    developers {
                        developer {
                            id.set("software-mansion")
                            name.set("Software Mansion")
                            email.set("project@swmansion.com")
                        }
                    }

                    scm {
                        connection.set("scm:git:https://github.com/software-mansion/pulsar.git")
                        developerConnection.set("scm:git:https://github.com/software-mansion/pulsar.git")
                        url.set("https://github.com/software-mansion/pulsar")
                    }
                }
            }
        }
    }

    nmcp {
        publishAllPublicationsToCentralPortal {
            username.set(System.getenv("MAVEN_USERNAME") ?: "")
            password.set(System.getenv("MAVEN_PASSWORD") ?: "")
            publishingType.set("AUTOMATIC")
        }
    }

    signing {
        val gpgPrivateKey = System.getenv("GPG_PRIVATE_KEY")?.let { key ->
            if (key.contains("BEGIN PGP PRIVATE KEY BLOCK")) {
                key
            } else {
                runCatching { String(Base64.getDecoder().decode(key)) }
                    .getOrNull()
                    ?.takeIf { it.contains("BEGIN PGP PRIVATE KEY BLOCK") }
                    ?: key
            }
        }

        useInMemoryPgpKeys(
            gpgPrivateKey,
            System.getenv("GPG_PASSPHRASE")
        )
        sign(publishing.publications["release"])
    }
}
