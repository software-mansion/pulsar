group = "com.swmansion.pulsar"
version = "1.0-SNAPSHOT"

buildscript {
    val kotlinVersion = "2.2.20"
    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath("com.android.tools.build:gradle:8.11.1")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

plugins {
    id("com.android.library")
    id("kotlin-android")
    id("org.jetbrains.kotlin.plugin.serialization") version "2.2.20"
}

fun getStringPropertyOrEnv(name: String, defaultValue: String): String {
    val projectValue = (rootProject.findProperty(name) ?: project.findProperty(name)) as String?
    return projectValue ?: System.getenv(name) ?: defaultValue
}

// By default the plugin compiles against the published com.swmansion:pulsar Maven
// artifact. Set USE_LOCAL_PULSAR_ANDROID=1 to compile against the in-repo sources
// under Android/Pulsar instead (useful when iterating on the native SDK).
val useLocalPulsarAndroid = getStringPropertyOrEnv("USE_LOCAL_PULSAR_ANDROID", "0") == "1"
val pulsarAndroidVersion = getStringPropertyOrEnv("PULSAR_ANDROID_MAVEN_VERSION", "1.1.1")
val localPulsarAndroidSourceDir = file("../../../Android/Pulsar/src/main/java")

if (useLocalPulsarAndroid) {
    if (!localPulsarAndroidSourceDir.exists()) {
        throw GradleException("USE_LOCAL_PULSAR_ANDROID=1 but local Pulsar Android sources were not found at $localPulsarAndroidSourceDir")
    }
    logger.lifecycle("Using local Pulsar Android sources from $localPulsarAndroidSourceDir")
} else {
    logger.lifecycle("Using published Pulsar Android artifact com.swmansion:pulsar:$pulsarAndroidVersion")
}

android {
    namespace = "com.swmansion.pulsar"

    compileSdk = 36

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    sourceSets {
        getByName("main") {
            java.srcDirs("src/main/kotlin")
            if (useLocalPulsarAndroid) {
                java.srcDir(localPulsarAndroidSourceDir)
            }
        }
        getByName("test") {
            java.srcDirs("src/test/kotlin")
        }
    }

    defaultConfig {
        minSdk = 24
    }

    testOptions {
        unitTests {
            isIncludeAndroidResources = true
            all {
                it.useJUnitPlatform()

                it.outputs.upToDateWhen { false }

                it.testLogging {
                    events("passed", "skipped", "failed", "standardOut", "standardError")
                    showStandardStreams = true
                }
            }
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")

    if (useLocalPulsarAndroid) {
        // Local sources need the serialization runtime that the artifact would otherwise provide.
        implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    } else {
        implementation("com.swmansion:pulsar:$pulsarAndroidVersion")
    }

    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("org.mockito:mockito-core:5.0.0")
}
