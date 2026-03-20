package com.swmansion.pulsar.presets

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class SystemImpactLightPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(0f, 0.3f, 0.7f),
        )
    )) { companion object: PresetWithName { override val name = "SystemImpactLight" } }

class SystemImpactMediumPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(0f, 0.6f, 0.5f),
        )
    )) { companion object: PresetWithName { override val name = "SystemImpactMedium" } }

class SystemImpactHeavyPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(0f, 1.0f, 0.2f),
        )
    )) { companion object: PresetWithName { override val name = "SystemImpactHeavy" } }

class SystemImpactSoftPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(0f, 0.25f, 0.1f),
        )
    )) { companion object: PresetWithName { override val name = "SystemImpactSoft" } }

class SystemImpactRigidPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(0f, 0.7f, 1.0f),
        )
    )) { companion object: PresetWithName { override val name = "SystemImpactRigid" } }

class SystemNotificationSuccessPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(0f,   0.4f, 0.5f),
            listOf(110f, 0.8f, 0.5f),
        )
    )) { companion object: PresetWithName { override val name = "SystemNotificationSuccess" } }

class SystemNotificationWarningPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(0f,   0.5f, 0.5f),
            listOf(120f, 0.5f, 0.5f),
            listOf(240f, 0.5f, 0.5f),
        )
    )) { companion object: PresetWithName { override val name = "SystemNotificationWarning" } }

class SystemNotificationErrorPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(0f,   0.8f, 0.3f),
            listOf(100f, 0.5f, 0.3f),
            listOf(200f, 0.8f, 0.3f),
        )
    )) { companion object: PresetWithName { override val name = "SystemNotificationError" } }

class SystemSelectionPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(0f, 0.15f, 0.85f),
        )
    )) { companion object: PresetWithName { override val name = "SystemSelection" } }
