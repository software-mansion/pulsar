package com.swmansion.pulsar.haptics

import android.util.Log
import java.lang.reflect.Constructor
import java.lang.reflect.Method

/** Plays RichTap HE patterns through the engine some OEMs (e.g. OnePlus) ship inside the OS. */
class RichTapPlayer private constructor(
    private val createEffect: Method,
    private val newPlayer: Constructor<*>,
    private val startPlayer: Method,
    private val stopPlayer: Method,
) {
    private var current: Any? = null

    fun play(heJson: String) {
        stop()
        try {
            val effect = createEffect.invoke(null, heJson)
            current = newPlayer.newInstance(effect).also { startPlayer.invoke(it, 1) }
        } catch (error: Exception) {
            Log.w(TAG, "RichTap playback failed", error)
            current = null
        }
    }

    fun stop() {
        val player = current ?: return
        current = null
        try {
            stopPlayer.invoke(player)
        } catch (error: Exception) {
            Log.w(TAG, "RichTap stop failed", error)
        }
    }

    companion object {
        private const val TAG = "Pulsar"

        fun createIfAvailable(): RichTapPlayer? = try {
            val dynamicEffect = Class.forName("android.os.DynamicEffect")
            val hapticPlayer = Class.forName("android.os.HapticPlayer")
            val isAvailable = hapticPlayer.getMethod("isAvailable").invoke(null) as Boolean
            if (!isAvailable) null else RichTapPlayer(
                createEffect = dynamicEffect.getMethod("create", String::class.java),
                newPlayer = hapticPlayer.getConstructor(dynamicEffect),
                startPlayer = hapticPlayer.getMethod("start", Int::class.javaPrimitiveType),
                stopPlayer = hapticPlayer.getMethod("stop"),
            )
        } catch (_: Throwable) {
            null
        }
    }
}
