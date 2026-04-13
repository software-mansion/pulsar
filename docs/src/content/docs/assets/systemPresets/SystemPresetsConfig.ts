import type { PresetConfig } from '../../components/Preset/types';

// CODEGEN_BEGIN_{imports}
import IosSystemImpactHeavyPreset from './ios/SystemImpactHeavy.json';
import IosSystemImpactHeavyImage from './ios/SystemImpactHeavy.png';
import IosSystemImpactLightPreset from './ios/SystemImpactLight.json';
import IosSystemImpactLightImage from './ios/SystemImpactLight.png';
import IosSystemImpactMediumPreset from './ios/SystemImpactMedium.json';
import IosSystemImpactMediumImage from './ios/SystemImpactMedium.png';
import IosSystemImpactRigidPreset from './ios/SystemImpactRigid.json';
import IosSystemImpactRigidImage from './ios/SystemImpactRigid.png';
import IosSystemImpactSoftPreset from './ios/SystemImpactSoft.json';
import IosSystemImpactSoftImage from './ios/SystemImpactSoft.png';
import IosSystemNotificationErrorPreset from './ios/SystemNotificationError.json';
import IosSystemNotificationErrorImage from './ios/SystemNotificationError.png';
import IosSystemNotificationSuccessPreset from './ios/SystemNotificationSuccess.json';
import IosSystemNotificationSuccessImage from './ios/SystemNotificationSuccess.png';
import IosSystemNotificationWarningPreset from './ios/SystemNotificationWarning.json';
import IosSystemNotificationWarningImage from './ios/SystemNotificationWarning.png';
import IosSystemSelectionPreset from './ios/SystemSelection.json';
import IosSystemSelectionImage from './ios/SystemSelection.png';
import AndroidSystemCalendarDatePresetPreset from './android/SystemCalendarDatePreset.json';
import AndroidSystemCalendarDatePresetImage from './android/SystemCalendarDatePreset.png';
import AndroidSystemClockTickPresetPreset from './android/SystemClockTickPreset.json';
import AndroidSystemClockTickPresetImage from './android/SystemClockTickPreset.png';
import AndroidSystemConfirmPresetPreset from './android/SystemConfirmPreset.json';
import AndroidSystemConfirmPresetImage from './android/SystemConfirmPreset.png';
import AndroidSystemContextClickPresetPreset from './android/SystemContextClickPreset.json';
import AndroidSystemContextClickPresetImage from './android/SystemContextClickPreset.png';
import AndroidSystemDragCrossingPresetPreset from './android/SystemDragCrossingPreset.json';
import AndroidSystemDragCrossingPresetImage from './android/SystemDragCrossingPreset.png';
import AndroidSystemDragStartPresetPreset from './android/SystemDragStartPreset.json';
import AndroidSystemDragStartPresetImage from './android/SystemDragStartPreset.png';
import AndroidSystemEdgeReleasePresetPreset from './android/SystemEdgeReleasePreset.json';
import AndroidSystemEdgeReleasePresetImage from './android/SystemEdgeReleasePreset.png';
import AndroidSystemEdgeSqueezePresetPreset from './android/SystemEdgeSqueezePreset.json';
import AndroidSystemEdgeSqueezePresetImage from './android/SystemEdgeSqueezePreset.png';
import AndroidSystemEffectClickPresetPreset from './android/SystemEffectClickPreset.json';
import AndroidSystemEffectClickPresetImage from './android/SystemEffectClickPreset.png';
import AndroidSystemEffectDoubleClickPresetPreset from './android/SystemEffectDoubleClickPreset.json';
import AndroidSystemEffectDoubleClickPresetImage from './android/SystemEffectDoubleClickPreset.png';
import AndroidSystemEffectHeavyClickPresetPreset from './android/SystemEffectHeavyClickPreset.json';
import AndroidSystemEffectHeavyClickPresetImage from './android/SystemEffectHeavyClickPreset.png';
import AndroidSystemEffectTickPresetPreset from './android/SystemEffectTickPreset.json';
import AndroidSystemEffectTickPresetImage from './android/SystemEffectTickPreset.png';
import AndroidSystemGestureEndPresetPreset from './android/SystemGestureEndPreset.json';
import AndroidSystemGestureEndPresetImage from './android/SystemGestureEndPreset.png';
import AndroidSystemGestureStartPresetPreset from './android/SystemGestureStartPreset.json';
import AndroidSystemGestureStartPresetImage from './android/SystemGestureStartPreset.png';
import AndroidSystemImpactHeavyPreset from './android/SystemImpactHeavy.json';
import AndroidSystemImpactHeavyImage from './android/SystemImpactHeavy.png';
import AndroidSystemImpactLightPreset from './android/SystemImpactLight.json';
import AndroidSystemImpactLightImage from './android/SystemImpactLight.png';
import AndroidSystemImpactMediumPreset from './android/SystemImpactMedium.json';
import AndroidSystemImpactMediumImage from './android/SystemImpactMedium.png';
import AndroidSystemImpactRigidPreset from './android/SystemImpactRigid.json';
import AndroidSystemImpactRigidImage from './android/SystemImpactRigid.png';
import AndroidSystemImpactSoftPreset from './android/SystemImpactSoft.json';
import AndroidSystemImpactSoftImage from './android/SystemImpactSoft.png';
import AndroidSystemKeyboardPressPresetPreset from './android/SystemKeyboardPressPreset.json';
import AndroidSystemKeyboardPressPresetImage from './android/SystemKeyboardPressPreset.png';
import AndroidSystemKeyboardReleasePresetPreset from './android/SystemKeyboardReleasePreset.json';
import AndroidSystemKeyboardReleasePresetImage from './android/SystemKeyboardReleasePreset.png';
import AndroidSystemKeyboardTapPresetPreset from './android/SystemKeyboardTapPreset.json';
import AndroidSystemKeyboardTapPresetImage from './android/SystemKeyboardTapPreset.png';
import AndroidSystemLongPressPresetPreset from './android/SystemLongPressPreset.json';
import AndroidSystemLongPressPresetImage from './android/SystemLongPressPreset.png';
import AndroidSystemNotificationErrorPreset from './android/SystemNotificationError.json';
import AndroidSystemNotificationErrorImage from './android/SystemNotificationError.png';
import AndroidSystemNotificationSuccessPreset from './android/SystemNotificationSuccess.json';
import AndroidSystemNotificationSuccessImage from './android/SystemNotificationSuccess.png';
import AndroidSystemNotificationWarningPreset from './android/SystemNotificationWarning.json';
import AndroidSystemNotificationWarningImage from './android/SystemNotificationWarning.png';
import AndroidSystemPrimitiveClickPresetPreset from './android/SystemPrimitiveClickPreset.json';
import AndroidSystemPrimitiveClickPresetImage from './android/SystemPrimitiveClickPreset.png';
import AndroidSystemPrimitiveLowTickPresetPreset from './android/SystemPrimitiveLowTickPreset.json';
import AndroidSystemPrimitiveLowTickPresetImage from './android/SystemPrimitiveLowTickPreset.png';
import AndroidSystemPrimitiveQuickFallPresetPreset from './android/SystemPrimitiveQuickFallPreset.json';
import AndroidSystemPrimitiveQuickFallPresetImage from './android/SystemPrimitiveQuickFallPreset.png';
import AndroidSystemPrimitiveQuickRisePresetPreset from './android/SystemPrimitiveQuickRisePreset.json';
import AndroidSystemPrimitiveQuickRisePresetImage from './android/SystemPrimitiveQuickRisePreset.png';
import AndroidSystemPrimitiveSlowRisePresetPreset from './android/SystemPrimitiveSlowRisePreset.json';
import AndroidSystemPrimitiveSlowRisePresetImage from './android/SystemPrimitiveSlowRisePreset.png';
import AndroidSystemPrimitiveSpinPresetPreset from './android/SystemPrimitiveSpinPreset.json';
import AndroidSystemPrimitiveSpinPresetImage from './android/SystemPrimitiveSpinPreset.png';
import AndroidSystemPrimitiveThudPresetPreset from './android/SystemPrimitiveThudPreset.json';
import AndroidSystemPrimitiveThudPresetImage from './android/SystemPrimitiveThudPreset.png';
import AndroidSystemPrimitiveTickPresetPreset from './android/SystemPrimitiveTickPreset.json';
import AndroidSystemPrimitiveTickPresetImage from './android/SystemPrimitiveTickPreset.png';
import AndroidSystemReleasePresetPreset from './android/SystemReleasePreset.json';
import AndroidSystemReleasePresetImage from './android/SystemReleasePreset.png';
import AndroidSystemScrollItemFocusPresetPreset from './android/SystemScrollItemFocusPreset.json';
import AndroidSystemScrollItemFocusPresetImage from './android/SystemScrollItemFocusPreset.png';
import AndroidSystemScrollLimitPresetPreset from './android/SystemScrollLimitPreset.json';
import AndroidSystemScrollLimitPresetImage from './android/SystemScrollLimitPreset.png';
import AndroidSystemScrollTickPresetPreset from './android/SystemScrollTickPreset.json';
import AndroidSystemScrollTickPresetImage from './android/SystemScrollTickPreset.png';
import AndroidSystemSegmentFrequentTickPresetPreset from './android/SystemSegmentFrequentTickPreset.json';
import AndroidSystemSegmentFrequentTickPresetImage from './android/SystemSegmentFrequentTickPreset.png';
import AndroidSystemSegmentTickPresetPreset from './android/SystemSegmentTickPreset.json';
import AndroidSystemSegmentTickPresetImage from './android/SystemSegmentTickPreset.png';
import AndroidSystemSelectionPreset from './android/SystemSelection.json';
import AndroidSystemSelectionImage from './android/SystemSelection.png';
import AndroidSystemTextHandleMovePresetPreset from './android/SystemTextHandleMovePreset.json';
import AndroidSystemTextHandleMovePresetImage from './android/SystemTextHandleMovePreset.png';
import AndroidSystemToggleOffPresetPreset from './android/SystemToggleOffPreset.json';
import AndroidSystemToggleOffPresetImage from './android/SystemToggleOffPreset.png';
import AndroidSystemToggleOnPresetPreset from './android/SystemToggleOnPreset.json';
import AndroidSystemToggleOnPresetImage from './android/SystemToggleOnPreset.png';
import AndroidSystemVirtualKeyPresetPreset from './android/SystemVirtualKeyPreset.json';
import AndroidSystemVirtualKeyPresetImage from './android/SystemVirtualKeyPreset.png';
import AndroidSystemVirtualKeyReleasePresetPreset from './android/SystemVirtualKeyReleasePreset.json';
import AndroidSystemVirtualKeyReleasePresetImage from './android/SystemVirtualKeyReleasePreset.png';
// CODEGEN_END_{imports}

