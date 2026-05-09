package com.swmansion.pulsar.presets

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.composers.PatternComposer

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
