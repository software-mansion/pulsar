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
      DoubleClickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemDoubleClickPreset');
      },
      TickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemTickPreset');
      },
      HeavyClickPreset: () => {
        'worklet';
        Pulsar.Pulsar_play('SystemHeavyClickPreset');
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
  BoredomFlat: () => { 
    'worklet';
    Pulsar.Pulsar_play('BoredomFlat');
  },
  Breath: () => { 
    'worklet';
    Pulsar.Pulsar_play('Breath');
  },
  BtnChip: () => { 
    'worklet';
    Pulsar.Pulsar_play('BtnChip');
  },
  BtnDestructive: () => { 
    'worklet';
    Pulsar.Pulsar_play('BtnDestructive');
  },
  BtnGhost: () => { 
    'worklet';
    Pulsar.Pulsar_play('BtnGhost');
  },
  BtnIcon: () => { 
    'worklet';
    Pulsar.Pulsar_play('BtnIcon');
  },
  BtnMenu: () => { 
    'worklet';
    Pulsar.Pulsar_play('BtnMenu');
  },
  BtnPrimary: () => { 
    'worklet';
    Pulsar.Pulsar_play('BtnPrimary');
  },
  BtnSecondary: () => { 
    'worklet';
    Pulsar.Pulsar_play('BtnSecondary');
  },
  BtnSubmit: () => { 
    'worklet';
    Pulsar.Pulsar_play('BtnSubmit');
  },
  BtnToggleOff: () => { 
    'worklet';
    Pulsar.Pulsar_play('BtnToggleOff');
  },
  Buildup: () => { 
    'worklet';
    Pulsar.Pulsar_play('Buildup');
  },
  CameraShutter: () => { 
    'worklet';
    Pulsar.Pulsar_play('CameraShutter');
  },
  Cascade: () => { 
    'worklet';
    Pulsar.Pulsar_play('Cascade');
  },
  CleanStrike: () => { 
    'worklet';
    Pulsar.Pulsar_play('CleanStrike');
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
  DeepRumble: () => { 
    'worklet';
    Pulsar.Pulsar_play('DeepRumble');
  },
  DeepThud: () => { 
    'worklet';
    Pulsar.Pulsar_play('DeepThud');
  },
  DogBark: () => { 
    'worklet';
    Pulsar.Pulsar_play('DogBark');
  },
  DoubleBeat: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoubleBeat');
  },
  DoubleBlast: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoubleBlast');
  },
  DoubleBurst: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoubleBurst');
  },
  DoubleClick: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoubleClick');
  },
  DoubleGentleTap: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoubleGentleTap');
  },
  DoublePat: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoublePat');
  },
  DoublePulse: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoublePulse');
  },
  DoublePunch: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoublePunch');
  },
  DoubleStrike: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoubleStrike');
  },
  DoubleTap: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoubleTap');
  },
  DoubleThud: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoubleThud');
  },
  DoubleTriplet: () => { 
    'worklet';
    Pulsar.Pulsar_play('DoubleTriplet');
  },
  EngineRev: () => { 
    'worklet';
    Pulsar.Pulsar_play('EngineRev');
  },
  ErrorBuzz: () => { 
    'worklet';
    Pulsar.Pulsar_play('ErrorBuzz');
  },
  ErrorSoft: () => { 
    'worklet';
    Pulsar.Pulsar_play('ErrorSoft');
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
  FanfareShort: () => { 
    'worklet';
    Pulsar.Pulsar_play('FanfareShort');
  },
  FirmImpact: () => { 
    'worklet';
    Pulsar.Pulsar_play('FirmImpact');
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
  HappinessJoyful: () => { 
    'worklet';
    Pulsar.Pulsar_play('HappinessJoyful');
  },
  HappinessLight: () => { 
    'worklet';
    Pulsar.Pulsar_play('HappinessLight');
  },
  Heartbeat: () => { 
    'worklet';
    Pulsar.Pulsar_play('Heartbeat');
  },
  HeavyImpact: () => { 
    'worklet';
    Pulsar.Pulsar_play('HeavyImpact');
  },
  KeyboardMechanical: () => { 
    'worklet';
    Pulsar.Pulsar_play('KeyboardMechanical');
  },
  KeyboardMembrane: () => { 
    'worklet';
    Pulsar.Pulsar_play('KeyboardMembrane');
  },
  KeyboardTypewriterOld: () => { 
    'worklet';
    Pulsar.Pulsar_play('KeyboardTypewriterOld');
  },
  KnockDoor: () => { 
    'worklet';
    Pulsar.Pulsar_play('KnockDoor');
  },
  LevelUp: () => { 
    'worklet';
    Pulsar.Pulsar_play('LevelUp');
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
  MarioGameOver: () => { 
    'worklet';
    Pulsar.Pulsar_play('MarioGameOver');
  },
  MaxImpact: () => { 
    'worklet';
    Pulsar.Pulsar_play('MaxImpact');
  },
  MutedImpact: () => { 
    'worklet';
    Pulsar.Pulsar_play('MutedImpact');
  },
  NeutralClear: () => { 
    'worklet';
    Pulsar.Pulsar_play('NeutralClear');
  },
  NeutralSteady: () => { 
    'worklet';
    Pulsar.Pulsar_play('NeutralSteady');
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
  NotifyReminderSoft: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifyReminderSoft');
  },
  NotifySocialMention: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifySocialMention');
  },
  NotifySocialMessage: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifySocialMessage');
  },
  NotifySuccessSubtle: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifySuccessSubtle');
  },
  NotifyTimerDone: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifyTimerDone');
  },
  NotifyWarnMild: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifyWarnMild');
  },
  NotifyWarnModerate: () => { 
    'worklet';
    Pulsar.Pulsar_play('NotifyWarnModerate');
  },
  PassingCar: () => { 
    'worklet';
    Pulsar.Pulsar_play('PassingCar');
  },
  Pendulum: () => { 
    'worklet';
    Pulsar.Pulsar_play('Pendulum');
  },
  PowerDown: () => { 
    'worklet';
    Pulsar.Pulsar_play('PowerDown');
  },
  QuadBeat: () => { 
    'worklet';
    Pulsar.Pulsar_play('QuadBeat');
  },
  QuadRamp: () => { 
    'worklet';
    Pulsar.Pulsar_play('QuadRamp');
  },
  QuadThud: () => { 
    'worklet';
    Pulsar.Pulsar_play('QuadThud');
  },
  Rain: () => { 
    'worklet';
    Pulsar.Pulsar_play('Rain');
  },
  ReadySteadyGo: () => { 
    'worklet';
    Pulsar.Pulsar_play('ReadySteadyGo');
  },
  ReliefSigh: () => { 
    'worklet';
    Pulsar.Pulsar_play('ReliefSigh');
  },
  ReliefSoft: () => { 
    'worklet';
    Pulsar.Pulsar_play('ReliefSoft');
  },
  Ripple: () => { 
    'worklet';
    Pulsar.Pulsar_play('Ripple');
  },
  SadnessMelancholic: () => { 
    'worklet';
    Pulsar.Pulsar_play('SadnessMelancholic');
  },
  Searching: () => { 
    'worklet';
    Pulsar.Pulsar_play('Searching');
  },
  SearchSuccess: () => { 
    'worklet';
    Pulsar.Pulsar_play('SearchSuccess');
  },
  SelectionCrisp: () => { 
    'worklet';
    Pulsar.Pulsar_play('SelectionCrisp');
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
  SuccessFlourish: () => { 
    'worklet';
    Pulsar.Pulsar_play('SuccessFlourish');
  },
  SuccessGentle: () => { 
    'worklet';
    Pulsar.Pulsar_play('SuccessGentle');
  },
  SupportSteady: () => { 
    'worklet';
    Pulsar.Pulsar_play('SupportSteady');
  },
  SupportStrong: () => { 
    'worklet';
    Pulsar.Pulsar_play('SupportStrong');
  },
  SurpriseGasp: () => { 
    'worklet';
    Pulsar.Pulsar_play('SurpriseGasp');
  },
  Tada: () => { 
    'worklet';
    Pulsar.Pulsar_play('Tada');
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
  TideSwell: () => { 
    'worklet';
    Pulsar.Pulsar_play('TideSwell');
  },
  TripleBeat: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleBeat');
  },
  TripleClick: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleClick');
  },
  TripleDecay: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleDecay');
  },
  TripleDrum: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleDrum');
  },
  TripleEscalation: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleEscalation');
  },
  TripleFade: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleFade');
  },
  TripleGentleTap: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleGentleTap');
  },
  TripleKnock: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleKnock');
  },
  TriplePat: () => { 
    'worklet';
    Pulsar.Pulsar_play('TriplePat');
  },
  TriplePulse: () => { 
    'worklet';
    Pulsar.Pulsar_play('TriplePulse');
  },
  TripleStrike: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleStrike');
  },
  TripleSurge: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleSurge');
  },
  TripleTap: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleTap');
  },
  TripleThud: () => { 
    'worklet';
    Pulsar.Pulsar_play('TripleThud');
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
  WarningPulse: () => { 
    'worklet';
    Pulsar.Pulsar_play('WarningPulse');
  },
  WarningSoft: () => { 
    'worklet';
    Pulsar.Pulsar_play('WarningSoft');
  },
  WarningUrgent: () => { 
    'worklet';
    Pulsar.Pulsar_play('WarningUrgent');
  },
  Waterfall: () => { 
    'worklet';
    Pulsar.Pulsar_play('Waterfall');
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
