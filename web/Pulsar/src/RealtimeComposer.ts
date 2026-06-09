import { getHapticTimingCapabilities } from "./Engine.ts";
import Settings from "./Settings.ts";

/**
 * Drives realtime gesture-based haptics by continuously replaying
 * a short PWM-like vibration pattern until it is stopped.
 */
/**
 * Minimum shot length (ms) below which most haptic actuators (especially ERM
 * motors on cheaper Android devices) cannot reach full amplitude. Shots shorter
 * than this fall into a perception "dead zone" — they feel weaker than intuition
 * suggests, creating a non-monotonic intensity curve. Linear scaling from below
 * this threshold produces the classic "0.0 feels stronger than 0.2" complaint.
 */
const ENGAGEMENT_THRESHOLD_MS = 60;

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
   *
   * Safe to call at high frequency (e.g. on every `pointermove`): the running
   * tick loop reads `this.intensity` and `this.frequency` fresh on each cycle,
   * so the latest values are picked up at the next shot/pause boundary without
   * restarting (and therefore starving) the PWM cycle.
   */
  public set(intensity: number, frequency: number) {
    this.intensity = this.clamp01(intensity);
    this.frequency = this.clamp01(frequency);

    if (!Settings.isHapticsEnabled() || !Settings.isHapticsAvailable()) {
      this.stopInternal(true);
      return false;
    }

    if (this.playing) {
      // Loop is already running; latest values will be applied on the next tick.
      return true;
    }

    this.playing = true;
    this.ensureStopHandler();
    return this.tick();
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

    // intensity === 0 → silence. Skip vibrate() (a call of 0 would cancel any
    // in-progress shot from a previous tick) and just wait out the pause.
    if (shotLength > 0) {
      const didStart = navigator.vibrate(shotLength);

      if (!didStart) {
        this.stopInternal(false);
        return false;
      }
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
    // intensity 0 is treated as silence.
    if (intensity <= 0) {
      return 0;
    }

    // Above 0 we clamp the minimum shot above the actuator's engagement
    // threshold so low intensities still produce a fully-engaged (just shorter)
    // pulse instead of a partial-amplitude "weak buzz" that perceptually
    // undershoots the click at intensity 0.
    const { maxPulseMs } = this.timingCapabilities;
    const min = Math.min(ENGAGEMENT_THRESHOLD_MS, maxPulseMs);
    return this.lerp(min, maxPulseMs, intensity);
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
