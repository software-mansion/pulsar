package com.swmansion.pulsar.lottie

import com.swmansion.pulsar.kmp.CompatibilityMode
import com.swmansion.pulsar.kmp.PatternComposerHandle
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.Pulsar
import com.swmansion.pulsar.kmp.PulsarPlatformFactory
import com.swmansion.pulsar.kmp.PulsarPlatformHandle
import com.swmansion.pulsar.kmp.PulsarPresetsHandle
import com.swmansion.pulsar.kmp.RealtimeComposerHandle
import com.swmansion.pulsar.kmp.SoundData
import com.swmansion.pulsar.kmp.registerPulsarFactory

class RecordingHandle : PulsarPlatformHandle {
    val realtime = RecordingRealtime()
    val pattern = RecordingPattern()

    override fun presets(): PulsarPresetsHandle =
        throw UnsupportedOperationException("the Lottie SDK never reaches for the preset library")

    override fun patternComposer(): PatternComposerHandle = pattern
    override fun realtimeComposer(): RealtimeComposerHandle = realtime

    override fun preloadPreset(name: String) = Unit
    override fun enableHaptics(state: Boolean) = Unit
    override fun enableSound(state: Boolean) = Unit
    override fun enableCache(state: Boolean) = Unit
    override fun isCacheEnabled(): Boolean = true
    override fun clearCache() = Unit
    override fun stopHaptics() = Unit
    override fun shutDownEngine() = Unit
    override fun isHapticsEnabled(): Boolean = true
    override fun isHapticsSupported(): Boolean = true
    override fun canPlayHaptics(): Boolean = true
    override fun hapticSupport(): CompatibilityMode = CompatibilityMode.ADVANCED_SUPPORT
}

class RecordingRealtime : RealtimeComposerHandle {
    val sets = mutableListOf<Pair<Float, Float>>()
    val discretes = mutableListOf<Pair<Float, Float>>()
    var stops = 0

    override fun set(amplitude: Float, frequency: Float) {
        sets += amplitude to frequency
    }

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        discretes += amplitude to frequency
    }

    override fun stop() {
        stops++
    }

    override fun isActive(): Boolean = false

    fun clear() {
        sets.clear()
        discretes.clear()
        stops = 0
    }
}

class RecordingPattern : PatternComposerHandle {
    val parsed = mutableListOf<PatternData>()
    var plays = 0
    var stops = 0

    override fun parsePattern(pattern: PatternData) {
        parsed += pattern
    }

    override fun parsePatternWithSound(pattern: PatternData, sound: SoundData) {
        parsed += pattern
    }

    override fun playPattern(pattern: PatternData) {
        parsed += pattern
        plays++
    }

    override fun play() {
        plays++
    }

    override fun playAudioOnly() = Unit

    override fun stop() {
        stops++
    }
}

fun installRecordingPulsar(): Pair<Pulsar, RecordingHandle> {
    val handle = RecordingHandle()
    registerPulsarFactory(object : PulsarPlatformFactory {
        override fun createPulsar(): PulsarPlatformHandle = handle
    })
    return Pulsar.create() to handle
}

object TestBundle {

    const val LOTTIE_JSON =
        """{"v":"5.7.4","fr":30,"ip":0,"op":60,"w":100,"h":100,"nm":"empty","ddd":0,""" +
            """"assets":[],"layers":[]}"""

    private const val HAPTICS_JSON =
        """{"continuousPattern":{"amplitude":[{"time":0,"value":0.0},{"time":800,"value":1.0}],""" +
            """"frequency":[{"time":0,"value":0.3}]},""" +
            """"discretePattern":[{"time":250,"amplitude":1.0,"frequency":0.5},""" +
            """{"time":600,"amplitude":0.4,"frequency":0.2}]}"""

    fun bytes(durationMs: Double = 1500.0, withAnimation: Boolean = true): ByteArray {
        val animation =
            if (withAnimation) {
                ""","animation":{"src":"anim/celebration.json","frameRate":30,"totalFrames":60}"""
            } else {
                ""
            }
        val manifest =
            """{"schema":"pulsar.bundle/1","id":"com.acme.haptics","name":"Acme Pack","revision":7,""" +
                """"hash":"sha256-test","presets":[{"id":"celebration","name":"Celebration",""" +
                """"duration":$durationMs,"haptics":"haptics/celebration.json"$animation}]}"""

        val entries = buildMap {
            put("manifest.json", manifest)
            put("haptics/celebration.json", HAPTICS_JSON)
            if (withAnimation) put("anim/celebration.json", LOTTIE_JSON)
        }
        return storedZip(entries)
    }

    private fun storedZip(entries: Map<String, String>): ByteArray {
        fun crc32(bytes: ByteArray): Int {
            val table = IntArray(256) { n ->
                var c = n
                repeat(8) { c = if (c and 1 != 0) (0xEDB88320.toInt() xor (c ushr 1)) else (c ushr 1) }
                c
            }
            var c = -1
            for (b in bytes) c = table[(c xor b.toInt()) and 0xFF] xor (c ushr 8)
            return c.inv()
        }
        fun le16(v: Int) = byteArrayOf((v and 0xFF).toByte(), ((v ushr 8) and 0xFF).toByte())
        fun le32(v: Int) = byteArrayOf(
            (v and 0xFF).toByte(), ((v ushr 8) and 0xFF).toByte(),
            ((v ushr 16) and 0xFF).toByte(), ((v ushr 24) and 0xFF).toByte(),
        )
        val local = ArrayList<Byte>()
        val central = ArrayList<Byte>()
        var offset = 0
        for ((name, content) in entries) {
            val nameB = name.encodeToByteArray()
            val data = content.encodeToByteArray()
            val crc = crc32(data)
            val lh = le32(0x04034b50) + le16(20) + le16(0) + le16(0) + le16(0) + le16(0) +
                le32(crc) + le32(data.size) + le32(data.size) + le16(nameB.size) + le16(0)
            local += lh.toList(); local += nameB.toList(); local += data.toList()
            val ch = le32(0x02014b50) + le16(20) + le16(20) + le16(0) + le16(0) + le16(0) + le16(0) +
                le32(crc) + le32(data.size) + le32(data.size) +
                le16(nameB.size) + le16(0) + le16(0) + le16(0) + le16(0) + le32(0) + le32(offset)
            central += ch.toList(); central += nameB.toList()
            offset += lh.size + nameB.size + data.size
        }
        val eocd = le32(0x06054b50) + le16(0) + le16(0) + le16(entries.size) + le16(entries.size) +
            le32(central.size) + le32(local.size) + le16(0)
        return (local + central.toList() + eocd.toList()).toByteArray()
    }
}
