import type { PresetConfig } from '../../components/Preset/types';

// CODEGEN_BEGIN_{imports}
import AimingFirePreset from './AimingFire.json';
import AimingFireImage from './AimingFire.png';
// CODEGEN_END_{imports}

export const PresetsConfig: Array<PresetConfig> = [
// CODEGEN_BEGIN_{presets}
  { data: AimingFirePreset, image: AimingFireImage },
  { data: AimingFirePreset, image: AimingFireImage },
// CODEGEN_END_{presets}
];
