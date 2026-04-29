package com.swmansion.pulsar

import kotlinx.cinterop.ExperimentalForeignApi
import platform.CoreHaptics.CHHapticAdvancedPatternPlayerProtocol
import platform.CoreHaptics.CHHapticEngine
import platform.CoreHaptics.CHHapticEvent
import platform.CoreHaptics.CHHapticEventParameter
import platform.CoreHaptics.CHHapticEventParameterIDHapticIntensity
import platform.CoreHaptics.CHHapticEventParameterIDHapticSharpness
import platform.CoreHaptics.CHHapticEventTypeHapticContinuous
import platform.CoreHaptics.CHHapticPattern
import platform.CoreHaptics.CHHapticPatternPlayerProtocol
import platform.Foundation.NSLog
import platform.Foundation.NSNotification
import platform.Foundation.NSNotificationCenter
import platform.UIKit.UIApplication
import platform.UIKit.UIApplicationDidBecomeActiveNotification
import platform.UIKit.UIApplicationDidEnterBackgroundNotification
import platform.UIKit.UIApplicationWillEnterForegroundNotification
import platform.UIKit.UIApplicationWillResignActiveNotification
import platform.darwin.NSObject
import platform.objc.sel_registerName

@OptIn(ExperimentalForeignApi::class)
internal class IOSHapticEngineWrapper {
    private var engine: CHHapticEngine? = null
    private var initialized = false
    var isHapticsEnabled: Boolean = true
        private set
    private var isAppActive = true
    private val playerRegistry = mutableMapOf<Int, CHHapticPatternPlayerProtocol>()
    private val playerCreationOrder = mutableListOf<Int>()
    private var nextPlayerId = 0
    private var cachedRealtimePlayer: CHHapticAdvancedPatternPlayerProtocol? = null
    private val lifecycleObserver = IOSAppLifecycleObserver(this)

    init {
        if (!isHapticsSupported()) {
            log("Device does not support haptics")
        } else {
            startEngine()
            registerAppLifecycleObservers()
        }
    }

    fun enableHaptics(state: Boolean) {
        if (isHapticsEnabled == state) return
        isHapticsEnabled = state
        if (!state) {
            stopHaptics()
        } else if (canPlayHaptics() && !initialized) {
            startEngine()
        }
    }

    fun stopHaptics() {
        clearPlayerState(stopPlayers = true)
        runCatching { engine?.stopWithCompletionHandler(null) }
        initialized = false
    }

    fun shutDownEngine() {
        stopHaptics()
        engine = null
    }

    fun createPlayer(pattern: CHHapticPattern?): Int? {
        if (!canPlayHaptics()) return null
        startEngine()
        val player = buildPatternPlayer(pattern) ?: return null
        return registerPlayer(player)
    }

    fun getRealtimePlayer(): CHHapticAdvancedPatternPlayerProtocol? {
        if (!canPlayHaptics()) return null
        startEngine()
        cachedRealtimePlayer?.let { return it }
        return makeRealtimePlayer().also { cachedRealtimePlayer = it }
    }

    fun playPlayer(id: Int, pattern: CHHapticPattern? = null) {
        if (!canPlayHaptics()) return
        playerRegistry[id]?.let {
            startPlayer(it, "Error starting player")
            return
        }
        pattern ?: return
        startEngine()
        val player = buildPatternPlayer(pattern) ?: return
        registerRecreatedPlayer(player, id)
        startPlayer(player, "Error starting recreated player")
    }

    fun stopPlayer(id: Int) {
        playerRegistry[id]?.let { stopPlayer(it, "Error stopping player") }
    }

    fun removePlayer(id: Int) {
        runCatching { playerRegistry[id]?.stopAtTime(0.0, null) }
        playerRegistry.remove(id)
        playerCreationOrder.removeAll { it == id }
    }

    fun updatePlaybackAvailability(isActive: Boolean) {
        isAppActive = isActive
    }

    fun canPlayHaptics(): Boolean = isHapticsEnabled && isAppActive && isHapticsSupported()

    fun isHapticsSupported(): Boolean = CHHapticEngine.capabilitiesForHardware().supportsHaptics()

    private fun registerAppLifecycleObservers() {
        val center = NSNotificationCenter.defaultCenter
        center.addObserver(
            lifecycleObserver,
            selector = sel_registerName("appDidEnterBackground:"),
            name = UIApplicationDidEnterBackgroundNotification,
            `object` = null,
        )
        center.addObserver(
            lifecycleObserver,
            selector = sel_registerName("appWillEnterForeground:"),
            name = UIApplicationWillEnterForegroundNotification,
            `object` = null,
        )
        center.addObserver(
            lifecycleObserver,
            selector = sel_registerName("appDidBecomeActive:"),
            name = UIApplicationDidBecomeActiveNotification,
            `object` = null,
        )
        center.addObserver(
            lifecycleObserver,
            selector = sel_registerName("appWillResignActive:"),
            name = UIApplicationWillResignActiveNotification,
            `object` = null,
        )
    }

