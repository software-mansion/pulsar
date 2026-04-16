# Pulsar KMP

This module exports Pulsar as a Kotlin Multiplatform wrapper library.

- Android uses the native Pulsar implementation copied into `androidMain`.
- iOS keeps its native Swift implementation separate and connects to the KMP facade through a factory bridge.

Useful commands:
- `./gradlew :library:check`
- `./gradlew :library:publishToMavenLocal`
- `./gradlew :library:publishToMavenCentral`

GitHub Actions publishing:
- Workflow: `.github/workflows/publish-kmp-library.yml`
- Required repository secrets: `MAVEN_USERNAME`, `MAVEN_PASSWORD`, `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE`
- Published version is taken from the workflow `version` input via `LIB_VERSION`
