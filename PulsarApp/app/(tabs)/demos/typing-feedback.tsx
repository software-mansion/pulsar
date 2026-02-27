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

export default function TypingFeedbackDemo() {
  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Typing feedback
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          This demo will showcase subtle haptics for keyboard taps and input confirmation.
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
