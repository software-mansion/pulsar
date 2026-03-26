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
  { name: 'Afterglow', displayName: '📳 Afterglow', play: Presets.Afterglow },
  { name: 'Aftershock', displayName: '📳 Aftershock', play: Presets.Aftershock },
  { name: 'Alarm', displayName: '📳 Alarm', play: Presets.Alarm },
  { name: 'Anvil', displayName: '📳 Anvil', play: Presets.Anvil },
  { name: 'Applause', displayName: '📳 Applause', play: Presets.Applause },
  { name: 'Ascent', displayName: '📳 Ascent', play: Presets.Ascent },
  { name: 'BalloonPop', displayName: '📳 BalloonPop', play: Presets.BalloonPop },
  { name: 'Barrage', displayName: '📳 Barrage', play: Presets.Barrage },
  { name: 'BassDrop', displayName: '📳 BassDrop', play: Presets.BassDrop },
  { name: 'Batter', displayName: '📳 Batter', play: Presets.Batter },
  { name: 'BellToll', displayName: '📳 BellToll', play: Presets.BellToll },
  { name: 'Blip', displayName: '📳 Blip', play: Presets.Blip },
  { name: 'Bloom', displayName: '📳 Bloom', play: Presets.Bloom },
  { name: 'Bongo', displayName: '📳 Bongo', play: Presets.Bongo },
  { name: 'Boulder', displayName: '📳 Boulder', play: Presets.Boulder },
  { name: 'BreakingWave', displayName: '📳 BreakingWave', play: Presets.BreakingWave },
  { name: 'Breath', displayName: '📳 Breath', play: Presets.Breath },
  { name: 'Breathing', displayName: '📳 Breathing', play: Presets.Breathing },
  { name: 'Buildup', displayName: '📳 Buildup', play: Presets.Buildup },
  { name: 'Burst', displayName: '📳 Burst', play: Presets.Burst },
  { name: 'Buzz', displayName: '📳 Buzz', play: Presets.Buzz },
  { name: 'Cadence', displayName: '📳 Cadence', play: Presets.Cadence },
  { name: 'CameraShutter', displayName: '📳 CameraShutter', play: Presets.CameraShutter },
  { name: 'Canter', displayName: '📳 Canter', play: Presets.Canter },
  { name: 'Cascade', displayName: '📳 Cascade', play: Presets.Cascade },
  { name: 'Castanets', displayName: '📳 Castanets', play: Presets.Castanets },
  { name: 'CatPaw', displayName: '📳 CatPaw', play: Presets.CatPaw },
  { name: 'Charge', displayName: '📳 Charge', play: Presets.Charge },
  { name: 'Chime', displayName: '📳 Chime', play: Presets.Chime },
  { name: 'Chip', displayName: '📳 Chip', play: Presets.Chip },
  { name: 'Chirp', displayName: '📳 Chirp', play: Presets.Chirp },
  { name: 'Clamor', displayName: '📳 Clamor', play: Presets.Clamor },
  { name: 'Clasp', displayName: '📳 Clasp', play: Presets.Clasp },
  { name: 'Cleave', displayName: '📳 Cleave', play: Presets.Cleave },
  { name: 'Coil', displayName: '📳 Coil', play: Presets.Coil },
  { name: 'CoinDrop', displayName: '📳 CoinDrop', play: Presets.CoinDrop },
  { name: 'CombinationLock', displayName: '📳 CombinationLock', play: Presets.CombinationLock },
  { name: 'Crescendo', displayName: '📳 Crescendo', play: Presets.Crescendo },
  { name: 'Dewdrop', displayName: '📳 Dewdrop', play: Presets.Dewdrop },
  { name: 'Dirge', displayName: '📳 Dirge', play: Presets.Dirge },
  { name: 'Dissolve', displayName: '📳 Dissolve', play: Presets.Dissolve },
  { name: 'DogBark', displayName: '📳 DogBark', play: Presets.DogBark },
  { name: 'Drone', displayName: '📳 Drone', play: Presets.Drone },
  { name: 'EngineRev', displayName: '📳 EngineRev', play: Presets.EngineRev },
  { name: 'Exhale', displayName: '📳 Exhale', play: Presets.Exhale },
  { name: 'Explosion', displayName: '📳 Explosion', play: Presets.Explosion },
  { name: 'FadeOut', displayName: '📳 FadeOut', play: Presets.FadeOut },
  { name: 'Fanfare', displayName: '📳 Fanfare', play: Presets.Fanfare },
  { name: 'Feather', displayName: '📳 Feather', play: Presets.Feather },
  { name: 'Finale', displayName: '📳 Finale', play: Presets.Finale },
  { name: 'FingerDrum', displayName: '📳 FingerDrum', play: Presets.FingerDrum },
  { name: 'Firecracker', displayName: '📳 Firecracker', play: Presets.Firecracker },
  { name: 'Fizz', displayName: '📳 Fizz', play: Presets.Fizz },
  { name: 'Flare', displayName: '📳 Flare', play: Presets.Flare },
  { name: 'Flick', displayName: '📳 Flick', play: Presets.Flick },
  { name: 'Flinch', displayName: '📳 Flinch', play: Presets.Flinch },
  { name: 'Flourish', displayName: '📳 Flourish', play: Presets.Flourish },
  { name: 'Flurry', displayName: '📳 Flurry', play: Presets.Flurry },
  { name: 'Flush', displayName: '📳 Flush', play: Presets.Flush },
  { name: 'Gallop', displayName: '📳 Gallop', play: Presets.Gallop },
  { name: 'Gavel', displayName: '📳 Gavel', play: Presets.Gavel },
  { name: 'Glitch', displayName: '📳 Glitch', play: Presets.Glitch },
  { name: 'GuitarStrum', displayName: '📳 GuitarStrum', play: Presets.GuitarStrum },
  { name: 'Hail', displayName: '📳 Hail', play: Presets.Hail },
  { name: 'Hammer', displayName: '📳 Hammer', play: Presets.Hammer },
  { name: 'Heartbeat', displayName: '📳 Heartbeat', play: Presets.Heartbeat },
  { name: 'Herald', displayName: '📳 Herald', play: Presets.Herald },
  { name: 'HoofBeat', displayName: '📳 HoofBeat', play: Presets.HoofBeat },
  { name: 'Ignition', displayName: '📳 Ignition', play: Presets.Ignition },
  { name: 'Impact', displayName: '📳 Impact', play: Presets.Impact },
  { name: 'Jolt', displayName: '📳 Jolt', play: Presets.Jolt },
  { name: 'KeyboardMechanical', displayName: '📳 KeyboardMechanical', play: Presets.KeyboardMechanical },
  { name: 'KeyboardMembrane', displayName: '📳 KeyboardMembrane', play: Presets.KeyboardMembrane },
  { name: 'Knell', displayName: '📳 Knell', play: Presets.Knell },
  { name: 'Knock', displayName: '📳 Knock', play: Presets.Knock },
  { name: 'Lament', displayName: '📳 Lament', play: Presets.Lament },
  { name: 'Latch', displayName: '📳 Latch', play: Presets.Latch },
  { name: 'Lighthouse', displayName: '📳 Lighthouse', play: Presets.Lighthouse },
  { name: 'Lilt', displayName: '📳 Lilt', play: Presets.Lilt },
  { name: 'Lock', displayName: '📳 Lock', play: Presets.Lock },
  { name: 'Lope', displayName: '📳 Lope', play: Presets.Lope },
  { name: 'March', displayName: '📳 March', play: Presets.March },
  { name: 'Metronome', displayName: '📳 Metronome', play: Presets.Metronome },
  { name: 'Murmur', displayName: '📳 Murmur', play: Presets.Murmur },
  { name: 'Nudge', displayName: '📳 Nudge', play: Presets.Nudge },
  { name: 'PassingCar', displayName: '📳 PassingCar', play: Presets.PassingCar },
  { name: 'Patter', displayName: '📳 Patter', play: Presets.Patter },
  { name: 'Peal', displayName: '📳 Peal', play: Presets.Peal },
  { name: 'Peck', displayName: '📳 Peck', play: Presets.Peck },
  { name: 'Pendulum', displayName: '📳 Pendulum', play: Presets.Pendulum },
  { name: 'Ping', displayName: '📳 Ping', play: Presets.Ping },
  { name: 'Pip', displayName: '📳 Pip', play: Presets.Pip },
  { name: 'Piston', displayName: '📳 Piston', play: Presets.Piston },
  { name: 'Plink', displayName: '📳 Plink', play: Presets.Plink },
  { name: 'Plummet', displayName: '📳 Plummet', play: Presets.Plummet },
  { name: 'Plunk', displayName: '📳 Plunk', play: Presets.Plunk },
  { name: 'Poke', displayName: '📳 Poke', play: Presets.Poke },
  { name: 'Pound', displayName: '📳 Pound', play: Presets.Pound },
  { name: 'PowerDown', displayName: '📳 PowerDown', play: Presets.PowerDown },
  { name: 'Propel', displayName: '📳 Propel', play: Presets.Propel },
  { name: 'Pulse', displayName: '📳 Pulse', play: Presets.Pulse },
  { name: 'Pummel', displayName: '📳 Pummel', play: Presets.Pummel },
  { name: 'Push', displayName: '📳 Push', play: Presets.Push },
  { name: 'Radar', displayName: '📳 Radar', play: Presets.Radar },
  { name: 'Rain', displayName: '📳 Rain', play: Presets.Rain },
  { name: 'Ramp', displayName: '📳 Ramp', play: Presets.Ramp },
  { name: 'Rap', displayName: '📳 Rap', play: Presets.Rap },
  { name: 'Ratchet', displayName: '📳 Ratchet', play: Presets.Ratchet },
  { name: 'Rebound', displayName: '📳 Rebound', play: Presets.Rebound },
  { name: 'Ripple', displayName: '📳 Ripple', play: Presets.Ripple },
  { name: 'Rivet', displayName: '📳 Rivet', play: Presets.Rivet },
  { name: 'Rustle', displayName: '📳 Rustle', play: Presets.Rustle },
  { name: 'Shockwave', displayName: '📳 Shockwave', play: Presets.Shockwave },
  { name: 'Snap', displayName: '📳 Snap', play: Presets.Snap },
  { name: 'Sonar', displayName: '📳 Sonar', play: Presets.Sonar },
  { name: 'Spark', displayName: '📳 Spark', play: Presets.Spark },
  { name: 'Spin', displayName: '📳 Spin', play: Presets.Spin },
  { name: 'Stagger', displayName: '📳 Stagger', play: Presets.Stagger },
  { name: 'Stamp', displayName: '📳 Stamp', play: Presets.Stamp },
  { name: 'Stampede', displayName: '📳 Stampede', play: Presets.Stampede },
  { name: 'Stomp', displayName: '📳 Stomp', play: Presets.Stomp },
  { name: 'StoneSkip', displayName: '📳 StoneSkip', play: Presets.StoneSkip },
  { name: 'Strike', displayName: '📳 Strike', play: Presets.Strike },
  { name: 'Summon', displayName: '📳 Summon', play: Presets.Summon },
  { name: 'Surge', displayName: '📳 Surge', play: Presets.Surge },
  { name: 'Sway', displayName: '📳 Sway', play: Presets.Sway },
  { name: 'Sweep', displayName: '📳 Sweep', play: Presets.Sweep },
  { name: 'Swell', displayName: '📳 Swell', play: Presets.Swell },
  { name: 'Syncopate', displayName: '📳 Syncopate', play: Presets.Syncopate },
  { name: 'Throb', displayName: '📳 Throb', play: Presets.Throb },
  { name: 'Thud', displayName: '📳 Thud', play: Presets.Thud },
  { name: 'Thump', displayName: '📳 Thump', play: Presets.Thump },
  { name: 'Thunder', displayName: '📳 Thunder', play: Presets.Thunder },
  { name: 'ThunderRoll', displayName: '📳 ThunderRoll', play: Presets.ThunderRoll },
  { name: 'TickTock', displayName: '📳 TickTock', play: Presets.TickTock },
  { name: 'TidalSurge', displayName: '📳 TidalSurge', play: Presets.TidalSurge },
  { name: 'TideSwell', displayName: '📳 TideSwell', play: Presets.TideSwell },
  { name: 'Tremor', displayName: '📳 Tremor', play: Presets.Tremor },
  { name: 'Trigger', displayName: '📳 Trigger', play: Presets.Trigger },
  { name: 'Triumph', displayName: '📳 Triumph', play: Presets.Triumph },
  { name: 'Trumpet', displayName: '📳 Trumpet', play: Presets.Trumpet },
  { name: 'Typewriter', displayName: '📳 Typewriter', play: Presets.Typewriter },
  { name: 'Unfurl', displayName: '📳 Unfurl', play: Presets.Unfurl },
  { name: 'Vortex', displayName: '📳 Vortex', play: Presets.Vortex },
  { name: 'Wane', displayName: '📳 Wane', play: Presets.Wane },
  { name: 'WarDrum', displayName: '📳 WarDrum', play: Presets.WarDrum },
  { name: 'Waterfall', displayName: '📳 Waterfall', play: Presets.Waterfall },
  { name: 'Wave', displayName: '📳 Wave', play: Presets.Wave },
  { name: 'Wisp', displayName: '📳 Wisp', play: Presets.Wisp },
  { name: 'Wobble', displayName: '📳 Wobble', play: Presets.Wobble },
  { name: 'Woodpecker', displayName: '📳 Woodpecker', play: Presets.Woodpecker },
  { name: 'Zipper', displayName: '📳 Zipper', play: Presets.Zipper },
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
