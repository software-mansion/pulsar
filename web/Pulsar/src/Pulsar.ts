import { PatternComposer } from "./PatternComposer.ts";
import { Presets } from "./Presets.ts";
import { RealtimeComposer } from "./RealtimeComposer.ts";
import Settings from "./Settings.ts";

class Pulsar {
  private readonly presets = new Presets();
  private readonly realtimeComposer = new RealtimeComposer();

  /**
   * Returns the shared presets wrapper instance exposed by this Pulsar object.
   */
  public getPresets() {
    return this.presets;
  }

  /**
   * Returns a fresh pattern composer instance for independent one-shot patterns.
   */
  public getPatternComposer() {
    return new PatternComposer();
  }

  /**
   * Returns the shared realtime composer instance used for gesture-driven haptics.
   */
  public getRealtimeComposer() {
    return this.realtimeComposer;
  }

  /**
   * Returns whether the current environment exposes Web Vibration support.
   */
  public isHapticsSupported() {
    return Settings.isHapticsAvailable();
  }

  /**
   * Enables or disables haptics globally for this web runtime.
   */
  public enableHaptics(state: boolean) {
    Settings.enableHaptics(state);
  }

  /**
   * Enables or disables sound globally.
   * Sound playback is not implemented yet, but the setting is exposed now.
   */
  public enableSound(state: boolean) {
    Settings.enableSound(state);
  }

  /**
   * Stops all currently playing haptics.
   */
  public stopHaptics() {
    return Settings.stopHaptics();
  }
}

export default Pulsar;
export { Pulsar };
