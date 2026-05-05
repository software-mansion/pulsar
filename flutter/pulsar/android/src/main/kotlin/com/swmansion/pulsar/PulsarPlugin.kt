package com.swmansion.pulsar

import android.app.Activity
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.embedding.engine.plugins.activity.ActivityAware
import io.flutter.embedding.engine.plugins.activity.ActivityPluginBinding
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.RealtimeComposerStrategy
import com.swmansion.pulsar.types.ValuePoint

/** PulsarPlugin */
class PulsarPlugin : FlutterPlugin, MethodCallHandler, ActivityAware {

    private lateinit var channel: MethodChannel
    private var activity: Activity? = null
    private var pulsar: Pulsar? = null
    private val patternComposers = mutableMapOf<Int, PatternComposer>()
    private var nextPatternComposerId = 1

    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel = MethodChannel(binding.binaryMessenger, "pulsar")
        channel.setMethodCallHandler(this)
    }

    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
    }

    override fun onAttachedToActivity(binding: ActivityPluginBinding) {
        activity = binding.activity
        pulsar = Pulsar(binding.activity)
    }

    override fun onDetachedFromActivityForConfigChanges() {
        activity = null
        pulsar = null
        patternComposers.clear()
    }

    override fun onReattachedToActivityForConfigChanges(binding: ActivityPluginBinding) {
        activity = binding.activity
        pulsar = Pulsar(binding.activity)
    }

    override fun onDetachedFromActivity() {
        activity = null
        pulsar = null
        patternComposers.clear()
    }

    override fun onMethodCall(call: MethodCall, result: Result) {
        val p = pulsar
        if (p == null) {
            result.error("NOT_INITIALIZED", "Pulsar is not initialized (no Activity)", null)
            return
        }

        when (call.method) {
            "Pulsar_play" -> {
                val name = call.argument<String>("name")
                    ?: return result.error("INVALID_ARGS", "name required", null)
                p.getPresets().getByName(name)?.play()
                result.success(null)
            }

            "Pulsar_enableHaptics" -> {
                val state = call.argument<Boolean>("state")
                    ?: return result.error("INVALID_ARGS", "state required", null)
                p.enableHaptics(state)
                result.success(null)
            }

            "Pulsar_enableSound" -> {
                val state = call.argument<Boolean>("state")
                    ?: return result.error("INVALID_ARGS", "state required", null)
                p.enableSound(state)
                result.success(null)
            }

            "Pulsar_enableCache" -> {
                val state = call.argument<Boolean>("state")
                    ?: return result.error("INVALID_ARGS", "state required", null)
                p.enableCache(state)
                result.success(null)
            }

            "Pulsar_isCacheEnabled" -> {
                result.success(p.isCacheEnabled())
            }

            "Pulsar_clearCache" -> {
                p.clearCache()
                result.success(null)
            }

            "Pulsar_preloadPreset" -> {
                val name = call.argument<String>("presetName")
                    ?: return result.error("INVALID_ARGS", "presetName required", null)
                p.preloadPreset(name)
                result.success(null)
            }

            "Pulsar_presetExists" -> {
                val name = call.argument<String>("name")
                    ?: return result.error("INVALID_ARGS", "name required", null)
                result.success(p.getPresets().getByName(name) != null)
            }

            "Pulsar_preloadPresets" -> {
                val names = call.argument<List<String>>("presetNames")
                    ?: return result.error("INVALID_ARGS", "presetNames required", null)
                p.preloadPresets(names)
                result.success(null)
            }

            "Pulsar_stopHaptics" -> {
                p.stopHaptics()
                result.success(null)
            }

            "Pulsar_shutDownEngine" -> {
                result.success(null)
            }

            "Pulsar_isHapticsEnabled" -> {
                result.success(p.isHapticsEnabled())
            }

            "Pulsar_canPlayHaptics" -> {
                result.success(p.canPlayHaptics())
            }

            "Pulsar_hapticSupport" -> {
                result.success(p.hapticSupport().ordinal)
            }

            "Pulsar_forceHapticsSupportLevel" -> {
                val level = call.argument<Int>("level")
                    ?: return result.error("INVALID_ARGS", "level required", null)
                val mode = CompatibilityMode.entries.getOrNull(level)
                    ?: return result.error("INVALID_ARGS", "invalid level", null)
                p.forceHapticsSupportLevel(mode)
                result.success(null)
            }

            "Pulsar_enableImpulseCompositionMode" -> {
                val state = call.argument<Boolean>("state")
                    ?: return result.error("INVALID_ARGS", "state required", null)
                p.enableImpulseCompositionMode(state)
                result.success(null)
            }

            "Pulsar_setRealtimeComposerStrategy" -> {
                val strategy = call.argument<Int>("strategy")
                    ?: return result.error("INVALID_ARGS", "strategy required", null)
                val s = RealtimeComposerStrategy.entries.getOrNull(strategy)
                    ?: return result.error("INVALID_ARGS", "invalid strategy", null)
                p.realtimeComposerStrategy = s
                result.success(null)
            }

            "RealtimeComposer_set" -> {
                val amplitude = call.argument<Double>("amplitude")?.toFloat()
                    ?: return result.error("INVALID_ARGS", "amplitude required", null)
                val frequency = call.argument<Double>("frequency")?.toFloat()
                    ?: return result.error("INVALID_ARGS", "frequency required", null)
                val strategyIndex = call.argument<Int>("strategy")
                val strategy = if (strategyIndex != null) {
                    RealtimeComposerStrategy.entries.getOrNull(strategyIndex)
                        ?: return result.error("INVALID_ARGS", "invalid strategy", null)
                } else {
                    null
                }
                p.getRealtimeComposer(strategy).set(amplitude, frequency)
                result.success(null)
            }

            "RealtimeComposer_stop" -> {
                val strategyIndex = call.argument<Int>("strategy")
                val strategy = if (strategyIndex != null) {
                    RealtimeComposerStrategy.entries.getOrNull(strategyIndex)
                        ?: return result.error("INVALID_ARGS", "invalid strategy", null)
                } else {
                    null
                }
                p.getRealtimeComposer(strategy).stop()
                result.success(null)
            }

            "RealtimeComposer_isActive" -> {
                val strategyIndex = call.argument<Int>("strategy")
                val strategy = if (strategyIndex != null) {
                    RealtimeComposerStrategy.entries.getOrNull(strategyIndex)
                        ?: return result.error("INVALID_ARGS", "invalid strategy", null)
                } else {
                    null
                }
                result.success(p.getRealtimeComposer(strategy).isActive())
            }

            "RealtimeComposer_playDiscrete" -> {
                val amplitude = call.argument<Double>("amplitude")?.toFloat()
                    ?: return result.error("INVALID_ARGS", "amplitude required", null)
                val frequency = call.argument<Double>("frequency")?.toFloat()
                    ?: return result.error("INVALID_ARGS", "frequency required", null)
                val strategyIndex = call.argument<Int>("strategy")
                val strategy = if (strategyIndex != null) {
                    RealtimeComposerStrategy.entries.getOrNull(strategyIndex)
                        ?: return result.error("INVALID_ARGS", "invalid strategy", null)
                } else {
                    null
                }
                p.getRealtimeComposer(strategy).playDiscrete(amplitude, frequency)
                result.success(null)
            }

            "PatternComposer_parsePattern" -> {
                val data = call.argument<Map<String, Any>>("data")
                    ?: return result.error("INVALID_ARGS", "data required", null)
                val patternData = parsePatternData(data)
                    ?: return result.error("INVALID_ARGS", "invalid pattern data", null)
                val composerId = call.argument<Int>("composerId")
                val resolvedComposerId = composerId ?: nextPatternComposerId++
                val composer = patternComposers[resolvedComposerId] ?: p.getPatternComposer().also {
                    patternComposers[resolvedComposerId] = it
                }
                composer.parsePattern(patternData)
                result.success(resolvedComposerId)
            }

            "PatternComposer_playPattern" -> {
                val data = call.argument<Map<String, Any>>("data")
                    ?: return result.error("INVALID_ARGS", "data required", null)
                val patternData = parsePatternData(data)
                    ?: return result.error("INVALID_ARGS", "invalid pattern data", null)
                val composerId = call.argument<Int>("composerId")
                val resolvedComposerId = composerId ?: nextPatternComposerId++
                val composer = patternComposers[resolvedComposerId] ?: p.getPatternComposer().also {
                    patternComposers[resolvedComposerId] = it
                }
                composer.parsePattern(patternData)
                composer.play()
                result.success(resolvedComposerId)
            }

            "PatternComposer_play" -> {
                val composerId = call.argument<Int>("composerId")
                    ?: return result.error("INVALID_ARGS", "composerId required", null)
                patternComposers[composerId]?.play()
                result.success(null)
            }

            "PatternComposer_playAudioOnly" -> {
                val composerId = call.argument<Int>("composerId")
                    ?: return result.error("INVALID_ARGS", "composerId required", null)
                patternComposers[composerId]?.playAudioOnly()
                result.success(null)
            }

            "PatternComposer_stop" -> {
                val composerId = call.argument<Int>("composerId")
                    ?: return result.error("INVALID_ARGS", "composerId required", null)
                patternComposers[composerId]?.stop()
                result.success(null)
            }

            "PatternComposer_release" -> {
                val composerId = call.argument<Int>("composerId")
                    ?: return result.error("INVALID_ARGS", "composerId required", null)
                patternComposers.remove(composerId)?.stop()
                result.success(null)
            }

            else -> result.notImplemented()
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun parsePatternData(data: Map<String, Any>): PatternData? {
        val continuous = data["continuousPattern"] as? Map<String, Any> ?: return null
        val amplitudeRaw = continuous["amplitude"] as? List<Map<String, Any>> ?: return null
        val frequencyRaw = continuous["frequency"] as? List<Map<String, Any>> ?: return null
        val discreteRaw = data["discretePattern"] as? List<Map<String, Any>> ?: return null

        val amplitude = amplitudeRaw.mapNotNull { pt ->
            val time = (pt["time"] as? Number)?.toLong() ?: return@mapNotNull null
            val value = (pt["value"] as? Number)?.toFloat() ?: return@mapNotNull null
            ValuePoint(time, value)
        }
        val frequency = frequencyRaw.mapNotNull { pt ->
            val time = (pt["time"] as? Number)?.toLong() ?: return@mapNotNull null
            val value = (pt["value"] as? Number)?.toFloat() ?: return@mapNotNull null
            ValuePoint(time, value)
        }
        val discrete = discreteRaw.mapNotNull { pt ->
            val time = (pt["time"] as? Number)?.toLong() ?: return@mapNotNull null
            val amp = (pt["amplitude"] as? Number)?.toFloat() ?: return@mapNotNull null
            val freq = (pt["frequency"] as? Number)?.toFloat() ?: return@mapNotNull null
            ConfigPoint(time, amp, freq)
        }

        return PatternData(
            continuousPattern = ContinuousPattern(amplitude, frequency),
            discretePattern = discrete
        )
    }
}
