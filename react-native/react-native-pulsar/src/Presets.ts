import Pulsar from './NativeRNPulsar';

// workaround for RN prototype caching issue 
Pulsar.Pulsar_play;

export default {
  Earthquake: () => { 
    'worklet';
    Pulsar.Pulsar_play('Earthquake');
  },
  Success: () => {
    'worklet';
    Pulsar.Pulsar_play('Success');
  },
  Fail: () => {
    'worklet';
    Pulsar.Pulsar_play('Fail');
  },
  Tap: () => {
    'worklet';
    Pulsar.Pulsar_play('Tap');
  },
  System: {
    ImpactLight: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactSuccess');
    },
    ImpactMedium: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactSuccess');
    },
    ImpactHeavy: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactHeavy');
    },
    ImpactSoft: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactSoft');
    },
    ImpactRigid: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemImpactRigid');
    },
    NotificationSuccess: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemNotificationSuccess');
    },
    NotificationWarning: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemNotificationWarning');
    },
    NotificationError: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemNotificationError');
    },
    Selection: () => {
      'worklet';
      Pulsar.Pulsar_play('SystemSelection');
    },
  }
}
