import AVFoundation
import UIKit
import Foundation
import AVFAudio

@objc public class PresetsWrapper : NSObject {
  private var playSound: Bool = true
  private var useCache: Bool = true
  private var cache: [String: Preset] = [:]
  private var haptics: Pulsar!
  
  private lazy var mapper: [String: Preset.Type] = {
    let rawMapper: [String: Preset.Type] = [
    "SystemImpactLight": SystemImpactLightPreset.self,
    "SystemImpactMedium": SystemImpactMediumPreset.self,
    "SystemImpactHeavy": SystemImpactHeavyPreset.self,
    "SystemImpactSoft": SystemImpactSoftPreset.self,
    "SystemImpactRigid": SystemImpactRigidPreset.self,
    "SystemNotificationSuccess": SystemNotificationSuccessPreset.self,
    "SystemNotificationWarning": SystemNotificationWarningPreset.self,
    "SystemNotificationError": SystemNotificationErrorPreset.self,
    "SystemSelection": SystemSelectionPreset.self,
    
// CODEGEN_BEGIN_{mappers}
    "Afterglow": AfterglowPreset.self,
    "Aftershock": AftershockPreset.self,
    "Alarm": AlarmPreset.self,
    "Anvil": AnvilPreset.self,
    "Applause": ApplausePreset.self,
    "Ascent": AscentPreset.self,
    "BalloonPop": BalloonPopPreset.self,
    "Barrage": BarragePreset.self,
    "BassDrop": BassDropPreset.self,
    "Batter": BatterPreset.self,
    "BellToll": BellTollPreset.self,
    "Blip": BlipPreset.self,
    "Bloom": BloomPreset.self,
    "Bongo": BongoPreset.self,
    "Boulder": BoulderPreset.self,
    "BreakingWave": BreakingWavePreset.self,
    "Breath": BreathPreset.self,
    "Buildup": BuildupPreset.self,
    "Burst": BurstPreset.self,
    "Buzz": BuzzPreset.self,
    "Cadence": CadencePreset.self,
    "CameraShutter": CameraShutterPreset.self,
    "Canter": CanterPreset.self,
    "Cascade": CascadePreset.self,
    "Castanets": CastanetsPreset.self,
    "CatPaw": CatPawPreset.self,
    "Charge": ChargePreset.self,
    "Chime": ChimePreset.self,
    "Chip": ChipPreset.self,
    "Chirp": ChirpPreset.self,
    "Clamor": ClamorPreset.self,
    "Clasp": ClaspPreset.self,
    "Cleave": CleavePreset.self,
    "Coil": CoilPreset.self,
    "CoinDrop": CoinDropPreset.self,
    "CombinationLock": CombinationLockPreset.self,
    "Crescendo": CrescendoPreset.self,
    "Dewdrop": DewdropPreset.self,
    "Dirge": DirgePreset.self,
    "Dissolve": DissolvePreset.self,
    "DogBark": DogBarkPreset.self,
    "Drone": DronePreset.self,
    "EngineRev": EngineRevPreset.self,
    "Exhale": ExhalePreset.self,
    "Explosion": ExplosionPreset.self,
    "FadeOut": FadeOutPreset.self,
    "Fanfare": FanfarePreset.self,
    "Feather": FeatherPreset.self,
    "Finale": FinalePreset.self,
    "FingerDrum": FingerDrumPreset.self,
    "Firecracker": FirecrackerPreset.self,
    "Fizz": FizzPreset.self,
    "Flare": FlarePreset.self,
    "Flick": FlickPreset.self,
    "Flinch": FlinchPreset.self,
    "Flourish": FlourishPreset.self,
    "Flurry": FlurryPreset.self,
    "Flush": FlushPreset.self,
    "Gallop": GallopPreset.self,
    "Gavel": GavelPreset.self,
    "Glitch": GlitchPreset.self,
    "GuitarStrum": GuitarStrumPreset.self,
    "Hail": HailPreset.self,
    "Hammer": HammerPreset.self,
    "Heartbeat": HeartbeatPreset.self,
    "Herald": HeraldPreset.self,
    "HoofBeat": HoofBeatPreset.self,
    "Ignition": IgnitionPreset.self,
    "Impact": ImpactPreset.self,
    "Jolt": JoltPreset.self,
    "KeyboardMechanical": KeyboardMechanicalPreset.self,
    "KeyboardMembrane": KeyboardMembranePreset.self,
    "Knell": KnellPreset.self,
    "Knock": KnockPreset.self,
    "Lament": LamentPreset.self,
    "Latch": LatchPreset.self,
    "Lighthouse": LighthousePreset.self,
    "Lilt": LiltPreset.self,
    "Lock": LockPreset.self,
    "Lope": LopePreset.self,
    "March": MarchPreset.self,
    "Metronome": MetronomePreset.self,
    "Murmur": MurmurPreset.self,
    "Nudge": NudgePreset.self,
    "PassingCar": PassingCarPreset.self,
    "Patter": PatterPreset.self,
    "Peal": PealPreset.self,
    "Peck": PeckPreset.self,
    "Pendulum": PendulumPreset.self,
    "Ping": PingPreset.self,
    "Pip": PipPreset.self,
    "Piston": PistonPreset.self,
    "Plink": PlinkPreset.self,
    "Plummet": PlummetPreset.self,
    "Plunk": PlunkPreset.self,
    "Poke": PokePreset.self,
    "Pound": PoundPreset.self,
    "PowerDown": PowerDownPreset.self,
    "Propel": PropelPreset.self,
    "Pulse": PulsePreset.self,
    "Pummel": PummelPreset.self,
    "Push": PushPreset.self,
    "Radar": RadarPreset.self,
    "Rain": RainPreset.self,
    "Ramp": RampPreset.self,
    "Rap": RapPreset.self,
    "Ratchet": RatchetPreset.self,
    "Rebound": ReboundPreset.self,
    "Ripple": RipplePreset.self,
    "Rivet": RivetPreset.self,
    "Rustle": RustlePreset.self,
    "Shockwave": ShockwavePreset.self,
    "Snap": SnapPreset.self,
    "Sonar": SonarPreset.self,
    "Spark": SparkPreset.self,
    "Spin": SpinPreset.self,
    "Stagger": StaggerPreset.self,
    "Stamp": StampPreset.self,
    "Stampede": StampedePreset.self,
    "Stomp": StompPreset.self,
    "StoneSkip": StoneSkipPreset.self,
    "Strike": StrikePreset.self,
    "Summon": SummonPreset.self,
    "Surge": SurgePreset.self,
    "Sway": SwayPreset.self,
    "Sweep": SweepPreset.self,
    "Swell": SwellPreset.self,
    "Syncopate": SyncopatePreset.self,
    "Throb": ThrobPreset.self,
    "Thud": ThudPreset.self,
    "Thump": ThumpPreset.self,
    "Thunder": ThunderPreset.self,
    "ThunderRoll": ThunderRollPreset.self,
    "TickTock": TickTockPreset.self,
    "TidalSurge": TidalSurgePreset.self,
    "TideSwell": TideSwellPreset.self,
    "Tremor": TremorPreset.self,
    "Trigger": TriggerPreset.self,
    "Triumph": TriumphPreset.self,
    "Trumpet": TrumpetPreset.self,
    "Typewriter": TypewriterPreset.self,
    "Unfurl": UnfurlPreset.self,
    "Vortex": VortexPreset.self,
    "Wane": WanePreset.self,
    "WarDrum": WarDrumPreset.self,
    "Waterfall": WaterfallPreset.self,
    "Wave": WavePreset.self,
    "Wisp": WispPreset.self,
    "Wobble": WobblePreset.self,
    "Woodpecker": WoodpeckerPreset.self,
    "Zipper": ZipperPreset.self,
// CODEGEN_END_{mappers}
    ]
    return Dictionary(uniqueKeysWithValues: rawMapper.map { (self.normalizeName($0.key), $0.value) })
  }()
  
