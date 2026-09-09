package com.swmansion.pulsar.lottie

import android.content.Context
import android.util.AttributeSet
import com.airbnb.lottie.LottieAnimationView
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.bundle.PresetHandle
import com.swmansion.pulsar.types.PatternData

/**
 * A [LottieAnimationView] subclass that plays Pulsar haptics in sync.
 *
 * A drop-in replacement for `LottieAnimationView`: with no haptics bound it
 * behaves identically. Call [bindHaptics] to attach a pattern — or a whole bundle
 * preset, whose Lottie animation this view renders for you — and drive transport
 * through the returned [HapticLottieController].
 */
class HapticLottieView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0,
) : LottieAnimationView(context, attrs, defStyleAttr) {

    private var controller: HapticLottieController? = null

    /**
     * Bind haptics and return the controller that steers animation + haptics.
     *
     * A bundle [preset] supplies all three of the animation, the pattern and the
     * authored duration; each is still overridable on its own. An explicit [haptics]
     * wins over the preset's pattern, and an animation already set on this view is
     * kept rather than replaced.
     */
    @JvmOverloads
    fun bindHaptics(
        pulsar: Pulsar,
        preset: PresetHandle? = null,
        haptics: PatternData? = null,
        hapticMode: HapticMode? = null,
        hapticOffset: Long = 0L,
        hapticsEnabled: Boolean = true,
        durationMs: Long? = null,
    ): HapticLottieController {
        controller?.release()
        preset?.animation?.let { animation ->
            if (composition == null) setAnimation(animation.data.inputStream(), preset.id)
        }
        return HapticLottieController(
            this,
            pulsar,
            preset,
            haptics,
            hapticMode,
            hapticOffset,
            hapticsEnabled,
            durationMs,
        ).also { controller = it }
    }

    /** The current controller, or `null` if [bindHaptics] hasn't been called. */
    fun hapticController(): HapticLottieController? = controller
}
