/// Pulsar — rich haptic feedback for Flutter.
///
/// Import this library to access [Pulsar], [PulsarPresets], [PulsarRealtimeComposer],
/// [PulsarPatternComposer], and [AdaptiveHaptics].
library;

import 'dart:async' show unawaited;

export 'pulsar_platform_interface.dart';
export 'pulsar_types.dart';

import 'package:flutter/foundation.dart'
    show TargetPlatform, defaultTargetPlatform;

import 'pulsar_platform_interface.dart';
import 'pulsar_types.dart';

part 'src/adaptive_haptics.dart';
part 'src/pulsar_api.dart';
part 'src/pulsar_pattern_composer.dart';
part 'src/pulsar_preset.dart';
part 'src/pulsar_presets.dart';
part 'src/pulsar_realtime_composer.dart';
part 'src/pulsar_sync_presets.dart';
