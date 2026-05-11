import { getHapticTimingCapabilities } from "./Engine.ts";
import Settings from "./Settings.ts";
import type { HapticPattern, ParsedPattern } from "./types.ts";

type Interval = {
  start: number;
  end: number;
};

class PatternComposer {
  private readonly timingCapabilities = getHapticTimingCapabilities();
  private pattern: ParsedPattern = [];

  public parse(pattern: HapticPattern) {
    const intervals = pattern
      .flatMap((entry) => this.toIntervals(entry))
      .sort((left, right) => left.start - right.start);

    const mergedIntervals = this.mergeIntervals(intervals);

    if (mergedIntervals.length === 0) {
      this.pattern = [];
      return this.pattern;
    }

    const parsedPattern: ParsedPattern = [];
    let cursor = 0;

    for (const interval of mergedIntervals) {
      if (interval.start > cursor) {
        if (parsedPattern.length === 0) {
          parsedPattern.push(0);
        }
        parsedPattern.push(interval.start - cursor);
      }

      parsedPattern.push(interval.end - interval.start);
      cursor = interval.end;
    }

    this.pattern = parsedPattern;
    return this.pattern;
  }

  public play() {
    if (!Settings.isHapticsEnabled() || !Settings.isHapticsAvailable()) {
      return false;
    }

    return navigator.vibrate(this.pattern);
  }

  public stop() {
    this.pattern = [];
    return Settings.stopHaptics();
  }

  public getPattern() {
    return [...this.pattern];
  }

  private toIntervals(entry: HapticPattern[number]): Interval[] {
    const start = Math.max(0, entry.timestamp);
    const duration = Math.max(0, entry.duration);

    if (duration === 0) {
      return [];
    }

    if (entry.type === "continuous") {
      return [{ start, end: start + duration }];
    }

    const intensity = this.clamp01(entry.intensity ?? 0.5);
    const frequency = this.clamp01(entry.frequency ?? 0.5);
    const shotLength = this.resolveShotLength(duration, intensity);
    const pauseLength = this.resolvePauseLength(duration, frequency);

    const intervals: Interval[] = [];
    let cursor = start;
    const end = start + duration;

    while (cursor < end) {
      const shotEnd = Math.min(cursor + shotLength, end);
      intervals.push({ start: cursor, end: shotEnd });
      cursor = shotEnd + pauseLength;
    }

    return intervals;
  }

  private mergeIntervals(intervals: Interval[]) {
    if (intervals.length === 0) {
      return [];
    }

    const firstInterval = intervals[0];
    if (firstInterval === undefined) {
      return [];
    }

    const merged: Interval[] = [{ start: firstInterval.start, end: firstInterval.end }];

    for (const interval of intervals.slice(1)) {
      const previous = merged[merged.length - 1];
      if (previous === undefined) {
        merged.push({ start: interval.start, end: interval.end });
        continue;
      }

      if (interval.start <= previous.end) {
        previous.end = Math.max(previous.end, interval.end);
        continue;
      }

      merged.push({ ...interval });
    }

    return merged;
  }

  private resolveShotLength(duration: number, intensity: number) {
    const { minPulseMs, maxPulseMs } = this.timingCapabilities;
    const maxShot = Math.max(minPulseMs, Math.min(duration, maxPulseMs));
    return this.lerp(minPulseMs, maxShot, intensity);
  }

  private resolvePauseLength(duration: number, frequency: number) {
    const { minPauseMs, maxPauseMs } = this.timingCapabilities;
    const maxPause = Math.max(minPauseMs, Math.min(duration, maxPauseMs));
    return this.lerp(maxPause, minPauseMs, frequency);
  }

  private clamp01(value: number) {
    return Math.min(1, Math.max(0, value));
  }

  private lerp(start: number, end: number, amount: number) {
    return start + (end - start) * amount;
  }
}

export { PatternComposer };
