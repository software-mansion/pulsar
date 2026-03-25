package com.swmansion.pulsar.presets

import android.app.Activity
import android.content.Context
import android.os.Build
import android.view.HapticFeedbackConstants
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.types.PresetWithName

class SystemViewBasedPresets(private var activity: Activity?) {
    fun longPress() { playHaptic(HapticFeedbackConstants.LONG_PRESS) }
    fun virtualKey() { playHaptic(HapticFeedbackConstants.VIRTUAL_KEY) }
    fun keyboardTap() { playHaptic(HapticFeedbackConstants.KEYBOARD_TAP) }
    fun clockTick() { playHaptic(HapticFeedbackConstants.CLOCK_TICK) }
    fun calendarDate() { playHaptic(5) } // CALENDAR_DATE
    fun contextClick() { playHaptic(HapticFeedbackConstants.CONTEXT_CLICK) }
    fun keyboardPress() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            playHaptic(HapticFeedbackConstants.KEYBOARD_PRESS)
        }
    }
    fun keyboardRelease() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            playHaptic(HapticFeedbackConstants.KEYBOARD_RELEASE)
        }
    }
    fun virtualKeyRelease() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            playHaptic(HapticFeedbackConstants.VIRTUAL_KEY_RELEASE)
        }
    }
    fun textHandleMove() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            playHaptic(HapticFeedbackConstants.TEXT_HANDLE_MOVE)
        }
    }
    fun dragCrossing() { playHaptic(11) } // DRAG_CROSSING
    fun gestureStart() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(HapticFeedbackConstants.GESTURE_START)
        }
    }
    fun gestureEnd() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(HapticFeedbackConstants.GESTURE_END)
        }
    }
    fun edgeSqueeze() { playHaptic(14) } // EDGE_SQUEEZE
    fun edgeRelease() { playHaptic(15) } // EDGE_RELEASE
    fun confirm() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(HapticFeedbackConstants.CONFIRM)
        }
    }
    fun release() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            playHaptic(HapticFeedbackConstants.REJECT)
        }
    }
    fun scrollTick() { playHaptic(18) } // SCROLL_TICK
    fun scrollItemFocus() { playHaptic(19) } // SCROLL_ITEM_FOCUS
    fun scrollLimit() { playHaptic(20) } // SCROLL_LIMIT
    fun toggleOn() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            playHaptic(HapticFeedbackConstants.TOGGLE_ON)
        }
    }
    fun toggleOff() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            playHaptic(HapticFeedbackConstants.TOGGLE_OFF)
        }
    }
    fun dragStart() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            playHaptic(HapticFeedbackConstants.DRAG_START)
        }
    }
    fun segmentTick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            playHaptic(HapticFeedbackConstants.SEGMENT_TICK)
        }
    }
    fun segmentFrequentTick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            playHaptic(HapticFeedbackConstants.SEGMENT_FREQUENT_TICK)
        }
    }

    private fun playHaptic(preset: Int) {
        activity?.window?.decorView?.performHapticFeedback(preset)
    }
}

class SystemLongPressPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.9f, 0.45f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.longPress()
    }
    companion object: PresetWithName { override val name = "SystemLongPressPreset" }
}

class SystemVirtualKeyPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.virtualKey()
    }
    companion object: PresetWithName { override val name = "SystemVirtualKeyPreset" }
}

class SystemKeyboardTapPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.keyboardTap()
    }
    companion object: PresetWithName { override val name = "SystemKeyboardTapPreset" }
}

class SystemClockTickPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.12f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.clockTick()
    }
    companion object: PresetWithName { override val name = "SystemClockTickPreset" }
}

class SystemCalendarDatePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.calendarDate()
    }
    companion object: PresetWithName { override val name = "SystemCalendarDatePreset" }
}

class SystemContextClickPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.contextClick()
    }
    companion object: PresetWithName { override val name = "SystemContextClickPreset" }
}

class SystemKeyboardPressPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.keyboardPress()
    }
    companion object: PresetWithName { override val name = "SystemKeyboardPressPreset" }
}

class SystemKeyboardReleasePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.keyboardRelease()
    }
    companion object: PresetWithName { override val name = "SystemKeyboardReleasePreset" }
}

class SystemVirtualKeyReleasePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.virtualKeyRelease()
    }
    companion object: PresetWithName { override val name = "SystemVirtualKeyReleasePreset" }
}

class SystemTextHandleMovePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.12f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.textHandleMove()
    }
    companion object: PresetWithName { override val name = "SystemTextHandleMovePreset" }
}

class SystemDragCrossingPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.dragCrossing()
    }
    companion object: PresetWithName { override val name = "SystemDragCrossingPreset" }
}

class SystemGestureStartPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.gestureStart()
    }
    companion object: PresetWithName { override val name = "SystemGestureStartPreset" }
}

class SystemGestureEndPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.gestureEnd()
    }
    companion object: PresetWithName { override val name = "SystemGestureEndPreset" }
}

class SystemEdgeSqueezePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.9f, 0.45f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.edgeSqueeze()
    }
    companion object: PresetWithName { override val name = "SystemEdgeSqueezePreset" }
}

class SystemEdgeReleasePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.edgeRelease()
    }
    companion object: PresetWithName { override val name = "SystemEdgeReleasePreset" }
}

class SystemConfirmPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.confirm()
    }
    companion object: PresetWithName { override val name = "SystemConfirmPreset" }
}

class SystemReleasePreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.81f, 0.61f),
                listOf(120.0f, 0.7f, 0.35f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.release()
    }
    companion object: PresetWithName { override val name = "SystemReleasePreset" }
}

class SystemScrollTickPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.scrollTick()
    }
    companion object: PresetWithName { override val name = "SystemScrollTickPreset" }
}

class SystemScrollItemFocusPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.scrollItemFocus()
    }
    companion object: PresetWithName { override val name = "SystemScrollItemFocusPreset" }
}

class SystemScrollLimitPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.65f, 0.85f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.scrollLimit()
    }
    companion object: PresetWithName { override val name = "SystemScrollLimitPreset" }
}

class SystemToggleOnPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.5f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.toggleOn()
    }
    companion object: PresetWithName { override val name = "SystemToggleOnPreset" }
}

class SystemToggleOffPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.4f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.toggleOff()
    }
    companion object: PresetWithName { override val name = "SystemToggleOffPreset" }
}

class SystemDragStartPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.9f, 0.45f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.dragStart()
    }
    companion object: PresetWithName { override val name = "SystemDragStartPreset" }
}

class SystemSegmentTickPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.2f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.segmentTick()
    }
    companion object: PresetWithName { override val name = "SystemSegmentTickPreset" }
}

class SystemSegmentFrequentTickPreset(haptics: Pulsar, private val systemPresets: SystemViewBasedPresets) : Preset,
    Player(
        haptics,
//CODEGEN_BEGIN_{system_preset}
        PatternData(
            rawDiscretePattern = listOf(
                listOf(0.0f, 0.12f, 0.9f),
            ),
        ),
//CODEGEN_END_{system_preset}
        true
    ) {
    override fun play() {
        super.play()
        systemPresets.segmentFrequentTick()
    }
    companion object: PresetWithName { override val name = "SystemSegmentFrequentTickPreset" }
}
