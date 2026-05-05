import 'package:flutter/material.dart';
import 'package:pulsar/pulsar.dart';

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
      await _pulsar.realtimeComposer.set(_amplitude, _frequency);
    } catch (_) {}
  }

  Future<void> _onSliderEnd(double _) async {
    try {
      await _pulsar.realtimeComposer.stop();
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
      await _pulsar.patternComposer.parsePattern(pattern);
      await _pulsar.patternComposer.play();
      _setStatus('Pattern: playing');
    } catch (e) {
      _setStatus('Pattern error: $e');
    }
  }

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
              _PresetButton('Earthquake', () => _tryHaptic('earthquake', _pulsar.presets.earthquake)),
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
                onPressed: () => _tryHaptic('patternStop', _pulsar.patternComposer.stop),
                icon: const Icon(Icons.stop),
                label: const Text('Stop'),
              ),
            ],
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
              () => _pulsar.realtimeComposer.playDiscrete(_amplitude, _frequency),
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
