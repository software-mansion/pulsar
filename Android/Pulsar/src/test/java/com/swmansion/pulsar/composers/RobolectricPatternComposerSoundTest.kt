package com.swmansion.pulsar.composers

import com.swmansion.pulsar.audio.AudioSimulator
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.SoundData
import com.swmansion.pulsar.types.ValuePoint
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class RobolectricPatternComposerSoundTest {

    private fun composer(): PatternComposer {
        val app = RuntimeEnvironment.getApplication()
        return PatternComposer(HapticEngineWrapper(app), AudioSimulator(CompatibilityMode.STANDARD_SUPPORT))
    }

    private fun pattern() = PatternData(
        continuousPattern = ContinuousPattern(
            amplitude = listOf(ValuePoint(0L, 1f), ValuePoint(100L, 0f)),
            frequency = listOf(ValuePoint(0L, 0.5f)),
        ),
        discretePattern = listOf(ConfigPoint(0L, 1f, 0.3f)),
    )

    @Test
    fun reparsingWithoutSoundDropsThePreviousSound() {
        val composer = composer()

        composer.parsePatternWithSound(pattern(), SoundData(uri = "/pulsar-test-sound.wav"))
        assertNotNull(composer.soundPlayer)

        composer.parsePattern(pattern())
        assertNull(composer.soundPlayer)
    }

    @Test
    fun reparsingWithSoundReplacesThePreviousSound() {
        val composer = composer()

        composer.parsePatternWithSound(pattern(), SoundData(uri = "/pulsar-test-sound.wav"))
        val first = composer.soundPlayer

        composer.parsePatternWithSound(pattern(), SoundData(uri = "/pulsar-other-sound.wav"))

        assertNotNull(composer.soundPlayer)
        assert(composer.soundPlayer !== first)
    }

    @Test
    fun releaseDropsTheSound() {
        val composer = composer()

        composer.parsePatternWithSound(pattern(), SoundData(uri = "/pulsar-test-sound.wav"))
        composer.release()

        assertNull(composer.soundPlayer)
    }
}
