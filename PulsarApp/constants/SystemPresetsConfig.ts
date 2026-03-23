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
const AndroidSystemDoubleClickPresetImage = require('@/assets/systemPresets/android/SystemDoubleClickPreset.png');
const AndroidSystemDragCrossingPresetImage = require('@/assets/systemPresets/android/SystemDragCrossingPreset.png');
const AndroidSystemDragStartPresetImage = require('@/assets/systemPresets/android/SystemDragStartPreset.png');
const AndroidSystemEdgeReleasePresetImage = require('@/assets/systemPresets/android/SystemEdgeReleasePreset.png');
const AndroidSystemEdgeSqueezePresetImage = require('@/assets/systemPresets/android/SystemEdgeSqueezePreset.png');
const AndroidSystemEffectClickPresetImage = require('@/assets/systemPresets/android/SystemEffectClickPreset.png');
const AndroidSystemGestureEndPresetImage = require('@/assets/systemPresets/android/SystemGestureEndPreset.png');
const AndroidSystemGestureStartPresetImage = require('@/assets/systemPresets/android/SystemGestureStartPreset.png');
const AndroidSystemHeavyClickPresetImage = require('@/assets/systemPresets/android/SystemHeavyClickPreset.png');
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
const AndroidSystemReleasePresetImage = require('@/assets/systemPresets/android/SystemReleasePreset.png');
const AndroidSystemScrollItemFocusPresetImage = require('@/assets/systemPresets/android/SystemScrollItemFocusPreset.png');
const AndroidSystemScrollLimitPresetImage = require('@/assets/systemPresets/android/SystemScrollLimitPreset.png');
const AndroidSystemScrollTickPresetImage = require('@/assets/systemPresets/android/SystemScrollTickPreset.png');
const AndroidSystemSegmentFrequentTickPresetImage = require('@/assets/systemPresets/android/SystemSegmentFrequentTickPreset.png');
const AndroidSystemSegmentTickPresetImage = require('@/assets/systemPresets/android/SystemSegmentTickPreset.png');
const AndroidSystemSelectionImage = require('@/assets/systemPresets/android/SystemSelection.png');
const AndroidSystemTextHandleMovePresetImage = require('@/assets/systemPresets/android/SystemTextHandleMovePreset.png');
const AndroidSystemTickPresetImage = require('@/assets/systemPresets/android/SystemTickPreset.png');
const AndroidSystemToggleOffPresetImage = require('@/assets/systemPresets/android/SystemToggleOffPreset.png');
const AndroidSystemToggleOnPresetImage = require('@/assets/systemPresets/android/SystemToggleOnPreset.png');
const AndroidSystemVirtualKeyPresetImage = require('@/assets/systemPresets/android/SystemVirtualKeyPreset.png');
const AndroidSystemVirtualKeyReleasePresetImage = require('@/assets/systemPresets/android/SystemVirtualKeyReleasePreset.png');
// CODEGEN_END_{imports}

