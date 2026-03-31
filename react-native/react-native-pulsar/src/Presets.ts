import Pulsar from './NativeRNPulsar';

// workaround for RN prototype caching issue 
Pulsar.Pulsar_play;

export default {
  System: {
    impactLight: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactLight');
    },
    impactMedium: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactMedium');
    },
    impactHeavy: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactHeavy');
    },
    impactSoft: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactSoft');
    },
    impactRigid: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactRigid');
    },
    notificationSuccess: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemNotificationSuccess');
    },
    notificationWarning: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemNotificationWarning');
    },
    notificationError: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemNotificationError');
    },
    selection: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemSelection');
    },

    Android: {
      effectClick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectClick');
      },
      effectDoubleClick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectDoubleClick');
      },
      effectTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectTick');
      },
      effectHeavyClick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectHeavyClick');
      },

      primitiveClick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveClick');
      },
      primitiveLowTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveLowTick');
      },
      primitiveQuickFall: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveQuickFall');
      },
      primitiveQuickRise: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveQuickRise');
      },
      primitiveSlowRise: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveSlowRise');
      },
      primitiveSpin: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveSpin');
      },
      primitiveThud: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveThud');
      },
      primitiveTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveTick');
      },

      longPress: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemLongPress');
      },
      virtualKey: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemVirtualKey');
      },
      keyboardTap: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemKeyboardTap');
      },
      clockTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemClockTick');
      },
      calendarDate: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemCalendarDate');
      },
      contextClick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemContextClick');
      },
      keyboardPress: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemKeyboardPress');
      },
      keyboardRelease: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemKeyboardRelease');
      },
      virtualKeyRelease: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemVirtualKeyRelease');
      },
      textHandleMove: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemTextHandleMove');
      },
      dragCrossing: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemDragCrossing');
      },
      gestureStart: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemGestureStart');
      },
      gestureEnd: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemGestureEnd');
      },
      edgeSqueeze: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEdgeSqueeze');
      },
      edgeRelease: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEdgeRelease');
      },
      confirm: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemConfirm');
      },
      release: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemRelease');
      },
      scrollTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemScrollTick');
      },
      scrollItemFocus: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemScrollItemFocus');
      },
      scrollLimit: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemScrollLimit');
      },
      toggleOn: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemToggleOn');
      },
      toggleOff: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemToggleOff');
      },
      dragStart: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemDragStart');
      },
      segmentTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemSegmentTick');
      },
      segmentFrequentTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemSegmentFrequentTick');
      },
    },
  },
