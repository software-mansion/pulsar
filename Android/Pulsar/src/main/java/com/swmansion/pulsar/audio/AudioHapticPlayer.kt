package com.swmansion.pulsar.audio

import android.content.res.AssetFileDescriptor
import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.SoundPool
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.swmansion.pulsar.types.SoundData

class AudioHapticPlayer(
    private val context: Context,
    private val sound: SoundData,
    private val hapticChannelsMuted: Boolean,
) {
    companion object {
        private const val TAG = "Pulsar"
        private const val LOAD_SUCCESS = 0
    }

    private val windowed = sound.startMs > 0L || sound.durationMs > 0L

    private var soundPool: SoundPool? = null
    private var soundId: Int = 0
    private var streamId: Int = 0
    private var mediaPlayer: MediaPlayer? = null
    private var openedFd: AssetFileDescriptor? = null
    private var isLoaded = false
    private var playPending = false
    private val mainHandler = Handler(Looper.getMainLooper())

    private fun audioAttributes(): AudioAttributes {
        val builder = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            builder.setHapticChannelsMuted(hapticChannelsMuted)
        }
        return builder.build()
    }

    fun load() {
        if (windowed) loadMediaPlayer() else loadSoundPool()
    }

    fun play() {
        if (isLoaded) scheduleStream() else playPending = true
    }

    fun stop() {
        playPending = false
        mainHandler.removeCallbacksAndMessages(null)
        if (windowed) {
            mediaPlayer?.let { if (it.isPlaying) it.pause() }
        } else if (streamId != 0) {
            soundPool?.stop(streamId)
            streamId = 0
        }
    }

    fun release() {
        stop()
        soundPool?.release()
        soundPool = null
        mediaPlayer?.release()
        mediaPlayer = null
        openedFd?.close()
        openedFd = null
        isLoaded = false
    }

    private fun scheduleStream() {
        if (sound.offset > 0) {
            mainHandler.postDelayed({ startStream() }, sound.offset)
        } else {
            startStream()
        }
    }

    private fun startStream() {
        if (windowed) startMediaPlayer() else startSoundPool()
    }

    private fun loadSoundPool() {
        val pool = SoundPool.Builder()
            .setMaxStreams(4)
            .setAudioAttributes(audioAttributes())
            .build()

        pool.setOnLoadCompleteListener { _, sampleId, status ->
            if (status == LOAD_SUCCESS && sampleId == soundId) {
                isLoaded = true
                if (playPending) {
                    playPending = false
                    scheduleStream()
                }
            } else {
                Log.w(TAG, "Failed to load sound (status=$status): ${sound.uri}")
            }
        }

        soundId = loadInto(pool)
        soundPool = pool
    }

    private fun startSoundPool() {
        val pool = soundPool ?: return
        streamId = pool.play(soundId, sound.volume, sound.volume, 1, 0, 1f)
    }

    private fun loadInto(pool: SoundPool): Int {
        val uri = sound.uri
        val isPath = uri.startsWith("/") || uri.startsWith("file://")

        if (!isPath) {
            val name = uri.substringAfterLast('/').substringBeforeLast('.')
            val resId = context.resources.getIdentifier(name, "raw", context.packageName)
            if (resId != 0) {
                return pool.load(context, resId, 1)
            }
        }

        val path = if (uri.startsWith("file://")) uri.removePrefix("file://") else uri
        return pool.load(path, 1)
    }

    private fun loadMediaPlayer() {
        val mp = MediaPlayer()
        try {
            mp.setAudioAttributes(audioAttributes())
            setMediaPlayerSource(mp)
            mp.setVolume(sound.volume, sound.volume)
            mp.setOnPreparedListener {
                isLoaded = true
                if (playPending) {
                    playPending = false
                    scheduleStream()
                }
            }
            mp.setOnErrorListener { _, what, extra ->
                Log.w(TAG, "MediaPlayer error ($what, $extra): ${sound.uri}")
                true
            }
            mp.prepareAsync()
        } catch (e: Exception) {
            Log.w(TAG, "Failed to load windowed sound: ${sound.uri}", e)
        }
        mediaPlayer = mp
    }

    private fun setMediaPlayerSource(mp: MediaPlayer) {
        val uri = sound.uri
        val isPath = uri.startsWith("/") || uri.startsWith("file://")

        if (!isPath) {
            val name = uri.substringAfterLast('/').substringBeforeLast('.')
            val resId = context.resources.getIdentifier(name, "raw", context.packageName)
            if (resId != 0) {
                val afd = context.resources.openRawResourceFd(resId)
                openedFd = afd
                mp.setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                return
            }
        }

        val path = if (uri.startsWith("file://")) uri.removePrefix("file://") else uri
        mp.setDataSource(path)
    }

    private fun startMediaPlayer() {
        val mp = mediaPlayer ?: return
        if (sound.startMs > 0L) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                mp.seekTo(sound.startMs, MediaPlayer.SEEK_CLOSEST)
            } else {
                mp.seekTo(sound.startMs.toInt())
            }
        }
        mp.start()
        if (sound.durationMs > 0L) {
            mainHandler.postDelayed(
                { mediaPlayer?.let { if (it.isPlaying) it.pause() } },
                sound.durationMs,
            )
        }
    }
}
