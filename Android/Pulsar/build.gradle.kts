import java.util.Base64

plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    `maven-publish`
    signing
    alias(libs.plugins.nmcp)
}

android {
    namespace = "com.swmansion.pulsar"
    compileSdk = 36

    defaultConfig {
        minSdk = 24

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
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
    buildFeatures {
        buildConfig = true
    }
    testOptions {
        unitTests {
            // Robolectric needs the Android resources/manifest available to unit tests.
            isIncludeAndroidResources = true
        }
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    testImplementation(libs.junit)
    testImplementation("org.robolectric:robolectric:4.14.1")
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    implementation(libs.kotlinx.serialization.json)
}

group = "com.swmansion"
version = "1.3.0" // pulsar-sync:android-version

afterEvaluate {
    publishing {
        publications {
            create<MavenPublication>("release") {
                from(components["release"])

                groupId = "com.swmansion"
                artifactId = "pulsar"
                version = version.toString()

                pom {
                    name.set("Pulsar")
                    description.set("Pulsar haptics SDK for Android with presets, custom patterns, and realtime feedback control")
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
