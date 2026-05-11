import { getHapticTimingCapabilities } from "./Engine.ts";
import Settings from "./Settings.ts";

/**
 * Drives realtime gesture-based haptics by continuously replaying
 * a short PWM-like vibration pattern until it is stopped.
 */
class RealtimeComposer {
  private readonly timingCapabilities = getHapticTimingCapabilities();
  private intensity = 0.5;
  private frequency = 0.5;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private playing = false;
  private unregisterStopHandler: (() => void) | null = null;

  /**
   * Starts realtime playback if needed and updates the currently playing
   * PWM pattern to the latest intensity and frequency values.
   */
  public set(intensity: number, frequency: number) {
    this.intensity = this.clamp01(intensity);
    this.frequency = this.clamp01(frequency);
    this.playing = Settings.isHapticsEnabled();

    if (!this.playing) {
      this.clearScheduledLoop();
      return false;
    }

    this.ensureStopHandler();
    return this.restartLoop();
  }

  /**
   * Stops the current realtime PWM loop and cancels the active vibration.
   */
  public stop() {
    return this.stopInternal(true);
  }

  public isPlaying() {
    return this.playing;
  }

  public getCurrentValues() {
    return {
      intensity: this.intensity,
      frequency: this.frequency,
    };
  }

  private restartLoop() {
    this.clearScheduledLoop();
    return this.tick();
  }

  private tick() {
    if (!this.playing) {
      return false;
    }

    if (!Settings.isHapticsEnabled() || !Settings.isHapticsAvailable()) {
      this.stopInternal(false);
      return false;
    }

    const shotLength = this.resolveShotLength(this.intensity);
    const pauseLength = this.resolvePauseLength(this.frequency);
    const cycleDuration = shotLength + pauseLength;
    const didStart = navigator.vibrate(shotLength);

    if (!didStart) {
      this.stopInternal(false);
      return false;
    }

    this.timeoutId = setTimeout(() => {
      this.tick();
    }, cycleDuration);

    return true;
  }

  private ensureStopHandler() {
    if (this.unregisterStopHandler !== null) {
      return;
    }

    this.unregisterStopHandler = Settings.registerStopHapticsHandler(() => {
      this.stopInternal(false);
    });
  }

  private releaseStopHandler() {
    if (this.unregisterStopHandler !== null) {
      this.unregisterStopHandler();
      this.unregisterStopHandler = null;
    }
  }

  private stopInternal(shouldCancelBrowserVibration: boolean) {
    this.playing = false;
    this.clearScheduledLoop();
    this.releaseStopHandler();

    if (!shouldCancelBrowserVibration) {
      return false;
    }

    if (!Settings.isHapticsAvailable()) {
      return false;
    }

    return navigator.vibrate(0);
  }

  private clearScheduledLoop() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private resolveShotLength(intensity: number) {
    const { minPulseMs, maxPulseMs } = this.timingCapabilities;
    return this.lerp(minPulseMs, maxPulseMs, intensity);
  }

  private resolvePauseLength(frequency: number) {
    const { minPauseMs, maxPauseMs } = this.timingCapabilities;
    return this.lerp(maxPauseMs, minPauseMs, frequency);
  }

  private clamp01(value: number) {
    return Math.min(1, Math.max(0, value));
  }

  private lerp(start: number, end: number, amount: number) {
    return start + (end - start) * amount;
  }
}

export { RealtimeComposer };
