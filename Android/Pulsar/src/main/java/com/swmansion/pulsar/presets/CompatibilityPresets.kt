package com.swmansion.pulsar.presets

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class SystemImpactLightPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(.1f, 1.0f, 1.0f),
        )
    )) { companion object: PresetWithName { override val name = "SystemImpactLight" } }

class SystemImpactMediumPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(.1f, 1.0f, 1.0f),
        )
    )) { companion object: PresetWithName { override val name = "SystemImpactMedium" } }

class SystemImpactHeavyPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(.1f, 1.0f, 1.0f),
        )
    )) { companion object: PresetWithName { override val name = "SystemImpactHeavy" } }

class SystemImpactSoftPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(.1f, 1.0f, 1.0f),
        )
    )) { companion object: PresetWithName { override val name = "SystemImpactSoft" } }

class SystemImpactRigidPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(.1f, 1.0f, 1.0f),
        )
    )) { companion object: PresetWithName { override val name = "SystemImpactRigid" } }

class SystemNotificationSuccessPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(.1f, 1.0f, 1.0f),
        )
    )) { companion object: PresetWithName { override val name = "SystemNotificationSuccess" } }

class SystemNotificationWarningPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(.1f, 1.0f, 1.0f),
        )
    )) { companion object: PresetWithName { override val name = "SystemNotificationWarning" } }

class SystemNotificationErrorPreset(haptics: Pulsar) : Preset,
    Player(haptics, PatternData(
        rawDiscretePattern = listOf(
            listOf(.1f, 1.0f, 1.0f),
        )
    )) { companion object: PresetWithName { override val name = "SystemNotificationError" } }
