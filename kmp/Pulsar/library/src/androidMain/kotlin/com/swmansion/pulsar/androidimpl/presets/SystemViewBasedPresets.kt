package com.swmansion.pulsar.kmp.androidimpl.presets

import android.os.Build
import android.view.HapticFeedbackConstants
import com.swmansion.pulsar.kmp.androidimpl.ActivityProvider
import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.types.Preset
import com.swmansion.pulsar.kmp.androidimpl.types.PresetWithName

class SystemViewBasedPresets(private val activityProvider: ActivityProvider) {
    fun longPress(): Boolean = playHaptic(HapticFeedbackConstants.LONG_PRESS)
    fun virtualKey(): Boolean = playHaptic(HapticFeedbackConstants.VIRTUAL_KEY)
    fun keyboardTap(): Boolean = playHaptic(HapticFeedbackConstants.KEYBOARD_TAP)
    fun clockTick(): Boolean = playHaptic(HapticFeedbackConstants.CLOCK_TICK)
    fun calendarDate(): Boolean = playHaptic(5) // CALENDAR_DATE
    fun contextClick(): Boolean = playHaptic(HapticFeedbackConstants.CONTEXT_CLICK)
    fun keyboardPress(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        playHaptic(HapticFeedbackConstants.KEYBOARD_PRESS)
    } else {
        false
    }
    fun keyboardRelease(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        playHaptic(HapticFeedbackConstants.KEYBOARD_RELEASE)
    } else {
        false
    }
    fun virtualKeyRelease(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        playHaptic(HapticFeedbackConstants.VIRTUAL_KEY_RELEASE)
    } else {
        false
    }
    fun textHandleMove(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        playHaptic(HapticFeedbackConstants.TEXT_HANDLE_MOVE)
    } else {
        false
    }
    fun dragCrossing(): Boolean = playHaptic(11) // DRAG_CROSSING
    fun gestureStart(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        playHaptic(HapticFeedbackConstants.GESTURE_START)
    } else {
        false
    }
    fun gestureEnd(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        playHaptic(HapticFeedbackConstants.GESTURE_END)
    } else {
        false
    }
    fun edgeSqueeze(): Boolean = playHaptic(14) // EDGE_SQUEEZE
    fun edgeRelease(): Boolean = playHaptic(15) // EDGE_RELEASE
    fun confirm(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        playHaptic(HapticFeedbackConstants.CONFIRM)
    } else {
        false
    }
    fun release(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        playHaptic(HapticFeedbackConstants.REJECT)
    } else {
        false
    }
    fun scrollTick(): Boolean = playHaptic(18) // SCROLL_TICK
    fun scrollItemFocus(): Boolean = playHaptic(19) // SCROLL_ITEM_FOCUS
    fun scrollLimit(): Boolean = playHaptic(20) // SCROLL_LIMIT
    fun toggleOn(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        playHaptic(HapticFeedbackConstants.TOGGLE_ON)
    } else {
        false
    }
    fun toggleOff(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        playHaptic(HapticFeedbackConstants.TOGGLE_OFF)
    } else {
        false
    }
    fun dragStart(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        playHaptic(HapticFeedbackConstants.DRAG_START)
    } else {
        false
    }
    fun segmentTick(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        playHaptic(HapticFeedbackConstants.SEGMENT_TICK)
    } else {
        false
    }
    fun segmentFrequentTick(): Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        playHaptic(HapticFeedbackConstants.SEGMENT_FREQUENT_TICK)
    } else {
        false
    }

    private fun playHaptic(preset: Int): Boolean {
        return activityProvider.getCurrentActivity()?.window?.decorView?.performHapticFeedback(preset) == true
    }
}

class SystemLongPressPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.9f, 0.45f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.longPress() }
    }
    companion object: PresetWithName { override val name = "SystemLongPress" }
}

class SystemVirtualKeyPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.virtualKey() }
    }
    companion object: PresetWithName { override val name = "SystemVirtualKey" }
}

class SystemKeyboardTapPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.keyboardTap() }
    }
    companion object: PresetWithName { override val name = "SystemKeyboardTap" }
}

class SystemClockTickPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.12f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.clockTick() }
    }
    companion object: PresetWithName { override val name = "SystemClockTick" }
}

class SystemCalendarDatePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.calendarDate() }
    }
    companion object: PresetWithName { override val name = "SystemCalendarDate" }
}

class SystemContextClickPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.contextClick() }
    }
    companion object: PresetWithName { override val name = "SystemContextClick" }
}

class SystemKeyboardPressPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.keyboardPress() }
    }
    companion object: PresetWithName { override val name = "SystemKeyboardPress" }
}

class SystemKeyboardReleasePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.keyboardRelease() }
    }
    companion object: PresetWithName { override val name = "SystemKeyboardRelease" }
}

class SystemVirtualKeyReleasePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.virtualKeyRelease() }
    }
    companion object: PresetWithName { override val name = "SystemVirtualKeyRelease" }
}

class SystemTextHandleMovePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.12f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.textHandleMove() }
    }
    companion object: PresetWithName { override val name = "SystemTextHandleMove" }
}

class SystemDragCrossingPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.dragCrossing() }
    }
    companion object: PresetWithName { override val name = "SystemDragCrossing" }
}

class SystemGestureStartPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.gestureStart() }
    }
    companion object: PresetWithName { override val name = "SystemGestureStart" }
}

class SystemGestureEndPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.gestureEnd() }
    }
    companion object: PresetWithName { override val name = "SystemGestureEnd" }
}

class SystemEdgeSqueezePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.9f, 0.45f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.edgeSqueeze() }
    }
    companion object: PresetWithName { override val name = "SystemEdgeSqueeze" }
}

class SystemEdgeReleasePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.edgeRelease() }
    }
    companion object: PresetWithName { override val name = "SystemEdgeRelease" }
}

class SystemConfirmPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.confirm() }
    }
    companion object: PresetWithName { override val name = "SystemConfirm" }
}

class SystemReleasePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.81f, 0.61f),
                listOf(120.0f, 0.7f, 0.35f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.release() }
    }
    companion object: PresetWithName { override val name = "SystemRelease" }
}

class SystemScrollTickPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.scrollTick() }
    }
    companion object: PresetWithName { override val name = "SystemScrollTick" }
}

class SystemScrollItemFocusPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.scrollItemFocus() }
    }
    companion object: PresetWithName { override val name = "SystemScrollItemFocus" }
}

class SystemScrollLimitPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.scrollLimit() }
    }
    companion object: PresetWithName { override val name = "SystemScrollLimit" }
}

class SystemToggleOnPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.5f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.toggleOn() }
    }
    companion object: PresetWithName { override val name = "SystemToggleOn" }
}

class SystemToggleOffPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.4f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.toggleOff() }
    }
    companion object: PresetWithName { override val name = "SystemToggleOff" }
}

class SystemDragStartPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.9f, 0.45f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.dragStart() }
    }
    companion object: PresetWithName { override val name = "SystemDragStart" }
}

class SystemSegmentTickPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.segmentTick() }
    }
    companion object: PresetWithName { override val name = "SystemSegmentTick" }
}

class SystemSegmentFrequentTickPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawContinuousPattern = listOf(
                listOf(),
                listOf(),
            ),
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.12f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        playSystemOrFallback { systemPresets.segmentFrequentTick() }
    }
    companion object: PresetWithName { override val name = "SystemSegmentFrequentTick" }
}