  public init(haptics: Pulsar) {
    super.init()
    self.haptics = haptics
  }
  
  public func enableCache(state: Bool) {
    self.useCache = state
    if (!state) {
      resetCache()
    }
  }
  
  public func isCacheEnabled() -> Bool {
    return self.useCache
  }
  
  public func resetCache() {
    cache.removeAll()
  }
  
  public func preloadPresetByNames(_ names: Array<String>) {
    for (name) in names {
      preloadPresetByName(name)
    }
  }
  
  public func preloadPresetByName(_ name: String) {
    self.useCache = true
    guard let type = getPresetType(for: name) else {
      return
    }
    _ = getCacheablePreset(type)
  }
  
  @objc public func getByName(_ name: String) -> Preset? {
    guard let type = getPresetType(for: name) else {
      return nil
    }
    return getCacheablePreset(type)
  }
  
  private func getCacheablePreset(_ type: Preset.Type) -> Preset {
    let cacheKey = normalizeName(type.name)
    if (useCache) {
      if let cachedPreset = cache[cacheKey] {
        return cachedPreset
      } else {
        let preset = type.getInstance(haptics: haptics!)
        cache[cacheKey] = preset
        return preset
      }
    }
    return type.getInstance(haptics: haptics!)
  }

  private func getPresetType(for name: String) -> Preset.Type? {
    return mapper[normalizeName(name)]
  }

