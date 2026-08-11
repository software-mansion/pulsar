#import "Haptics.h"
#import <UIKit/UIKit.h>
#if __has_include(<Pulsar/Pulsar-Swift.h>)
// Local sources mode (USE_LOCAL_PULSAR_IOS=1) under use_frameworks!: Swift compiled
// into this pod's `Pulsar` module and exposed as a framework header.
#import <Pulsar/Pulsar-Swift.h>
#elif __has_include("Pulsar-Swift.h")
// Local sources mode with static libraries (the default): the `Pulsar` module's own
// generated Swift header is not reachable via the framework-style <Pulsar/...> path,
// only via the quote form on the target's own header search path.
#import "Pulsar-Swift.h"
#elif __has_include(<PulsarHaptics/PulsarHaptics-Swift.h>)
// Published pod with frameworks: framework-style angle-bracket header.
#import <PulsarHaptics/PulsarHaptics-Swift.h>
#else
// Published pod, static libs: reachable via the HEADER_SEARCH_PATHS in Pulsar.podspec.
#import "PulsarHaptics-Swift.h"
#endif

@implementation RNPulsar {
  Pulsar *pulsar_;
  RealtimeComposer *realtimeComposer_;
  int nextId;
  NSMutableDictionary<NSNumber*, PatternComposer*> *patternComposersRegistry_;
  NSMutableDictionary<NSString*, LoadedBundle*> *bundlesRegistry_;
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
  return NO;
}

- (dispatch_queue_t)methodQueue
{
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
    bundlesRegistry_ = [NSMutableDictionary new];
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

// Preset bundles ---------------------------------------------------------

- (nonnull NSString *)Pulsar_loadBundle:(nonnull NSString *)base64 {
  NSData *data = [[NSData alloc] initWithBase64EncodedString:base64
                                                     options:NSDataBase64DecodingIgnoreUnknownCharacters];
  if (!data) {
    NSLog(@"[RNPulsar] Pulsar_loadBundle: invalid base64");
    return @"";
  }
  NSError *error = nil;
  LoadedBundle *bundle = [pulsar_ loadBundleWithData:data error:&error];
  if (!bundle) {
    NSLog(@"[RNPulsar] Pulsar_loadBundle failed: %@", error);
    return @"";
  }
  bundlesRegistry_[bundle.id] = bundle;
  return bundle.id;
}

- (void)Pulsar_playBundlePreset:(nonnull NSString *)token presetId:(nonnull NSString *)presetId {
  if (!RNPulsarIsAppActive()) {
    return;
  }
  RNPulsarPerformSafely(@"Pulsar_playBundlePreset", ^{
    [bundlesRegistry_[token] play:presetId];
  });
}

- (void)Pulsar_stopBundlePreset:(nonnull NSString *)token presetId:(nonnull NSString *)presetId {
  RNPulsarPerformSafely(@"Pulsar_stopBundlePreset", ^{
    [[bundlesRegistry_[token] handle:presetId] stop];
  });
}

- (void)Pulsar_disposeBundle:(nonnull NSString *)token {
  [bundlesRegistry_[token] dispose];
  [bundlesRegistry_ removeObjectForKey:token];
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

- (nonnull NSNumber *)PatternComposer_parsePatternWithSound:(JS::NativeRNPulsar::Pattern &)data
                                                       uri:(nonnull NSString *)uri
                                                    volume:(double)volume
                                                    offset:(double)offset
                                                     start:(double)start
                                                  duration:(double)duration {
  auto patternComposer = [pulsar_ getPatternComposer];

  PatternData *patternData = PatternDataFromJSPattern(data);
  [patternComposer parsePatternWithSoundWithHapticsData:patternData
                                                    uri:uri
                                                 volume:(float)volume
                                                 offset:offset
                                                  start:start
                                               duration:duration];

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
