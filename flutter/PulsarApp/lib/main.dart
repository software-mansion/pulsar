import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:pulsar_haptics/pulsar.dart';
import 'package:pulsar_haptics_lottie/pulsar_haptics_lottie.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pulsar Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const PulsarDemoScreen(),
    );
  }
}

class PulsarDemoScreen extends StatefulWidget {
  const PulsarDemoScreen({super.key});

  @override
  State<PulsarDemoScreen> createState() => _PulsarDemoScreenState();
}

class _PulsarDemoScreenState extends State<PulsarDemoScreen> {
  final _pulsar = Pulsar();
  late final PulsarPatternComposer _patternComposer =
      _pulsar.getPatternComposer();
  String _status = 'Ready';
  HapticSupport _hapticSupport = HapticSupport.noSupport;
  double _amplitude = 0.5;
  double _frequency = 0.5;

  @override
  void initState() {
    super.initState();
    _loadHapticSupport();
  }

  Future<void> _loadHapticSupport() async {
    try {
      final support = await _pulsar.hapticSupport();
      setState(() => _hapticSupport = support);
    } catch (_) {}
  }

  void _setStatus(String msg) => setState(() => _status = msg);

  Future<void> _tryHaptic(String label, Future<void> Function() action) async {
    _setStatus('Playing: $label…');
    try {
      await action();
      _setStatus('Played: $label');
    } catch (e) {
      _setStatus('Error: $e');
    }
  }

  // ── Realtime composer ──────────────────────────────────────────────────────

  Future<void> _onSliderChange(double value) async {
    setState(() => _amplitude = value);
    try {
      await _pulsar.getRealtimeComposer().set(_amplitude, _frequency);
    } catch (_) {}
  }

  Future<void> _onSliderEnd(double _) async {
    try {
      await _pulsar.getRealtimeComposer().stop();
      _setStatus('Realtime: stopped');
    } catch (_) {}
  }

  Future<void> _onFreqChange(double value) async {
    setState(() => _frequency = value);
  }

  // ── Pattern composer ───────────────────────────────────────────────────────

  Future<void> _playPattern() async {
    _setStatus('Playing custom pattern…');
    try {
      final pattern = PatternData(
        continuousPattern: ContinuousPattern(
          amplitude: const [
            ValuePoint(time: 0, value: 0.0),
            ValuePoint(time: 200, value: 0.8),
            ValuePoint(time: 600, value: 0.4),
            ValuePoint(time: 900, value: 0.0),
          ],
          frequency: const [
            ValuePoint(time: 0, value: 0.3),
            ValuePoint(time: 300, value: 0.7),
            ValuePoint(time: 900, value: 0.2),
          ],
        ),
        discretePattern: const [
          DiscretePoint(time: 0, amplitude: 1.0, frequency: 0.9),
          DiscretePoint(time: 450, amplitude: 0.7, frequency: 0.5),
        ],
      );
      await _patternComposer.parsePattern(pattern);
      await _patternComposer.play();
      _setStatus('Pattern: playing');
    } catch (e) {
      _setStatus('Pattern error: $e');
    }
  }

  Future<void> _playPatternWithSound() async {
    _setStatus('Playing pattern + sound…');
    try {
      final pattern = PatternData(
        continuousPattern: const ContinuousPattern(amplitude: [], frequency: []),
        discretePattern: const [
          DiscretePoint(time: 0, amplitude: 1.0, frequency: 0.8),
          DiscretePoint(time: 200, amplitude: 0.7, frequency: 0.5),
        ],
      );

      // A short sound played in sync with the haptics. A bare name defaults to
      // `.wav`, so bundle `beep.wav` natively — iOS: in the app bundle; Android:
      // in `res/raw` (use an explicit `beep.ogg` with baked haptic channels for
      // coupled sync). To ship it as a Flutter asset instead, copy it from
      // `rootBundle` to a temp file first and pass that absolute path. Missing
      // files degrade gracefully to haptics-only.
      await _patternComposer.parsePatternWithSound(
        pattern,
        const Sound(uri: 'beep', volume: 1.0, offset: 0),
      );
      await _patternComposer.play();
      _setStatus('Pattern + sound: playing');
    } catch (e) {
      _setStatus('Pattern + sound error: $e');
    }
  }

  // ── Audio-synced haptics ────────────────────────────────────────────────────