export const AndroidPresetsConfig: Array<PresetProps> = [
// CODEGEN_BEGIN_{android_presets}
  {
    name: 'SystemCalendarDatePreset',
    description: 'A calendar date selection feedback using HapticFeedbackConstants.CALENDAR_DATE. Gentle feedback when scrolling through or selecting calendar dates.',
    tags: ["System","Selection","Gentle"],
    duration: 50,
    image: AndroidSystemCalendarDatePresetImage,
    play: Presets.System.Android.SystemCalendarDatePreset,
  },
  {
    name: 'SystemClockTickPreset',
    description: 'A clock tick feedback using HapticFeedbackConstants.CLOCK_TICK. Very light, precise tick for time pickers or other rhythmic interactions.',
    tags: ["System","Tick","Gentle"],
    duration: 50,
    image: AndroidSystemClockTickPresetImage,
    play: Presets.System.Android.SystemClockTickPreset,
  },
  {
    name: 'SystemConfirmPreset',
    description: 'A confirm feedback using HapticFeedbackConstants.CONFIRM (API 30+). Two-pulse pattern that communicates successful confirmation of an action.',
    tags: ["System","Confirm","Bumps"],
    duration: 170,
    image: AndroidSystemConfirmPresetImage,
    play: Presets.System.Android.SystemConfirmPreset,
  },
  {
    name: 'SystemContextClickPreset',
    description: 'A context click feedback using HapticFeedbackConstants.CONTEXT_CLICK. Feedback for mouse-like secondary button interactions on compatible devices.',
    tags: ["System","Click","Context"],
    duration: 50,
    image: AndroidSystemContextClickPresetImage,
    play: Presets.System.Android.SystemContextClickPreset,
  },
  {
    name: 'SystemDoubleClickPreset',
    description: 'A double-click effect using VibrationEffect.EFFECT_DOUBLE_CLICK. Two rapid pulses indicating a double-tap or confirmation action.',
    tags: ["System","Click","Double","Bumps"],
    duration: 170,
    image: AndroidSystemDoubleClickPresetImage,
    play: Presets.System.Android.SystemDoubleClickPreset,
  },
  {
    name: 'SystemDragCrossingPreset',
    description: 'A drag crossing feedback using HapticFeedbackConstants.DRAG_CROSSING. Feedback when a dragged item crosses over another element.',
    tags: ["System","Drag","Click"],
    duration: 50,
    image: AndroidSystemDragCrossingPresetImage,
    play: Presets.System.Android.SystemDragCrossingPreset,
  },
  {
    name: 'SystemDragStartPreset',
    description: 'A drag start feedback using HapticFeedbackConstants.DRAG_START (API 34+). Confirms that a drag operation has been initiated.',
    tags: ["System","Drag","Impact"],
    duration: 50,
    image: AndroidSystemDragStartPresetImage,
    play: Presets.System.Android.SystemDragStartPreset,
  },
  {
    name: 'SystemEdgeReleasePreset',
    description: 'An edge release feedback using HapticFeedbackConstants.EDGE_RELEASE. Moderate feedback when releasing a squeezed device edge.',
    tags: ["System","Edge","Release"],
    duration: 50,
    image: AndroidSystemEdgeReleasePresetImage,
    play: Presets.System.Android.SystemEdgeReleasePreset,
  },
  {
    name: 'SystemEdgeSqueezePreset',
    description: 'An edge squeeze feedback using HapticFeedbackConstants.EDGE_SQUEEZE. Strong, low-frequency feedback when squeezing the device edge.',
    tags: ["System","Edge","Impact","Bold"],
    duration: 50,
    image: AndroidSystemEdgeSqueezePresetImage,
    play: Presets.System.Android.SystemEdgeSqueezePreset,
  },
  {
    name: 'SystemEffectClickPreset',
    description: 'A standard click effect using VibrationEffect.EFFECT_CLICK. Represents a typical UI tap or button press feedback.',
    tags: ["System","Click","Impact"],
    duration: 50,
    image: AndroidSystemEffectClickPresetImage,
    play: Presets.System.Android.SystemEffectClickPreset,
  },
  {
    name: 'SystemGestureEndPreset',
    description: 'A gesture end feedback using HapticFeedbackConstants.GESTURE_END (API 30+). Signals the completion of a gesture interaction.',
    tags: ["System","Gesture","Impact"],
    duration: 50,
    image: AndroidSystemGestureEndPresetImage,
    play: Presets.System.Android.SystemGestureEndPreset,
  },
  {
    name: 'SystemGestureStartPreset',
    description: 'A gesture start feedback using HapticFeedbackConstants.GESTURE_START (API 30+). Signals the beginning of a gesture interaction.',
    tags: ["System","Gesture","Impact"],
    duration: 50,
    image: AndroidSystemGestureStartPresetImage,
    play: Presets.System.Android.SystemGestureStartPreset,
  },
  {
    name: 'SystemHeavyClickPreset',
    description: 'A heavy click effect using VibrationEffect.EFFECT_HEAVY_CLICK. Strong, mid-frequency feedback for significant UI interactions.',
    tags: ["System","Click","Heavy","Bold"],
    duration: 50,
    image: AndroidSystemHeavyClickPresetImage,
    play: Presets.System.Android.SystemHeavyClickPreset,
  },
  {
    name: 'SystemImpactHeavy',
    description: 'A strong, low-frequency impact feedback using UIImpactFeedbackGenerator with .heavy style. Best for significant actions requiring bold confirmation. This is a compatibility fallback implementation based on the iOS preset, used on Android when no native equivalent is available.',
    tags: ["System","Impact","Heavy","Bold","Fallback"],
    duration: 50,
    image: AndroidSystemImpactHeavyImage,
    play: Presets.System.SystemImpactHeavy,
  },
  {
    name: 'SystemImpactLight',
    description: 'A light, subtle impact feedback using UIImpactFeedbackGenerator with .light style. Ideal for minor interactions that need gentle confirmation. This is a compatibility fallback implementation based on the iOS preset, used on Android when no native equivalent is available.',
    tags: ["System","Impact","Light","Fallback"],
    duration: 50,
    image: AndroidSystemImpactLightImage,
    play: Presets.System.SystemImpactLight,
  },
  {
    name: 'SystemImpactMedium',
    description: 'A medium-strength impact feedback using UIImpactFeedbackGenerator with .medium style. Suitable for standard taps and button presses. This is a compatibility fallback implementation based on the iOS preset, used on Android when no native equivalent is available.',
    tags: ["System","Impact","Medium","Fallback"],
    duration: 50,
    image: AndroidSystemImpactMediumImage,
    play: Presets.System.SystemImpactMedium,
  },
  {
    name: 'SystemImpactRigid',
    description: 'A sharp, high-frequency impact feedback using UIImpactFeedbackGenerator with .rigid style. Ideal for snappy, precise interactions like toggling or locking. This is a compatibility fallback implementation based on the iOS preset, used on Android when no native equivalent is available.',
    tags: ["System","Impact","Rigid","Sharp","Fallback"],
    duration: 50,
    image: AndroidSystemImpactRigidImage,
    play: Presets.System.SystemImpactRigid,
  },
  {
    name: 'SystemImpactSoft',
    description: 'A very soft, low-frequency impact feedback using UIImpactFeedbackGenerator with .soft style. Great for gentle, non-intrusive interactions. This is a compatibility fallback implementation based on the iOS preset, used on Android when no native equivalent is available.',
    tags: ["System","Impact","Soft","Gentle","Fallback"],
    duration: 50,
    image: AndroidSystemImpactSoftImage,
    play: Presets.System.SystemImpactSoft,
  },
  {
    name: 'SystemKeyboardPressPreset',
    description: 'A keyboard key press feedback using HapticFeedbackConstants.KEYBOARD_PRESS (API 27+). Feedback for pressing down on a virtual key.',
    tags: ["System","Keyboard","Press"],
    duration: 50,
    image: AndroidSystemKeyboardPressPresetImage,
    play: Presets.System.Android.SystemKeyboardPressPreset,
  },
  {
    name: 'SystemKeyboardReleasePreset',
    description: 'A keyboard key release feedback using HapticFeedbackConstants.KEYBOARD_RELEASE (API 27+). Softer feedback for releasing a virtual key.',
    tags: ["System","Keyboard","Release"],
    duration: 50,
    image: AndroidSystemKeyboardReleasePresetImage,
    play: Presets.System.Android.SystemKeyboardReleasePreset,
  },
  {
    name: 'SystemKeyboardTapPreset',
    description: 'A keyboard tap feedback using HapticFeedbackConstants.KEYBOARD_TAP. Light, crisp feedback for each key tap on a virtual keyboard.',
    tags: ["System","Keyboard","Tap"],
    duration: 50,
    image: AndroidSystemKeyboardTapPresetImage,
    play: Presets.System.Android.SystemKeyboardTapPreset,
  },
  {
    name: 'SystemLongPressPreset',
    description: 'A long press feedback using HapticFeedbackConstants.LONG_PRESS. Confirms a long-press gesture has been recognized.',
    tags: ["System","LongPress","Impact"],
    duration: 50,
    image: AndroidSystemLongPressPresetImage,
    play: Presets.System.Android.SystemLongPressPreset,
  },
  {
    name: 'SystemNotificationError',
    description: 'A three-pulse error notification feedback using UINotificationFeedbackGenerator. Signals a failed action or error state to the user. This is a compatibility fallback implementation based on the iOS preset, used on Android when no native equivalent is available.',
    tags: ["System","Notification","Error","Bumps","Bold","Fallback"],
    duration: 250,
    image: AndroidSystemNotificationErrorImage,
    play: Presets.System.SystemNotificationError,
  },
  {
    name: 'SystemNotificationSuccess',
    description: 'A two-pulse success notification feedback using UINotificationFeedbackGenerator. Communicates successful completion of an action. This is a compatibility fallback implementation based on the iOS preset, used on Android when no native equivalent is available.',
    tags: ["System","Notification","Success","Bumps","Fallback"],
    duration: 160,
    image: AndroidSystemNotificationSuccessImage,
    play: Presets.System.SystemNotificationSuccess,
  },
  {
    name: 'SystemNotificationWarning',
    description: 'A three-pulse warning notification feedback using UINotificationFeedbackGenerator. Alerts the user to a situation requiring attention. This is a compatibility fallback implementation based on the iOS preset, used on Android when no native equivalent is available.',
    tags: ["System","Notification","Warning","Bumps","Fallback"],
    duration: 290,
    image: AndroidSystemNotificationWarningImage,
    play: Presets.System.SystemNotificationWarning,
  },
  {
    name: 'SystemReleasePreset',
    description: 'A reject/release feedback using HapticFeedbackConstants.REJECT (API 30+). Two-pulse low-frequency pattern indicating a rejected or released action.',
    tags: ["System","Reject","Bumps","Bold"],
    duration: 180,
    image: AndroidSystemReleasePresetImage,
    play: Presets.System.Android.SystemReleasePreset,
  },
  {
    name: 'SystemScrollItemFocusPreset',
    description: 'A scroll item focus feedback using HapticFeedbackConstants.SCROLL_ITEM_FOCUS. Subtle feedback when a scroll item snaps into the focused position.',
    tags: ["System","Scroll","Selection"],
    duration: 50,
    image: AndroidSystemScrollItemFocusPresetImage,
    play: Presets.System.Android.SystemScrollItemFocusPreset,
  },
  {
    name: 'SystemScrollLimitPreset',
    description: 'A scroll limit feedback using HapticFeedbackConstants.SCROLL_LIMIT. Notifies the user they have reached the end of a scrollable content area.',
    tags: ["System","Scroll","Limit","Impact"],
    duration: 50,
    image: AndroidSystemScrollLimitPresetImage,
    play: Presets.System.Android.SystemScrollLimitPreset,
  },
  {
    name: 'SystemScrollTickPreset',
    description: 'A scroll tick feedback using HapticFeedbackConstants.SCROLL_TICK. Very light, high-frequency feedback for each incremental scroll step.',
    tags: ["System","Scroll","Tick","Gentle"],
    duration: 50,
    image: AndroidSystemScrollTickPresetImage,
    play: Presets.System.Android.SystemScrollTickPreset,
  },
  {
    name: 'SystemSegmentFrequentTickPreset',
    description: 'A frequent segment tick feedback using HapticFeedbackConstants.SEGMENT_FREQUENT_TICK (API 34+). Very light, crisp tick for rapid segment value changes.',
    tags: ["System","Segment","Tick","Gentle"],
    duration: 50,
    image: AndroidSystemSegmentFrequentTickPresetImage,
    play: Presets.System.Android.SystemSegmentFrequentTickPreset,
  },
  {
    name: 'SystemSegmentTickPreset',
    description: 'A segment tick feedback using HapticFeedbackConstants.SEGMENT_TICK (API 34+). Subtle high-frequency tick for stepping through segmented control values.',
    tags: ["System","Segment","Tick","Gentle"],
    duration: 50,
    image: AndroidSystemSegmentTickPresetImage,
    play: Presets.System.Android.SystemSegmentTickPreset,
  },
  {
    name: 'SystemSelection',
    description: 'A subtle, high-frequency selection change feedback using UISelectionFeedbackGenerator. Used when the user moves through a series of discrete values. This is a compatibility fallback implementation based on the iOS preset, used on Android when no native equivalent is available.',
    tags: ["System","Selection","Gentle","Fallback"],
    duration: 50,
    image: AndroidSystemSelectionImage,
    play: Presets.System.SystemSelection,
  },
  {
    name: 'SystemTextHandleMovePreset',
    description: 'A text handle move feedback using HapticFeedbackConstants.TEXT_HANDLE_MOVE (API 27+). Very subtle feedback when dragging text selection handles.',
    tags: ["System","Text","Gentle"],
    duration: 50,
    image: AndroidSystemTextHandleMovePresetImage,
    play: Presets.System.Android.SystemTextHandleMovePreset,
  },
  {
    name: 'SystemTickPreset',
    description: 'A light tick effect using VibrationEffect.EFFECT_TICK. Subtle high-frequency feedback for scrolling or fine-grained selection changes.',
    tags: ["System","Tick","Gentle"],
    duration: 50,
    image: AndroidSystemTickPresetImage,
    play: Presets.System.Android.SystemTickPreset,
  },
  {
    name: 'SystemToggleOffPreset',
    description: 'A toggle-off feedback using HapticFeedbackConstants.TOGGLE_OFF (API 34+). Confirms a toggle switch has been turned off, slightly softer than toggle-on.',
    tags: ["System","Toggle","Click"],
    duration: 50,
    image: AndroidSystemToggleOffPresetImage,
    play: Presets.System.Android.SystemToggleOffPreset,
  },
  {
    name: 'SystemToggleOnPreset',
    description: 'A toggle-on feedback using HapticFeedbackConstants.TOGGLE_ON (API 34+). Confirms a toggle switch has been turned on.',
    tags: ["System","Toggle","Click"],
    duration: 50,
    image: AndroidSystemToggleOnPresetImage,
    play: Presets.System.Android.SystemToggleOnPreset,
  },
  {
    name: 'SystemVirtualKeyPreset',
    description: 'A virtual key press feedback using HapticFeedbackConstants.VIRTUAL_KEY. Simulates pressing a virtual on-screen key.',
    tags: ["System","VirtualKey","Click"],
    duration: 50,
    image: AndroidSystemVirtualKeyPresetImage,
    play: Presets.System.Android.SystemVirtualKeyPreset,
  },
  {
    name: 'SystemVirtualKeyReleasePreset',
    description: 'A virtual key release feedback using HapticFeedbackConstants.VIRTUAL_KEY_RELEASE (API 27+). Gentle feedback when releasing an on-screen key.',
    tags: ["System","VirtualKey","Release"],
    duration: 50,
    image: AndroidSystemVirtualKeyReleasePresetImage,
    play: Presets.System.Android.SystemVirtualKeyReleasePreset,
  },
// CODEGEN_END_{android_presets}
];

