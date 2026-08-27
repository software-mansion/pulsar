import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  createBundle,
  createBundleFromAsset,
  loadBundle,
  type PresetHandle,
} from 'react-native-pulsar';
import { HapticLottieView, type HapticLottieRef } from 'react-native-pulsar-lottie';
import hapticsBundle from '../../assets/hapticsBundle.bundle.json';

// Regenerate with `npm run pulsar-gen` after every Studio export.
const Haptics = createBundle(hapticsBundle);

// Only presets are enumerable, so this is exactly the pack's contents.
const presetIds = Object.keys(Haptics) as (keyof typeof hapticsBundle.presets)[];

// The same sidecar, bound to the binary — the only path that carries the authored audio.
const withAudioDescriptor = createBundleFromAsset(
  hapticsBundle,
  require('../../assets/hapticsBundle.pulsar'),
);
const loadWithAudio = () => loadBundle(withAudioDescriptor);
type WithAudioBundle = Awaited<ReturnType<typeof loadWithAudio>>;

export default function BundlesScreen() {
  const lottieRef = React.useRef<HapticLottieRef>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Preset bundles</Text>
        <Text style={styles.body}>
          A .pulsar bundle authored in Pulsar Studio, loaded from its generated
          sidecar. Preset names autocomplete and a typo is a compile error.
        </Text>

        <Text style={styles.section}>Play a preset</Text>
        {presetIds.map(id => (
          <PresetRow key={id} preset={Haptics[id]} />
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

        <Text style={styles.section}>Presets with audio</Text>
        <AudioPresetDemo />
      </ScrollView>
    </SafeAreaView>
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
      <TouchableOpacity style={styles.smallButton} onPress={() => preset.play()}>
        <Text style={styles.buttonText}>▶</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Contrasts the two paths: the sidecar plays haptics alone, the binary brings the sound. */
function AudioPresetDemo() {
  const [withAudio, setWithAudio] = useState<WithAudioBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const play = async () => {
    try {
      const bundle = withAudio ?? (await loadWithAudio());
      if (!withAudio) {
        setWithAudio(bundle);
      }
      bundle.arcadeBonusAlert.play();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <>
      <Text style={styles.body}>
        "{Haptics.arcadeBonusAlert.name}" was authored with a sound. From the
        sidecar it plays haptics only; the same sidecar bound to the .pulsar
        binary plays both.
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.flex]}
          onPress={() => Haptics.arcadeBonusAlert.play()}>
          <Text style={styles.buttonText}>Haptics only</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.flex]} onPress={play}>
          <Text style={styles.buttonText}>With audio</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
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
  buttonRow: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
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
  error: { color: '#c00', fontSize: 12, marginTop: 8 },
});
