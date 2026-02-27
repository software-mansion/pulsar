import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';

const defaultEdges = {
  top: 'additive',
  left: 'additive',
  bottom: 'off',
  right: 'additive',
};

export default function CameraShutterDemo() {
  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Camera shutter
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          This demo will pair a crisp haptic pulse with a camera shutter action.
        </ThemedText>
      </BasicLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
