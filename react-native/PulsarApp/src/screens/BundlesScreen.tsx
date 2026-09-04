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
import {
  loadBundle,
  type PresetHandle,
} from '../../assets/jacek-bundle.bundle';

// Regenerate with `npm run pulsar-gen` after every Studio export.
const Haptics = loadBundle({ withAssets: false });
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
          The `Loading` preset carries its animation as well as its pattern, so
          the view needs neither a source nor a haptics prop.
        </Text>
        <View style={styles.canvas}>
          <HapticLottieView
            ref={lottieRef}
            preset={Haptics.loadingAnimation}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => lottieRef.current?.play()}
        >
          <Text style={styles.buttonText}>▶ Replay animation</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Preset without audio</Text>
        <Text style={styles.body}>
          Without the .pulsar asset, play runs synchronously using the haptic
          pattern embedded in the generated module. Authored audio is not
          played.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Haptics.nokiaTune.play()}
        >
          <Text style={styles.buttonText}>Play haptics only</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Preset with audio</Text>
        <Text style={styles.body}>
          Loading with assets returns a Promise. Native code reads the .pulsar
          binary first; after that, play is synchronous and includes authored
          audio.
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

    loadBundle({ withAssets: true })
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
      onPress={() => bundle.nokiaTune.play()}
    >
      <Text style={styles.buttonText}>Play haptics + audio</Text>
    </TouchableOpacity>
  );
}

function PresetRow({ preset }: { preset: PresetHandle }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{preset.name}</Text>
        <Text style={styles.rowMeta}>
          {preset.duration ? `${preset.duration} ms` : 'no duration'}
          {preset.hasAudio ? ' · has audio' : ''}
          {preset.hasAnimation ? ' · has animation' : ''}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.smallButton}
        onPress={() => preset.play()}
      >
        <Text style={styles.buttonText}>▶</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  section: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginTop: 28,
    marginBottom: 8,
  },
  body: { fontSize: 14, lineHeight: 20, color: '#555', marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  rowMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  canvas: {
    marginTop: 12,
    height: 200,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
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
  smallButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: { color: 'white', fontSize: 15, fontWeight: '600' },
});