  private func normalizeName(_ name: String) -> String {
    return name.lowercased()
  }
  
  public func systemImpactLight() {
    getCacheablePreset(SystemImpactLightPreset.self).play()
  }
  
  public func systemImpactMedium() {
    getCacheablePreset(SystemImpactMediumPreset.self).play()
  }
  
  public func systemImpactHeavy() {
    getCacheablePreset(SystemImpactHeavyPreset.self).play()
  }
  
  public func systemImpactSoft() {
    getCacheablePreset(SystemImpactSoftPreset.self).play()
  }
  
  public func systemImpactRigid() {
    getCacheablePreset(SystemImpactRigidPreset.self).play()
  }
  
  public func systemNotificationSuccess() {
    getCacheablePreset(SystemNotificationSuccessPreset.self).play()
  }
  
  public func systemNotificationWarning() {
    getCacheablePreset(SystemNotificationWarningPreset.self).play()
  }
  
  public func systemNotificationError() {
    getCacheablePreset(SystemNotificationErrorPreset.self).play()
  }
  
  public func systemSelection() {
    getCacheablePreset(SystemSelectionPreset.self).play()
  }
  
// CODEGEN_BEGIN_{getters}
  public func afterglow() {
    getCacheablePreset(AfterglowPreset.self).play()
  }

  public func aftershock() {
    getCacheablePreset(AftershockPreset.self).play()
  }

  public func alarm() {
    getCacheablePreset(AlarmPreset.self).play()
  }

  public func anvil() {
    getCacheablePreset(AnvilPreset.self).play()
  }

  public func applause() {
    getCacheablePreset(ApplausePreset.self).play()
  }

  public func ascent() {
    getCacheablePreset(AscentPreset.self).play()
  }

  public func balloonPop() {
    getCacheablePreset(BalloonPopPreset.self).play()
  }

  public func barrage() {
    getCacheablePreset(BarragePreset.self).play()
  }

  public func bassDrop() {
    getCacheablePreset(BassDropPreset.self).play()
  }

  public func batter() {
    getCacheablePreset(BatterPreset.self).play()
  }

  public func bellToll() {
    getCacheablePreset(BellTollPreset.self).play()
  }

  public func blip() {
    getCacheablePreset(BlipPreset.self).play()
  }

  public func bloom() {
    getCacheablePreset(BloomPreset.self).play()
  }

  public func bongo() {
    getCacheablePreset(BongoPreset.self).play()
  }

  public func boulder() {
    getCacheablePreset(BoulderPreset.self).play()
  }

