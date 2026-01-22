#import "Haptics.h"
#import "Pulsar-Swift.h"

@implementation RNPulsar {
  Pulsar *pulsar_;
  RealtimeComposerImpl *realtimeComposer_;
  int nextId;
  NSMutableDictionary<NSNumber*, PatternComposerImpl*> *patternComposersRegistry_;
}
RCT_EXPORT_MODULE()

- (instancetype)init
{
  self = [super init];
  if (self) {
    pulsar_ = [[Pulsar alloc] init];
    realtimeComposer_ = [pulsar_ RealtimeComposer];
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
  [[[pulsar_ Presets] getByName:name] play];
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
  NSMutableArray<PatternPoint *> *amplitudePoints = [NSMutableArray array];
  NSMutableArray<PatternPoint *> *frequencyPoints = [NSMutableArray array];

  auto continuous = data.continuesPattern();
  for (const auto &point : continuous.amplitude()) {
    PatternPoint *pp = [[PatternPoint alloc] initWithTime:point.time() value:(float)point.value()];
    [amplitudePoints addObject:pp];
  }
  for (const auto &point : continuous.frequency()) {
    PatternPoint *pp = [[PatternPoint alloc] initWithTime:point.time() value:(float)point.value()];
    [frequencyPoints addObject:pp];
  }

  ContinuesPattern *continuesPattern = [[ContinuesPattern alloc] initWithAmplitude:amplitudePoints
                                                                         frequency:frequencyPoints];

  NSMutableArray<DiscretePoint *> *discretePoints = [NSMutableArray array];
  for (const auto &point : data.discretePattern()) {
    DiscretePoint *dp = [[DiscretePoint alloc] initWithTime:point.time()
                                                  amplitude:(float)point.amplitude()
                                                  frequency:(float)point.frequency()];
    [discretePoints addObject:dp];
  }

  return [[PatternData alloc] initWithContinuesPattern:continuesPattern discretePattern:discretePoints];
}

- (nonnull NSNumber *)PatternComposer_parsePattern:(JS::NativeRNPulsar::Pattern &)data {
  auto patternComposer = [pulsar_ PatternComposer];

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

@end
