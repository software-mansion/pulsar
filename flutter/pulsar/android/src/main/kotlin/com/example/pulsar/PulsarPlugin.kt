package com.example.pulsar

import android.app.Activity
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.embedding.engine.plugins.activity.ActivityAware
import io.flutter.embedding.engine.plugins.activity.ActivityPluginBinding
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result
import com.swmansion.pulsar.Pulsar
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
    private var patternComposer: PatternComposer? = null

    // ---------------------------------------------------------------------------
    // FlutterPlugin
    // ---------------------------------------------------------------------------

    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel = MethodChannel(binding.binaryMessenger, "pulsar")
        channel.setMethodCallHandler(this)
    }

    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
    }

    // ---------------------------------------------------------------------------
    // ActivityAware
    // ---------------------------------------------------------------------------

    override fun onAttachedToActivity(binding: ActivityPluginBinding) {
        activity = binding.activity
        pulsar = Pulsar(binding.activity)
    }

    override fun onDetachedFromActivityForConfigChanges() {
        activity = null
        pulsar = null
    }

    override fun onReattachedToActivityForConfigChanges(binding: ActivityPluginBinding) {
        activity = binding.activity
        pulsar = Pulsar(binding.activity)
    }

    override fun onDetachedFromActivity() {
        activity = null
        pulsar = null
    }

    // ---------------------------------------------------------------------------
    // MethodCallHandler
    // ---------------------------------------------------------------------------

    override fun onMethodCall(call: MethodCall, result: Result) {
        val p = pulsar
        if (p == null) {
            result.error("NOT_INITIALIZED", "Pulsar is not initialized (no Activity)", null)
            return
        }

        when (call.method) {

            // ── Pulsar ─────────────────────────────────────────────────────────

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

            "Pulsar_clearCache" -> {
                p.clearCache()
                result.success(null)
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
                // No-op on Android.
                result.success(null)
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

            // ── RealtimeComposer ───────────────────────────────────────────────

            "RealtimeComposer_set" -> {
                val amplitude = call.argument<Double>("amplitude")?.toFloat()
                    ?: return result.error("INVALID_ARGS", "amplitude required", null)
                val frequency = call.argument<Double>("frequency")?.toFloat()
                    ?: return result.error("INVALID_ARGS", "frequency required", null)
                p.getRealtimeComposer().set(amplitude, frequency)
                result.success(null)
            }

            "RealtimeComposer_stop" -> {
                p.getRealtimeComposer().stop()
                result.success(null)
            }

            "RealtimeComposer_isActive" -> {
                result.success(p.getRealtimeComposer().isActive())
            }

            "RealtimeComposer_playDiscrete" -> {
                val amplitude = call.argument<Double>("amplitude")?.toFloat()
                    ?: return result.error("INVALID_ARGS", "amplitude required", null)
                val frequency = call.argument<Double>("frequency")?.toFloat()
                    ?: return result.error("INVALID_ARGS", "frequency required", null)
                p.getRealtimeComposer().playDiscrete(amplitude, frequency)
                result.success(null)
            }

            // ── PatternComposer ────────────────────────────────────────────────

            "PatternComposer_parsePattern" -> {
                val data = call.argument<Map<String, Any>>("data")
                    ?: return result.error("INVALID_ARGS", "data required", null)
                val patternData = parsePatternData(data)
                    ?: return result.error("INVALID_ARGS", "invalid pattern data", null)
                val composer = p.getPatternComposer()
                composer.parsePattern(patternData)
                patternComposer = composer
                result.success(null)
            }

            "PatternComposer_play" -> {
                patternComposer?.play()
                result.success(null)
            }

            "PatternComposer_stop" -> {
                patternComposer?.stop()
                result.success(null)
            }

            else -> result.notImplemented()
        }
    }

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

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
