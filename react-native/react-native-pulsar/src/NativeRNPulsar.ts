import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  play(name: string): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNPulsar');