  public func breakingWave() {
    getCacheablePreset(BreakingWavePreset.self).play()
  }

  public func breath() {
    getCacheablePreset(BreathPreset.self).play()
  }

  public func buildup() {
    getCacheablePreset(BuildupPreset.self).play()
  }

  public func burst() {
    getCacheablePreset(BurstPreset.self).play()
  }

  public func buzz() {
    getCacheablePreset(BuzzPreset.self).play()
  }

  public func cadence() {
    getCacheablePreset(CadencePreset.self).play()
  }

  public func cameraShutter() {
    getCacheablePreset(CameraShutterPreset.self).play()
  }

  public func canter() {
    getCacheablePreset(CanterPreset.self).play()
  }

  public func cascade() {
    getCacheablePreset(CascadePreset.self).play()
  }

  public func castanets() {
    getCacheablePreset(CastanetsPreset.self).play()
  }

  public func catPaw() {
    getCacheablePreset(CatPawPreset.self).play()
  }

  public func charge() {
    getCacheablePreset(ChargePreset.self).play()
  }

  public func chime() {
    getCacheablePreset(ChimePreset.self).play()
  }

  public func chip() {
    getCacheablePreset(ChipPreset.self).play()
  }

  public func chirp() {
    getCacheablePreset(ChirpPreset.self).play()
  }

  public func clamor() {
    getCacheablePreset(ClamorPreset.self).play()
  }

  public func clasp() {
    getCacheablePreset(ClaspPreset.self).play()
  }

  public func cleave() {
    getCacheablePreset(CleavePreset.self).play()
  }

  public func coil() {
    getCacheablePreset(CoilPreset.self).play()
  }

  public func coinDrop() {
    getCacheablePreset(CoinDropPreset.self).play()
  }

  public func combinationLock() {
    getCacheablePreset(CombinationLockPreset.self).play()
  }

  public func crescendo() {
    getCacheablePreset(CrescendoPreset.self).play()
  }

  public func dewdrop() {
    getCacheablePreset(DewdropPreset.self).play()
  }

  public func dirge() {
    getCacheablePreset(DirgePreset.self).play()
  }

  public func dissolve() {
    getCacheablePreset(DissolvePreset.self).play()
  }

  public func dogBark() {
    getCacheablePreset(DogBarkPreset.self).play()
  }

  public func drone() {
    getCacheablePreset(DronePreset.self).play()
  }

  public func engineRev() {
    getCacheablePreset(EngineRevPreset.self).play()
  }

  public func exhale() {
    getCacheablePreset(ExhalePreset.self).play()
  }

  public func explosion() {
    getCacheablePreset(ExplosionPreset.self).play()
  }

  public func fadeOut() {
    getCacheablePreset(FadeOutPreset.self).play()
  }

  public func fanfare() {
    getCacheablePreset(FanfarePreset.self).play()
  }

  public func feather() {
    getCacheablePreset(FeatherPreset.self).play()
  }

  public func finale() {
    getCacheablePreset(FinalePreset.self).play()
  }

  public func fingerDrum() {
    getCacheablePreset(FingerDrumPreset.self).play()
  }

  public func firecracker() {
    getCacheablePreset(FirecrackerPreset.self).play()
  }

  public func fizz() {
    getCacheablePreset(FizzPreset.self).play()
  }

  public func flare() {
    getCacheablePreset(FlarePreset.self).play()
  }

  public func flick() {
    getCacheablePreset(FlickPreset.self).play()
  }

  public func flinch() {
    getCacheablePreset(FlinchPreset.self).play()
  }

  public func flourish() {
    getCacheablePreset(FlourishPreset.self).play()
  }

  public func flurry() {
    getCacheablePreset(FlurryPreset.self).play()
  }

  public func flush() {
    getCacheablePreset(FlushPreset.self).play()
  }

  public func gallop() {
    getCacheablePreset(GallopPreset.self).play()
  }

  public func gavel() {
    getCacheablePreset(GavelPreset.self).play()
  }

