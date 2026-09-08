import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  HapticLottieView,
  type HapticLottieRef,
} from 'react-native-pulsar-lottie';
import { type PresetHandle } from 'react-native-pulsar';
import {
  loadBundleSync,
  loadBundleWithAssetsAsync,
} from '../../assets/hapticsBundle.bundle';

// Regenerate with `npm run pulsar-gen` after every Studio export.
const Haptics = loadBundleSync();
type HapticsBundle = typeof Haptics;

// Bundle metadata is non-enumerable, so these are exactly the preset handles.
const presets = Object.values(Haptics) as PresetHandle[];

export default function BundlesScreen() {
  const lottieRef = React.useRef<HapticLottieRef>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Preset bundles</Text>
        <Text style={styles.body}>
          A .pulsar bundle authored in Pulsar Studio, loaded from its generated
          module. Preset names autocomplete and a typo is a compile error.
        </Text>

        <Text style={styles.section}>Play a preset</Text>
        {presets.map(preset => (
          <PresetRow key={preset.id} preset={preset} />
        ))}

        <Text style={styles.section}>Animation from a preset</Text>
        <Text style={styles.body}>
          The `lottie` preset carries its animation as well as its pattern, so
          the view needs neither a source nor a haptics prop.
        </Text>
        <View style={styles.canvas}>
          <HapticLottieView
            ref={lottieRef}
            preset={Haptics.lottie}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => lottieRef.current?.play()}>
          <Text style={styles.buttonText}>▶ Replay animation</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Preset without audio</Text>
        <Text style={styles.body}>
          `loadBundleSync()` never reads the .pulsar binary — it plays the
          pattern embedded in the generated module. "
          {Haptics.arcadeBonusAlert.name}" was authored with a sound, so on this
          path it plays haptics only.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Haptics.arcadeBonusAlert.play()}>
          <Text style={styles.buttonText}>Play haptics only</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Preset with audio</Text>
        <Text style={styles.body}>
          `loadBundleWithAssetsAsync()` hands the .pulsar to native code before
          it resolves, so the same preset plays its authored sound. After that,
          play() is synchronous on both paths.
        </Text>
        <AudioPresetDemo />
      </ScrollView>
    </SafeAreaView>
  );
}

function AudioPresetDemo() {
  const [bundle, setBundle] = React.useState<HapticsBundle>();
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    let cancelled = false;
    let loaded: HapticsBundle | undefined;

    loadBundleWithAssetsAsync()
      .then(withAssets => {
        loaded = withAssets;
        if (cancelled) {
          withAssets.dispose();
          return;
        }
        setBundle(withAssets);
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });

    return () => {
      cancelled = true;
      loaded?.dispose();
    };
  }, []);

  if (error) {
    return (
      <Text style={styles.body}>Failed to load audio bundle: {error}</Text>
    );
  }

  if (!bundle) {
    return <Text style={styles.body}>Loading audio bundle…</Text>;
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => bundle.arcadeBonusAlert.play()}>
      <Text style={styles.buttonText}>Play haptics + audio</Text>
    </TouchableOpacity>
  );
}

function PresetRow({ preset }: { preset: PresetHandle }) {
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Text style={styles.rowTitle}>{preset.name}</Text>
        <Text style={styles.rowMeta}>
          {preset.duration ? `${preset.duration} ms` : 'no duration'}
          {preset.hasAudio ? ' · has audio' : ''}
          {preset.hasAnimation ? ' · has animation' : ''}
        </Text>
      </View>
      <TouchableOpacity style={styles.smallButton} onPress={() => preset.play()}>
        <Text style={styles.buttonText}>▶</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  section: { fontSize: 17, fontWeight: '600', marginTop: 24, marginBottom: 8 },
  body: { fontSize: 14, color: '#444', lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  flex: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  smallButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  canvas: {
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    overflow: 'hidden',
  },
  lottie: { width: 180, height: 180 },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: 'white', fontSize: 15, fontWeight: '600' },
});