export const AndroidPresetsConfig: Array<PresetConfig> = [
// CODEGEN_BEGIN_{android_presets}
  { data: AndroidSystemCalendarDatePresetPreset, image: AndroidSystemCalendarDatePresetImage },
  { data: AndroidSystemClockTickPresetPreset, image: AndroidSystemClockTickPresetImage },
  { data: AndroidSystemConfirmPresetPreset, image: AndroidSystemConfirmPresetImage },
  { data: AndroidSystemContextClickPresetPreset, image: AndroidSystemContextClickPresetImage },
  { data: AndroidSystemDragCrossingPresetPreset, image: AndroidSystemDragCrossingPresetImage },
  { data: AndroidSystemDragStartPresetPreset, image: AndroidSystemDragStartPresetImage },
  { data: AndroidSystemEdgeReleasePresetPreset, image: AndroidSystemEdgeReleasePresetImage },
  { data: AndroidSystemEdgeSqueezePresetPreset, image: AndroidSystemEdgeSqueezePresetImage },
  { data: AndroidSystemEffectClickPresetPreset, image: AndroidSystemEffectClickPresetImage },
  { data: AndroidSystemEffectDoubleClickPresetPreset, image: AndroidSystemEffectDoubleClickPresetImage },
  { data: AndroidSystemEffectHeavyClickPresetPreset, image: AndroidSystemEffectHeavyClickPresetImage },
  { data: AndroidSystemEffectTickPresetPreset, image: AndroidSystemEffectTickPresetImage },
  { data: AndroidSystemGestureEndPresetPreset, image: AndroidSystemGestureEndPresetImage },
  { data: AndroidSystemGestureStartPresetPreset, image: AndroidSystemGestureStartPresetImage },
  { data: AndroidSystemImpactHeavyPreset, image: AndroidSystemImpactHeavyImage },
  { data: AndroidSystemImpactLightPreset, image: AndroidSystemImpactLightImage },
  { data: AndroidSystemImpactMediumPreset, image: AndroidSystemImpactMediumImage },
  { data: AndroidSystemImpactRigidPreset, image: AndroidSystemImpactRigidImage },
  { data: AndroidSystemImpactSoftPreset, image: AndroidSystemImpactSoftImage },
  { data: AndroidSystemKeyboardPressPresetPreset, image: AndroidSystemKeyboardPressPresetImage },
  { data: AndroidSystemKeyboardReleasePresetPreset, image: AndroidSystemKeyboardReleasePresetImage },
  { data: AndroidSystemKeyboardTapPresetPreset, image: AndroidSystemKeyboardTapPresetImage },
  { data: AndroidSystemLongPressPresetPreset, image: AndroidSystemLongPressPresetImage },
  { data: AndroidSystemNotificationErrorPreset, image: AndroidSystemNotificationErrorImage },
  { data: AndroidSystemNotificationSuccessPreset, image: AndroidSystemNotificationSuccessImage },
  { data: AndroidSystemNotificationWarningPreset, image: AndroidSystemNotificationWarningImage },
  { data: AndroidSystemPrimitiveClickPresetPreset, image: AndroidSystemPrimitiveClickPresetImage },
  { data: AndroidSystemPrimitiveLowTickPresetPreset, image: AndroidSystemPrimitiveLowTickPresetImage },
  { data: AndroidSystemPrimitiveQuickFallPresetPreset, image: AndroidSystemPrimitiveQuickFallPresetImage },
  { data: AndroidSystemPrimitiveQuickRisePresetPreset, image: AndroidSystemPrimitiveQuickRisePresetImage },
  { data: AndroidSystemPrimitiveSlowRisePresetPreset, image: AndroidSystemPrimitiveSlowRisePresetImage },
  { data: AndroidSystemPrimitiveSpinPresetPreset, image: AndroidSystemPrimitiveSpinPresetImage },
  { data: AndroidSystemPrimitiveThudPresetPreset, image: AndroidSystemPrimitiveThudPresetImage },
  { data: AndroidSystemPrimitiveTickPresetPreset, image: AndroidSystemPrimitiveTickPresetImage },
  { data: AndroidSystemReleasePresetPreset, image: AndroidSystemReleasePresetImage },
  { data: AndroidSystemScrollItemFocusPresetPreset, image: AndroidSystemScrollItemFocusPresetImage },
  { data: AndroidSystemScrollLimitPresetPreset, image: AndroidSystemScrollLimitPresetImage },
  { data: AndroidSystemScrollTickPresetPreset, image: AndroidSystemScrollTickPresetImage },
  { data: AndroidSystemSegmentFrequentTickPresetPreset, image: AndroidSystemSegmentFrequentTickPresetImage },
  { data: AndroidSystemSegmentTickPresetPreset, image: AndroidSystemSegmentTickPresetImage },
  { data: AndroidSystemSelectionPreset, image: AndroidSystemSelectionImage },
  { data: AndroidSystemTextHandleMovePresetPreset, image: AndroidSystemTextHandleMovePresetImage },
  { data: AndroidSystemToggleOffPresetPreset, image: AndroidSystemToggleOffPresetImage },
  { data: AndroidSystemToggleOnPresetPreset, image: AndroidSystemToggleOnPresetImage },
  { data: AndroidSystemVirtualKeyPresetPreset, image: AndroidSystemVirtualKeyPresetImage },
  { data: AndroidSystemVirtualKeyReleasePresetPreset, image: AndroidSystemVirtualKeyReleasePresetImage },
// CODEGEN_END_{android_presets}
];

export const IOSPresetsConfig: Array<PresetConfig> = [
// CODEGEN_BEGIN_{ios_presets}
  { data: IosSystemImpactHeavyPreset, image: IosSystemImpactHeavyImage },
  { data: IosSystemImpactLightPreset, image: IosSystemImpactLightImage },
  { data: IosSystemImpactMediumPreset, image: IosSystemImpactMediumImage },
  { data: IosSystemImpactRigidPreset, image: IosSystemImpactRigidImage },
  { data: IosSystemImpactSoftPreset, image: IosSystemImpactSoftImage },
  { data: IosSystemNotificationErrorPreset, image: IosSystemNotificationErrorImage },
  { data: IosSystemNotificationSuccessPreset, image: IosSystemNotificationSuccessImage },
  { data: IosSystemNotificationWarningPreset, image: IosSystemNotificationWarningImage },
  { data: IosSystemSelectionPreset, image: IosSystemSelectionImage },
// CODEGEN_END_{ios_presets}
];
