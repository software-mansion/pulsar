package com.swmansion.pulsar.kmp

internal class IOSPulsarPresetsHandle(
    private val haptics: IOSPulsarHandle,
) : PulsarPresetsHandle {
    private var useCache = true
    private val cache = mutableMapOf<String, IOSPreset>()

    private val mapper: Map<String, IOSPresetFactory> = buildMap {
        put("SystemImpactLight".normalizedName(), IOSPresetFactory { IOSSystemImpactLightPreset(it) })
        put("SystemImpactMedium".normalizedName(), IOSPresetFactory { IOSSystemImpactMediumPreset(it) })
        put("SystemImpactHeavy".normalizedName(), IOSPresetFactory { IOSSystemImpactHeavyPreset(it) })
        put("SystemImpactSoft".normalizedName(), IOSPresetFactory { IOSSystemImpactSoftPreset(it) })
        put("SystemImpactRigid".normalizedName(), IOSPresetFactory { IOSSystemImpactRigidPreset(it) })
        put("SystemNotificationSuccess".normalizedName(), IOSPresetFactory { IOSSystemNotificationSuccessPreset(it) })
        put("SystemNotificationWarning".normalizedName(), IOSPresetFactory { IOSSystemNotificationWarningPreset(it) })
        put("SystemNotificationError".normalizedName(), IOSPresetFactory { IOSSystemNotificationErrorPreset(it) })
        put("SystemSelection".normalizedName(), IOSPresetFactory { IOSSystemSelectionPreset(it) })
        iosGeneratedPresetFactories.forEach { (name, factory) ->
            put(name.normalizedName(), factory)
        }
    }

    fun enableCache(state: Boolean) {
        useCache = state
        if (!state) resetCache()
    }

    fun isCacheEnabled(): Boolean = useCache

    fun resetCache() {
        cache.clear()
    }

    fun preloadPresetByName(name: String) {
        useCache = true
        getByName(name)
    }

    fun getByName(name: String): IOSPreset? {
        val type = mapper[name.normalizedName()] ?: return null
        return getCacheablePreset(name, type)
    }

    override fun play(name: String): Boolean {
        val preset = getByName(name) ?: return false
        preset.play()
        return true
    }

    override fun systemImpactLight() {
        getCacheablePreset("SystemImpactLight", mapper.getValue("SystemImpactLight".normalizedName())).play()
    }

    override fun systemImpactMedium() {
        getCacheablePreset("SystemImpactMedium", mapper.getValue("SystemImpactMedium".normalizedName())).play()
    }

    override fun systemImpactHeavy() {
        getCacheablePreset("SystemImpactHeavy", mapper.getValue("SystemImpactHeavy".normalizedName())).play()
    }

    override fun systemImpactSoft() {
        getCacheablePreset("SystemImpactSoft", mapper.getValue("SystemImpactSoft".normalizedName())).play()
    }

    override fun systemImpactRigid() {
        getCacheablePreset("SystemImpactRigid", mapper.getValue("SystemImpactRigid".normalizedName())).play()
    }

    override fun systemNotificationSuccess() {
        getCacheablePreset("SystemNotificationSuccess", mapper.getValue("SystemNotificationSuccess".normalizedName())).play()
    }

    override fun systemNotificationWarning() {
        getCacheablePreset("SystemNotificationWarning", mapper.getValue("SystemNotificationWarning".normalizedName())).play()
    }

    override fun systemNotificationError() {
        getCacheablePreset("SystemNotificationError", mapper.getValue("SystemNotificationError".normalizedName())).play()
    }

    override fun systemSelection() {
        getCacheablePreset("SystemSelection", mapper.getValue("SystemSelection".normalizedName())).play()
    }

    private fun getCacheablePreset(name: String, factory: IOSPresetFactory): IOSPreset {
        val cacheKey = name.normalizedName()
        if (!useCache) return factory.getInstance(haptics)
        return cache.getOrPut(cacheKey) { factory.getInstance(haptics) }
    }

    private fun String.normalizedName(): String = lowercase()
}
