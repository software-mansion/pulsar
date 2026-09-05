// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.android.library) apply false
    // Declared here (unapplied) so :Pulsar and :PulsarLottie resolve them from the same
    // buildscript classloader; otherwise nmcp's shared build service is loaded twice and
    // the second module's publish task fails to resolve it.
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.nmcp) apply false
}