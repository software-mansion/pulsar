import java.util.Base64

plugins {
    `kotlin-dsl`
    `java-gradle-plugin`
    `maven-publish`
    signing
    id("com.gradleup.nmcp") version "1.4.4"
}

group = "com.swmansion.pulsar"
version = "0.1.0" // pulsar-sync:pulsar-gen-gradle-version

gradlePlugin {
    website = "https://github.com/software-mansion/pulsar"
    vcsUrl = "https://github.com/software-mansion/pulsar"
    plugins {
        create("pulsarGen") {
            id = "com.swmansion.pulsar.gen"
            implementationClass = "com.swmansion.pulsar.gradle.PulsarGenPlugin"
            displayName = "Pulsar bundle codegen"
            description = "Generates typed Kotlin accessors for .pulsar bundles and packages them into assets."
            tags = listOf("haptics", "pulsar", "codegen", "android")
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

java {
    withSourcesJar()
    withJavadocJar()
}

// `java-gradle-plugin` creates the `pluginMaven` publication plus a marker publication per plugin
// id; both need POM metadata and a signature to be accepted by Central.
publishing {
    publications.withType<MavenPublication>().configureEach {
        pom {
            name.set("Pulsar bundle codegen")
            description.set("Gradle plugin that generates typed Kotlin accessors for Pulsar .pulsar bundles and packages them into Android assets.")
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

    // Unsigned local builds stay usable: only sign when a key is actually present.
    isRequired = gpgPrivateKey != null
    useInMemoryPgpKeys(gpgPrivateKey, System.getenv("GPG_PASSPHRASE"))
    sign(publishing.publications)
}
