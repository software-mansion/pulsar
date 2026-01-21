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
    [pulsar_ clearChace];
  }
}

// PatternComposer -----------------------------------------------------------------

static PatternData *PatternDataFromJSPattern(JS::NativeRNPulsar::Pattern &data) {
  NSMutableArray<ChartPoint *> *amplitudePoints = [NSMutableArray array];
  NSMutableArray<ChartPoint *> *frequencyPoints = [NSMutableArray array];

  auto continuous = data.continuesPattern();
  for (const auto &point : continuous.amplitude()) {
    ChartPoint *cp = [[ChartPoint alloc] initWithX:point.time() y:(float)point.value()];
    [amplitudePoints addObject:cp];
  }
  for (const auto &point : continuous.frequency()) {
    ChartPoint *cp = [[ChartPoint alloc] initWithX:point.time() y:(float)point.value()];
    [frequencyPoints addObject:cp];
  }

  NSMutableArray<NSMutableArray<ChartPoint *> *> *linePoints = [NSMutableArray arrayWithCapacity:2];
  [linePoints addObject:amplitudePoints];
  [linePoints addObject:frequencyPoints];

  NSMutableArray<BarChartPoint *> *barPoints = [NSMutableArray array];
  for (const auto &point : data.discretePattern()) {
    BarChartPoint *bp = [[BarChartPoint alloc] initWithX:point.time()
                                                      y1:(float)point.amplitude()
                                                      y2:(float)point.frequency()];
    [barPoints addObject:bp];
  }

  return [[PatternData alloc] initWithLinePoints:linePoints barPoints:barPoints];
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
