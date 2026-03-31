import java.util.Base64

plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    id("org.jetbrains.kotlin.plugin.serialization") version "2.0.21"
    `maven-publish`
    signing
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
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    implementation(libs.kotlinx.serialization.json)
}

group = "com.swmansion"
version = System.getenv("LIB_VERSION") ?: "0.0.1"

afterEvaluate {
    publishing {
        publications {
            create<MavenPublication>("release") {
                from(components["release"])

                groupId = "com.swmansion"
                artifactId = "pulsar"
                version = version.toString()

                pom {
                    name.set("Pulsar Android Library")
                    description.set("Pulsar audio visualization and manipulation library for Android")
                    url.set("https://github.com/swmansion/pulsar")
                    
                    licenses {
                        license {
                            name.set("MIT License")
                            url.set("https://github.com/swmansion/pulsar/blob/main/LICENSE")
                        }
                    }
                    
                    developers {
                        developer {
                            id.set("swmansion")
                            name.set("Software Mansion")
                            email.set("hello@swmansion.com")
                        }
                    }
                    
                    scm {
                        connection.set("scm:git:https://github.com/swmansion/pulsar.git")
                        developerConnection.set("scm:git:https://github.com/swmansion/pulsar.git")
                        url.set("https://github.com/swmansion/pulsar")
                    }
                }
            }
        }

        repositories {
            maven {
                url = uri("https://s01.oss.sonatype.org/service/repositories/releases/content/")
                credentials {
                    username = System.getenv("MAVEN_USERNAME")
                    password = System.getenv("MAVEN_PASSWORD")
                }
            }
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