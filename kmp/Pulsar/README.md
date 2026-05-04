# Pulsar KMP

<!-- GENERATED:KMP_VERSION_START -->
Latest available version: `0.0.2`
<!-- GENERATED:KMP_VERSION_END -->

<!-- GENERATED:KMP_INSTALL_SNIPPET_START -->
```kotlin
dependencies {
  implementation("com.swmansion:pulsar-kmp:0.0.2")
}
```
<!-- GENERATED:KMP_INSTALL_SNIPPET_END -->

This module exports Pulsar as a Kotlin Multiplatform wrapper library.

- Android uses the native Pulsar implementation copied into `androidMain` and registers it automatically through the library manifest.
- iOS uses a Kotlin/Native CoreHaptics implementation in `iosMain`, including generated preset pattern data.
- Consumers can call `Pulsar.create()` from common code without adding a platform bridge.

Useful commands:
- `./gradlew :library:check`
- `./gradlew :library:publishToMavenLocal`
- `./gradlew :library:publishToMavenCentral`

GitHub Actions publishing:
- Workflow: `.github/workflows/publish-kmp-library.yml`
- Required repository secrets: `MAVEN_USERNAME`, `MAVEN_PASSWORD`, `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE`
- Published version is taken from the workflow `version` input via `LIB_VERSION`
