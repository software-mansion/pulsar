import type { Settings } from '../../shared/types';

export const DEFAULT_SETTINGS: Settings = {
  soundInEdit: true,
  compactLayout: false,
  fileKeyOverride: '',
  previewBaseUrlOverride: ''
};

// Development flag. Flip to `true` to reveal the in-plugin Debug tab (maintenance
// actions like clearing stored data). Read directly by the UI (not a persisted
// setting), so this single line is the only switch. Keep `false` on commits so
// the debug tab never ships to users.
export const DEV_MODE = false;
