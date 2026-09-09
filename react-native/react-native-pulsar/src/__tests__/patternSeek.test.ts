import { patternDurationMs, patternFrom } from '../patternSeek';
import type { Pattern } from '../types';

const ramp: Pattern = {
  discretePattern: [
    { time: 0, amplitude: 1, frequency: 0.5 },
    { time: 400, amplitude: 0.8, frequency: 0.4 },
    { time: 1000, amplitude: 0.6, frequency: 0.3 },
  ],
  continuousPattern: {
    amplitude: [
      { time: 0, value: 0 },
      { time: 1000, value: 1 },
    ],
    frequency: [
      { time: 0, value: 0.2 },
      { time: 500, value: 0.8 },
    ],
  },
};

describe('patternDurationMs', () => {
  it('takes the last authored timestamp across both lines', () => {
    expect(patternDurationMs(ramp)).toBe(1000);
  });

  it('is zero for an empty pattern', () => {
    expect(
      patternDurationMs({
        discretePattern: [],
        continuousPattern: { amplitude: [], frequency: [] },
      })
    ).toBe(0);
  });
});

describe('patternFrom', () => {
  it('returns the pattern untouched at or before zero', () => {
    expect(patternFrom(ramp, 0)).toBe(ramp);
    expect(patternFrom(ramp, -100)).toBe(ramp);
  });

  it('drops the discrete events before the seek and rebases the rest', () => {
    expect(patternFrom(ramp, 400).discretePattern).toEqual([
      { time: 0, amplitude: 0.8, frequency: 0.4 },
      { time: 600, amplitude: 0.6, frequency: 0.3 },
    ]);
  });

  it('re-anchors an envelope onto its interpolated value at the seek', () => {
    expect(patternFrom(ramp, 250).continuousPattern.amplitude).toEqual([
      { time: 0, value: 0.25 },
      { time: 750, value: 1 },
    ]);
  });

  it('holds the last value when every point sits before the seek', () => {
    // Emptying it instead would silence BOTH channels, since the composer only builds
    // the continuous line when amplitude and frequency are each non-empty.
    expect(patternFrom(ramp, 800).continuousPattern.frequency).toEqual([
      { time: 0, value: 0.8 },
      { time: 200, value: 0.8 },
    ]);
    expect(patternFrom(ramp, 800).continuousPattern.amplitude).not.toEqual([]);
  });

  it('collapses a held envelope to a single point once nothing remains', () => {
    expect(patternFrom(ramp, 1000).continuousPattern.frequency).toEqual([
      { time: 0, value: 0.8 },
    ]);
  });

  it('leaves an empty envelope empty', () => {
    const noFrequency: Pattern = {
      ...ramp,
      continuousPattern: { ...ramp.continuousPattern, frequency: [] },
    };
    expect(patternFrom(noFrequency, 250).continuousPattern.frequency).toEqual(
      []
    );
  });

  describe('sound', () => {
    const withSound = (sound: NonNullable<Pattern['sound']>): Pattern => ({
      ...ramp,
      sound,
    });

    it('seeks into the file by the same amount', () => {
      expect(patternFrom(withSound({ uri: 'clip.wav' }), 300).sound).toEqual({
        uri: 'clip.wav',
        offset: 0,
        start: 300,
        duration: 0,
      });
    });

    it('eats into the lead-in before it touches the file', () => {
      // 200ms into a 500ms lead-in: the audio has not begun, so only the wait shortens.
      expect(
        patternFrom(withSound({ uri: 'clip.wav', offset: 500 }), 200).sound
      ).toEqual({ uri: 'clip.wav', offset: 300, start: 0, duration: 0 });

      // Past the lead-in, the remainder is a seek into the file.
      expect(
        patternFrom(withSound({ uri: 'clip.wav', offset: 500 }), 800).sound
      ).toEqual({ uri: 'clip.wav', offset: 0, start: 300, duration: 0 });
    });

    it('shrinks an authored trim window and adds to its start', () => {
      expect(
        patternFrom(
          withSound({ uri: 'clip.wav', start: 1000, duration: 900 }),
          400
        ).sound
      ).toEqual({ uri: 'clip.wav', offset: 0, start: 1400, duration: 500 });
    });
  });
});
