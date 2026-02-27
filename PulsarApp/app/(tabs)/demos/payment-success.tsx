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

export default function PaymentSuccessDemo() {
  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Payment success
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          This demo will highlight a short celebratory haptic pattern for successful payments.
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
