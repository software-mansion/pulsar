import Pulsar from './NativeRNPulsar';

// workaround for RN prototype caching issue 
Pulsar.Pulsar_play;

export default {
  System: {
    ImpactLight: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactLight');
    },
    ImpactMedium: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactMedium');
    },
    ImpactHeavy: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactHeavy');
    },
    ImpactSoft: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactSoft');
    },
    ImpactRigid: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactRigid');
    },
    NotificationSuccess: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemNotificationSuccess');
    },
    NotificationWarning: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemNotificationWarning');
    },
    NotificationError: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemNotificationError');
    },
    Selection: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemSelection');
    },

    Android: {
      EffectClick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectClick');
      },
      EffectDoubleClick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectDoubleClick');
      },
      EffectTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectTick');
      },
      EffectHeavyClick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectHeavyClick');
      },

      PrimitiveClick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveClick');
      },
      PrimitiveLowTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveLowTick');
      },
      PrimitiveQuickFall: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveQuickFall');
      },
      PrimitiveQuickRise: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveQuickRise');
      },
      PrimitiveSlowRise: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveSlowRise');
      },
      PrimitiveSpin: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveSpin');
      },
      PrimitiveThud: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveThud');
      },
      PrimitiveTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveTick');
      },

      LongPress: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemLongPress');
      },
      VirtualKey: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemVirtualKey');
      },
      KeyboardTap: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemKeyboardTap');
      },
      ClockTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemClockTick');
      },
      CalendarDate: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemCalendarDate');
      },
      ContextClick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemContextClick');
      },
      KeyboardPress: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemKeyboardPress');
      },
      KeyboardRelease: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemKeyboardRelease');
      },
      VirtualKeyRelease: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemVirtualKeyRelease');
      },
      TextHandleMove: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemTextHandleMove');
      },
      DragCrossing: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemDragCrossing');
      },
      GestureStart: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemGestureStart');
      },
      GestureEnd: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemGestureEnd');
      },
      EdgeSqueeze: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEdgeSqueeze');
      },
      EdgeRelease: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEdgeRelease');
      },
      Confirm: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemConfirm');
      },
      Release: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemRelease');
      },
      ScrollTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemScrollTick');
      },
      ScrollItemFocus: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemScrollItemFocus');
      },
      ScrollLimit: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemScrollLimit');
      },
      ToggleOn: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemToggleOn');
      },
      ToggleOff: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemToggleOff');
      },
      DragStart: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemDragStart');
      },
      SegmentTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemSegmentTick');
      },
      SegmentFrequentTick: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemSegmentFrequentTick');
      },
    },
  },
