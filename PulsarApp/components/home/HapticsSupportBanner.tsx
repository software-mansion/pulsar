import { StyleSheet, TouchableOpacity } from 'react-native';
import { HapticSupport } from 'react-native-pulsar';

import Card from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';

export default function HapticsSupportBanner({
  level,
  onClose,
}: {
  level: HapticSupport;
  onClose: () => void;
}) {
  const getLevelInfo = (): { name: string; description: string } => {
    switch (level) {
      case HapticSupport.ADVANCED_SUPPORT:
        return { name: 'Advanced', description: 'All presets are fully supported on your device.' };
      case HapticSupport.STANDARD_SUPPORT:
        return { name: 'Standard', description: 'Most presets are fully supported on your device.' };
      case HapticSupport.LIMITED_SUPPORT:
        return {
          name: 'Limited',
          description: 'Some presets may not work as expected on your device.',
        };
      default:
        return { name: 'None', description: 'Your device does not support haptics.' };
    }
  };

  const { name, description } = getLevelInfo();

  return (
    <Card style={Margins.marginTop4X}>
      <TouchableOpacity onPress={onClose} style={styles.close}>
        <Icon name="x" size={34} color="#001A72" />
      </TouchableOpacity>
      <ThemedText type="subtitle">Haptic support: {name}</ThemedText>
      <ThemedText style={Margins.marginTop2X}>{description}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  close: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
});
