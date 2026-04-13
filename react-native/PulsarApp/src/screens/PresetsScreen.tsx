import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Presets, Settings } from 'react-native-pulsar';
import { runOnUI } from 'react-native-worklets';

interface PresetItem {
  name: string;
  displayName: string;
  play: () => void;
}

const PRESETS: PresetItem[] = [
  { name: 'SystemImpactLight', displayName: '💫 Impact Light', play: Presets.System.ImpactLight },
  { name: 'SystemImpactMedium', displayName: '⚡ Impact Medium', play: Presets.System.ImpactMedium },
  { name: 'SystemImpactHeavy', displayName: '💥 Impact Heavy', play: Presets.System.ImpactHeavy },
  { name: 'SystemImpactSoft', displayName: '🌸 Impact Soft', play: Presets.System.ImpactSoft },
  { name: 'SystemImpactRigid', displayName: '🔨 Impact Rigid', play: Presets.System.ImpactRigid },
  { name: 'SystemNotificationSuccess', displayName: '🔔 Notification Success', play: Presets.System.NotificationSuccess },
  { name: 'SystemNotificationWarning', displayName: '⚠️ Notification Warning', play: Presets.System.NotificationWarning },
  { name: 'SystemNotificationError', displayName: '🚨 Notification Error', play: Presets.System.NotificationError },
  { name: 'SystemSelection', displayName: '🎯 Selection', play: Presets.System.Selection },
// CODEGEN_BEGIN_{example_app_preset_list}
  { name: 'Afterglow', displayName: '📳 Afterglow', play: Presets.afterglow },
  { name: 'Aftershock', displayName: '📳 Aftershock', play: Presets.aftershock },
  { name: 'Alarm', displayName: '📳 Alarm', play: Presets.alarm },
  { name: 'Anvil', displayName: '📳 Anvil', play: Presets.anvil },
  { name: 'Applause', displayName: '📳 Applause', play: Presets.applause },
  { name: 'Ascent', displayName: '📳 Ascent', play: Presets.ascent },
  { name: 'BalloonPop', displayName: '📳 BalloonPop', play: Presets.balloonPop },
  { name: 'Barrage', displayName: '📳 Barrage', play: Presets.barrage },
  { name: 'BassDrop', displayName: '📳 BassDrop', play: Presets.bassDrop },
  { name: 'Batter', displayName: '📳 Batter', play: Presets.batter },
  { name: 'BellToll', displayName: '📳 BellToll', play: Presets.bellToll },
  { name: 'Blip', displayName: '📳 Blip', play: Presets.blip },
  { name: 'Bloom', displayName: '📳 Bloom', play: Presets.bloom },
  { name: 'Bongo', displayName: '📳 Bongo', play: Presets.bongo },
  { name: 'Boulder', displayName: '📳 Boulder', play: Presets.boulder },
  { name: 'BreakingWave', displayName: '📳 BreakingWave', play: Presets.breakingWave },
  { name: 'Breath', displayName: '📳 Breath', play: Presets.breath },
  { name: 'Buildup', displayName: '📳 Buildup', play: Presets.buildup },
  { name: 'Burst', displayName: '📳 Burst', play: Presets.burst },
  { name: 'Buzz', displayName: '📳 Buzz', play: Presets.buzz },
  { name: 'Cadence', displayName: '📳 Cadence', play: Presets.cadence },
  { name: 'CameraShutter', displayName: '📳 CameraShutter', play: Presets.cameraShutter },
  { name: 'Canter', displayName: '📳 Canter', play: Presets.canter },
  { name: 'Cascade', displayName: '📳 Cascade', play: Presets.cascade },
  { name: 'Castanets', displayName: '📳 Castanets', play: Presets.castanets },
  { name: 'CatPaw', displayName: '📳 CatPaw', play: Presets.catPaw },
  { name: 'Charge', displayName: '📳 Charge', play: Presets.charge },
  { name: 'Chime', displayName: '📳 Chime', play: Presets.chime },
  { name: 'Chip', displayName: '📳 Chip', play: Presets.chip },
  { name: 'Chirp', displayName: '📳 Chirp', play: Presets.chirp },
  { name: 'Clamor', displayName: '📳 Clamor', play: Presets.clamor },
  { name: 'Clasp', displayName: '📳 Clasp', play: Presets.clasp },
  { name: 'Cleave', displayName: '📳 Cleave', play: Presets.cleave },
  { name: 'Coil', displayName: '📳 Coil', play: Presets.coil },
  { name: 'CoinDrop', displayName: '📳 CoinDrop', play: Presets.coinDrop },
  { name: 'CombinationLock', displayName: '📳 CombinationLock', play: Presets.combinationLock },
  { name: 'Crescendo', displayName: '📳 Crescendo', play: Presets.crescendo },
  { name: 'Dewdrop', displayName: '📳 Dewdrop', play: Presets.dewdrop },
  { name: 'Dirge', displayName: '📳 Dirge', play: Presets.dirge },
  { name: 'Dissolve', displayName: '📳 Dissolve', play: Presets.dissolve },
  { name: 'DogBark', displayName: '📳 DogBark', play: Presets.dogBark },
  { name: 'Drone', displayName: '📳 Drone', play: Presets.drone },
  { name: 'EngineRev', displayName: '📳 EngineRev', play: Presets.engineRev },
  { name: 'Exhale', displayName: '📳 Exhale', play: Presets.exhale },
  { name: 'Explosion', displayName: '📳 Explosion', play: Presets.explosion },
  { name: 'FadeOut', displayName: '📳 FadeOut', play: Presets.fadeOut },
  { name: 'Fanfare', displayName: '📳 Fanfare', play: Presets.fanfare },
  { name: 'Feather', displayName: '📳 Feather', play: Presets.feather },
  { name: 'Finale', displayName: '📳 Finale', play: Presets.finale },
  { name: 'FingerDrum', displayName: '📳 FingerDrum', play: Presets.fingerDrum },
  { name: 'Firecracker', displayName: '📳 Firecracker', play: Presets.firecracker },
  { name: 'Fizz', displayName: '📳 Fizz', play: Presets.fizz },
  { name: 'Flare', displayName: '📳 Flare', play: Presets.flare },
  { name: 'Flick', displayName: '📳 Flick', play: Presets.flick },
  { name: 'Flinch', displayName: '📳 Flinch', play: Presets.flinch },
  { name: 'Flourish', displayName: '📳 Flourish', play: Presets.flourish },
  { name: 'Flurry', displayName: '📳 Flurry', play: Presets.flurry },
  { name: 'Flush', displayName: '📳 Flush', play: Presets.flush },
  { name: 'Gallop', displayName: '📳 Gallop', play: Presets.gallop },
  { name: 'Gavel', displayName: '📳 Gavel', play: Presets.gavel },
  { name: 'Glitch', displayName: '📳 Glitch', play: Presets.glitch },
  { name: 'GuitarStrum', displayName: '📳 GuitarStrum', play: Presets.guitarStrum },
  { name: 'Hail', displayName: '📳 Hail', play: Presets.hail },
  { name: 'Hammer', displayName: '📳 Hammer', play: Presets.hammer },
  { name: 'Heartbeat', displayName: '📳 Heartbeat', play: Presets.heartbeat },
  { name: 'Herald', displayName: '📳 Herald', play: Presets.herald },
  { name: 'HoofBeat', displayName: '📳 HoofBeat', play: Presets.hoofBeat },
  { name: 'Ignition', displayName: '📳 Ignition', play: Presets.ignition },
  { name: 'Impact', displayName: '📳 Impact', play: Presets.impact },
  { name: 'Jolt', displayName: '📳 Jolt', play: Presets.jolt },
  { name: 'KeyboardMechanical', displayName: '📳 KeyboardMechanical', play: Presets.keyboardMechanical },
  { name: 'KeyboardMembrane', displayName: '📳 KeyboardMembrane', play: Presets.keyboardMembrane },
  { name: 'Knell', displayName: '📳 Knell', play: Presets.knell },
  { name: 'Knock', displayName: '📳 Knock', play: Presets.knock },
  { name: 'Lament', displayName: '📳 Lament', play: Presets.lament },
  { name: 'Latch', displayName: '📳 Latch', play: Presets.latch },
  { name: 'Lighthouse', displayName: '📳 Lighthouse', play: Presets.lighthouse },
  { name: 'Lilt', displayName: '📳 Lilt', play: Presets.lilt },
  { name: 'Lock', displayName: '📳 Lock', play: Presets.lock },
  { name: 'Lope', displayName: '📳 Lope', play: Presets.lope },
  { name: 'March', displayName: '📳 March', play: Presets.march },
  { name: 'Metronome', displayName: '📳 Metronome', play: Presets.metronome },
  { name: 'Murmur', displayName: '📳 Murmur', play: Presets.murmur },
  { name: 'Nudge', displayName: '📳 Nudge', play: Presets.nudge },
  { name: 'PassingCar', displayName: '📳 PassingCar', play: Presets.passingCar },
  { name: 'Patter', displayName: '📳 Patter', play: Presets.patter },
  { name: 'Peal', displayName: '📳 Peal', play: Presets.peal },
  { name: 'Peck', displayName: '📳 Peck', play: Presets.peck },
  { name: 'Pendulum', displayName: '📳 Pendulum', play: Presets.pendulum },
  { name: 'Ping', displayName: '📳 Ping', play: Presets.ping },
  { name: 'Pip', displayName: '📳 Pip', play: Presets.pip },
  { name: 'Piston', displayName: '📳 Piston', play: Presets.piston },
  { name: 'Plink', displayName: '📳 Plink', play: Presets.plink },
  { name: 'Plummet', displayName: '📳 Plummet', play: Presets.plummet },
  { name: 'Plunk', displayName: '📳 Plunk', play: Presets.plunk },
  { name: 'Poke', displayName: '📳 Poke', play: Presets.poke },
  { name: 'Pound', displayName: '📳 Pound', play: Presets.pound },
  { name: 'PowerDown', displayName: '📳 PowerDown', play: Presets.powerDown },
  { name: 'Propel', displayName: '📳 Propel', play: Presets.propel },
  { name: 'Pulse', displayName: '📳 Pulse', play: Presets.pulse },
  { name: 'Pummel', displayName: '📳 Pummel', play: Presets.pummel },
  { name: 'Push', displayName: '📳 Push', play: Presets.push },
  { name: 'Radar', displayName: '📳 Radar', play: Presets.radar },
  { name: 'Rain', displayName: '📳 Rain', play: Presets.rain },
  { name: 'Ramp', displayName: '📳 Ramp', play: Presets.ramp },
  { name: 'Rap', displayName: '📳 Rap', play: Presets.rap },
  { name: 'Ratchet', displayName: '📳 Ratchet', play: Presets.ratchet },
  { name: 'Rebound', displayName: '📳 Rebound', play: Presets.rebound },
  { name: 'Ripple', displayName: '📳 Ripple', play: Presets.ripple },
  { name: 'Rivet', displayName: '📳 Rivet', play: Presets.rivet },
  { name: 'Rustle', displayName: '📳 Rustle', play: Presets.rustle },
  { name: 'Shockwave', displayName: '📳 Shockwave', play: Presets.shockwave },
  { name: 'Snap', displayName: '📳 Snap', play: Presets.snap },
  { name: 'Sonar', displayName: '📳 Sonar', play: Presets.sonar },
  { name: 'Spark', displayName: '📳 Spark', play: Presets.spark },
  { name: 'Spin', displayName: '📳 Spin', play: Presets.spin },
  { name: 'Stagger', displayName: '📳 Stagger', play: Presets.stagger },
  { name: 'Stamp', displayName: '📳 Stamp', play: Presets.stamp },
  { name: 'Stampede', displayName: '📳 Stampede', play: Presets.stampede },
  { name: 'Stomp', displayName: '📳 Stomp', play: Presets.stomp },
  { name: 'StoneSkip', displayName: '📳 StoneSkip', play: Presets.stoneSkip },
  { name: 'Strike', displayName: '📳 Strike', play: Presets.strike },
  { name: 'Summon', displayName: '📳 Summon', play: Presets.summon },
  { name: 'Surge', displayName: '📳 Surge', play: Presets.surge },
  { name: 'Sway', displayName: '📳 Sway', play: Presets.sway },
  { name: 'Sweep', displayName: '📳 Sweep', play: Presets.sweep },
  { name: 'Swell', displayName: '📳 Swell', play: Presets.swell },
  { name: 'Syncopate', displayName: '📳 Syncopate', play: Presets.syncopate },
  { name: 'Throb', displayName: '📳 Throb', play: Presets.throb },
  { name: 'Thud', displayName: '📳 Thud', play: Presets.thud },
  { name: 'Thump', displayName: '📳 Thump', play: Presets.thump },
  { name: 'Thunder', displayName: '📳 Thunder', play: Presets.thunder },
  { name: 'ThunderRoll', displayName: '📳 ThunderRoll', play: Presets.thunderRoll },
  { name: 'TickTock', displayName: '📳 TickTock', play: Presets.tickTock },
  { name: 'TidalSurge', displayName: '📳 TidalSurge', play: Presets.tidalSurge },
  { name: 'TideSwell', displayName: '📳 TideSwell', play: Presets.tideSwell },
  { name: 'Tremor', displayName: '📳 Tremor', play: Presets.tremor },
  { name: 'Trigger', displayName: '📳 Trigger', play: Presets.trigger },
  { name: 'Triumph', displayName: '📳 Triumph', play: Presets.triumph },
  { name: 'Trumpet', displayName: '📳 Trumpet', play: Presets.trumpet },
  { name: 'Typewriter', displayName: '📳 Typewriter', play: Presets.typewriter },
  { name: 'Unfurl', displayName: '📳 Unfurl', play: Presets.unfurl },
  { name: 'Vortex', displayName: '📳 Vortex', play: Presets.vortex },
  { name: 'Wane', displayName: '📳 Wane', play: Presets.wane },
  { name: 'WarDrum', displayName: '📳 WarDrum', play: Presets.warDrum },
  { name: 'Waterfall', displayName: '📳 Waterfall', play: Presets.waterfall },
  { name: 'Wave', displayName: '📳 Wave', play: Presets.wave },
  { name: 'Wisp', displayName: '📳 Wisp', play: Presets.wisp },
  { name: 'Wobble', displayName: '📳 Wobble', play: Presets.wobble },
  { name: 'Woodpecker', displayName: '📳 Woodpecker', play: Presets.woodpecker },
  { name: 'Zipper', displayName: '📳 Zipper', play: Presets.zipper },
// CODEGEN_END_{example_app_preset_list}
];

export default function PresetsScreen() {
  const handlePlayPreset = (play: () => void) => {
    runOnUI(() => {
      'worklet';
      play();
    })();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Haptic Presets</Text>
        <Text style={styles.subtitle}>
          Test all available haptic presets in the Pulsar library
        </Text>

        <View style={styles.presetsList}>
          {PRESETS.map((preset) => (
            <View key={preset.name} style={styles.presetRow}>
              <Text style={styles.presetName}>{preset.displayName}</Text>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => handlePlayPreset(preset.play)}>
                <Text style={styles.playButtonText}>▶ Play</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  presetsList: {
    gap: 12,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  presetName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
