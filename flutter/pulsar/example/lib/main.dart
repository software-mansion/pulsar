import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:pulsar_haptics/pulsar_haptics.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Pulsar Haptics Example',
      home: HapticsDemo(),
    );
  }
}

class HapticsDemo extends StatefulWidget {
  const HapticsDemo({super.key});

  @override
  State<HapticsDemo> createState() => _HapticsDemoState();
}

class _HapticsDemoState extends State<HapticsDemo> {
  final _pulsar = Pulsar();
  String _supportStatus = 'Checking…';
  String _lastPlayed = '—';

  @override
  void initState() {
    super.initState();
    _checkSupport();
  }

  Future<void> _checkSupport() async {
    try {
      final support = await _pulsar.hapticSupport();
      final canPlay = await _pulsar.canPlayHaptics();
      if (!mounted) return;
      setState(() {
        _supportStatus = 'Support: $support  •  Can play: $canPlay';
      });
    } on PlatformException catch (e) {
      if (!mounted) return;
      setState(() => _supportStatus = 'Error: ${e.message}');
    }
  }

  Future<void> _play(String name, Future<void> Function() action) async {
    try {
      await action();
      if (!mounted) return;
      setState(() => _lastPlayed = name);
    } on PlatformException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: ${e.message}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final presets = _pulsar.presets;
    return Scaffold(
      appBar: AppBar(title: const Text('Pulsar Haptics')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(_supportStatus),
          const SizedBox(height: 4),
          Text('Last played: $_lastPlayed',
              style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 16),
          const Text('System', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Chip('Impact Light',
                  () => _play('systemImpactLight', presets.systemImpactLight)),
              _Chip('Impact Medium',
                  () => _play('systemImpactMedium', presets.systemImpactMedium)),
              _Chip('Impact Heavy',
                  () => _play('systemImpactHeavy', presets.systemImpactHeavy)),
              _Chip('Success',
                  () => _play('systemNotificationSuccess', presets.systemNotificationSuccess)),
              _Chip('Warning',
                  () => _play('systemNotificationWarning', presets.systemNotificationWarning)),
              _Chip('Error',
                  () => _play('systemNotificationError', presets.systemNotificationError)),
              _Chip('Selection',
                  () => _play('systemSelection', presets.systemSelection)),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Library presets', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Chip('Heartbeat',
                  () => _play('heartbeat', presets.heartbeat)),
              _Chip('Explosion',
                  () => _play('explosion', presets.explosion)),
              _Chip('Typewriter',
                  () => _play('typewriter', presets.typewriter)),
              _Chip('Thunder',
                  () => _play('thunder', presets.thunder)),
              _Chip('Coin Drop',
                  () => _play('coinDrop', presets.coinDrop)),
              _Chip('Buzz',
                  () => _play('buzz', presets.buzz)),
              _Chip('Camera Shutter',
                  () => _play('cameraShutter', presets.cameraShutter)),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Realtime composer', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          _RealtimeSlider(pulsar: _pulsar),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip(this.label, this.onTap);
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ActionChip(label: Text(label), onPressed: onTap);
  }
}

class _RealtimeSlider extends StatefulWidget {
  const _RealtimeSlider({required this.pulsar});
  final Pulsar pulsar;

  @override
  State<_RealtimeSlider> createState() => _RealtimeSliderState();
}

class _RealtimeSliderState extends State<_RealtimeSlider> {
  double _amplitude = 0.5;
  bool _active = false;

  Future<void> _onChanged(double value) async {
    setState(() => _amplitude = value);
    try {
      await widget.pulsar
          .getRealtimeComposer()
          .set(_amplitude, 0.5, startIfNeeded: true);
      if (!mounted) return;
      setState(() => _active = true);
    } on PlatformException {
      // silently ignore on simulator
    }
  }

  Future<void> _onChangeEnd(double _) async {
    try {
      await widget.pulsar.getRealtimeComposer().stop();
    } on PlatformException {
      // silently ignore on simulator
    }
    if (!mounted) return;
    setState(() => _active = false);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Amplitude: ${_amplitude.toStringAsFixed(2)}'
            '${_active ? '  ●' : ''}'),
        Slider(
          value: _amplitude,
          onChanged: _onChanged,
          onChangeEnd: _onChangeEnd,
        ),
      ],
    );
  }
}