// CODEGEN_BEGIN_{getters}
  Afterglow: () => { 
    'worklet';
    Pulsar.Pulsar_play('Afterglow');
  },
  Aftershock: () => { 
    'worklet';
    Pulsar.Pulsar_play('Aftershock');
  },
  Alarm: () => { 
    'worklet';
    Pulsar.Pulsar_play('Alarm');
  },
  Anvil: () => { 
    'worklet';
    Pulsar.Pulsar_play('Anvil');
  },
  Applause: () => { 
    'worklet';
    Pulsar.Pulsar_play('Applause');
  },
  Ascent: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ascent');
  },
  BalloonPop: () => { 
    'worklet';
    Pulsar.Pulsar_play('BalloonPop');
  },
  Barrage: () => { 
    'worklet';
    Pulsar.Pulsar_play('Barrage');
  },
  BassDrop: () => { 
    'worklet';
    Pulsar.Pulsar_play('BassDrop');
  },
  Batter: () => { 
    'worklet';
    Pulsar.Pulsar_play('Batter');
  },
  BellToll: () => { 
    'worklet';
    Pulsar.Pulsar_play('BellToll');
  },
  Blip: () => { 
    'worklet';
    Pulsar.Pulsar_play('Blip');
  },
  Bloom: () => { 
    'worklet';
    Pulsar.Pulsar_play('Bloom');
  },
  Bongo: () => { 
    'worklet';
    Pulsar.Pulsar_play('Bongo');
  },
  Boulder: () => { 
    'worklet';
    Pulsar.Pulsar_play('Boulder');
  },
  BreakingWave: () => { 
    'worklet';
    Pulsar.Pulsar_play('BreakingWave');
  },
  Breath: () => { 
    'worklet';
    Pulsar.Pulsar_play('Breath');
  },
  Breathing: () => { 
    'worklet';
    Pulsar.Pulsar_play('Breathing');
  },
  Buildup: () => { 
    'worklet';
    Pulsar.Pulsar_play('Buildup');
  },
  Burst: () => { 
    'worklet';
    Pulsar.Pulsar_play('Burst');
  },
  Buzz: () => { 
    'worklet';
    Pulsar.Pulsar_play('Buzz');
  },
  Cadence: () => { 
    'worklet';
    Pulsar.Pulsar_play('Cadence');
  },
  CameraShutter: () => { 
    'worklet';
    Pulsar.Pulsar_play('CameraShutter');
  },
  Canter: () => { 
    'worklet';
    Pulsar.Pulsar_play('Canter');
  },
  Cascade: () => { 
    'worklet';
    Pulsar.Pulsar_play('Cascade');
  },
  Castanets: () => { 
    'worklet';
    Pulsar.Pulsar_play('Castanets');
  },
  CatPaw: () => { 
    'worklet';
    Pulsar.Pulsar_play('CatPaw');
  },
  Charge: () => { 
    'worklet';
    Pulsar.Pulsar_play('Charge');
  },
  Chime: () => { 
    'worklet';
    Pulsar.Pulsar_play('Chime');
  },
  Chip: () => { 
    'worklet';
    Pulsar.Pulsar_play('Chip');
  },
  Chirp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Chirp');
  },
  Clamor: () => { 
    'worklet';
    Pulsar.Pulsar_play('Clamor');
  },
  Clasp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Clasp');
  },
  Cleave: () => { 
    'worklet';
    Pulsar.Pulsar_play('Cleave');
  },
  Coil: () => { 
    'worklet';
    Pulsar.Pulsar_play('Coil');
  },
  CoinDrop: () => { 
    'worklet';
    Pulsar.Pulsar_play('CoinDrop');
  },
  CombinationLock: () => { 
    'worklet';
    Pulsar.Pulsar_play('CombinationLock');
  },
  Crescendo: () => { 
    'worklet';
    Pulsar.Pulsar_play('Crescendo');
  },
  Dewdrop: () => { 
    'worklet';
    Pulsar.Pulsar_play('Dewdrop');
  },
  Dirge: () => { 
    'worklet';
    Pulsar.Pulsar_play('Dirge');
  },
  Dissolve: () => { 
    'worklet';
    Pulsar.Pulsar_play('Dissolve');
  },
  DogBark: () => { 
    'worklet';
    Pulsar.Pulsar_play('DogBark');
  },
  Drone: () => { 
    'worklet';
    Pulsar.Pulsar_play('Drone');
  },
  EngineRev: () => { 
    'worklet';
    Pulsar.Pulsar_play('EngineRev');
  },
  Exhale: () => { 
    'worklet';
    Pulsar.Pulsar_play('Exhale');
  },
  Explosion: () => { 
    'worklet';
    Pulsar.Pulsar_play('Explosion');
  },
  FadeOut: () => { 
    'worklet';
    Pulsar.Pulsar_play('FadeOut');
  },
  Fanfare: () => { 
    'worklet';
    Pulsar.Pulsar_play('Fanfare');
  },
  Feather: () => { 
    'worklet';
    Pulsar.Pulsar_play('Feather');
  },
  Finale: () => { 
    'worklet';
    Pulsar.Pulsar_play('Finale');
  },
  FingerDrum: () => { 
    'worklet';
    Pulsar.Pulsar_play('FingerDrum');
  },
  Firecracker: () => { 
    'worklet';
    Pulsar.Pulsar_play('Firecracker');
  },
  Fizz: () => { 
    'worklet';
    Pulsar.Pulsar_play('Fizz');
  },
  Flare: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flare');
  },
  Flick: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flick');
  },
  Flinch: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flinch');
  },
  Flourish: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flourish');
  },
  Flurry: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flurry');
  },
  Flush: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flush');
  },
  Gallop: () => { 
    'worklet';
    Pulsar.Pulsar_play('Gallop');
  },
  Gavel: () => { 
    'worklet';
    Pulsar.Pulsar_play('Gavel');
  },
  Glitch: () => { 
    'worklet';
    Pulsar.Pulsar_play('Glitch');
  },
  GuitarStrum: () => { 
    'worklet';
    Pulsar.Pulsar_play('GuitarStrum');
  },
  Hail: () => { 
    'worklet';
    Pulsar.Pulsar_play('Hail');
  },
  Hammer: () => { 
    'worklet';
    Pulsar.Pulsar_play('Hammer');
  },
  Heartbeat: () => { 
    'worklet';
    Pulsar.Pulsar_play('Heartbeat');
  },
  Herald: () => { 
    'worklet';
    Pulsar.Pulsar_play('Herald');
  },
  HoofBeat: () => { 
    'worklet';
    Pulsar.Pulsar_play('HoofBeat');
  },
  Ignition: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ignition');
  },
  Impact: () => { 
    'worklet';
    Pulsar.Pulsar_play('Impact');
  },
  Jolt: () => { 
    'worklet';
    Pulsar.Pulsar_play('Jolt');
  },
  KeyboardMechanical: () => { 
    'worklet';
    Pulsar.Pulsar_play('KeyboardMechanical');
  },
  KeyboardMembrane: () => { 
    'worklet';
    Pulsar.Pulsar_play('KeyboardMembrane');
  },
  Knell: () => { 
    'worklet';
    Pulsar.Pulsar_play('Knell');
  },
  Knock: () => { 
    'worklet';
    Pulsar.Pulsar_play('Knock');
  },
  Lament: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lament');
  },
  Latch: () => { 
    'worklet';
    Pulsar.Pulsar_play('Latch');
  },
  Lighthouse: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lighthouse');
  },
  Lilt: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lilt');
  },
  Lock: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lock');
  },
  Lope: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lope');
  },
  March: () => { 
    'worklet';
    Pulsar.Pulsar_play('March');
  },
  Metronome: () => { 
    'worklet';
    Pulsar.Pulsar_play('Metronome');
  },
  Murmur: () => { 
    'worklet';
    Pulsar.Pulsar_play('Murmur');
  },
  Nudge: () => { 
    'worklet';
    Pulsar.Pulsar_play('Nudge');
  },
  PassingCar: () => { 
    'worklet';
    Pulsar.Pulsar_play('PassingCar');
  },
  Patter: () => { 
    'worklet';
    Pulsar.Pulsar_play('Patter');
  },
  Peal: () => { 
    'worklet';
    Pulsar.Pulsar_play('Peal');
  },
  Peck: () => { 
    'worklet';
    Pulsar.Pulsar_play('Peck');
  },
  Pendulum: () => { 
    'worklet';
    Pulsar.Pulsar_play('Pendulum');
  },
  Ping: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ping');
  },
  Pip: () => { 
    'worklet';
    Pulsar.Pulsar_play('Pip');
  },
  Piston: () => { 
    'worklet';
    Pulsar.Pulsar_play('Piston');
  },
  Plink: () => { 
    'worklet';
    Pulsar.Pulsar_play('Plink');
  },
  Plummet: () => { 
    'worklet';
    Pulsar.Pulsar_play('Plummet');
  },
  Plunk: () => { 
    'worklet';
    Pulsar.Pulsar_play('Plunk');
  },
  Poke: () => { 
    'worklet';
    Pulsar.Pulsar_play('Poke');
  },
  Pound: () => { 
    'worklet';
    Pulsar.Pulsar_play('Pound');
  },
  PowerDown: () => { 
    'worklet';
    Pulsar.Pulsar_play('PowerDown');
  },
  Propel: () => { 
    'worklet';
    Pulsar.Pulsar_play('Propel');
  },
  Pulse: () => { 
    'worklet';
    Pulsar.Pulsar_play('Pulse');
  },
  Pummel: () => { 
    'worklet';
    Pulsar.Pulsar_play('Pummel');
  },
  Push: () => { 
    'worklet';
    Pulsar.Pulsar_play('Push');
  },
  Radar: () => { 
    'worklet';
    Pulsar.Pulsar_play('Radar');
  },
  Rain: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rain');
  },
  Ramp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ramp');
  },
  Rap: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rap');
  },
  Ratchet: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ratchet');
  },
  Rebound: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rebound');
  },
  Ripple: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ripple');
  },
  Rivet: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rivet');
  },
  Rustle: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rustle');
  },
  Shockwave: () => { 
    'worklet';
    Pulsar.Pulsar_play('Shockwave');
  },
  Snap: () => { 
    'worklet';
    Pulsar.Pulsar_play('Snap');
  },
  Sonar: () => { 
    'worklet';
    Pulsar.Pulsar_play('Sonar');
  },
  Spark: () => { 
    'worklet';
    Pulsar.Pulsar_play('Spark');
  },
  Spin: () => { 
    'worklet';
    Pulsar.Pulsar_play('Spin');
  },
  Stagger: () => { 
    'worklet';
    Pulsar.Pulsar_play('Stagger');
  },
  Stamp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Stamp');
  },
  Stampede: () => { 
    'worklet';
    Pulsar.Pulsar_play('Stampede');
  },
  Stomp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Stomp');
  },
  StoneSkip: () => { 
    'worklet';
    Pulsar.Pulsar_play('StoneSkip');
  },
  Strike: () => { 
    'worklet';
    Pulsar.Pulsar_play('Strike');
  },
  Summon: () => { 
    'worklet';
    Pulsar.Pulsar_play('Summon');
  },
  Surge: () => { 
    'worklet';
    Pulsar.Pulsar_play('Surge');
  },
  Sway: () => { 
    'worklet';
    Pulsar.Pulsar_play('Sway');
  },
  Sweep: () => { 
    'worklet';
    Pulsar.Pulsar_play('Sweep');
  },
  Swell: () => { 
    'worklet';
    Pulsar.Pulsar_play('Swell');
  },
  Syncopate: () => { 
    'worklet';
    Pulsar.Pulsar_play('Syncopate');
  },
  Throb: () => { 
    'worklet';
    Pulsar.Pulsar_play('Throb');
  },
  Thud: () => { 
    'worklet';
    Pulsar.Pulsar_play('Thud');
  },
  Thump: () => { 
    'worklet';
    Pulsar.Pulsar_play('Thump');
  },
  Thunder: () => { 
    'worklet';
    Pulsar.Pulsar_play('Thunder');
  },
  ThunderRoll: () => { 
    'worklet';
    Pulsar.Pulsar_play('ThunderRoll');
  },
  TickTock: () => { 
    'worklet';
    Pulsar.Pulsar_play('TickTock');
  },
  TidalSurge: () => { 
    'worklet';
    Pulsar.Pulsar_play('TidalSurge');
  },
  TideSwell: () => { 
    'worklet';
    Pulsar.Pulsar_play('TideSwell');
  },
  Tremor: () => { 
    'worklet';
    Pulsar.Pulsar_play('Tremor');
  },
  Trigger: () => { 
    'worklet';
    Pulsar.Pulsar_play('Trigger');
  },
  Triumph: () => { 
    'worklet';
    Pulsar.Pulsar_play('Triumph');
  },
  Trumpet: () => { 
    'worklet';
    Pulsar.Pulsar_play('Trumpet');
  },
  Typewriter: () => { 
    'worklet';
    Pulsar.Pulsar_play('Typewriter');
  },
  Unfurl: () => { 
    'worklet';
    Pulsar.Pulsar_play('Unfurl');
  },
  Vortex: () => { 
    'worklet';
    Pulsar.Pulsar_play('Vortex');
  },
  Wane: () => { 
    'worklet';
    Pulsar.Pulsar_play('Wane');
  },
  WarDrum: () => { 
    'worklet';
    Pulsar.Pulsar_play('WarDrum');
  },
  Waterfall: () => { 
    'worklet';
    Pulsar.Pulsar_play('Waterfall');
  },
  Wave: () => { 
    'worklet';
    Pulsar.Pulsar_play('Wave');
  },
  Wisp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Wisp');
  },
  Wobble: () => { 
    'worklet';
    Pulsar.Pulsar_play('Wobble');
  },
  Woodpecker: () => { 
    'worklet';
    Pulsar.Pulsar_play('Woodpecker');
  },
  Zipper: () => { 
    'worklet';
    Pulsar.Pulsar_play('Zipper');
  },
// CODEGEN_END_{getters}
}
