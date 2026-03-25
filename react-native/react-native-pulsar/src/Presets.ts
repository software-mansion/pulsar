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
      EffectClickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectClickPreset');
      },
      EffectDoubleClickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectDoubleClickPreset');
      },
      EffectTickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectTickPreset');
      },
      EffectHeavyClickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEffectHeavyClickPreset');
      },

      PrimitiveClickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveClickPreset');
      },
      PrimitiveLowTickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveLowTickPreset');
      },
      PrimitiveQuickFallPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveQuickFallPreset');
      },
      PrimitiveQuickRisePreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveQuickRisePreset');
      },
      PrimitiveSlowRisePreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveSlowRisePreset');
      },
      PrimitiveSpinPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveSpinPreset');
      },
      PrimitiveThudPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveThudPreset');
      },
      PrimitiveTickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemPrimitiveTickPreset');
      },

      LongPressPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemLongPressPreset');
      },
      VirtualKeyPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemVirtualKeyPreset');
      },
      KeyboardTapPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemKeyboardTapPreset');
      },
      ClockTickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemClockTickPreset');
      },
      CalendarDatePreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemCalendarDatePreset');
      },
      ContextClickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemContextClickPreset');
      },
      KeyboardPressPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemKeyboardPressPreset');
      },
      KeyboardReleasePreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemKeyboardReleasePreset');
      },
      VirtualKeyReleasePreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemVirtualKeyReleasePreset');
      },
      TextHandleMovePreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemTextHandleMovePreset');
      },
      DragCrossingPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemDragCrossingPreset');
      },
      GestureStartPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemGestureStartPreset');
      },
      GestureEndPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemGestureEndPreset');
      },
      EdgeSqueezePreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEdgeSqueezePreset');
      },
      EdgeReleasePreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemEdgeReleasePreset');
      },
      ConfirmPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemConfirmPreset');
      },
      ReleasePreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemReleasePreset');
      },
      ScrollTickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemScrollTickPreset');
      },
      ScrollItemFocusPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemScrollItemFocusPreset');
      },
      ScrollLimitPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemScrollLimitPreset');
      },
      ToggleOnPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemToggleOnPreset');
      },
      ToggleOffPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemToggleOffPreset');
      },
      DragStartPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemDragStartPreset');
      },
      SegmentTickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemSegmentTickPreset');
      },
      SegmentFrequentTickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemSegmentFrequentTickPreset');
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
  AimingFire: () => { 
    'worklet';
    Pulsar.Pulsar_play('AimingFire');
  },
  AimingLock: () => { 
    'worklet';
    Pulsar.Pulsar_play('AimingLock');
  },
  Alarm: () => { 
    'worklet';
    Pulsar.Pulsar_play('Alarm');
  },
  AngerFrustration: () => { 
    'worklet';
    Pulsar.Pulsar_play('AngerFrustration');
  },
  Anvil: () => { 
    'worklet';
    Pulsar.Pulsar_play('Anvil');
  },
  Applause: () => { 
    'worklet';
    Pulsar.Pulsar_play('Applause');
  },
  Attention: () => { 
    'worklet';
    Pulsar.Pulsar_play('Attention');
  },
  BalloonPop: () => { 
    'worklet';
    Pulsar.Pulsar_play('BalloonPop');
  },
  BangDoor: () => { 
    'worklet';
    Pulsar.Pulsar_play('BangDoor');
  },
  Barrage: () => { 
    'worklet';
    Pulsar.Pulsar_play('Barrage');
  },
  BassDrop: () => { 
    'worklet';
    Pulsar.Pulsar_play('BassDrop');
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
  Buildup: () => { 
    'worklet';
    Pulsar.Pulsar_play('Buildup');
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
  Chip: () => { 
    'worklet';
    Pulsar.Pulsar_play('Chip');
  },
  Chirp: () => { 
    'worklet';
    Pulsar.Pulsar_play('Chirp');
  },
  Cleave: () => { 
    'worklet';
    Pulsar.Pulsar_play('Cleave');
  },
  CoinDrop: () => { 
    'worklet';
    Pulsar.Pulsar_play('CoinDrop');
  },
  CombinationLock: () => { 
    'worklet';
    Pulsar.Pulsar_play('CombinationLock');
  },
  Confirm: () => { 
    'worklet';
    Pulsar.Pulsar_play('Confirm');
  },
  Cowboy: () => { 
    'worklet';
    Pulsar.Pulsar_play('Cowboy');
  },
  Crescendo: () => { 
    'worklet';
    Pulsar.Pulsar_play('Crescendo');
  },
  CrossedEyes: () => { 
    'worklet';
    Pulsar.Pulsar_play('CrossedEyes');
  },
  Cursing: () => { 
    'worklet';
    Pulsar.Pulsar_play('Cursing');
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
  ErrorBuzz: () => { 
    'worklet';
    Pulsar.Pulsar_play('ErrorBuzz');
  },
  ExplodingHead: () => { 
    'worklet';
    Pulsar.Pulsar_play('ExplodingHead');
  },
  Explosion: () => { 
    'worklet';
    Pulsar.Pulsar_play('Explosion');
  },
  EyeRolling: () => { 
    'worklet';
    Pulsar.Pulsar_play('EyeRolling');
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
  Flick: () => { 
    'worklet';
    Pulsar.Pulsar_play('Flick');
  },
  Gallop: () => { 
    'worklet';
    Pulsar.Pulsar_play('Gallop');
  },
  GameCombo: () => { 
    'worklet';
    Pulsar.Pulsar_play('GameCombo');
  },
  GameHit: () => { 
    'worklet';
    Pulsar.Pulsar_play('GameHit');
  },
  GameLevelUp: () => { 
    'worklet';
    Pulsar.Pulsar_play('GameLevelUp');
  },
  GamePickup: () => { 
    'worklet';
    Pulsar.Pulsar_play('GamePickup');
  },
  Gavel: () => { 
    'worklet';
    Pulsar.Pulsar_play('Gavel');
  },
  Glitch: () => { 
    'worklet';
    Pulsar.Pulsar_play('Glitch');
  },
  GravityFreefall: () => { 
    'worklet';
    Pulsar.Pulsar_play('GravityFreefall');
  },
  GrinningSquinting: () => { 
    'worklet';
    Pulsar.Pulsar_play('GrinningSquinting');
  },
  GuitarStrum: () => { 
    'worklet';
    Pulsar.Pulsar_play('GuitarStrum');
  },
  Hail: () => { 
    'worklet';
    Pulsar.Pulsar_play('Hail');
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
  KnockDoor: () => { 
    'worklet';
    Pulsar.Pulsar_play('KnockDoor');
  },
  Latch: () => { 
    'worklet';
    Pulsar.Pulsar_play('Latch');
  },
  LevelUp: () => { 
    'worklet';
    Pulsar.Pulsar_play('LevelUp');
  },
  Lighthouse: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lighthouse');
  },
  LoaderBreathing: () => { 
    'worklet';
    Pulsar.Pulsar_play('LoaderBreathing');
  },
  LoaderPulse: () => { 
    'worklet';
    Pulsar.Pulsar_play('LoaderPulse');
  },
  LoaderRadar: () => { 
    'worklet';
    Pulsar.Pulsar_play('LoaderRadar');
  },
  LoaderSpin: () => { 
    'worklet';
    Pulsar.Pulsar_play('LoaderSpin');
  },
  LoaderWave: () => { 
    'worklet';
    Pulsar.Pulsar_play('LoaderWave');
  },
  Lock: () => { 
    'worklet';
    Pulsar.Pulsar_play('Lock');
  },
  LongPress: () => { 
    'worklet';
    Pulsar.Pulsar_play('LongPress');
  },
  March: () => { 
    'worklet';
    Pulsar.Pulsar_play('March');
  },
  MarioGameOver: () => { 
    'worklet';
    Pulsar.Pulsar_play('MarioGameOver');
  },
  Metronome: () => { 
    'worklet';
    Pulsar.Pulsar_play('Metronome');
  },
  Murmur: () => { 
    'worklet';
    Pulsar.Pulsar_play('Murmur');
  },
  NewMessage: () => { 
    'worklet';
    Pulsar.Pulsar_play('NewMessage');
  },
  Notification: () => { 
    'worklet';
    Pulsar.Pulsar_play('Notification');
  },
  NotificationKnock: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotificationKnock');
  },
  NotificationUrgent: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotificationUrgent');
  },
  NotifyInfoStandard: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifyInfoStandard');
  },
  NotifyReminderFinal: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifyReminderFinal');
  },
  NotifyReminderNudge: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifyReminderNudge');
  },
  NotifySocialMention: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifySocialMention');
  },
  NotifySocialMessage: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifySocialMessage');
  },
  NotifyTimerDone: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifyTimerDone');
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
  Piston: () => { 
    'worklet';
    Pulsar.Pulsar_play('Piston');
  },
  Plunk: () => { 
    'worklet';
    Pulsar.Pulsar_play('Plunk');
  },
  PowerDown: () => { 
    'worklet';
    Pulsar.Pulsar_play('PowerDown');
  },
  Propel: () => { 
    'worklet';
    Pulsar.Pulsar_play('Propel');
  },
  Push: () => { 
    'worklet';
    Pulsar.Pulsar_play('Push');
  },
  Rain: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rain');
  },
  Ratchet: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ratchet');
  },
  ReadySteadyGo: () => { 
    'worklet';
    Pulsar.Pulsar_play('ReadySteadyGo');
  },
  Rebound: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rebound');
  },
  ReliefSigh: () => { 
    'worklet';
    Pulsar.Pulsar_play('ReliefSigh');
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
  Searching: () => { 
    'worklet';
    Pulsar.Pulsar_play('Searching');
  },
  SearchSuccess: () => { 
    'worklet';
    Pulsar.Pulsar_play('SearchSuccess');
  },
  SelectionSnap: () => { 
    'worklet';
    Pulsar.Pulsar_play('SelectionSnap');
  },
  Shockwave: () => { 
    'worklet';
    Pulsar.Pulsar_play('Shockwave');
  },
  Sneezing: () => { 
    'worklet';
    Pulsar.Pulsar_play('Sneezing');
  },
  Spark: () => { 
    'worklet';
    Pulsar.Pulsar_play('Spark');
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
  SuccessFlourish: () => { 
    'worklet';
    Pulsar.Pulsar_play('SuccessFlourish');
  },
  SurpriseGasp: () => { 
    'worklet';
    Pulsar.Pulsar_play('SurpriseGasp');
  },
  Sway: () => { 
    'worklet';
    Pulsar.Pulsar_play('Sway');
  },
  Syncopate: () => { 
    'worklet';
    Pulsar.Pulsar_play('Syncopate');
  },
  Tada: () => { 
    'worklet';
    Pulsar.Pulsar_play('Tada');
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
  Typewriter: () => { 
    'worklet';
    Pulsar.Pulsar_play('Typewriter');
  },
  Victory: () => { 
    'worklet';
    Pulsar.Pulsar_play('Victory');
  },
  Vomiting: () => { 
    'worklet';
    Pulsar.Pulsar_play('Vomiting');
  },
  Vortex: () => { 
    'worklet';
    Pulsar.Pulsar_play('Vortex');
  },
  WarDrum: () => { 
    'worklet';
    Pulsar.Pulsar_play('WarDrum');
  },
  WarningPulse: () => { 
    'worklet';
    Pulsar.Pulsar_play('WarningPulse');
  },
  WarningUrgent: () => { 
    'worklet';
    Pulsar.Pulsar_play('WarningUrgent');
  },
  Waterfall: () => { 
    'worklet';
    Pulsar.Pulsar_play('Waterfall');
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
  ZeldaChest: () => { 
    'worklet';
    Pulsar.Pulsar_play('ZeldaChest');
  },
  Zipper: () => { 
    'worklet';
    Pulsar.Pulsar_play('Zipper');
  },
// CODEGEN_END_{getters}
}
