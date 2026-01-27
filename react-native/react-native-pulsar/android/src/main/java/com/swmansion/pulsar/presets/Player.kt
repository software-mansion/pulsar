package com.swmansion.pulsar.presets

import android.Manifest
import androidx.annotation.RequiresPermission
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.composers.PatternComposer

open class Player(
    haptics: Pulsar,
    pattern: PatternData,
) {
    private var composer: PatternComposer = haptics.getPatternComposer()

    init {
        composer.parsePattern(pattern)
    }

    fun play() {
        composer.play()
    }

}