  public func glitch() {
    getCacheablePreset(GlitchPreset.self).play()
  }

  public func guitarStrum() {
    getCacheablePreset(GuitarStrumPreset.self).play()
  }

  public func hail() {
    getCacheablePreset(HailPreset.self).play()
  }

  public func hammer() {
    getCacheablePreset(HammerPreset.self).play()
  }

  public func heartbeat() {
    getCacheablePreset(HeartbeatPreset.self).play()
  }

  public func herald() {
    getCacheablePreset(HeraldPreset.self).play()
  }

  public func hoofBeat() {
    getCacheablePreset(HoofBeatPreset.self).play()
  }

  public func ignition() {
    getCacheablePreset(IgnitionPreset.self).play()
  }

  public func impact() {
    getCacheablePreset(ImpactPreset.self).play()
  }

  public func jolt() {
    getCacheablePreset(JoltPreset.self).play()
  }

  public func keyboardMechanical() {
    getCacheablePreset(KeyboardMechanicalPreset.self).play()
  }

  public func keyboardMembrane() {
    getCacheablePreset(KeyboardMembranePreset.self).play()
  }

  public func knell() {
    getCacheablePreset(KnellPreset.self).play()
  }

  public func knock() {
    getCacheablePreset(KnockPreset.self).play()
  }

  public func lament() {
    getCacheablePreset(LamentPreset.self).play()
  }

  public func latch() {
    getCacheablePreset(LatchPreset.self).play()
  }

  public func lighthouse() {
    getCacheablePreset(LighthousePreset.self).play()
  }

  public func lilt() {
    getCacheablePreset(LiltPreset.self).play()
  }

  public func lock() {
    getCacheablePreset(LockPreset.self).play()
  }

  public func lope() {
    getCacheablePreset(LopePreset.self).play()
  }

  public func march() {
    getCacheablePreset(MarchPreset.self).play()
  }

  public func metronome() {
    getCacheablePreset(MetronomePreset.self).play()
  }

  public func murmur() {
    getCacheablePreset(MurmurPreset.self).play()
  }

  public func nudge() {
    getCacheablePreset(NudgePreset.self).play()
  }

  public func passingCar() {
    getCacheablePreset(PassingCarPreset.self).play()
  }

  public func patter() {
    getCacheablePreset(PatterPreset.self).play()
  }

  public func peal() {
    getCacheablePreset(PealPreset.self).play()
  }

  public func peck() {
    getCacheablePreset(PeckPreset.self).play()
  }

  public func pendulum() {
    getCacheablePreset(PendulumPreset.self).play()
  }

  public func ping() {
    getCacheablePreset(PingPreset.self).play()
  }

  public func pip() {
    getCacheablePreset(PipPreset.self).play()
  }

  public func piston() {
    getCacheablePreset(PistonPreset.self).play()
  }

  public func plink() {
    getCacheablePreset(PlinkPreset.self).play()
  }

  public func plummet() {
    getCacheablePreset(PlummetPreset.self).play()
  }

  public func plunk() {
    getCacheablePreset(PlunkPreset.self).play()
  }

  public func poke() {
    getCacheablePreset(PokePreset.self).play()
  }

  public func pound() {
    getCacheablePreset(PoundPreset.self).play()
  }

  public func powerDown() {
    getCacheablePreset(PowerDownPreset.self).play()
  }

  public func propel() {
    getCacheablePreset(PropelPreset.self).play()
  }

  public func pulse() {
    getCacheablePreset(PulsePreset.self).play()
  }

  public func pummel() {
    getCacheablePreset(PummelPreset.self).play()
  }

  public func push() {
    getCacheablePreset(PushPreset.self).play()
  }

  public func radar() {
    getCacheablePreset(RadarPreset.self).play()
  }

  public func rain() {
    getCacheablePreset(RainPreset.self).play()
  }

  public func ramp() {
    getCacheablePreset(RampPreset.self).play()
  }

  public func rap() {
    getCacheablePreset(RapPreset.self).play()
  }

