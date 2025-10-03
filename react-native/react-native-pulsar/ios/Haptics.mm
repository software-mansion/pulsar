#import "Haptics.h"
#import "Pulsar-Swift.h"

@implementation RNPulsar {
  Pulsar *pulsar_;
}
RCT_EXPORT_MODULE()

- (instancetype)init
{
  self = [super init];
  if (self) {
    pulsar_ = [[Pulsar alloc] init];
  }
  return self;
}

- (void)play:(NSString *)name {
  [[[pulsar_ Presets] getByName:name] play];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeRNPulsarSpecJSI>(params);
}

@end
