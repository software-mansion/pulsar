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
  unsigned long bundleTokenSeq_;
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
    bundleTokenSeq_ = 0;
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

- (LoadedBundle *)bundleForToken:(NSString *)token {
  if (token == nil) {
    return nil;
  }
  @synchronized (bundlesRegistry_) {
    return bundlesRegistry_[token];
  }
}

- (NSString *)registerBundleUnderNewToken:(LoadedBundle *)bundle {
  if (bundle == nil) {
    return @"";
  }
  @synchronized (bundlesRegistry_) {
    NSString *token = [NSString stringWithFormat:@"%@#%lu", bundle.id, ++bundleTokenSeq_];
    bundlesRegistry_[token] = bundle;
    return token;
  }
}

- (LoadedBundle *)takeBundleForToken:(NSString *)token {
  if (token == nil) {
    return nil;
  }
  @synchronized (bundlesRegistry_) {
    LoadedBundle *bundle = bundlesRegistry_[token];
    [bundlesRegistry_ removeObjectForKey:token];
    return bundle;
  }
}

- (NSURL *)bundleURLForUri:(NSString *)uri {
  NSURL *url = [NSURL URLWithString:uri];
  if (!url.scheme) {
    url = [NSURL fileURLWithPath:uri];
  }
  return url;
}

- (NSString *)Pulsar_loadBundleFromUriSync:(nonnull NSString *)uri {
  NSURL *url = [self bundleURLForUri:uri];
  if (!url) {
    NSLog(@"[RNPulsar] Pulsar_loadBundleFromUriSync: invalid URI %@", uri);
    return @"";
  }
  NSError *error = nil;
  NSData *data = [NSData dataWithContentsOfURL:url options:0 error:&error];
  if (!data) {
    NSLog(@"[RNPulsar] Pulsar_loadBundleFromUriSync: could not read %@: %@", uri, error);
    return @"";
  }
  LoadedBundle *bundle = [pulsar_ loadBundleWithData:data error:&error];
  if (!bundle) {
    NSLog(@"[RNPulsar] Pulsar_loadBundleFromUriSync: could not load %@: %@", uri, error);
    return @"";
  }
  return [self registerBundleUnderNewToken:bundle];
}

- (void)Pulsar_loadBundleFromUri:(nonnull NSString *)uri
                         resolve:(nonnull RCTPromiseResolveBlock)resolve
                          reject:(nonnull RCTPromiseRejectBlock)reject {
  NSURL *url = [self bundleURLForUri:uri];
  if (!url) {
    reject(@"PULSAR_INVALID_BUNDLE_URI", @"Pulsar: invalid bundle URI", nil);
    return;
  }

  void (^loadData)(NSData *) = ^(NSData *data) {
    NSError *error = nil;
    LoadedBundle *bundle = [self->pulsar_ loadBundleWithData:data error:&error];
    if (!bundle) {
      reject(@"PULSAR_LOAD_BUNDLE_FAILED", @"Pulsar: failed to load bundle", error);
      return;
    }
    resolve([self registerBundleUnderNewToken:bundle]);
  };

  if (url.isFileURL) {
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
      NSError *error = nil;
      NSData *data = [NSData dataWithContentsOfURL:url options:0 error:&error];
      if (!data) {
        reject(@"PULSAR_READ_BUNDLE_FAILED", @"Pulsar: failed to read bundle URI", error);
        return;
      }
      loadData(data);
    });
    return;
  }

  NSURLSessionDataTask *task = [[NSURLSession sharedSession]
      dataTaskWithURL:url
    completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
      if (!data || error) {
        reject(@"PULSAR_READ_BUNDLE_FAILED", @"Pulsar: failed to read bundle URI", error);
        return;
      }
      loadData(data);
    }];
  [task resume];
}

- (void)Pulsar_playBundlePreset:(nonnull NSString *)token
                      presetId:(nonnull NSString *)presetId
                        fromMs:(double)fromMs {
  if (!RNPulsarIsAppActive()) {
    return;
  }
  LoadedBundle *bundle = [self bundleForToken:token];
  RNPulsarPerformSafely(@"Pulsar_playBundlePreset", ^{
    [bundle play:presetId fromMs:fromMs];
  });
}

- (void)Pulsar_stopBundlePreset:(nonnull NSString *)token presetId:(nonnull NSString *)presetId {
  LoadedBundle *bundle = [self bundleForToken:token];
  RNPulsarPerformSafely(@"Pulsar_stopBundlePreset", ^{
    [[bundle handle:presetId] stop];
  });
}

- (void)Pulsar_disposeBundle:(nonnull NSString *)token {
  LoadedBundle *bundle = [self takeBundleForToken:token];
  RNPulsarPerformSafely(@"Pulsar_disposeBundle", ^{
    [bundle dispose];
  });
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

- (nonnull NSDictionary *)Pulsar_hapticCapabilities {
  HapticCapabilities *capabilities = [pulsar_ hapticCapabilities];
  return @{
    @"hasAmplitudeControl" : @(capabilities.hasAmplitudeControl),
    @"hasPrimitiveSupport" : @(capabilities.hasPrimitiveSupport),
    @"isEnvelopeSupported" : @(capabilities.isEnvelopeSupported),
    @"isFrequencyProfileSupported" : @(capabilities.isFrequencyProfileSupported),
    @"minControlPointDurationMillis" : @(capabilities.minControlPointDurationMillis),
  };
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

- (nonnull NSNumber *)PatternComposer_parsePattern:(JS::NativeRNPulsar::Pattern &)data
                                           fromMs:(double)fromMs {
  auto patternComposer = [pulsar_ getPatternComposer];

  PatternData *patternData = PatternDataFromJSPattern(data);
  [patternComposer parsePatternWithHapticsData:patternData fromMs:fromMs];

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
                                               duration:duration
                                                 fromMs:0];

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