    fun appDidEnterBackground() {
        updatePlaybackAvailability(false)
        suspendHaptics()
    }

    fun appWillEnterForeground() {
        updatePlaybackAvailability(UIApplication.sharedApplication.applicationState.name == "UIApplicationStateActive")
    }

    fun appDidBecomeActive() {
        updatePlaybackAvailability(true)
        engine = null
        startEngine()
    }

    fun appWillResignActive() {
        updatePlaybackAvailability(false)
        suspendHaptics()
    }

    private fun suspendHaptics() {
        stopHaptics()
    }

    private fun startEngine() {
        if (initialized || !canPlayHaptics()) return
        runCatching {
            createEngineIfNeeded()
            engine?.startAndReturnError(null)
            initialized = true
        }.onFailure {
            initialized = false
            engine = null
            log("Error starting engine: ${it.message}")
        }
    }

    private fun createEngineIfNeeded() {
        if (engine != null) return
        engine = CHHapticEngine(andReturnError = null)
    }

    private fun buildPatternPlayer(pattern: CHHapticPattern?): CHHapticPatternPlayerProtocol? {
        val player = engine?.createPlayerWithPattern(
            pattern ?: CHHapticPattern(events = emptyList<Any>(), parameters = emptyList<Any>(), error = null),
            error = null,
        )
        if (player == null) log("Error making haptic player")
        return player
    }

    private fun makeRealtimePlayer(): CHHapticAdvancedPatternPlayerProtocol? {
        val event = CHHapticEvent(
            eventType = CHHapticEventTypeHapticContinuous,
            parameters = listOf(
                CHHapticEventParameter(CHHapticEventParameterIDHapticIntensity, 1.0f),
                CHHapticEventParameter(CHHapticEventParameterIDHapticSharpness, 0.0f),
            ),
            relativeTime = 0.0,
            duration = 100.0,
        )
        val pattern = CHHapticPattern(events = listOf(event), parameters = emptyList<Any>(), error = null)
        val player = engine?.createAdvancedPlayerWithPattern(pattern, error = null)
        if (player == null) log("Error creating realtime player")
        return player
    }

    private fun clearPlayerState(stopPlayers: Boolean) {
        if (stopPlayers) {
            playerRegistry.values.forEach { runCatching { it.stopAtTime(0.0, null) } }
            runCatching { cachedRealtimePlayer?.stopAtTime(0.0, null) }
        }
        playerRegistry.clear()
        playerCreationOrder.clear()
        cachedRealtimePlayer = null
    }

    private fun registerPlayer(player: CHHapticPatternPlayerProtocol): Int {
        evictOldestPlayerIfNeeded()
        val id = nextPlayerId++
        playerRegistry[id] = player
        playerCreationOrder += id
        return id
    }

    private fun registerRecreatedPlayer(player: CHHapticPatternPlayerProtocol, id: Int) {
        evictOldestPlayerIfNeeded()
        playerRegistry[id] = player
        playerCreationOrder += id
    }

    private fun evictOldestPlayerIfNeeded() {
        if (playerRegistry.size < 20) return
        val oldestId = playerCreationOrder.removeAt(0)
        runCatching { playerRegistry[oldestId]?.stopAtTime(0.0, null) }
        playerRegistry.remove(oldestId)
    }

    private fun startPlayer(player: CHHapticPatternPlayerProtocol, errorPrefix: String) {
        runCatching { player.startAtTime(0.0, null) }
            .onFailure { log("$errorPrefix: ${it.message}") }
    }

    private fun stopPlayer(player: CHHapticPatternPlayerProtocol, errorPrefix: String) {
        runCatching { player.stopAtTime(0.0, null) }
            .onFailure { log("$errorPrefix: ${it.message}") }
    }
}

internal class IOSAppLifecycleObserver(
    private val engine: IOSHapticEngineWrapper,
) : NSObject() {
    @Suppress("UNUSED_PARAMETER")
    fun appDidEnterBackground(notification: NSNotification) {
        engine.appDidEnterBackground()
    }

    @Suppress("UNUSED_PARAMETER")
    fun appWillEnterForeground(notification: NSNotification) {
        engine.appWillEnterForeground()
    }

    @Suppress("UNUSED_PARAMETER")
    fun appDidBecomeActive(notification: NSNotification) {
        engine.appDidBecomeActive()
    }

    @Suppress("UNUSED_PARAMETER")
    fun appWillResignActive(notification: NSNotification) {
        engine.appWillResignActive()
    }
}

internal fun log(message: String) {
    NSLog("Pulsar: $message")
}
