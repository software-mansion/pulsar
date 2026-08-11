package com.swmansion.pulsar.lottie

import android.content.Context
import android.util.AttributeSet
import com.airbnb.lottie.LottieAnimationView
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.types.PatternData

/**
 * A [LottieAnimationView] subclass that plays Pulsar haptics in sync.
 *
 * A drop-in replacement for `LottieAnimationView`: with no haptics set it
 * behaves identically. Call [setHaptics] to attach a pattern and drive transport
 * through the returned [HapticLottieController].
 */
class HapticLottieView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0,
) : LottieAnimationView(context, attrs, defStyleAttr) {

    private var controller: HapticLottieController? = null

    /** Attach [haptics] and return the controller that steers animation + haptics. */
    @JvmOverloads
    fun setHaptics(
        pulsar: Pulsar,
        haptics: PatternData,
        mode: HapticMode = HapticMode.REALTIME,
        offsetMs: Long = 0L,
        enabled: Boolean = true,
    ): HapticLottieController {
        controller?.release()
        return HapticLottieController(this, pulsar, haptics, mode, offsetMs, enabled)
            .also { controller = it }
    }

    /** The current controller, or `null` if [setHaptics] hasn't been called. */
    fun hapticController(): HapticLottieController? = controller
}
