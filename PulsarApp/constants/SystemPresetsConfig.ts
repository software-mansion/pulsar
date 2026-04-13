import { Presets } from "react-native-pulsar";
import { PresetProps } from "./types";

// CODEGEN_BEGIN_{imports}
const IosSystemImpactHeavyImage = require('@/assets/systemPresets/ios/SystemImpactHeavy.png');
const IosSystemImpactLightImage = require('@/assets/systemPresets/ios/SystemImpactLight.png');
const IosSystemImpactMediumImage = require('@/assets/systemPresets/ios/SystemImpactMedium.png');
const IosSystemImpactRigidImage = require('@/assets/systemPresets/ios/SystemImpactRigid.png');
const IosSystemImpactSoftImage = require('@/assets/systemPresets/ios/SystemImpactSoft.png');
const IosSystemNotificationErrorImage = require('@/assets/systemPresets/ios/SystemNotificationError.png');
const IosSystemNotificationSuccessImage = require('@/assets/systemPresets/ios/SystemNotificationSuccess.png');
const IosSystemNotificationWarningImage = require('@/assets/systemPresets/ios/SystemNotificationWarning.png');
const IosSystemSelectionImage = require('@/assets/systemPresets/ios/SystemSelection.png');
const AndroidSystemCalendarDatePresetImage = require('@/assets/systemPresets/android/SystemCalendarDatePreset.png');
const AndroidSystemClockTickPresetImage = require('@/assets/systemPresets/android/SystemClockTickPreset.png');
const AndroidSystemConfirmPresetImage = require('@/assets/systemPresets/android/SystemConfirmPreset.png');
const AndroidSystemContextClickPresetImage = require('@/assets/systemPresets/android/SystemContextClickPreset.png');
const AndroidSystemDragCrossingPresetImage = require('@/assets/systemPresets/android/SystemDragCrossingPreset.png');
const AndroidSystemDragStartPresetImage = require('@/assets/systemPresets/android/SystemDragStartPreset.png');
const AndroidSystemEdgeReleasePresetImage = require('@/assets/systemPresets/android/SystemEdgeReleasePreset.png');
const AndroidSystemEdgeSqueezePresetImage = require('@/assets/systemPresets/android/SystemEdgeSqueezePreset.png');
const AndroidSystemEffectClickPresetImage = require('@/assets/systemPresets/android/SystemEffectClickPreset.png');
const AndroidSystemEffectDoubleClickPresetImage = require('@/assets/systemPresets/android/SystemEffectDoubleClickPreset.png');
const AndroidSystemEffectHeavyClickPresetImage = require('@/assets/systemPresets/android/SystemEffectHeavyClickPreset.png');
const AndroidSystemEffectTickPresetImage = require('@/assets/systemPresets/android/SystemEffectTickPreset.png');
const AndroidSystemGestureEndPresetImage = require('@/assets/systemPresets/android/SystemGestureEndPreset.png');
const AndroidSystemGestureStartPresetImage = require('@/assets/systemPresets/android/SystemGestureStartPreset.png');
const AndroidSystemImpactHeavyImage = require('@/assets/systemPresets/android/SystemImpactHeavy.png');
const AndroidSystemImpactLightImage = require('@/assets/systemPresets/android/SystemImpactLight.png');
const AndroidSystemImpactMediumImage = require('@/assets/systemPresets/android/SystemImpactMedium.png');
const AndroidSystemImpactRigidImage = require('@/assets/systemPresets/android/SystemImpactRigid.png');
const AndroidSystemImpactSoftImage = require('@/assets/systemPresets/android/SystemImpactSoft.png');
const AndroidSystemKeyboardPressPresetImage = require('@/assets/systemPresets/android/SystemKeyboardPressPreset.png');
const AndroidSystemKeyboardReleasePresetImage = require('@/assets/systemPresets/android/SystemKeyboardReleasePreset.png');
const AndroidSystemKeyboardTapPresetImage = require('@/assets/systemPresets/android/SystemKeyboardTapPreset.png');
const AndroidSystemLongPressPresetImage = require('@/assets/systemPresets/android/SystemLongPressPreset.png');
const AndroidSystemNotificationErrorImage = require('@/assets/systemPresets/android/SystemNotificationError.png');
const AndroidSystemNotificationSuccessImage = require('@/assets/systemPresets/android/SystemNotificationSuccess.png');
const AndroidSystemNotificationWarningImage = require('@/assets/systemPresets/android/SystemNotificationWarning.png');
const AndroidSystemPrimitiveClickPresetImage = require('@/assets/systemPresets/android/SystemPrimitiveClickPreset.png');
const AndroidSystemPrimitiveLowTickPresetImage = require('@/assets/systemPresets/android/SystemPrimitiveLowTickPreset.png');
const AndroidSystemPrimitiveQuickFallPresetImage = require('@/assets/systemPresets/android/SystemPrimitiveQuickFallPreset.png');
const AndroidSystemPrimitiveQuickRisePresetImage = require('@/assets/systemPresets/android/SystemPrimitiveQuickRisePreset.png');
const AndroidSystemPrimitiveSlowRisePresetImage = require('@/assets/systemPresets/android/SystemPrimitiveSlowRisePreset.png');
const AndroidSystemPrimitiveSpinPresetImage = require('@/assets/systemPresets/android/SystemPrimitiveSpinPreset.png');
const AndroidSystemPrimitiveThudPresetImage = require('@/assets/systemPresets/android/SystemPrimitiveThudPreset.png');
const AndroidSystemPrimitiveTickPresetImage = require('@/assets/systemPresets/android/SystemPrimitiveTickPreset.png');
const AndroidSystemReleasePresetImage = require('@/assets/systemPresets/android/SystemReleasePreset.png');
const AndroidSystemScrollItemFocusPresetImage = require('@/assets/systemPresets/android/SystemScrollItemFocusPreset.png');
const AndroidSystemScrollLimitPresetImage = require('@/assets/systemPresets/android/SystemScrollLimitPreset.png');
const AndroidSystemScrollTickPresetImage = require('@/assets/systemPresets/android/SystemScrollTickPreset.png');
const AndroidSystemSegmentFrequentTickPresetImage = require('@/assets/systemPresets/android/SystemSegmentFrequentTickPreset.png');
const AndroidSystemSegmentTickPresetImage = require('@/assets/systemPresets/android/SystemSegmentTickPreset.png');
const AndroidSystemSelectionImage = require('@/assets/systemPresets/android/SystemSelection.png');
const AndroidSystemTextHandleMovePresetImage = require('@/assets/systemPresets/android/SystemTextHandleMovePreset.png');
const AndroidSystemToggleOffPresetImage = require('@/assets/systemPresets/android/SystemToggleOffPreset.png');
const AndroidSystemToggleOnPresetImage = require('@/assets/systemPresets/android/SystemToggleOnPreset.png');
const AndroidSystemVirtualKeyPresetImage = require('@/assets/systemPresets/android/SystemVirtualKeyPreset.png');
const AndroidSystemVirtualKeyReleasePresetImage = require('@/assets/systemPresets/android/SystemVirtualKeyReleasePreset.png');
// CODEGEN_END_{imports}