  public func ratchet() {
    getCacheablePreset(RatchetPreset.self).play()
  }

  public func rebound() {
    getCacheablePreset(ReboundPreset.self).play()
  }

  public func ripple() {
    getCacheablePreset(RipplePreset.self).play()
  }

  public func rivet() {
    getCacheablePreset(RivetPreset.self).play()
  }

  public func rustle() {
    getCacheablePreset(RustlePreset.self).play()
  }

  public func shockwave() {
    getCacheablePreset(ShockwavePreset.self).play()
  }

  public func snap() {
    getCacheablePreset(SnapPreset.self).play()
  }

  public func sonar() {
    getCacheablePreset(SonarPreset.self).play()
  }

  public func spark() {
    getCacheablePreset(SparkPreset.self).play()
  }

  public func spin() {
    getCacheablePreset(SpinPreset.self).play()
  }

  public func stagger() {
    getCacheablePreset(StaggerPreset.self).play()
  }

  public func stamp() {
    getCacheablePreset(StampPreset.self).play()
  }

  public func stampede() {
    getCacheablePreset(StampedePreset.self).play()
  }

  public func stomp() {
    getCacheablePreset(StompPreset.self).play()
  }

  public func stoneSkip() {
    getCacheablePreset(StoneSkipPreset.self).play()
  }

  public func strike() {
    getCacheablePreset(StrikePreset.self).play()
  }

  public func summon() {
    getCacheablePreset(SummonPreset.self).play()
  }

  public func surge() {
    getCacheablePreset(SurgePreset.self).play()
  }

  public func sway() {
    getCacheablePreset(SwayPreset.self).play()
  }

  public func sweep() {
    getCacheablePreset(SweepPreset.self).play()
  }

  public func swell() {
    getCacheablePreset(SwellPreset.self).play()
  }

  public func syncopate() {
    getCacheablePreset(SyncopatePreset.self).play()
  }

  public func throb() {
    getCacheablePreset(ThrobPreset.self).play()
  }

  public func thud() {
    getCacheablePreset(ThudPreset.self).play()
  }

  public func thump() {
    getCacheablePreset(ThumpPreset.self).play()
  }

  public func thunder() {
    getCacheablePreset(ThunderPreset.self).play()
  }

  public func thunderRoll() {
    getCacheablePreset(ThunderRollPreset.self).play()
  }

  public func tickTock() {
    getCacheablePreset(TickTockPreset.self).play()
  }

  public func tidalSurge() {
    getCacheablePreset(TidalSurgePreset.self).play()
  }

  public func tideSwell() {
    getCacheablePreset(TideSwellPreset.self).play()
  }

  public func tremor() {
    getCacheablePreset(TremorPreset.self).play()
  }

  public func trigger() {
    getCacheablePreset(TriggerPreset.self).play()
  }

  public func triumph() {
    getCacheablePreset(TriumphPreset.self).play()
  }

  public func trumpet() {
    getCacheablePreset(TrumpetPreset.self).play()
  }

  public func typewriter() {
    getCacheablePreset(TypewriterPreset.self).play()
  }

  public func unfurl() {
    getCacheablePreset(UnfurlPreset.self).play()
  }

  public func vortex() {
    getCacheablePreset(VortexPreset.self).play()
  }

  public func wane() {
    getCacheablePreset(WanePreset.self).play()
  }

  public func warDrum() {
    getCacheablePreset(WarDrumPreset.self).play()
  }

  public func waterfall() {
    getCacheablePreset(WaterfallPreset.self).play()
  }

  public func wave() {
    getCacheablePreset(WavePreset.self).play()
  }

  public func wisp() {
    getCacheablePreset(WispPreset.self).play()
  }

  public func wobble() {
    getCacheablePreset(WobblePreset.self).play()
  }

  public func woodpecker() {
    getCacheablePreset(WoodpeckerPreset.self).play()
  }

  public func zipper() {
    getCacheablePreset(ZipperPreset.self).play()
  }
// CODEGEN_END_{getters}
}
