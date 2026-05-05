import 'dart:async';

import 'package:flutter/material.dart';
import 'package:pulsar/pulsar.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  String _status = 'Checking haptics support...';
  final _pulsarPlugin = Pulsar();

  @override
  void initState() {
    super.initState();
    initPlatformState();
  }

  Future<void> initPlatformState() async {
    final support = await _pulsarPlugin.hapticSupport();
    final canPlay = await _pulsarPlugin.canPlayHaptics();

    if (!mounted) return;

    setState(() {
      _status = 'Support: $support\nCan play now: $canPlay';
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Plugin example app')),
        body: Center(child: Text('$_status\n')),
      ),
    );
  }
}
