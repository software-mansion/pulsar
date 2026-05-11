import { createNanoIconSet } from 'react-native-nano-icons';
import glyphMap from '@/assets/icons/nanoicons/pulsar-icons.glyphmap.json';

export const Icon = createNanoIconSet(glyphMap);

export type IconName = keyof typeof glyphMap.i;
