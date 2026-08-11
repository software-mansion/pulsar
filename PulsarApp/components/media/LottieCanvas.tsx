import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// Guarded require: `lottie-react-native` is a native module. If the dev client hasn't been
// rebuilt since it was added, requiring it throws — and the AUDIO path must keep working.
// So we fall back to a placeholder instead of taking down the whole bundle.
let LottieView: React.ComponentType<{
  source: { uri: string };
  progress?: number;
  resizeMode?: 'cover' | 'contain' | 'center';
  style?: object;
}> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  LottieView = require('lottie-react-native').default;
} catch {
  LottieView = null;
}

/**
 * Renders a downloaded Lottie clip, its playhead driven by `progress` (0..1) — the SAME
 * clock the haptics run on (see MediaSessionContext), so animation and haptics stay in
 * lockstep. `repeat` restarts both because the clock resets to 0.
 */
export default function LottieCanvas({ uri, progress }: { uri: string; progress: number }) {
  if (!LottieView) {
    return (
      <View style={styles.fallback}>
        <ThemedText style={styles.fallbackText}>
          Rebuild the app to view Lottie animations here.
        </ThemedText>
      </View>
    );
  }
  return (
    <View style={styles.canvas}>
      <LottieView
        source={{ uri }}
        progress={Math.max(0, Math.min(1, progress))}
        resizeMode="contain"
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: 200,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#001A72',
    overflow: 'hidden',
    marginBottom: 12,
  },
  lottie: { width: '100%', height: '100%' },
  fallback: {
    height: 120,
    borderRadius: 12,
    backgroundColor: '#EAF4FB',
    borderWidth: 2,
    borderColor: '#001A72',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  fallbackText: { color: '#496695', fontSize: 13, textAlign: 'center' },
});
