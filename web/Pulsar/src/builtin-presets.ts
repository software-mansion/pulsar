import type {
  HapticContinuousSegment,
  HapticLineSegment,
  HapticPattern,
  HapticPulseSegment,
} from "./types.ts";

const c = (timestamp: number, duration: number): HapticContinuousSegment => ({
  type: "continuous",
  timestamp,
  duration,
});

const p = (
  timestamp: number,
  duration: number,
  intensity: number,
  frequency: number,
): HapticPulseSegment => ({
  type: "pulse",
  timestamp,
  duration,
  intensity,
  frequency,
});

const l = (
  timestamp: number,
  duration: number,
  intensity: Array<[number, number]>,
  frequency: Array<[number, number]>,
): HapticLineSegment => ({
  type: "line",
  timestamp,
  duration,
  intensity: intensity.map(([time, value]) => ({ time, value })),
  frequency: frequency.map(([time, value]) => ({ time, value })),
});

const taps = (start: number, count: number, gap: number, duration: number): HapticContinuousSegment[] => {
  const out: HapticContinuousSegment[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(c(start + i * gap, duration));
  }
  return out;
};

const BUILTIN_PRESETS = {
  tap: [c(0, 35)],
  softTap1: [c(0, 5)],
  doubleTap: [c(0, 30), c(90, 30)],
  tripleTap: taps(0, 3, 80, 28),
  sneeze: [c(0, 30), c(80, 35), c(160, 180)],
  pulseHeavySlow: [p(0, 1000, 1.0, 0.0)],
  pulseMidPlateau: [p(0, 800, 0.5, 0.5)],
  longPress: [c(0, 200)],
  birdInCage: [c(0, 25), c(80, 25), c(150, 25), c(400, 25), c(480, 25), c(560, 25)],
  lullaby: [p(0, 600, 0.3, 0.2), p(900, 600, 0.3, 0.2)],
  ringingPhone: [p(0, 400, 0.9, 0.95), p(700, 400, 0.9, 0.95)],
  emergency: [p(0, 250, 0.9, 1.0), p(380, 250, 0.9, 1.0), p(760, 250, 0.9, 1.0)],
  tickingOverHum: [p(0, 1800, 0.45, 0.18), c(400, 30), c(900, 30), c(1400, 30)],
  error: [c(0, 90), c(160, 90)],
  criticalAlert: [c(0, 180), c(240, 90), c(380, 90)],
  heartbeat: [c(0, 45), c(120, 70), c(420, 45), c(540, 70)],
  waltz: [c(0, 70), c(220, 30), c(420, 30), c(660, 70), c(880, 30), c(1080, 30)],
  tribalDrum: [c(0, 120), c(220, 40), c(310, 40), c(500, 120)],
  frogCroak: [p(0, 140, 0.4, 0.9), p(380, 140, 0.4, 0.9)],
  rollingThunder: [p(0, 900, 0.65, 0.3), p(700, 1100, 0.75, 0.35)],
  fireworksFinale: [c(0, 60), c(180, 80), c(380, 100), c(560, 60), c(700, 60), c(900, 220)],
  drumrollReveal: [p(0, 700, 0.15, 0.95), c(900, 200)],
  gameOver: [c(0, 120), c(220, 90), c(380, 70), c(500, 45)],
  comboFinisher: [c(0, 40), c(110, 40), c(220, 40), c(360, 180)],
  amusementPark: [c(0, 30), c(110, 30), c(220, 50), c(380, 70), c(560, 110)],
  respawn: [p(0, 500, 0.25, 0.5), c(540, 70)],
  anger: [c(0, 90), c(160, 50), c(240, 90), c(380, 50), c(480, 110)],
  clockTick: taps(0, 4, 500, 30),
  binaryBeep: [c(0, 35), c(110, 140), c(310, 35)],
  trainClickClack: [c(0, 35), c(110, 35), c(380, 35), c(490, 35), c(760, 35), c(870, 35)],
  carCrash: [c(0, 250), p(280, 600, 0.4, 0.7)],
  popcorn: [c(0, 25), c(280, 25), c(520, 25), c(680, 25), c(820, 25), c(920, 25), c(1010, 25), c(1080, 25), c(1140, 25)],
  kettleWhistle: [c(0, 200), c(220, 200), c(440, 200)],
  burp: [p(0, 250, 0.5, 0.4)],
  glassBreak: [c(0, 90), c(140, 25), c(190, 25), c(250, 25), c(330, 25), c(390, 25), c(470, 25)],
  coinDrop: [c(0, 30), c(180, 30), c(290, 25), c(370, 22)],
  intervalEnd: [c(0, 180), c(280, 35), c(380, 35)],
  hopscotch: [c(0, 50), c(280, 30), c(380, 30), c(620, 50), c(880, 30), c(980, 30)],
  fibonacciTaps: [c(0, 35), c(50, 35), c(130, 35), c(290, 35), c(530, 35), c(910, 35)],
  fibonacciTapsReverse: [c(0, 35), c(380, 35), c(620, 35), c(780, 35), c(860, 35), c(910, 35)],
  siren: [p(0, 400, 0.7, 0.4), p(420, 400, 0.2, 0.95), p(840, 400, 0.7, 0.4), p(1260, 400, 0.2, 0.95)],
  tremoloHeavy: [p(0, 250, 0.9, 0.6), p(260, 250, 0.1, 0.6), p(520, 250, 0.9, 0.6), p(780, 250, 0.1, 0.6), p(1040, 250, 0.9, 0.6)],
  phoneRingPickup: [p(0, 400, 0.85, 0.95), p(600, 400, 0.85, 0.95), c(1300, 70)],
  fractalCascade: [
    c(0, 25), c(60, 25), c(120, 25), c(180, 25),
    c(500, 25), c(560, 25), c(620, 25), c(680, 25),
    c(1200, 25), c(1260, 25), c(1320, 25), c(1380, 25),
    c(2200, 60), c(2400, 60), c(2600, 60), c(2800, 60),
  ],
  twoToneBuzzer: [
    p(0, 250, 0.1, 0.95),
    p(260, 250, 0.85, 0.25),
    p(520, 250, 0.1, 0.95),
    p(780, 250, 0.85, 0.25),
  ], 
} satisfies Record<string, HapticPattern>;

export { BUILTIN_PRESETS };
export type { HapticPattern };
