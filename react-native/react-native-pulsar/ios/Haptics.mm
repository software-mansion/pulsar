#import "Haptics.h"
#import "Pulsar-Swift.h"

@implementation RNPulsar {
  Pulsar *pulsar_;
  RealtimeComposer *realtimeComposer_;
  int nextId;
  NSMutableDictionary<NSNumber*, PatternComposer*> *patternComposersRegistry_;
}
RCT_EXPORT_MODULE()

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
  [[[pulsar_ getPresets] getByName:name] play];
}

- (void)Pulsar_preloadPresets:(nonnull NSArray *)presetNames {
  [pulsar_ preloadPresetsWithPresetNames:presetNames];
}

- (void)Pulsar_enableSound:(BOOL)state {
  [pulsar_ enableSoundWithState:state];
}

- (void)Pulsar_enableCache:(BOOL)state {
  [pulsar_ enableCacheWithState:state];
}

- (void)Pulsar_clearCache:(BOOL)state {
  if (state) {
    [pulsar_ clearCache];
  }
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

  NSMutableArray<ConfigPoint *> *discretePoints = [NSMutableArray array];
  for (const auto &point : data.discretePattern()) {
    ConfigPoint *dp = [[ConfigPoint alloc] initWithTime:point.time()
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
  [patternComposersRegistry_[@(patternId)] play];
}

- (void)PatternComposer_release:(double)patternId {
  [patternComposersRegistry_ removeObjectForKey:@(patternId)];
}

// RealtimeComposer -----------------------------------------------------------------

- (void)RealtimeComposer_update:(double)amplitude frequency:(double)frequency {
  [realtimeComposer_ updateWithAmplitude:amplitude frequency:frequency];
}

- (void)RealtimeComposer_playDiscrete:(double)amplitude frequency:(double)frequency {
  [realtimeComposer_ playDiscreteWithAmplitude:amplitude frequency:frequency];
}

- (void)RealtimeComposer_stop {
  if (realtimeComposer_) {
    [realtimeComposer_ stop];
  }
}

- (nonnull NSNumber *)RealtimeComposer_isActive {
  return [realtimeComposer_ isActive] ? @1 : @0;
}

- (nonnull NSNumber *)Pulsar_hapticSupport { 
  return [pulsar_ isHapticsSupported] ? @(4) : @(0);
}


@end