export const AndroidPresetsConfig: Array<PresetProps> = [
// CODEGEN_BEGIN_{android_presets}
  {
    name: 'SystemCalendarDate',
    description: 'HapticFeedbackConstants.CALENDAR_DATE (Vendor-specific)',
    tags: ["System","Android","Vendor","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemCalendarDatePresetImage,
    play: Presets.System.Android.calendarDate,
  },
  {
    name: 'SystemClockTick',
    description: 'HapticFeedbackConstants.CLOCK_TICK (Vendor-specific)',
    tags: ["System","Android","Vendor","Gentle","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemClockTickPresetImage,
    play: Presets.System.Android.clockTick,
  },
  {
    name: 'SystemConfirm',
    description: 'HapticFeedbackConstants.CONFIRM (Vendor-specific)',
    tags: ["System","Android","Vendor","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemConfirmPresetImage,
    play: Presets.System.Android.confirm,
  },
  {
    name: 'SystemContextClick',
    description: 'HapticFeedbackConstants.CONTEXT_CLICK (Vendor-specific)',
    tags: ["System","Android","Vendor","Gentle","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemContextClickPresetImage,
    play: Presets.System.Android.contextClick,
  },
  {
    name: 'SystemDragCrossing',
    description: 'HapticFeedbackConstants.DRAG_CROSSING (Vendor-specific)',
    tags: ["System","Android","Vendor","Gentle","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemDragCrossingPresetImage,
    play: Presets.System.Android.dragCrossing,
  },
  {
    name: 'SystemDragStart',
    description: 'HapticFeedbackConstants.DRAG_START (Vendor-specific)',
    tags: ["System","Android","Vendor","Bold","Flexible","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemDragStartPresetImage,
    play: Presets.System.Android.dragStart,
  },
  {
    name: 'SystemEdgeRelease',
    description: 'HapticFeedbackConstants.EDGE_RELEASE (Vendor-specific)',
    tags: ["System","Android","Vendor","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemEdgeReleasePresetImage,
    play: Presets.System.Android.edgeRelease,
  },
  {
    name: 'SystemEdgeSqueeze',
    description: 'HapticFeedbackConstants.EDGE_SQUEEZE (Vendor-specific)',
    tags: ["System","Android","Vendor","Bold","Flexible","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemEdgeSqueezePresetImage,
    play: Presets.System.Android.edgeSqueeze,
  },
  {
    name: 'SystemEffectClick',
    description: 'VibrationEffect.EFFECT_CLICK',
    tags: ["System","Android","Effect","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemEffectClickPresetImage,
    play: Presets.System.Android.effectClick,
  },
  {
    name: 'SystemEffectDoubleClick',
    description: 'VibrationEffect.EFFECT_DOUBLE_CLICK',
    tags: ["System","Android","Effect","Bold","Flexible","Impulses","Short"],
    duration: 170,
    image: AndroidSystemEffectDoubleClickPresetImage,
    play: Presets.System.Android.effectDoubleClick,
  },
  {
    name: 'SystemEffectHeavyClick',
    description: 'VibrationEffect.EFFECT_HEAVY_CLICK',
    tags: ["System","Android","Effect","Bold","Flexible","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemEffectHeavyClickPresetImage,
    play: Presets.System.Android.effectHeavyClick,
  },
  {
    name: 'SystemEffectTick',
    description: 'VibrationEffect.EFFECT_TICK',
    tags: ["System","Android","Effect","Gentle","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemEffectTickPresetImage,
    play: Presets.System.Android.effectTick,
  },
  {
    name: 'SystemGestureEnd',
    description: 'HapticFeedbackConstants.GESTURE_END (Vendor-specific)',
    tags: ["System","Android","Vendor","Gentle","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemGestureEndPresetImage,
    play: Presets.System.Android.gestureEnd,
  },
  {
    name: 'SystemGestureStart',
    description: 'HapticFeedbackConstants.GESTURE_START (Vendor-specific)',
    tags: ["System","Android","Vendor","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemGestureStartPresetImage,
    play: Presets.System.Android.gestureStart,
  },
  {
    name: 'SystemImpactHeavy',
    description: 'Fallback implementation of iOS UIImpactFeedbackGenerator.heavy preset.',
    tags: ["iOS Fallback","Bold","Soft","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemImpactHeavyImage,
    play: Presets.System.impactHeavy,
  },
  {
    name: 'SystemImpactLight',
    description: 'Fallback implementation of iOS UIImpactFeedbackGenerator.light preset.',
    tags: ["iOS Fallback","Gentle","Soft","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemImpactLightImage,
    play: Presets.System.impactLight,
  },
  {
    name: 'SystemImpactMedium',
    description: 'Fallback implementation of iOS UIImpactFeedbackGenerator.medium preset.',
    tags: ["iOS Fallback","Substantial","Flexible","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemImpactMediumImage,
    play: Presets.System.impactMedium,
  },
  {
    name: 'SystemImpactRigid',
    description: 'Fallback implementation of iOS UIImpactFeedbackGenerator.rigid preset.',
    tags: ["iOS Fallback","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemImpactRigidImage,
    play: Presets.System.impactRigid,
  },
  {
    name: 'SystemImpactSoft',
    description: 'Fallback implementation of iOS UIImpactFeedbackGenerator.soft preset.',
    tags: ["iOS Fallback","Gentle","Soft","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemImpactSoftImage,
    play: Presets.System.impactSoft,
  },
  {
    name: 'SystemKeyboardPress',
    description: 'HapticFeedbackConstants.KEYBOARD_PRESS (Vendor-specific)',
    tags: ["System","Android","Vendor","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemKeyboardPressPresetImage,
    play: Presets.System.Android.keyboardPress,
  },
  {
    name: 'SystemKeyboardRelease',
    description: 'HapticFeedbackConstants.KEYBOARD_RELEASE (Vendor-specific)',
    tags: ["System","Android","Vendor","Gentle","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemKeyboardReleasePresetImage,
    play: Presets.System.Android.keyboardRelease,
  },
  {
    name: 'SystemKeyboardTap',
    description: 'HapticFeedbackConstants.KEYBOARD_TAP (Vendor-specific)',
    tags: ["System","Android","Vendor","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemKeyboardTapPresetImage,
    play: Presets.System.Android.keyboardTap,
  },
  {
    name: 'SystemLongPress',
    description: 'HapticFeedbackConstants.LONG_PRESS (Vendor-specific)',
    tags: ["System","Android","Vendor","Bold","Flexible","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemLongPressPresetImage,
    play: Presets.System.Android.longPress,
  },
  {
    name: 'SystemNotificationError',
    description: 'Fallback implementation of iOS UINotificationFeedbackGenerator.error preset.',
    tags: ["iOS Fallback","Substantial","Elastic","Impulses","Extended"],
    duration: 250,
    image: AndroidSystemNotificationErrorImage,
    play: Presets.System.notificationError,
  },
  {
    name: 'SystemNotificationSuccess',
    description: 'Fallback implementation of iOS UINotificationFeedbackGenerator.success preset.',
    tags: ["iOS Fallback","Substantial","Rigid","Impulses","Impulse"],
    duration: 160,
    image: AndroidSystemNotificationSuccessImage,
    play: Presets.System.notificationSuccess,
  },
  {
    name: 'SystemNotificationWarning',
    description: 'Fallback implementation of iOS UINotificationFeedbackGenerator.warning preset.',
    tags: ["iOS Fallback","Substantial","Rigid","Impulses","Impulse"],
    duration: 160,
    image: AndroidSystemNotificationWarningImage,
    play: Presets.System.notificationWarning,
  },
  {
    name: 'SystemPrimitiveClick',
    description: 'VibrationEffect.Composition.PRIMITIVE_CLICK',
    tags: ["System","Android","Primitive","Substantial","Rigid","Impulses","Impulse"],
    duration: 12,
    image: AndroidSystemPrimitiveClickPresetImage,
    play: Presets.System.Android.primitiveClick,
  },
  {
    name: 'SystemPrimitiveLowTick',
    description: 'VibrationEffect.Composition.PRIMITIVE_LOW_TICK',
    tags: ["System","Android","Primitive","Gentle","Flexible","Impulses","Impulse"],
    duration: 12,
    image: AndroidSystemPrimitiveLowTickPresetImage,
    play: Presets.System.Android.primitiveLowTick,
  },
  {
    name: 'SystemPrimitiveQuickFall',
    description: 'VibrationEffect.Composition.PRIMITIVE_QUICK_FALL',
    tags: ["System","Android","Primitive","Substantial","Rigid","Impulses","Impulse"],
    duration: 100,
    image: AndroidSystemPrimitiveQuickFallPresetImage,
    play: Presets.System.Android.primitiveQuickFall,
  },
  {
    name: 'SystemPrimitiveQuickRise',
    description: 'VibrationEffect.Composition.PRIMITIVE_QUICK_RISE',
    tags: ["System","Android","Primitive","Substantial","Flexible","Impulses","Impulse"],
    duration: 155,
    image: AndroidSystemPrimitiveQuickRisePresetImage,
    play: Presets.System.Android.primitiveQuickRise,
  },
  {
    name: 'SystemPrimitiveSlowRise',
    description: 'VibrationEffect.Composition.PRIMITIVE_SLOW_RISE',
    tags: ["System","Android","Primitive","Gentle","Flexible","Impulses","Short"],
    duration: 505,
    image: AndroidSystemPrimitiveSlowRisePresetImage,
    play: Presets.System.Android.primitiveSlowRise,
  },
  {
    name: 'SystemPrimitiveSpin',
    description: 'VibrationEffect.Composition.PRIMITIVE_SPIN',
    tags: ["System","Android","Primitive","Gentle","Flexible","Impulses","Short"],
    duration: 150,
    image: AndroidSystemPrimitiveSpinPresetImage,
    play: Presets.System.Android.primitiveSpin,
  },
  {
    name: 'SystemPrimitiveThud',
    description: 'VibrationEffect.Composition.PRIMITIVE_THUD',
    tags: ["System","Android","Primitive","Bold","Flexible","Impulses","Impulse"],
    duration: 300,
    image: AndroidSystemPrimitiveThudPresetImage,
    play: Presets.System.Android.primitiveThud,
  },
  {
    name: 'SystemPrimitiveTick',
    description: 'VibrationEffect.Composition.PRIMITIVE_TICK',
    tags: ["System","Android","Primitive","Gentle","Rigid","Impulses","Impulse"],
    duration: 5,
    image: AndroidSystemPrimitiveTickPresetImage,
    play: Presets.System.Android.primitiveTick,
  },
  {
    name: 'SystemRelease',
    description: 'HapticFeedbackConstants.REJECT (Vendor-specific)',
    tags: ["System","Android","Vendor","Bold","Flexible","Impulses","Short"],
    duration: 170,
    image: AndroidSystemReleasePresetImage,
    play: Presets.System.Android.release,
  },
  {
    name: 'SystemScrollItemFocus',
    description: 'HapticFeedbackConstants.SCROLL_ITEM_FOCUS (Vendor-specific)',
    tags: ["System","Android","Vendor","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemScrollItemFocusPresetImage,
    play: Presets.System.Android.scrollItemFocus,
  },
  {
    name: 'SystemScrollLimit',
    description: 'HapticFeedbackConstants.SCROLL_LIMIT (Vendor-specific)',
    tags: ["System","Android","Vendor","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemScrollLimitPresetImage,
    play: Presets.System.Android.scrollLimit,
  },
  {
    name: 'SystemScrollTick',
    description: 'HapticFeedbackConstants.SCROLL_TICK (Vendor-specific)',
    tags: ["System","Android","Vendor","Gentle","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemScrollTickPresetImage,
    play: Presets.System.Android.scrollTick,
  },
  {
    name: 'SystemSegmentFrequentTick',
    description: 'HapticFeedbackConstants.SEGMENT_FREQUENT_TICK (Vendor-specific)',
    tags: ["System","Android","Vendor","Gentle","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemSegmentFrequentTickPresetImage,
    play: Presets.System.Android.segmentFrequentTick,
  },
  {
    name: 'SystemSegmentTick',
    description: 'HapticFeedbackConstants.SEGMENT_TICK (Vendor-specific)',
    tags: ["System","Android","Vendor","Gentle","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemSegmentTickPresetImage,
    play: Presets.System.Android.segmentTick,
  },
  {
    name: 'SystemSelection',
    description: 'Fallback implementation of iOS UISelectionFeedbackGenerator.selection preset.',
    tags: ["iOS Fallback","Gentle","Flexible","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemSelectionImage,
    play: Presets.System.selection,
  },
  {
    name: 'SystemTextHandleMove',
    description: 'HapticFeedbackConstants.TEXT_HANDLE_MOVE (Vendor-specific)',
    tags: ["System","Android","Vendor","Gentle","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemTextHandleMovePresetImage,
    play: Presets.System.Android.textHandleMove,
  },
  {
    name: 'SystemToggleOff',
    description: 'HapticFeedbackConstants.TOGGLE_OFF (Vendor-specific)',
    tags: ["System","Android","Vendor","Gentle","Flexible","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemToggleOffPresetImage,
    play: Presets.System.Android.toggleOff,
  },
  {
    name: 'SystemToggleOn',
    description: 'HapticFeedbackConstants.TOGGLE_ON (Vendor-specific)',
    tags: ["System","Android","Vendor","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemToggleOnPresetImage,
    play: Presets.System.Android.toggleOn,
  },
  {
    name: 'SystemVirtualKey',
    description: 'HapticFeedbackConstants.VIRTUAL_KEY (Vendor-specific)',
    tags: ["System","Android","Vendor","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemVirtualKeyPresetImage,
    play: Presets.System.Android.virtualKey,
  },
  {
    name: 'SystemVirtualKeyRelease',
    description: 'HapticFeedbackConstants.VIRTUAL_KEY_RELEASE (Vendor-specific)',
    tags: ["System","Android","Vendor","Gentle","Rigid","Impulses","Impulse"],
    duration: 50,
    image: AndroidSystemVirtualKeyReleasePresetImage,
    play: Presets.System.Android.virtualKeyRelease,
  },
// CODEGEN_END_{android_presets}
];

export const IOSPresetsConfig: Array<PresetProps> = [
// CODEGEN_BEGIN_{ios_presets}
  {
    name: 'SystemImpactHeavy',
    description: 'UIImpactFeedbackGenerator.heavy',
    tags: ["System","Bold","Soft","Impulses","Impulse"],
    duration: 50,
    image: IosSystemImpactHeavyImage,
    play: Presets.System.impactHeavy,
  },
  {
    name: 'SystemImpactLight',
    description: 'UIImpactFeedbackGenerator.light',
    tags: ["System","Gentle","Soft","Impulses","Impulse"],
    duration: 50,
    image: IosSystemImpactLightImage,
    play: Presets.System.impactLight,
  },
  {
    name: 'SystemImpactMedium',
    description: 'UIImpactFeedbackGenerator.medium',
    tags: ["System","Substantial","Flexible","Impulses","Impulse"],
    duration: 50,
    image: IosSystemImpactMediumImage,
    play: Presets.System.impactMedium,
  },
  {
    name: 'SystemImpactRigid',
    description: 'UIImpactFeedbackGenerator.rigid',
    tags: ["System","Substantial","Rigid","Impulses","Impulse"],
    duration: 50,
    image: IosSystemImpactRigidImage,
    play: Presets.System.impactRigid,
  },
  {
    name: 'SystemImpactSoft',
    description: 'UIImpactFeedbackGenerator.soft',
    tags: ["System","Gentle","Soft","Impulses","Impulse"],
    duration: 50,
    image: IosSystemImpactSoftImage,
    play: Presets.System.impactSoft,
  },
  {
    name: 'SystemNotificationError',
    description: 'UINotificationFeedbackGenerator.error',
    tags: ["System","Substantial","Elastic","Impulses","Extended"],
    duration: 250,
    image: IosSystemNotificationErrorImage,
    play: Presets.System.notificationError,
  },
  {
    name: 'SystemNotificationSuccess',
    description: 'UINotificationFeedbackGenerator.success',
    tags: ["System","Substantial","Rigid","Impulses","Impulse"],
    duration: 160,
    image: IosSystemNotificationSuccessImage,
    play: Presets.System.notificationSuccess,
  },
  {
    name: 'SystemNotificationWarning',
    description: 'UINotificationFeedbackGenerator.warning',
    tags: ["System","Substantial","Rigid","Impulses","Impulse"],
    duration: 160,
    image: IosSystemNotificationWarningImage,
    play: Presets.System.notificationWarning,
  },
  {
    name: 'SystemSelection',
    description: 'UISelectionFeedbackGenerator.selection',
    tags: ["System","Gentle","Flexible","Impulses","Impulse"],
    duration: 50,
    image: IosSystemSelectionImage,
    play: Presets.System.selection,
  },
// CODEGEN_END_{ios_presets}
];