export const IOSPresetsConfig: Array<PresetProps> = [
// CODEGEN_BEGIN_{ios_presets}
  {
    name: 'SystemImpactHeavy',
    description: 'A strong, low-frequency impact feedback using UIImpactFeedbackGenerator with .heavy style. Best for significant actions requiring bold confirmation.',
    tags: ["System","Impact","Heavy","Bold"],
    duration: 50,
    image: IosSystemImpactHeavyImage,
    play: Presets.System.SystemImpactHeavy,
  },
  {
    name: 'SystemImpactLight',
    description: 'A light, subtle impact feedback using UIImpactFeedbackGenerator with .light style. Ideal for minor interactions that need gentle confirmation.',
    tags: ["System","Impact","Light"],
    duration: 50,
    image: IosSystemImpactLightImage,
    play: Presets.System.SystemImpactLight,
  },
  {
    name: 'SystemImpactMedium',
    description: 'A medium-strength impact feedback using UIImpactFeedbackGenerator with .medium style. Suitable for standard taps and button presses.',
    tags: ["System","Impact","Medium"],
    duration: 50,
    image: IosSystemImpactMediumImage,
    play: Presets.System.SystemImpactMedium,
  },
  {
    name: 'SystemImpactRigid',
    description: 'A sharp, high-frequency impact feedback using UIImpactFeedbackGenerator with .rigid style. Ideal for snappy, precise interactions like toggling or locking.',
    tags: ["System","Impact","Rigid","Sharp"],
    duration: 50,
    image: IosSystemImpactRigidImage,
    play: Presets.System.SystemImpactRigid,
  },
  {
    name: 'SystemImpactSoft',
    description: 'A very soft, low-frequency impact feedback using UIImpactFeedbackGenerator with .soft style. Great for gentle, non-intrusive interactions.',
    tags: ["System","Impact","Soft","Gentle"],
    duration: 50,
    image: IosSystemImpactSoftImage,
    play: Presets.System.SystemImpactSoft,
  },
  {
    name: 'SystemNotificationError',
    description: 'A three-pulse error notification feedback using UINotificationFeedbackGenerator. Signals a failed action or error state to the user.',
    tags: ["System","Notification","Error","Bumps","Bold"],
    duration: 250,
    image: IosSystemNotificationErrorImage,
    play: Presets.System.SystemNotificationError,
  },
  {
    name: 'SystemNotificationSuccess',
    description: 'A two-pulse success notification feedback using UINotificationFeedbackGenerator. Communicates successful completion of an action.',
    tags: ["System","Notification","Success","Bumps"],
    duration: 160,
    image: IosSystemNotificationSuccessImage,
    play: Presets.System.SystemNotificationSuccess,
  },
  {
    name: 'SystemNotificationWarning',
    description: 'A three-pulse warning notification feedback using UINotificationFeedbackGenerator. Alerts the user to a situation requiring attention.',
    tags: ["System","Notification","Warning","Bumps"],
    duration: 290,
    image: IosSystemNotificationWarningImage,
    play: Presets.System.SystemNotificationWarning,
  },
  {
    name: 'SystemSelection',
    description: 'A subtle, high-frequency selection change feedback using UISelectionFeedbackGenerator. Used when the user moves through a series of discrete values.',
    tags: ["System","Selection","Gentle"],
    duration: 50,
    image: IosSystemSelectionImage,
    play: Presets.System.SystemSelection,
  },
// CODEGEN_END_{ios_presets}
];