  // A haptic pattern authored to sync with `assets/sample-3s.mp3`: the discrete
  // beats land on the track's onsets, the continuous envelope traces its energy.
  final _audioPattern = PatternData.fromArrays(
    amplitude: [
      [0, 1],
      [209, 0.927],
      [348, 0.843],
      [580, 0.789],
      [720, 0.791],
      [859, 0.693],
      [1022, 0.718],
      [1161, 0.665],
      [1324, 0.565],
      [1463, 0.432],
      [1649, 0.201],
      [1788, 0.068],
      [3181, 0.014],
    ],
    frequency: [
      [0, 0.402],
      [232, 0.061],
      [604, 0.077],
      [836, 0.23],
      [1068, 0.293],
      [1324, 0.346],
      [1625, 0.437],
      [1904, 0.513],
      [2206, 0.63],
      [2438, 0.822],
      [2670, 0.975],
      [2902, 0.947],
      [3181, 0.861],
    ],
    discrete: [
      [70, 0.299, 0.159],
      [232, 0.401, 0.416],
      [441, 0.627, 0.663],
      [627, 0.31, 0.607],
      [836, 0.792, 0.634],
      [1022, 0.394, 0.379],
      [1231, 0.806, 0.679],
      [1440, 0.612, 0.525],
      [1649, 0.232, 0.767],
      [2020, 0.239, 0.625],
      [2438, 0.385, 0.743],
      [2624, 0.226, 0.468],
      [2833, 0.446, 0.733],
    ],
  );

  Future<void> _playAudioHaptics() async {
    _setStatus('Playing audio-synced haptics…');
    try {
      // Flutter assets don't live in the native bundle where the SDK resolves
      // sound uris, so copy the bundled clip to a temp file and pass its
      // absolute path. (On Android you can instead ship an `.ogg` with baked
      // haptic channels in `res/raw` for coupled sync.)
      final bytes = await rootBundle.load('assets/sample-3s.mp3');
      final file = File('${Directory.systemTemp.path}/pulsar-sample-3s.mp3');
      await file.writeAsBytes(bytes.buffer.asUint8List(), flush: true);

      await _patternComposer.parsePatternWithSound(
        _audioPattern,
        Sound(uri: file.path, volume: 1.0),
      );
      await _patternComposer.play();
      _setStatus('Audio-synced haptics: playing');
    } catch (e) {
      _setStatus('Audio haptics error: $e');
    }
  }

  // ── Lottie + haptics ────────────────────────────────────────────────────────

  // A haptic pattern spanning the ~2.4s "verified" animation. In the default
  // realtime mode the animation timeline is the master clock, so the haptics
  // swell and resolve into a firm confirming tap as the checkmark snaps in.
  final _verifiedPattern = PatternData.fromArrays(
    amplitude: [
      [0, 0],
      [300, 0.25],
      [900, 0.45],
      [1500, 0.65],
      [1850, 0.9],
      [2000, 0.15],
      [2436, 0],
    ],
    frequency: [
      [0, 0.35],
      [900, 0.5],
      [1850, 0.9],
      [2436, 0.55],
    ],
    discrete: [
      [100, 0.35, 0.55],
      [1500, 0.6, 0.7],
      [1850, 1, 0.9],
      [2050, 0.45, 0.6],
    ],
  );

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: cs.inversePrimary,
        title: const Text('Pulsar Haptics Demo'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Status + haptic support
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Status', style: Theme.of(context).textTheme.labelSmall),
                  const SizedBox(height: 4),
                  Text(_status, style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 8),
                  Text('Haptic support: ${_hapticSupport.name}',
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // System impacts
          _SectionHeader('System Impacts'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _PresetButton('Light', () => _tryHaptic('systemImpactLight', _pulsar.presets.systemImpactLight)),
              _PresetButton('Medium', () => _tryHaptic('systemImpactMedium', _pulsar.presets.systemImpactMedium)),
              _PresetButton('Heavy', () => _tryHaptic('systemImpactHeavy', _pulsar.presets.systemImpactHeavy)),
              _PresetButton('Soft', () => _tryHaptic('systemImpactSoft', _pulsar.presets.systemImpactSoft)),
              _PresetButton('Rigid', () => _tryHaptic('systemImpactRigid', _pulsar.presets.systemImpactRigid)),
            ],
          ),
          const SizedBox(height: 12),

          // System notifications
          _SectionHeader('System Notifications'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _PresetButton('Success', () => _tryHaptic('systemNotificationSuccess', _pulsar.presets.systemNotificationSuccess)),
              _PresetButton('Warning', () => _tryHaptic('systemNotificationWarning', _pulsar.presets.systemNotificationWarning)),
              _PresetButton('Error', () => _tryHaptic('systemNotificationError', _pulsar.presets.systemNotificationError)),
              _PresetButton('Selection', () => _tryHaptic('systemSelection', _pulsar.presets.systemSelection)),
            ],
          ),
          const SizedBox(height: 12),

