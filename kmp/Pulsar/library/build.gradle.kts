import com.android.build.api.dsl.androidLibrary
plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.android.kotlin.multiplatform.library)
    alias(libs.plugins.vanniktech.mavenPublish)
}

group = "com.swmansion"
version = System.getenv("LIB_VERSION") ?: "0.0.1"

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
        }

        androidMain.dependencies {
            implementation(libs.androidx.core.ktx)
            implementation(libs.kotlinx.coroutines.core)
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
