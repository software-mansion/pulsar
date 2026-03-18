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
  { name: 'AimingFire', displayName: '📳 AimingFire', play: Presets.AimingFire },
  { name: 'AimingLock', displayName: '📳 AimingLock', play: Presets.AimingLock },
  { name: 'Alarm', displayName: '📳 Alarm', play: Presets.Alarm },
  { name: 'AngerFrustration', displayName: '📳 AngerFrustration', play: Presets.AngerFrustration },
  { name: 'Applause', displayName: '📳 Applause', play: Presets.Applause },
  { name: 'Attention', displayName: '📳 Attention', play: Presets.Attention },
  { name: 'BalloonPop', displayName: '📳 BalloonPop', play: Presets.BalloonPop },
  { name: 'BangDoor', displayName: '📳 BangDoor', play: Presets.BangDoor },
  { name: 'Barrage', displayName: '📳 Barrage', play: Presets.Barrage },
  { name: 'BoredomFlat', displayName: '📳 BoredomFlat', play: Presets.BoredomFlat },
  { name: 'Breath', displayName: '📳 Breath', play: Presets.Breath },
  { name: 'BtnChip', displayName: '📳 BtnChip', play: Presets.BtnChip },
  { name: 'BtnDestructive', displayName: '📳 BtnDestructive', play: Presets.BtnDestructive },
  { name: 'BtnGhost', displayName: '📳 BtnGhost', play: Presets.BtnGhost },
  { name: 'BtnIcon', displayName: '📳 BtnIcon', play: Presets.BtnIcon },
  { name: 'BtnMenu', displayName: '📳 BtnMenu', play: Presets.BtnMenu },
  { name: 'BtnPrimary', displayName: '📳 BtnPrimary', play: Presets.BtnPrimary },
  { name: 'BtnSecondary', displayName: '📳 BtnSecondary', play: Presets.BtnSecondary },
  { name: 'BtnSubmit', displayName: '📳 BtnSubmit', play: Presets.BtnSubmit },
  { name: 'BtnToggleOff', displayName: '📳 BtnToggleOff', play: Presets.BtnToggleOff },
  { name: 'Buildup', displayName: '📳 Buildup', play: Presets.Buildup },
  { name: 'CameraShutter', displayName: '📳 CameraShutter', play: Presets.CameraShutter },
  { name: 'Cascade', displayName: '📳 Cascade', play: Presets.Cascade },
  { name: 'CleanStrike', displayName: '📳 CleanStrike', play: Presets.CleanStrike },
  { name: 'CoinDrop', displayName: '📳 CoinDrop', play: Presets.CoinDrop },
  { name: 'CombinationLock', displayName: '📳 CombinationLock', play: Presets.CombinationLock },
  { name: 'Confirm', displayName: '📳 Confirm', play: Presets.Confirm },
  { name: 'Cowboy', displayName: '📳 Cowboy', play: Presets.Cowboy },
  { name: 'Crescendo', displayName: '📳 Crescendo', play: Presets.Crescendo },
  { name: 'CrossedEyes', displayName: '📳 CrossedEyes', play: Presets.CrossedEyes },
  { name: 'Cursing', displayName: '📳 Cursing', play: Presets.Cursing },
  { name: 'DeepRumble', displayName: '📳 DeepRumble', play: Presets.DeepRumble },
  { name: 'DeepThud', displayName: '📳 DeepThud', play: Presets.DeepThud },
  { name: 'DogBark', displayName: '📳 DogBark', play: Presets.DogBark },
  { name: 'DoubleBeat', displayName: '📳 DoubleBeat', play: Presets.DoubleBeat },
  { name: 'DoubleBlast', displayName: '📳 DoubleBlast', play: Presets.DoubleBlast },
  { name: 'DoubleBurst', displayName: '📳 DoubleBurst', play: Presets.DoubleBurst },
  { name: 'DoubleClick', displayName: '📳 DoubleClick', play: Presets.DoubleClick },
  { name: 'DoubleGentleTap', displayName: '📳 DoubleGentleTap', play: Presets.DoubleGentleTap },
  { name: 'DoublePat', displayName: '📳 DoublePat', play: Presets.DoublePat },
  { name: 'DoublePulse', displayName: '📳 DoublePulse', play: Presets.DoublePulse },
  { name: 'DoublePunch', displayName: '📳 DoublePunch', play: Presets.DoublePunch },
  { name: 'DoubleStrike', displayName: '📳 DoubleStrike', play: Presets.DoubleStrike },
  { name: 'DoubleTap', displayName: '📳 DoubleTap', play: Presets.DoubleTap },
  { name: 'DoubleThud', displayName: '📳 DoubleThud', play: Presets.DoubleThud },
  { name: 'DoubleTriplet', displayName: '📳 DoubleTriplet', play: Presets.DoubleTriplet },
  { name: 'EngineRev', displayName: '📳 EngineRev', play: Presets.EngineRev },
  { name: 'ErrorBuzz', displayName: '📳 ErrorBuzz', play: Presets.ErrorBuzz },
  { name: 'ErrorSoft', displayName: '📳 ErrorSoft', play: Presets.ErrorSoft },
  { name: 'ExplodingHead', displayName: '📳 ExplodingHead', play: Presets.ExplodingHead },
  { name: 'Explosion', displayName: '📳 Explosion', play: Presets.Explosion },
  { name: 'EyeRolling', displayName: '📳 EyeRolling', play: Presets.EyeRolling },
  { name: 'FadeOut', displayName: '📳 FadeOut', play: Presets.FadeOut },
  { name: 'FanfareShort', displayName: '📳 FanfareShort', play: Presets.FanfareShort },
  { name: 'FirmImpact', displayName: '📳 FirmImpact', play: Presets.FirmImpact },
  { name: 'GameCombo', displayName: '📳 GameCombo', play: Presets.GameCombo },
  { name: 'GameHit', displayName: '📳 GameHit', play: Presets.GameHit },
  { name: 'GameLevelUp', displayName: '📳 GameLevelUp', play: Presets.GameLevelUp },
  { name: 'GamePickup', displayName: '📳 GamePickup', play: Presets.GamePickup },
  { name: 'Glitch', displayName: '📳 Glitch', play: Presets.Glitch },
  { name: 'GravityFreefall', displayName: '📳 GravityFreefall', play: Presets.GravityFreefall },
  { name: 'GrinningSquinting', displayName: '📳 GrinningSquinting', play: Presets.GrinningSquinting },
  { name: 'GuitarStrum', displayName: '📳 GuitarStrum', play: Presets.GuitarStrum },
  { name: 'Hail', displayName: '📳 Hail', play: Presets.Hail },
  { name: 'HappinessJoyful', displayName: '📳 HappinessJoyful', play: Presets.HappinessJoyful },
  { name: 'HappinessLight', displayName: '📳 HappinessLight', play: Presets.HappinessLight },
  { name: 'Heartbeat', displayName: '📳 Heartbeat', play: Presets.Heartbeat },
  { name: 'HeavyImpact', displayName: '📳 HeavyImpact', play: Presets.HeavyImpact },
  { name: 'KeyboardMechanical', displayName: '📳 KeyboardMechanical', play: Presets.KeyboardMechanical },
  { name: 'KeyboardMembrane', displayName: '📳 KeyboardMembrane', play: Presets.KeyboardMembrane },
  { name: 'KeyboardTypewriterOld', displayName: '📳 KeyboardTypewriterOld', play: Presets.KeyboardTypewriterOld },
  { name: 'KnockDoor', displayName: '📳 KnockDoor', play: Presets.KnockDoor },
  { name: 'LevelUp', displayName: '📳 LevelUp', play: Presets.LevelUp },
  { name: 'LoaderBreathing', displayName: '📳 LoaderBreathing', play: Presets.LoaderBreathing },
  { name: 'LoaderPulse', displayName: '📳 LoaderPulse', play: Presets.LoaderPulse },
  { name: 'LoaderRadar', displayName: '📳 LoaderRadar', play: Presets.LoaderRadar },
  { name: 'LoaderSpin', displayName: '📳 LoaderSpin', play: Presets.LoaderSpin },
  { name: 'LoaderWave', displayName: '📳 LoaderWave', play: Presets.LoaderWave },
  { name: 'Lock', displayName: '📳 Lock', play: Presets.Lock },
  { name: 'LongPress', displayName: '📳 LongPress', play: Presets.LongPress },
  { name: 'MarioGameOver', displayName: '📳 MarioGameOver', play: Presets.MarioGameOver },
  { name: 'MaxImpact', displayName: '📳 MaxImpact', play: Presets.MaxImpact },
  { name: 'MutedImpact', displayName: '📳 MutedImpact', play: Presets.MutedImpact },
  { name: 'NeutralClear', displayName: '📳 NeutralClear', play: Presets.NeutralClear },
  { name: 'NeutralSteady', displayName: '📳 NeutralSteady', play: Presets.NeutralSteady },
  { name: 'NewMessage', displayName: '📳 NewMessage', play: Presets.NewMessage },
  { name: 'Notification', displayName: '📳 Notification', play: Presets.Notification },
  { name: 'NotificationKnock', displayName: '📳 NotificationKnock', play: Presets.NotificationKnock },
  { name: 'NotificationUrgent', displayName: '📳 NotificationUrgent', play: Presets.NotificationUrgent },
  { name: 'NotifyInfoStandard', displayName: '📳 NotifyInfoStandard', play: Presets.NotifyInfoStandard },
  { name: 'NotifyReminderFinal', displayName: '📳 NotifyReminderFinal', play: Presets.NotifyReminderFinal },
  { name: 'NotifyReminderNudge', displayName: '📳 NotifyReminderNudge', play: Presets.NotifyReminderNudge },
  { name: 'NotifyReminderSoft', displayName: '📳 NotifyReminderSoft', play: Presets.NotifyReminderSoft },
  { name: 'NotifySocialMention', displayName: '📳 NotifySocialMention', play: Presets.NotifySocialMention },
  { name: 'NotifySocialMessage', displayName: '📳 NotifySocialMessage', play: Presets.NotifySocialMessage },
  { name: 'NotifySuccessSubtle', displayName: '📳 NotifySuccessSubtle', play: Presets.NotifySuccessSubtle },
  { name: 'NotifyTimerDone', displayName: '📳 NotifyTimerDone', play: Presets.NotifyTimerDone },
  { name: 'NotifyWarnMild', displayName: '📳 NotifyWarnMild', play: Presets.NotifyWarnMild },
  { name: 'NotifyWarnModerate', displayName: '📳 NotifyWarnModerate', play: Presets.NotifyWarnModerate },
  { name: 'PassingCar', displayName: '📳 PassingCar', play: Presets.PassingCar },
  { name: 'Pendulum', displayName: '📳 Pendulum', play: Presets.Pendulum },
  { name: 'PowerDown', displayName: '📳 PowerDown', play: Presets.PowerDown },
  { name: 'QuadBeat', displayName: '📳 QuadBeat', play: Presets.QuadBeat },
  { name: 'QuadRamp', displayName: '📳 QuadRamp', play: Presets.QuadRamp },
  { name: 'QuadThud', displayName: '📳 QuadThud', play: Presets.QuadThud },
  { name: 'Rain', displayName: '📳 Rain', play: Presets.Rain },
  { name: 'ReadySteadyGo', displayName: '📳 ReadySteadyGo', play: Presets.ReadySteadyGo },
  { name: 'ReliefSigh', displayName: '📳 ReliefSigh', play: Presets.ReliefSigh },
  { name: 'ReliefSoft', displayName: '📳 ReliefSoft', play: Presets.ReliefSoft },
  { name: 'Ripple', displayName: '📳 Ripple', play: Presets.Ripple },
  { name: 'SadnessMelancholic', displayName: '📳 SadnessMelancholic', play: Presets.SadnessMelancholic },
  { name: 'Searching', displayName: '📳 Searching', play: Presets.Searching },
  { name: 'SearchSuccess', displayName: '📳 SearchSuccess', play: Presets.SearchSuccess },
  { name: 'SelectionCrisp', displayName: '📳 SelectionCrisp', play: Presets.SelectionCrisp },
  { name: 'SelectionSnap', displayName: '📳 SelectionSnap', play: Presets.SelectionSnap },
  { name: 'Shockwave', displayName: '📳 Shockwave', play: Presets.Shockwave },
  { name: 'Sneezing', displayName: '📳 Sneezing', play: Presets.Sneezing },
  { name: 'Spark', displayName: '📳 Spark', play: Presets.Spark },
  { name: 'SuccessFlourish', displayName: '📳 SuccessFlourish', play: Presets.SuccessFlourish },
  { name: 'SuccessGentle', displayName: '📳 SuccessGentle', play: Presets.SuccessGentle },
  { name: 'SupportSteady', displayName: '📳 SupportSteady', play: Presets.SupportSteady },
  { name: 'SupportStrong', displayName: '📳 SupportStrong', play: Presets.SupportStrong },
  { name: 'SurpriseGasp', displayName: '📳 SurpriseGasp', play: Presets.SurpriseGasp },
  { name: 'Tada', displayName: '📳 Tada', play: Presets.Tada },
  { name: 'Thunder', displayName: '📳 Thunder', play: Presets.Thunder },
  { name: 'ThunderRoll', displayName: '📳 ThunderRoll', play: Presets.ThunderRoll },
  { name: 'TickTock', displayName: '📳 TickTock', play: Presets.TickTock },
  { name: 'TideSwell', displayName: '📳 TideSwell', play: Presets.TideSwell },
  { name: 'TripleBeat', displayName: '📳 TripleBeat', play: Presets.TripleBeat },
  { name: 'TripleClick', displayName: '📳 TripleClick', play: Presets.TripleClick },
  { name: 'TripleDecay', displayName: '📳 TripleDecay', play: Presets.TripleDecay },
  { name: 'TripleDrum', displayName: '📳 TripleDrum', play: Presets.TripleDrum },
  { name: 'TripleEscalation', displayName: '📳 TripleEscalation', play: Presets.TripleEscalation },
  { name: 'TripleFade', displayName: '📳 TripleFade', play: Presets.TripleFade },
  { name: 'TripleGentleTap', displayName: '📳 TripleGentleTap', play: Presets.TripleGentleTap },
  { name: 'TripleKnock', displayName: '📳 TripleKnock', play: Presets.TripleKnock },
  { name: 'TriplePat', displayName: '📳 TriplePat', play: Presets.TriplePat },
  { name: 'TriplePulse', displayName: '📳 TriplePulse', play: Presets.TriplePulse },
  { name: 'TripleStrike', displayName: '📳 TripleStrike', play: Presets.TripleStrike },
  { name: 'TripleSurge', displayName: '📳 TripleSurge', play: Presets.TripleSurge },
  { name: 'TripleTap', displayName: '📳 TripleTap', play: Presets.TripleTap },
  { name: 'TripleThud', displayName: '📳 TripleThud', play: Presets.TripleThud },
  { name: 'Victory', displayName: '📳 Victory', play: Presets.Victory },
  { name: 'Vomiting', displayName: '📳 Vomiting', play: Presets.Vomiting },
  { name: 'Vortex', displayName: '📳 Vortex', play: Presets.Vortex },
  { name: 'WarningPulse', displayName: '📳 WarningPulse', play: Presets.WarningPulse },
  { name: 'WarningSoft', displayName: '📳 WarningSoft', play: Presets.WarningSoft },
  { name: 'WarningUrgent', displayName: '📳 WarningUrgent', play: Presets.WarningUrgent },
  { name: 'Waterfall', displayName: '📳 Waterfall', play: Presets.Waterfall },
  { name: 'Woodpecker', displayName: '📳 Woodpecker', play: Presets.Woodpecker },
  { name: 'ZeldaChest', displayName: '📳 ZeldaChest', play: Presets.ZeldaChest },
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
