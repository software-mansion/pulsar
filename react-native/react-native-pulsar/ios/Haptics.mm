#import "Haptics.h"
#import <UIKit/UIKit.h>
#if __has_include(<Pulsar/Pulsar-Swift.h>)
// Local sources mode (USE_LOCAL_PULSAR_IOS=1): Swift is compiled into the `Pulsar` module.
#import <Pulsar/Pulsar-Swift.h>
#elif __has_include(<Pulsar_haptics/Pulsar_haptics-Swift.h>)
// Published pod mode with frameworks: angle-bracket header is reachable.
#import <Pulsar_haptics/Pulsar_haptics-Swift.h>
#elif __has_include("Pulsar_haptics-Swift.h")
// Published pod mode (default, static libs): the `Pulsar_haptics` Swift interface header
// is reachable via the HEADER_SEARCH_PATHS added in Pulsar.podspec.
#import "Pulsar_haptics-Swift.h"
#else
#import "Pulsar-Swift.h"
#endif

@implementation RNPulsar {
  Pulsar *pulsar_;
  RealtimeComposer *realtimeComposer_;
  int nextId;
  NSMutableDictionary<NSNumber*, PatternComposer*> *patternComposersRegistry_;
}

static BOOL RNPulsarIsAppActive(void) {
  return UIApplication.sharedApplication.applicationState == UIApplicationStateActive;
}

static void RNPulsarLogBridgeException(NSString *context, NSException *exception) {
  NSLog(@"[RNPulsar] Ignored %@ after native exception: %@ (%@)", context, exception.name, exception.reason);
}

static void RNPulsarPerformSafely(NSString *context, void (^block)(void)) {
  @try {
    block();
  } @catch (NSException *exception) {
    RNPulsarLogBridgeException(context, exception);
  }
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  // Module construction does no UI / CoreHaptics / AVAudio work, so we don't
  // need to block the main queue during bridge setup. Methods that need to
  // run on the main thread still dispatch via `methodQueue` below.
  return NO;
}

- (dispatch_queue_t)methodQueue
{
  // Methods read UIApplication state and drive CoreHaptics / AVAudio APIs that
  // are most reliable on the main queue, so keep method dispatch there.
  return dispatch_get_main_queue();
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    pulsar_ = [[Pulsar alloc] init];
    realtimeComposer_ = [pulsar_ getRealtimeComposer];
    nextId = 1;
    patternComposersRegistry_ = [NSMutableDictionary new];
  }
  return self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeRNPulsarSpecJSI>(params);
}

// Pulsar -----------------------------------------------------------------

- (void)Pulsar_play:(nonnull NSString *)name {
  if (!RNPulsarIsAppActive()) {
    return;
  }

  RNPulsarPerformSafely(@"Pulsar_play", ^{
    [[[pulsar_ getPresets] getByName:name] play];
  });
}

- (void)Pulsar_preloadPresets:(nonnull NSArray *)presetNames {
  [pulsar_ preloadPresetsWithPresetNames:presetNames];
}

- (void)Pulsar_enableHaptics:(BOOL)state {
  [pulsar_ enableHapticsWithState:state];
}

- (void)Pulsar_enableSound:(BOOL)state {
  [pulsar_ enableSoundWithState:state];
}

- (void)Pulsar_enableCache:(BOOL)state {
  [pulsar_ enableCacheWithState:state];
}

- (void)Pulsar_clearCache {
  [pulsar_ clearCache];
}

- (void)Pulsar_stopHaptics {
  [pulsar_ stopHaptics];
}

- (void)Pulsar_shutDownEngine {
  [pulsar_ shutDownEngine];
}

- (nonnull NSNumber *)Pulsar_hapticSupport {
  return [pulsar_ isHapticsSupported] ? @(3) : @(0);
}

- (void)Pulsar_forceHapticsSupportLevel:(double)level {
  // do nothing on iOS
}

- (void)Pulsar_enableImpulseCompositionMode:(BOOL)state {
  // do nothing on iOS
}

- (void)Pulsar_setRealtimeComposerStrategy:(double)strategy {
  // do nothing on iOS
}

// PatternComposer -----------------------------------------------------------------

static PatternData *PatternDataFromJSPattern(JS::NativeRNPulsar::Pattern &data) {
  NSMutableArray<ValuePoint *> *amplitudePoints = [NSMutableArray array];
  NSMutableArray<ValuePoint *> *frequencyPoints = [NSMutableArray array];

  auto continuous = data.continuousPattern();
  for (const auto &point : continuous.amplitude()) {
    ValuePoint *pp = [[ValuePoint alloc] initWithTime:point.time() value:(float)point.value()];
    [amplitudePoints addObject:pp];
  }
  for (const auto &point : continuous.frequency()) {
    ValuePoint *pp = [[ValuePoint alloc] initWithTime:point.time() value:(float)point.value()];
    [frequencyPoints addObject:pp];
  }

  ContinuousPattern *continuousPattern = [[ContinuousPattern alloc] initWithAmplitude:amplitudePoints
                                                                         frequency:frequencyPoints];

  NSMutableArray<DiscretePoint *> *discretePoints = [NSMutableArray array];
  for (const auto &point : data.discretePattern()) {
    DiscretePoint *dp = [[DiscretePoint alloc] initWithTime:point.time()
                                                  amplitude:(float)point.amplitude()
                                                  frequency:(float)point.frequency()];
    [discretePoints addObject:dp];
  }

  return [[PatternData alloc] initWithContinuousPattern:continuousPattern discretePattern:discretePoints];
}

- (nonnull NSNumber *)PatternComposer_parsePattern:(JS::NativeRNPulsar::Pattern &)data {
  auto patternComposer = [pulsar_ getPatternComposer];

  PatternData *patternData = PatternDataFromJSPattern(data);
  [patternComposer parsePatternWithHapticsData:patternData];

  int currentId = nextId;
  nextId++;
  patternComposersRegistry_[@(currentId)] = patternComposer;
  return @(currentId);
}

- (void)PatternComposer_play:(double)patternId {
  if (!RNPulsarIsAppActive()) {
    return;
  }

  RNPulsarPerformSafely(@"PatternComposer_play", ^{
    [patternComposersRegistry_[@(patternId)] play];
  });
}

- (void)PatternComposer_stop:(double)patternId {
  [patternComposersRegistry_[@(patternId)] stop];
}

- (void)PatternComposer_release:(double)patternId {
  PatternComposer *composer = patternComposersRegistry_[@(patternId)];
  [composer dispose];
  [patternComposersRegistry_ removeObjectForKey:@(patternId)];
}

// RealtimeComposer -----------------------------------------------------------------

- (void)RealtimeComposer_set:(double)amplitude frequency:(double)frequency {
  if (!RNPulsarIsAppActive()) {
    return;
  }

  RNPulsarPerformSafely(@"RealtimeComposer_set", ^{
    [realtimeComposer_ setWithAmplitude:amplitude frequency:frequency];
  });
}

- (void)RealtimeComposer_playDiscrete:(double)amplitude frequency:(double)frequency {
  if (!RNPulsarIsAppActive()) {
    return;
  }

  RNPulsarPerformSafely(@"RealtimeComposer_playDiscrete", ^{
    [realtimeComposer_ playDiscreteWithAmplitude:amplitude frequency:frequency];
  });
}

- (void)RealtimeComposer_stop {
  if (realtimeComposer_) {
    [realtimeComposer_ stop];
  }
}

- (nonnull NSNumber *)RealtimeComposer_isActive {
  return [realtimeComposer_ isActive] ? @1 : @0;
}

@end
