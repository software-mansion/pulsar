// Pattern segment builders.
const c = (timestamp, duration) => ({ type: "continuous", timestamp, duration });

const p = (timestamp, duration, intensity, frequency) => ({
  type: "pulse", timestamp, duration, intensity, frequency,
});

// Line segment: intensity / frequency are arrays of [time, value] pairs
// that get expanded into { time, value } control points.
const l = (timestamp, duration, intensity, frequency) => ({
  type: "line",
  timestamp,
  duration,
  intensity: intensity.map(([time, value]) => ({ time, value })),
  frequency: frequency.map(([time, value]) => ({ time, value })),
});

// Build a sequence of N continuous taps with given gap and duration.
function taps(start, count, gap, duration) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(c(start + i * gap, duration));
  return out;
}

export const PRESETS = [
  // --- Tactile UI ---
  { name: "tap",            category: "UI",          description: "A single quick tap — minimal click feedback.",
    pattern: [c(0, 30)] },
  { name: "softTap",        category: "UI",          description: "Gentler tap for low-emphasis confirmations.",
    pattern: [c(0, 20)] },
  { name: "firmTap",        category: "UI",          description: "Heavier tap suggesting a deliberate press.",
    pattern: [c(0, 65)] },
  { name: "doubleTap",      category: "UI",          description: "Two crisp taps in quick succession.",
    pattern: [c(0, 30), c(90, 30)] },
  { name: "tripleTap",      category: "UI",          description: "Three even taps — strong attention pull.",
    pattern: taps(0, 3, 80, 28) },
  { name: "longPress",      category: "UI",          description: "Long sustained vibration for press-and-hold actions.",
    pattern: [c(0, 200)] },
  { name: "toggleOn",       category: "UI",          description: "Short tick followed by a slightly stronger thunk.",
    pattern: [c(0, 25), c(70, 55)] },
  { name: "toggleOff",      category: "UI",          description: "Mirror of toggleOn — fades from strong to short.",
    pattern: [c(0, 55), c(80, 25)] },
  { name: "swipeRefresh",   category: "UI",          description: "Subtle ramp suggesting content snapping into place.",
    pattern: [p(0, 220, 0.2, 0.6), c(260, 50)] },

  // --- Notifications / system ---
  { name: "success",        category: "Notification", description: "Ascending three-tap success motif.",
    pattern: [c(0, 40), c(90, 55), c(180, 90)] },
  { name: "error",          category: "Notification", description: "Two heavy buzzes spelling something went wrong.",
    pattern: [c(0, 90), c(160, 90)] },
  { name: "warning",        category: "Notification", description: "A textured warning pulse capped by a firm tap.",
    pattern: [p(0, 240, 0.35, 0.9), c(320, 120)] },
  { name: "notification",   category: "Notification", description: "Subtle two-step ping for incoming notifications.",
    pattern: [c(0, 35), c(110, 60)] },
  { name: "messageReceived",category: "Notification", description: "Quick double-tap echo like a chat bubble.",
    pattern: [c(0, 28), c(70, 28), c(180, 48)] },
  { name: "ringingPhone",   category: "Notification", description: "Two long buzzes with a pause, like a classic ring.",
    pattern: [p(0, 400, 0.9, 0.95), p(700, 400, 0.9, 0.95)] },
  { name: "morseSOS",       category: "Notification", description: "···−−−··· — three short, three long, three short.",
    pattern: [
      c(0, 60), c(120, 60), c(240, 60),
      c(420, 180), c(660, 180), c(900, 180),
      c(1140, 60), c(1260, 60), c(1380, 60),
    ] },
  { name: "alarmClock",     category: "Notification", description: "Repeating buzz volleys reminiscent of an alarm.",
    pattern: [p(0, 300, 0.9, 0.95), p(450, 300, 0.9, 0.95), p(900, 300, 0.9, 0.95)] },
  { name: "criticalAlert",  category: "Notification", description: "Long sharp blast followed by a tighter follow-up.",
    pattern: [c(0, 180), c(240, 90), c(380, 90)] },

  // --- Rhythm / musical ---
  { name: "heartbeat",      category: "Rhythm",      description: "Lub-dub pairs at a calm resting tempo.",
    pattern: [c(0, 45), c(120, 70), c(420, 45), c(540, 70)] },
  { name: "heartbeatFast",  category: "Rhythm",      description: "Excited heartbeat with shorter spacing.",
    pattern: [c(0, 40), c(95, 60), c(280, 40), c(375, 60), c(560, 40), c(655, 60)] },
  { name: "breathing",      category: "Rhythm",      description: "Long inhale-style swell with a slow release.",
    pattern: [p(0, 900, 0.4, 0.2)] },
  { name: "metronome",      category: "Rhythm",      description: "Steady evenly spaced ticks like a click track.",
    pattern: taps(0, 6, 200, 30) },
  { name: "waltz",          category: "Rhythm",      description: "Strong-weak-weak in 3/4 time — one bar repeated.",
    pattern: [c(0, 70), c(220, 30), c(420, 30), c(660, 70), c(880, 30), c(1080, 30)] },
  { name: "samba",          category: "Rhythm",      description: "Lively syncopated samba surdo pattern.",
    pattern: [c(0, 60), c(180, 30), c(300, 30), c(480, 60), c(660, 30), c(780, 30)] },
  { name: "drumroll",       category: "Rhythm",      description: "Accelerating roll with a final accent.",
    pattern: [p(0, 600, 0.1, 1.0), c(640, 120)] },
  { name: "tangoStomp",     category: "Rhythm",      description: "Sharp-sharp-long like a tango heel stomp.",
    pattern: [c(0, 50), c(160, 50), c(320, 180)] },

  // --- Textures / continuous feels ---
  { name: "buzz",           category: "Texture",     description: "Tight high-frequency buzz, like an angry insect.",
    pattern: [p(0, 600, 0.1, 1.0)] },
  { name: "shiver",         category: "Texture",     description: "Rapid trembling pulses — a cold shiver.",
    pattern: [p(0, 700, 0.2, 0.9)] },
  { name: "tremor",         category: "Texture",     description: "Irregular small pulses with growing intensity.",
    pattern: [p(0, 400, 0.15, 0.7), p(450, 500, 0.3, 0.75), p(1000, 600, 0.5, 0.8)] },
  { name: "staticHiss",     category: "Texture",     description: "Tiny irregular ticks like radio static.",
    pattern: [c(0, 22), c(60, 22), c(140, 22), c(180, 22), c(280, 22), c(330, 22), c(420, 22), c(480, 22), c(580, 22)] },

  // --- Nature ---
  { name: "rainfall",       category: "Nature",      description: "Steady scattered drops over a few seconds.",
    pattern: [c(0, 22), c(140, 22), c(310, 22), c(420, 22), c(610, 22), c(740, 22), c(900, 22), c(1080, 22)] },
  { name: "thunder",        category: "Nature",      description: "Distant rumble with a sharp crack at the end.",
    pattern: [p(0, 1200, 0.85, 0.45), c(1260, 180)] },
  { name: "cricket",        category: "Nature",      description: "Short high-frequency chirp.",
    pattern: [p(0, 200, 0.1, 1.0), p(450, 200, 0.1, 1.0)] },

  // --- Cinematic / dramatic ---
  { name: "fireworksFinale",category: "Cinematic",   description: "Three escalating bursts climaxing in a long boom.",
    pattern: [c(0, 60), c(180, 80), c(380, 100), c(560, 60), c(700, 60), c(900, 220)] },
  { name: "anticipation",   category: "Cinematic",   description: "Slowly building tension — accelerating ticks.",
    pattern: [c(0, 25), c(400, 25), c(720, 25), c(980, 30), c(1180, 30), c(1340, 35), c(1460, 60), c(1560, 120)] },
  { name: "drumrollReveal", category: "Cinematic",   description: "Accelerating roll, pause, single triumphant tap.",
    pattern: [p(0, 700, 0.15, 0.95), c(900, 200)] },

  // --- Gaming ---
  { name: "gameOver",       category: "Gaming",      description: "Four descending heavy taps — defeated.",
    pattern: [c(0, 120), c(220, 90), c(380, 70), c(500, 45)] },
  { name: "shieldHit",      category: "Gaming",      description: "Hard impact bleeding into a shimmer.",
    pattern: [c(0, 100), p(120, 300, 0.3, 0.85)] },
  { name: "comboFinisher",  category: "Gaming",      description: "Triple hit ending in a heavy slam.",
    pattern: [c(0, 40), c(110, 40), c(220, 40), c(360, 180)] },

  // --- Emotional / ambient ---
  { name: "nervous",        category: "Emotional",   description: "Irregular fast micro-taps — jittery.",
    pattern: [p(0, 800, 0.1, 0.85)] },
  { name: "excitement",     category: "Emotional",   description: "Rapid bright bursts.",
    pattern: [c(0, 30), c(70, 30), c(140, 50), p(220, 300, 0.3, 0.9)] },

  // --- Communication / themed ---
  { name: "clockTick",      category: "Communication", description: "Slow steady seconds-hand ticks.",
    pattern: taps(0, 5, 500, 30) },
  { name: "typewriter",     category: "Communication", description: "Rapid uneven key strikes with a final return.",
    pattern: [c(0, 25), c(110, 25), c(180, 25), c(290, 25), c(360, 25), c(490, 25), c(560, 25), c(710, 60)] },

  // --- UI (more) ---
  { name: "pullToRefresh",  category: "UI",          description: "Gentle stretch with a snap at release.",
    pattern: [p(0, 350, 0.15, 0.5), c(380, 70)] },

  // --- Notifications (more) ---
  { name: "callIncoming",   category: "Notification", description: "Pattern of two long pulses repeating.",
    pattern: [p(0, 350, 0.85, 0.95), p(550, 350, 0.85, 0.95), p(1300, 350, 0.85, 0.95), p(1500, 350, 0.85, 0.95)] },
  { name: "emergency",      category: "Notification", description: "Aggressive triple-burst alarm.",
    pattern: [p(0, 250, 0.9, 1.0), p(380, 250, 0.9, 1.0), p(760, 250, 0.9, 1.0)] },

  // --- Rhythm (more) ---
  { name: "tribalDrum",     category: "Rhythm",      description: "Deep tribal drum call with answering taps.",
    pattern: [c(0, 120), c(220, 40), c(310, 40), c(500, 120)] },

  // --- Nature (more) ---
  { name: "owlHoot",        category: "Nature",      description: "Two soft hoots — hoo, hoo.",
    pattern: [p(0, 200, 0.4, 0.55), p(420, 250, 0.5, 0.55)] },
  { name: "wolfHowl",       category: "Nature",      description: "Long swelling howl that fades out.",
    pattern: [p(0, 1500, 0.8, 0.18)] },
  { name: "frogCroak",      category: "Nature",      description: "Two short throaty croaks.",
    pattern: [p(0, 140, 0.4, 0.9), p(300, 140, 0.4, 0.9)] },
  { name: "rollingThunder", category: "Nature",      description: "Multiple distant rumbles overlapping.",
    pattern: [p(0, 900, 0.65, 0.3), p(700, 1100, 0.75, 0.35)] },

  // --- Cinematic (more) ---
  { name: "costam",         category: "Cinematic",   description: "Building shimmer climaxing in a release.",
    pattern: [p(0, 600, 0.1, 0.45), p(650, 400, 0.4, 0.8), c(1080, 90)] },
  { name: "fizzle",         category: "Cinematic",   description: "Spell failing — short shimmer then nothing.",
    pattern: [p(0, 400, 0.15, 0.6)] },
  { name: "footstepStone",  category: "Cinematic",   description: "Heavy slow giant-like footsteps.",
    pattern: [c(0, 120), c(700, 120), c(1400, 120)] },

  // --- Gaming (more) ---
  { name: "questComplete",  category: "Gaming",      description: "Triumphant ascending fanfare.",
    pattern: [c(0, 40), c(110, 50), c(220, 60), c(360, 90), c(500, 140)] },
  { name: "achievementUnlocked", category: "Gaming", description: "Sparkly intro then a satisfying lock-in.",
    pattern: [p(0, 350, 0.15, 0.85), c(390, 120)] },
  { name: "respawn",        category: "Gaming",      description: "Phasing-in pulse settling into a tap.",
    pattern: [p(0, 500, 0.25, 0.5), c(540, 70)] },

  // --- Emotional (more) ---
  { name: "anger",          category: "Emotional",   description: "Hard erratic accented hits.",
    pattern: [c(0, 90), c(160, 50), c(240, 90), c(380, 50), c(480, 110)] },

  // --- Communication (more) ---
  { name: "binaryBeep",     category: "Communication", description: "Short-long-short pattern like a data ping.",
    pattern: [c(0, 35), c(110, 140), c(310, 35)] },
  { name: "robotChatter",   category: "Communication", description: "Mechanical clipped speech-like bursts.",
    pattern: [c(0, 35), c(80, 18), c(120, 60), c(220, 18), c(260, 35), c(320, 90)] },
  { name: "applause",       category: "Communication", description: "Quick scattered claps building up.",
    pattern: [c(0, 30), c(90, 28), c(160, 26), c(240, 30), c(320, 24), c(380, 28), c(470, 30), c(540, 28), c(620, 32)] },

  // --- Transportation ---
  { name: "carIgnition",    category: "Transportation", description: "Cranking starter followed by an engine catch.",
    pattern: [p(0, 600, 0.2, 0.85), c(620, 130)] },
  { name: "carHonk",        category: "Transportation", description: "Single loud honk warning the world.",
    pattern: [c(0, 220)] },
  { name: "trainClickClack",category: "Transportation", description: "Rhythmic two-beat over rails.",
    pattern: [c(0, 35), c(110, 35), c(380, 35), c(490, 35), c(760, 35), c(870, 35)] },

  // --- Food / Cooking ---
  { name: "popcorn",        category: "Food",        description: "Sporadic pops accelerating into a flurry.",
    pattern: [c(0, 25), c(280, 25), c(520, 25), c(680, 25), c(820, 25), c(920, 25), c(1010, 25), c(1080, 25), c(1140, 25)] },
  { name: "knockOnEgg",     category: "Food",        description: "Sharp tap and quick fracture.",
    pattern: [c(0, 50), p(60, 120, 0.1, 0.95)] },
  { name: "champagnePop",   category: "Food",        description: "Building tension and a single sharp pop.",
    pattern: [p(0, 400, 0.12, 0.4), c(440, 100)] },
  { name: "kettleWhistle",  category: "Food",        description: "Long sustained whistle.",
    pattern: [c(0, 200), c(220, 200), c(440, 200)] },

  // --- Body / Sensation ---
  { name: "sneeze",         category: "Body",        description: "Sharp buildup and decisive release.",
    pattern: [c(0, 30), c(80, 35), c(160, 180)] },

  // --- Musical Instruments ---
  { name: "snareRoll",      category: "Music",       description: "Tight buzzing roll into a final crack.",
    pattern: [p(0, 600, 0.1, 1.0), c(620, 110)] },
  { name: "harpGlissando",  category: "Music",       description: "Sweeping rapid arpeggio.",
    pattern: [p(0, 700, 0.05, 0.95)] },

  // --- Materials / Physics ---
  { name: "glassBreak",     category: "Materials",   description: "Sharp shatter into a quick cascade of shards.",
    pattern: [c(0, 90), c(140, 25), c(190, 25), c(250, 25), c(330, 25), c(390, 25), c(470, 25)] },
  { name: "woodCrack",      category: "Materials",   description: "Slow groan, then sudden snap.",
    pattern: [p(0, 500, 0.2, 0.3), c(540, 110)] },
  { name: "paperTear",      category: "Materials",   description: "Quick rip with a small finishing snap.",
    pattern: [p(0, 250, 0.15, 0.95), c(280, 35)] },
  { name: "concreteBreak",  category: "Materials",   description: "Massive crunch followed by debris settling.",
    pattern: [c(0, 200), p(220, 600, 0.4, 0.65)] },

  // --- Magic types ---
  { name: "lightningSpell", category: "Magic",       description: "Tense buildup then a sudden crack.",
    pattern: [p(0, 500, 0.1, 0.45), c(540, 150)] },

  // --- Construction / Industrial ---
  { name: "welding",        category: "Industrial",  description: "Steady high-frequency crackle.",
    pattern: [p(0, 1000, 0.1, 0.95)] },

  // --- Casino / Game-show ---
  { name: "slotMachineWin", category: "Casino",      description: "Trio of locking reels then a payout shimmer.",
    pattern: [c(0, 70), c(280, 70), c(560, 90), p(700, 600, 0.1, 0.95)] },
  { name: "diceRoll",       category: "Casino",      description: "Tumbling clatter then settling.",
    pattern: [p(0, 500, 0.1, 0.9), c(530, 50), c(620, 60)] },

  // --- Fitness / Workout ---
  { name: "intervalStart",  category: "Fitness",     description: "Two quick taps and one long go-signal.",
    pattern: [c(0, 35), c(120, 35), c(280, 180)] },
  { name: "intervalEnd",    category: "Fitness",     description: "Long pulse then two cool-down taps.",
    pattern: [c(0, 180), c(280, 35), c(380, 35)] },

  // --- Vehicles (more) ---
  { name: "carCrash",       category: "Transportation", description: "Massive impact and crumpling decay.",
    pattern: [c(0, 250), p(280, 600, 0.4, 0.7)] },

  // --- Eat / Drink ---
  { name: "burp",           category: "Food",        description: "Short comical release.",
    pattern: [p(0, 250, 0.5, 0.4)] },

  // --- Children's games ---
  { name: "hopscotch",      category: "Toys",        description: "Single-double-single-double hopping rhythm.",
    pattern: [c(0, 50), c(280, 30), c(380, 30), c(620, 50), c(880, 30), c(980, 30)] },

  // --- Abstract ---
  { name: "fibonacciTaps",  category: "Abstract",    description: "Taps spaced by Fibonacci intervals.",
    pattern: [c(0, 35), c(50, 35), c(130, 35), c(290, 35), c(530, 35), c(910, 35)] },
  { name: "morphAccelerate",category: "Abstract",    description: "Pulses that gradually speed up.",
    pattern: [c(0, 40), c(600, 40), c(1100, 40), c(1500, 40), c(1800, 40), c(2000, 40)] },
  { name: "morphDecelerate",category: "Abstract",    description: "Pulses that gradually slow down.",
    pattern: [c(0, 40), c(200, 40), c(500, 40), c(900, 40), c(1400, 40), c(2000, 40)] },
  { name: "crescendo",      category: "Abstract",    description: "Each pulse longer than the last.",
    pattern: [c(0, 30), c(200, 50), c(450, 80), c(750, 120), c(1100, 180)] },
  { name: "decrescendo",    category: "Abstract",    description: "Each pulse shorter than the last.",
    pattern: [c(0, 180), c(350, 120), c(650, 80), c(900, 50), c(1100, 30)] },
  { name: "pingPong",       category: "Abstract",    description: "Alternating short and long taps.",
    pattern: [c(0, 25), c(150, 80), c(330, 25), c(480, 80), c(660, 25), c(810, 80)] },
  { name: "staircaseUp",    category: "Abstract",    description: "Five evenly-spaced ascending pulses.",
    pattern: [c(0, 30), c(200, 50), c(450, 70), c(770, 100), c(1170, 140)] },
  { name: "staircaseDown",  category: "Abstract",    description: "Five evenly-spaced descending pulses.",
    pattern: [c(0, 140), c(300, 100), c(540, 70), c(720, 50), c(850, 30)] },

  { name: "deployComplete", category: "Dev",         description: "Three taps and a final triumphant pulse.",
    pattern: [c(0, 40), c(140, 50), c(260, 60), c(420, 160)] },
  { name: "firewallBreach", category: "Cyberpunk",   description: "Build up alarm and a heavy entry slam.",
    pattern: [p(0, 800, 0.4, 0.85), c(820, 200)] },

  // --- Camping / Outdoor ---
  { name: "campfireCrackle",category: "Nature",      description: "Irregular sparking taps over a low hiss.",
    pattern: [p(0, 1500, 0.08, 0.35), c(200, 28), c(540, 28), c(900, 28), c(1200, 28)] },
  { name: "footstepLeaves", category: "Nature",      description: "Four crunching steps in leaves.",
    pattern: [p(0, 200, 0.1, 0.9), p(450, 200, 0.1, 0.9), p(900, 200, 0.1, 0.9), p(1350, 200, 0.1, 0.9)] },
  { name: "rakingLeaves",   category: "Nature",      description: "Slow drawn brushing texture.",
    pattern: [p(0, 700, 0.5, 0.4), p(900, 700, 0.5, 0.4)] },

  // --- Currency / Coins ---
  { name: "coinDrop",       category: "Casino",      description: "Single coin bouncing to rest.",
    pattern: [c(0, 30), c(180, 30), c(290, 25), c(370, 22)] },

  { name: "birdInCage",     category: "Pets",        description: "Cheerful repeating chirp pattern.",
    pattern: [c(0, 25), c(80, 25), c(150, 25), c(400, 25), c(480, 25), c(560, 25)] },

  { name: "lullaby",        category: "Wellness",    description: "Three soft rocking pulses.",
    pattern: [p(0, 600, 0.3, 0.2), p(900, 600, 0.3, 0.2), p(1800, 600, 0.3, 0.2)] },

  // --- Insects ---
  { name: "mosquito",       category: "Nature",      description: "Annoyingly high persistent whine.",
    pattern: [p(0, 1500, 0.05, 1.0)] },
  { name: "beehive",        category: "Nature",      description: "Layered low and high buzzing.",
    pattern: [p(0, 1500, 0.2, 0.8)] },

  // --- Misc / Themed ---
  { name: "amusementPark",  category: "Social",      description: "Bright joyful celebration cluster.",
    pattern: [c(0, 30), c(110, 30), c(220, 50), c(380, 70), c(560, 110)] },

  // --- PWM showcase ---
  { name: "pulseFastTight", category: "PWM",         description: "Maximum density: longest shots, shortest pauses.",
    pattern: [p(0, 1600, 1.0, 1.0)] },
  { name: "pulseHeavySlow", category: "PWM",         description: "Long heavy shots widely spaced.",
    pattern: [p(0, 1800, 1.0, 0.0)] },
  { name: "pulseMidPlateau",category: "PWM",         description: "Even mid-density texture, steady ride.",
    pattern: [p(0, 1500, 0.5, 0.5)] },

  // Intensity sweeps (frequency held)
  { name: "intensityRampUp",   category: "PWM",      description: "Shots grow longer while spacing stays tight.",
    pattern: [p(0, 400, 0.05, 0.8), p(420, 400, 0.3, 0.8), p(840, 400, 0.6, 0.8), p(1260, 400, 1.0, 0.8)] },
  { name: "intensityRampDown", category: "PWM",      description: "Shots shorten gradually at steady tempo.",
    pattern: [p(0, 400, 1.0, 0.8), p(420, 400, 0.6, 0.8), p(840, 400, 0.3, 0.8), p(1260, 400, 0.05, 0.8)] },

  // Frequency sweeps (intensity held)
  { name: "frequencyRampUp",   category: "PWM",      description: "Spacing tightens — texture turns into a buzz.",
    pattern: [p(0, 400, 0.3, 0.05), p(420, 400, 0.3, 0.4), p(840, 400, 0.3, 0.75), p(1260, 400, 0.3, 1.0)] },
  { name: "frequencyRampDown", category: "PWM",      description: "Spacing opens up — buzz turns into sparse ticks.",
    pattern: [p(0, 400, 0.3, 1.0), p(420, 400, 0.3, 0.75), p(840, 400, 0.3, 0.4), p(1260, 400, 0.3, 0.05)] },
  { name: "frequencyWobble",   category: "PWM",      description: "Frequency oscillates while energy stays steady.",
    pattern: [p(0, 300, 0.4, 0.2), p(310, 300, 0.4, 0.8), p(620, 300, 0.4, 0.2), p(930, 300, 0.4, 0.8), p(1240, 300, 0.4, 0.2)] },

  // Two-axis morphs
  { name: "antiDiagonalSweep", category: "PWM",      description: "Intensity falls as frequency rises.",
    pattern: [p(0, 400, 1.0, 0.1), p(410, 400, 0.7, 0.4), p(820, 400, 0.4, 0.7), p(1230, 400, 0.1, 1.0)] },

  // Stepped textures
  { name: "siren",             category: "PWM",      description: "Two alternating modes simulating a wailing siren.",
    pattern: [p(0, 400, 0.7, 0.4), p(420, 400, 0.2, 0.95), p(840, 400, 0.7, 0.4), p(1260, 400, 0.2, 0.95)] },

  // Layered / overlapping pulses (these merge in compile to form richer textures)
  { name: "layeredDrone",      category: "PWM",      description: "Two overlapping pulse layers, different speeds.",
    pattern: [p(0, 1600, 0.7, 0.2), p(0, 1600, 0.1, 0.95)] },
  { name: "layeredThrum",      category: "PWM",      description: "Slow heavy pulse with a fizzy overlay.",
    pattern: [p(0, 1500, 0.9, 0.15), p(0, 1500, 0.05, 0.9)] },

  // Density modulation
  { name: "tremoloHeavy",      category: "PWM",      description: "Wide intensity swing — dramatic tremolo.",
    pattern: [p(0, 250, 0.9, 0.6), p(260, 250, 0.1, 0.6), p(520, 250, 0.9, 0.6), p(780, 250, 0.1, 0.6), p(1040, 250, 0.9, 0.6)] },

  // --- Mixed: combined c() + p() narratives ---
  { name: "impactRingout",      category: "Mixed",   description: "Hard slam followed by a fizzy resonant tail.",
    pattern: [c(0, 160), p(180, 700, 0.15, 0.65)] },

  // Sandwich (c → p → c)
  { name: "tapBuzzTap",         category: "Mixed",   description: "Tap, dense buzz interlude, closing tap.",
    pattern: [c(0, 40), p(70, 500, 0.15, 0.95), c(590, 40)] },

  // Texture + rhythmic accents
  { name: "tickingOverHum",     category: "Mixed",   description: "Clock-like ticks layered over a low hum.",
    pattern: [p(0, 1800, 0.45, 0.18), c(400, 30), c(900, 30), c(1400, 30)] },

  // Multi-phase narratives
  { name: "phoneRingPickup",    category: "Mixed",   description: "Two long rings, pause, decisive pickup tap.",
    pattern: [p(0, 400, 0.85, 0.95), p(600, 400, 0.85, 0.95), c(1300, 70)] },

  { name: "morphingDrone",      category: "Wild",    description: "Eight overlapping pulse layers drifting through (i,f) space.",
    pattern: [
      p(0, 2400, 0.1, 0.9),
      p(300, 2100, 0.25, 0.75),
      p(600, 1800, 0.4, 0.6),
      p(900, 1500, 0.55, 0.45),
      p(1200, 1200, 0.7, 0.3),
      p(1500, 900, 0.85, 0.2),
      p(1800, 600, 1.0, 0.1),
    ] },

  { name: "fractalCascade",     category: "Wild",    description: "Self-similar cluster of 4-bursts at three scales.",
    pattern: [
      c(0, 25), c(60, 25), c(120, 25), c(180, 25),
      c(500, 25), c(560, 25), c(620, 25), c(680, 25),
      c(1200, 25), c(1260, 25), c(1320, 25), c(1380, 25),
      c(2200, 60), c(2400, 60), c(2600, 60), c(2800, 60),
    ] },

  { name: "twoToneBuzzer",      category: "Dynamic", description: "Alternates between two distinct buzz characters — high vs low.",
    pattern: [
      p(0, 250, 0.1, 0.95),
      p(260, 250, 0.85, 0.25),
      p(520, 250, 0.1, 0.95),
      p(780, 250, 0.85, 0.25),
      p(1040, 250, 0.1, 0.95),
      p(1300, 250, 0.85, 0.25),
      p(1560, 250, 0.1, 0.95),
      p(1820, 250, 0.85, 0.25),
    ] },

  { name: "heartbeatDrift",     category: "Line",    description: "Two-beat opening followed by a trembling, fading line afterglow.",
    pattern: [
      c(0, 28),
      c(128, 42),
      l(230, 500,
        [[0, 0.72], [150, 0.48], [320, 0.30], [500, 0.12]],
        [[0, 0.74], [180, 0.52], [340, 0.34], [500, 0.18]]),
    ] },
  { name: "rampUp",             category: "Line",    description: "Pure linear ramp from near silence to full intensity — a clean rising slope.",
    pattern: [
      l(0, 800,
        [[0, 0.05], [800, 1.0]],
        [[0, 0.05], [800, 1.0]]),
    ] },
  { name: "rampDown",           category: "Line",    description: "Pure linear ramp from full to near silence — a clean falling slope.",
    pattern: [
      l(0, 800,
        [[0, 1.0], [800, 0.05]],
        [[0, 1.0], [800, 0.05]]),
    ] },
];
