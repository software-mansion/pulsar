import Pulsar from './NativeRNPulsar';

Pulsar.play;

export const Presets = {
  Earthquake: () => { 
    'worklet';
    Pulsar.play('Earthquake');
  },
  Success: () => {
    'worklet';
    Pulsar.play('Success');
  },
  Fail: () => {
    'worklet';
    Pulsar.play('Fail');
  },
  Tap: () => {
    'worklet';
    Pulsar.play('Tap');
  },
  System: {
    ImpactLight: () => {
      'worklet';
      Pulsar.play('SystemImpactSuccess');
    },
    ImpactMedium: () => {
      'worklet';
      Pulsar.play('SystemImpactSuccess');
    },
    ImpactHeavy: () => {
      'worklet';
      Pulsar.play('SystemImpactHeavy');
    },
    ImpactSoft: () => {
      'worklet';
      Pulsar.play('SystemImpactSoft');
    },
    ImpactRigid: () => {
      'worklet';
      Pulsar.play('SystemImpactRigid');
    },
    NotificationSuccess: () => {
      'worklet';
      Pulsar.play('SystemNotificationSuccess');
    },
    NotificationWarning: () => {
      'worklet';
      Pulsar.play('SystemNotificationWarning');
    },
    NotificationError: () => {
      'worklet';
      Pulsar.play('SystemNotificationError');
    },
    Selection: () => {
      'worklet';
      Pulsar.play('SystemSelection');
    },
  }
}