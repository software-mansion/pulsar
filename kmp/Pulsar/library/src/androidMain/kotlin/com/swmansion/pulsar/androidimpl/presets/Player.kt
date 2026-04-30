package com.swmansion.pulsar.kmp.androidimpl.presets

import com.swmansion.pulsar.kmp.androidimpl.Pulsar
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData
import com.swmansion.pulsar.kmp.androidimpl.composers.PatternComposer

open class Player(
    haptics: Pulsar,
    pattern: PatternData,
    private var audioOnly: Boolean = false
) {
    private var composer: PatternComposer = haptics.getPatternComposer()

    init {
        composer.parsePattern(pattern)
    }

    open fun play() {
        if (audioOnly) {
            composer.playAudioOnly()
            return
        }
        composer.play()
    }

}