          // Named presets
          _SectionHeader('Named Presets'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _PresetButton('Balloon Pop', () => _tryHaptic('balloonPop', _pulsar.presets.balloonPop)),
              _PresetButton('Heartbeat', () => _tryHaptic('heartbeat', _pulsar.presets.heartbeat)),
              _PresetButton('Hammer', () => _tryHaptic('hammer', _pulsar.presets.hammer)),
              _PresetButton('Buzz', () => _tryHaptic('buzz', _pulsar.presets.buzz)),
              _PresetButton('Tremor', () => _tryHaptic('tremor', _pulsar.presets.tremor)),
              _PresetButton('Fanfare', () => _tryHaptic('fanfare', _pulsar.presets.fanfare)),
              _PresetButton('Thunder', () => _tryHaptic('thunder', _pulsar.presets.thunder)),
              _PresetButton('Applause', () => _tryHaptic('applause', _pulsar.presets.applause)),
              _PresetButton('Zipper', () => _tryHaptic('zipper', _pulsar.presets.zipper)),
            ],
          ),
          const SizedBox(height: 12),

          // Pattern composer
          _SectionHeader('Pattern Composer'),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _playPattern,
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Play Custom Pattern'),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: () => _tryHaptic('patternStop', _patternComposer.stop),
                icon: const Icon(Icons.stop),
                label: const Text('Stop'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _playPatternWithSound,
              icon: const Icon(Icons.music_note),
              label: const Text('Play Pattern + Sound'),
            ),
          ),
          const SizedBox(height: 12),

          // Audio-synced haptics
          _SectionHeader('Audio-synced Haptics'),
          Text(
            'A 3-second music clip played through the pattern composer, with '
            'haptics authored to land on the beat. Best felt on a real device.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _playAudioHaptics,
              icon: const Icon(Icons.multitrack_audio),
              label: const Text('Play sample-3s.mp3 + Haptics'),
            ),
          ),
          const SizedBox(height: 12),

          // Lottie + haptics
          _SectionHeader('Lottie + Haptics'),
          Text(
            'A checkmark animation with haptics locked to its timeline — the '
            'animation drives the haptics (realtime mode).',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 8),
          Center(
            child: SizedBox(
              width: 160,
              height: 160,
              child: HapticLottie.asset(
                'assets/verified.json',
                haptics: _verifiedPattern,
                autoPlay: true,
                repeat: true,
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Realtime composer
          _SectionHeader('Realtime Composer'),
          Text('Amplitude: ${_amplitude.toStringAsFixed(2)}',
              style: Theme.of(context).textTheme.bodySmall),
          Slider(
            value: _amplitude,
            onChanged: _onSliderChange,
            onChangeEnd: _onSliderEnd,
          ),
          Text('Frequency (sharpness): ${_frequency.toStringAsFixed(2)}',
              style: Theme.of(context).textTheme.bodySmall),
          Slider(
            value: _frequency,
            onChanged: _onFreqChange,
          ),
          ElevatedButton.icon(
            onPressed: () => _tryHaptic(
              'realtimePlayDiscrete',
              () => _pulsar.getRealtimeComposer().playDiscrete(_amplitude, _frequency),
            ),
            icon: const Icon(Icons.flash_on),
            label: const Text('Play Discrete Event'),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.title);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: Theme.of(context)
            .textTheme
            .titleSmall
            ?.copyWith(color: Theme.of(context).colorScheme.primary),
      ),
    );
  }
}

class _PresetButton extends StatelessWidget {
  const _PresetButton(this.label, this.onTap);
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(onPressed: onTap, child: Text(label));
  }
}
