import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:pulsar/pulsar.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key, this.pulsar = const PulsarFacade()});

  final PulsarFacade pulsar;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pulsar Smoke Test',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
      ),
      home: PulsarSmokeScreen(pulsar: pulsar),
    );
  }
}

class PulsarSmokeScreen extends StatefulWidget {
  const PulsarSmokeScreen({super.key, required this.pulsar});

  final PulsarFacade pulsar;

  @override
  State<PulsarSmokeScreen> createState() => _PulsarSmokeScreenState();
}

class _PulsarSmokeScreenState extends State<PulsarSmokeScreen> {
  String _status = 'Idle. Tap the button to call Pulsar.';

  Future<void> _runSmokeTest() async {
    setState(() {
      _status = 'Calling Pulsar...';
    });

    try {
      final platformVersion = await widget.pulsar.getPlatformVersion();
      if (!mounted) {
        return;
      }

      setState(() {
        _status = 'Pulsar connected: ${platformVersion ?? 'Unknown platform'}';
      });
    } on PlatformException catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _status = 'Pulsar call failed: ${error.message ?? error.code}';
      });
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _status = 'Unexpected error: $error';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pulsar Smoke Test')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _status,
                key: const Key('pulsar-status-text'),
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                key: const Key('pulsar-smoke-button'),
                onPressed: _runSmokeTest,
                child: const Text('Run Pulsar smoke test'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class PulsarFacade {
  const PulsarFacade();

  Future<String?> getPlatformVersion() {
    return Pulsar().getPlatformVersion();
  }
}
