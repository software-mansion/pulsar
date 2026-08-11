package com.swmansion.pulsar.gradle

import com.android.build.gradle.BaseExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.file.Directory
import org.gradle.api.file.DirectoryProperty
import org.gradle.api.provider.Property
import org.gradle.api.provider.Provider
import org.gradle.api.tasks.TaskProvider

abstract class PulsarGenExtension {
    /** Directory scanned for `*.pulsar` bundles. Defaults to `src/pulsarBundles`. */
    abstract val bundlesDir: DirectoryProperty

    /** Package for the generated accessor objects. Defaults to `com.swmansion.pulsar.bundles`. */
    abstract val packageName: Property<String>
}

/**
 * Apply with `id("com.swmansion.pulsar.gen")`. Generates typed Kotlin accessors for every
 * `.pulsar` bundle in `src/pulsarBundles/` and packages the bundles into the APK assets, wired to
 * run before compilation — the FlutterGen / Compose-Resources model for Android.
 */
class PulsarGenPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        val ext = project.extensions.create("pulsarBundles", PulsarGenExtension::class.java)

        val genSrc: Provider<Directory> = project.layout.buildDirectory.dir("generated/source/pulsar/main")
        val genAssets: Provider<Directory> = project.layout.buildDirectory.dir("generated/assets/pulsar")

        val task = project.tasks.register("generatePulsarBundles", GeneratePulsarBundlesTask::class.java) { t ->
            t.bundlesDir.convention(
                ext.bundlesDir.orElse(project.layout.projectDirectory.dir("src/pulsarBundles")),
            )
            t.generatedSrcDir.set(genSrc)
            t.generatedAssetsDir.set(genAssets)
            t.packageName.convention(ext.packageName.orElse("com.swmansion.pulsar.bundles"))
        }

        project.plugins.withId("com.android.application") { wireAndroid(project, task, genSrc, genAssets) }
        project.plugins.withId("com.android.library") { wireAndroid(project, task, genSrc, genAssets) }
    }

    private fun wireAndroid(
        project: Project,
        task: TaskProvider<GeneratePulsarBundlesTask>,
        genSrc: Provider<Directory>,
        genAssets: Provider<Directory>,
    ) {
        val android = project.extensions.findByType(BaseExtension::class.java) ?: return
        android.sourceSets.getByName("main").java.srcDir(genSrc)
        android.sourceSets.getByName("main").assets.srcDir(genAssets)
        project.tasks.named("preBuild").configure { it.dependsOn(task) }
    }
}