// CODEGEN_BEGIN_{getters}
  afterglow: () => { 
    'worklet';
    Pulsar.Pulsar_play('Afterglow');
  },
  aftershock: () => { 
    'worklet';
    Pulsar.Pulsar_play('Aftershock');
  },
  alarm: () => { 
    'worklet';
    Pulsar.Pulsar_play('Alarm');
  },
  anvil: () => { 
    'worklet';
    Pulsar.Pulsar_play('Anvil');
  },
  applause: () => { 
    'worklet';
    Pulsar.Pulsar_play('Applause');
  },
  ascent: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ascent');
  },
  balloonPop: () => { 
    'worklet';
    Pulsar.Pulsar_play('BalloonPop');
  },
  barrage: () => { 
    'worklet';
    Pulsar.Pulsar_play('Barrage');
  },
  bassDrop: () => { 
    'worklet';
    Pulsar.Pulsar_play('BassDrop');
  },
  batter: () => { 
    'worklet';
    Pulsar.Pulsar_play('Batter');
  },
  bellToll: () => { 
    'worklet';
    Pulsar.Pulsar_play('BellToll');
  },
  blip: () => { 
    'worklet';
    Pulsar.Pulsar_play('Blip');
  },
  bloom: () => { 
    'worklet';
    Pulsar.Pulsar_play('Bloom');
  },
  bongo: () => { 
    'worklet';
    Pulsar.Pulsar_play('Bongo');
  },
  boulder: () => { 
    'worklet';
    Pulsar.Pulsar_play('Boulder');
  },
  breakingWave: () => { 
    'worklet';
    Pulsar.Pulsar_play('BreakingWave');
  },
  breath: () => { 
    'worklet';
    Pulsar.Pulsar_play('Breath');
  },
  breathing: () => { 
    'worklet';
    Pulsar.Pulsar_play('Breathing');
  },
  buildup: () => { 
    'worklet';
    Pulsar.Pulsar_play('Buildup');
  },
  burst: () => { 
    'worklet';
    Pulsar.Pulsar_play('Burst');
  },
  buzz: () => { 
    'worklet';
    Pulsar.Pulsar_play('Buzz');
  },
  cadence: () => { 
    'worklet';
    Pulsar.Pulsar_play('Cadence');
  },
  cameraShutter: () => { 
    'worklet';
    Pulsar.Pulsar_play('CameraShutter');
  },
  canter: () => { 
    'worklet';
    Pulsar.Pulsar_play('Canter');
  },
  cascade: () => { 
    'worklet';
    Pulsar.Pulsar_play('Cascade');
  },
  castanets: () => { 
    'worklet';
    Pulsar.Pulsar_play('Castanets');
  },
  catPaw: () => { 
    'worklet';
    Pulsar.Pulsar_play('CatPaw');
  },
  charge: () => { 
    'worklet';
    Pulsar.Pulsar_play('Charge');
  },
  chime: () => { 
    'worklet';
    Pulsar.Pulsar_play('Chime');
  },
  chip: () => { 
    'worklet';
    Pulsar.Pulsar_play('Chip');
  },
  chirp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Chirp');
  },
  clamor: () => { 
    'worklet';
    Pulsar.Pulsar_play('Clamor');
  },
  clasp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Clasp');
  },
  cleave: () => { 
    'worklet';
    Pulsar.Pulsar_play('Cleave');
  },
  coil: () => { 
    'worklet';
    Pulsar.Pulsar_play('Coil');
  },
  coinDrop: () => { 
    'worklet';
    Pulsar.Pulsar_play('CoinDrop');
  },
  combinationLock: () => { 
    'worklet';
    Pulsar.Pulsar_play('CombinationLock');
  },
  crescendo: () => { 
    'worklet';
    Pulsar.Pulsar_play('Crescendo');
  },
  dewdrop: () => { 
    'worklet';
    Pulsar.Pulsar_play('Dewdrop');
  },
  dirge: () => { 
    'worklet';
    Pulsar.Pulsar_play('Dirge');
  },
  dissolve: () => { 
    'worklet';
    Pulsar.Pulsar_play('Dissolve');
  },
  dogBark: () => { 
    'worklet';
    Pulsar.Pulsar_play('DogBark');
  },
  drone: () => { 
    'worklet';
    Pulsar.Pulsar_play('Drone');
  },
  engineRev: () => { 
    'worklet';
    Pulsar.Pulsar_play('EngineRev');
  },
  exhale: () => { 
    'worklet';
    Pulsar.Pulsar_play('Exhale');
  },
  explosion: () => { 
    'worklet';
    Pulsar.Pulsar_play('Explosion');
  },
  fadeOut: () => { 
    'worklet';
    Pulsar.Pulsar_play('FadeOut');
  },
  fanfare: () => { 
    'worklet';
    Pulsar.Pulsar_play('Fanfare');
  },
  feather: () => { 
    'worklet';
    Pulsar.Pulsar_play('Feather');
  },
  finale: () => { 
    'worklet';
    Pulsar.Pulsar_play('Finale');
  },
  fingerDrum: () => { 
    'worklet';
    Pulsar.Pulsar_play('FingerDrum');
  },
  firecracker: () => { 
    'worklet';
    Pulsar.Pulsar_play('Firecracker');
  },
  fizz: () => { 
    'worklet';
    Pulsar.Pulsar_play('Fizz');
  },
  flare: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flare');
  },
  flick: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flick');
  },
  flinch: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flinch');
  },
  flourish: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flourish');
  },
  flurry: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flurry');
  },
  flush: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flush');
  },
  gallop: () => { 
    'worklet';
    Pulsar.Pulsar_play('Gallop');
  },
  gavel: () => { 
    'worklet';
    Pulsar.Pulsar_play('Gavel');
  },
  glitch: () => { 
    'worklet';
    Pulsar.Pulsar_play('Glitch');
  },
  guitarStrum: () => { 
    'worklet';
    Pulsar.Pulsar_play('GuitarStrum');
  },
  hail: () => { 
    'worklet';
    Pulsar.Pulsar_play('Hail');
  },
  hammer: () => { 
    'worklet';
    Pulsar.Pulsar_play('Hammer');
  },
  heartbeat: () => { 
    'worklet';
    Pulsar.Pulsar_play('Heartbeat');
  },
  herald: () => { 
    'worklet';
    Pulsar.Pulsar_play('Herald');
  },
  hoofBeat: () => { 
    'worklet';
    Pulsar.Pulsar_play('HoofBeat');
  },
  ignition: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ignition');
  },
  impact: () => { 
    'worklet';
    Pulsar.Pulsar_play('Impact');
  },
  jolt: () => { 
    'worklet';
    Pulsar.Pulsar_play('Jolt');
  },
  keyboardMechanical: () => { 
    'worklet';
    Pulsar.Pulsar_play('KeyboardMechanical');
  },
  keyboardMembrane: () => { 
    'worklet';
    Pulsar.Pulsar_play('KeyboardMembrane');
  },
  knell: () => { 
    'worklet';
    Pulsar.Pulsar_play('Knell');
  },
  knock: () => { 
    'worklet';
    Pulsar.Pulsar_play('Knock');
  },
  lament: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lament');
  },
  latch: () => { 
    'worklet';
    Pulsar.Pulsar_play('Latch');
  },
  lighthouse: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lighthouse');
  },
  lilt: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lilt');
  },
  lock: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lock');
  },
  lope: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lope');
  },
  march: () => { 
    'worklet';
    Pulsar.Pulsar_play('March');
  },
  metronome: () => { 
    'worklet';
    Pulsar.Pulsar_play('Metronome');
  },
  murmur: () => { 
    'worklet';
    Pulsar.Pulsar_play('Murmur');
  },
  nudge: () => { 
    'worklet';
    Pulsar.Pulsar_play('Nudge');
  },
  passingCar: () => { 
    'worklet';
    Pulsar.Pulsar_play('PassingCar');
  },
  patter: () => { 
    'worklet';
    Pulsar.Pulsar_play('Patter');
  },
  peal: () => { 
    'worklet';
    Pulsar.Pulsar_play('Peal');
  },
  peck: () => { 
    'worklet';
    Pulsar.Pulsar_play('Peck');
  },
  pendulum: () => { 
    'worklet';
    Pulsar.Pulsar_play('Pendulum');
  },
  ping: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ping');
  },
  pip: () => { 
    'worklet';
    Pulsar.Pulsar_play('Pip');
  },
  piston: () => { 
    'worklet';
    Pulsar.Pulsar_play('Piston');
  },
  plink: () => { 
    'worklet';
    Pulsar.Pulsar_play('Plink');
  },
  plummet: () => { 
    'worklet';
    Pulsar.Pulsar_play('Plummet');
  },
  plunk: () => { 
    'worklet';
    Pulsar.Pulsar_play('Plunk');
  },
  poke: () => { 
    'worklet';
    Pulsar.Pulsar_play('Poke');
  },
  pound: () => { 
    'worklet';
    Pulsar.Pulsar_play('Pound');
  },
  powerDown: () => { 
    'worklet';
    Pulsar.Pulsar_play('PowerDown');
  },
  propel: () => { 
    'worklet';
    Pulsar.Pulsar_play('Propel');
  },
  pulse: () => { 
    'worklet';
    Pulsar.Pulsar_play('Pulse');
  },
  pummel: () => { 
    'worklet';
    Pulsar.Pulsar_play('Pummel');
  },
  push: () => { 
    'worklet';
    Pulsar.Pulsar_play('Push');
  },
  radar: () => { 
    'worklet';
    Pulsar.Pulsar_play('Radar');
  },
  rain: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rain');
  },
  ramp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ramp');
  },
  rap: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rap');
  },
  ratchet: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ratchet');
  },
  rebound: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rebound');
  },
  ripple: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ripple');
  },
  rivet: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rivet');
  },
  rustle: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rustle');
  },
  shockwave: () => { 
    'worklet';
    Pulsar.Pulsar_play('Shockwave');
  },
  snap: () => { 
    'worklet';
    Pulsar.Pulsar_play('Snap');
  },
  sonar: () => { 
    'worklet';
    Pulsar.Pulsar_play('Sonar');
  },
  spark: () => { 
    'worklet';
    Pulsar.Pulsar_play('Spark');
  },
  spin: () => { 
    'worklet';
    Pulsar.Pulsar_play('Spin');
  },
  stagger: () => { 
    'worklet';
    Pulsar.Pulsar_play('Stagger');
  },
  stamp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Stamp');
  },
  stampede: () => { 
    'worklet';
    Pulsar.Pulsar_play('Stampede');
  },
  stomp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Stomp');
  },
  stoneSkip: () => { 
    'worklet';
    Pulsar.Pulsar_play('StoneSkip');
  },
  strike: () => { 
    'worklet';
    Pulsar.Pulsar_play('Strike');
  },
  summon: () => { 
    'worklet';
    Pulsar.Pulsar_play('Summon');
  },
  surge: () => { 
    'worklet';
    Pulsar.Pulsar_play('Surge');
  },
  sway: () => { 
    'worklet';
    Pulsar.Pulsar_play('Sway');
  },
  sweep: () => { 
    'worklet';
    Pulsar.Pulsar_play('Sweep');
  },
  swell: () => { 
    'worklet';
    Pulsar.Pulsar_play('Swell');
  },
  syncopate: () => { 
    'worklet';
    Pulsar.Pulsar_play('Syncopate');
  },
  throb: () => { 
    'worklet';
    Pulsar.Pulsar_play('Throb');
  },
  thud: () => { 
    'worklet';
    Pulsar.Pulsar_play('Thud');
  },
  thump: () => { 
    'worklet';
    Pulsar.Pulsar_play('Thump');
  },
  thunder: () => { 
    'worklet';
    Pulsar.Pulsar_play('Thunder');
  },
  thunderRoll: () => { 
    'worklet';
    Pulsar.Pulsar_play('ThunderRoll');
  },
  tickTock: () => { 
    'worklet';
    Pulsar.Pulsar_play('TickTock');
  },
  tidalSurge: () => { 
    'worklet';
    Pulsar.Pulsar_play('TidalSurge');
  },
  tideSwell: () => { 
    'worklet';
    Pulsar.Pulsar_play('TideSwell');
  },
  tremor: () => { 
    'worklet';
    Pulsar.Pulsar_play('Tremor');
  },
  trigger: () => { 
    'worklet';
    Pulsar.Pulsar_play('Trigger');
  },
  triumph: () => { 
    'worklet';
    Pulsar.Pulsar_play('Triumph');
  },
  trumpet: () => { 
    'worklet';
    Pulsar.Pulsar_play('Trumpet');
  },
  typewriter: () => { 
    'worklet';
    Pulsar.Pulsar_play('Typewriter');
  },
  unfurl: () => { 
    'worklet';
    Pulsar.Pulsar_play('Unfurl');
  },
  vortex: () => { 
    'worklet';
    Pulsar.Pulsar_play('Vortex');
  },
  wane: () => { 
    'worklet';
    Pulsar.Pulsar_play('Wane');
  },
  warDrum: () => { 
    'worklet';
    Pulsar.Pulsar_play('WarDrum');
  },
  waterfall: () => { 
    'worklet';
    Pulsar.Pulsar_play('Waterfall');
  },
  wave: () => { 
    'worklet';
    Pulsar.Pulsar_play('Wave');
  },
  wisp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Wisp');
  },
  wobble: () => { 
    'worklet';
    Pulsar.Pulsar_play('Wobble');
  },
  woodpecker: () => { 
    'worklet';
    Pulsar.Pulsar_play('Woodpecker');
  },
  zipper: () => { 
    'worklet';
    Pulsar.Pulsar_play('Zipper');
  },
// CODEGEN_END_{getters}
}
