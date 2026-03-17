import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Settings, HapticSupport } from 'react-native-pulsar';
import type { Pattern } from 'react-native-pulsar';
import { TurboModuleRegistry } from 'react-native';

// Access the native module directly for PatternComposer methods
const PulsarNative = TurboModuleRegistry.getEnforcing('RNPulsar') as any;

const HAPTIC_SUPPORT_LABELS = {
  [HapticSupport.NO_SUPPORT]: 'No Support',
  [HapticSupport.MINIMAL_SUPPORT]: 'Minimal Support',
  [HapticSupport.LIMITED_SUPPORT]: 'Limited Support',
  [HapticSupport.STANDARD_SUPPORT]: 'Standard Support',
  [HapticSupport.ADVANCED_SUPPORT]: 'Advanced Support',
};

export default function PublicApisScreen() {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [hapticSupport, setHapticSupport] = useState<HapticSupport | null>(null);
  const [forcedSupportLevel, setForcedSupportLevel] = useState<HapticSupport | null>(null);
  const [patternIds, setPatternIds] = useState<number[]>([]);
  const [lastAction, setLastAction] = useState<string>('');

  useEffect(() => {
    // Get haptic support on mount
    const support = Settings.getHapticsSupportLevel();
    setHapticSupport(support);
  }, []);

  // Pulsar Global Methods
  const handlePlayPresetByName = () => {
    PulsarNative.Pulsar_play('Success');
    setLastAction('Played "Success" preset by name');
  };

  const handleToggleHaptics = () => {
    const newState = !hapticsEnabled;
    Settings.enableHaptics(newState);
    setHapticsEnabled(newState);
    setLastAction(`Haptics ${newState ? 'enabled' : 'disabled'}`);
  };

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    Settings.enableSound(newState);
    setSoundEnabled(newState);
    setLastAction(`Sound ${newState ? 'enabled' : 'disabled'}`);
  };

  const handleToggleCache = () => {
    const newState = !cacheEnabled;
    Settings.enableCache(newState);
    setCacheEnabled(newState);
    setLastAction(`Cache ${newState ? 'enabled' : 'disabled'}`);
  };

  const handleClearCache = () => {
    Settings.clearCache();
    setLastAction('Cache cleared');
  };

  const handlePreloadPresets = () => {
    Settings.preloadPresets(['Earthquake', 'Success', 'Fail']);
    setLastAction('Preloaded: Earthquake, Success, Fail');
  };

  const handleStopHaptics = () => {
    Settings.stopHaptics();
    setLastAction('All haptics stopped');
  };

  const handleShutDownEngine = () => {
    Settings.shutDownEngine();
    setLastAction('Engine shut down');
  };

  const handleGetHapticSupport = () => {
    const support = Settings.getHapticsSupportLevel();
    setHapticSupport(support);
    setLastAction(`Haptic support: ${HAPTIC_SUPPORT_LABELS[support]}`);
  };

  const handleForceSupport = (level: HapticSupport) => {
    Settings.forceHapticsSupportLevel(level);
    setForcedSupportLevel(level);
    setLastAction(`Forced support to: ${HAPTIC_SUPPORT_LABELS[level]}`);
  };

  // PatternComposer Methods
  const handleParsePattern = () => {
    const pattern: Pattern = {
      discretePattern: [
        { time: 0, amplitude: 1.0, frequency: 0.5 },
        { time: 200, amplitude: 0.8, frequency: 0.7 },
      ],
      continuousPattern: {
        amplitude: [
          { time: 0, value: 0.5 },
          { time: 300, value: 1.0 },
        ],
        frequency: [
          { time: 0, value: 0.5 },
          { time: 300, value: 0.8 },
        ],
      },
    };

    const patternId = PulsarNative.PatternComposer_parsePattern(pattern);
    setPatternIds([...patternIds, patternId]);
    setLastAction(`Pattern parsed with ID: ${patternId}`);
  };

  const handlePlayPattern = () => {
    if (patternIds.length === 0) {
      setLastAction('No patterns available. Parse a pattern first.');
      return;
    }
    const patternId = patternIds[patternIds.length - 1];
    PulsarNative.PatternComposer_play(patternId);
    setLastAction(`Playing pattern ID: ${patternId}`);
  };

  const handleReleasePattern = () => {
    if (patternIds.length === 0) {
      setLastAction('No patterns to release.');
      return;
    }
    const patternId = patternIds[patternIds.length - 1];
    PulsarNative.PatternComposer_release(patternId);
    setPatternIds(patternIds.slice(0, -1));
    setLastAction(`Released pattern ID: ${patternId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Public API Testing</Text>
        <Text style={styles.subtitle}>
          Test all public methods and settings
        </Text>

        {/* Status Display */}
        {lastAction && (
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Last Action:</Text>
            <Text style={styles.statusText}>{lastAction}</Text>
          </View>
        )}

        {/* Pulsar Global Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Pulsar Settings</Text>

          <ApiButton
            title="Play Preset by Name"
            subtitle="Pulsar_play('Success')"
            onPress={handlePlayPresetByName}
          />

          <ApiButton
            title={`${hapticsEnabled ? 'Disable' : 'Enable'} Haptics`}
            subtitle="Pulsar_enableHaptics()"
            onPress={handleToggleHaptics}
            status={hapticsEnabled ? '✅ Enabled' : '❌ Disabled'}
          />

          <ApiButton
            title={`${soundEnabled ? 'Disable' : 'Enable'} Sound`}
            subtitle="Pulsar_enableSound()"
            onPress={handleToggleSound}
            status={soundEnabled ? '✅ Enabled' : '❌ Disabled'}
          />

          <ApiButton
            title={`${cacheEnabled ? 'Disable' : 'Enable'} Cache`}
            subtitle="Pulsar_enableCache()"
            onPress={handleToggleCache}
            status={cacheEnabled ? '✅ Enabled' : '❌ Disabled'}
          />

          <ApiButton
            title="Clear Cache"
            subtitle="Pulsar_clearCache()"
            onPress={handleClearCache}
          />

          <ApiButton
            title="Preload Presets"
            subtitle="Pulsar_preloadPresets(['Earthquake', ...])"
            onPress={handlePreloadPresets}
          />

          <ApiButton
            title="Stop All Haptics"
            subtitle="Pulsar_stopHaptics()"
            onPress={handleStopHaptics}
          />

          <ApiButton
            title="Shut Down Engine"
            subtitle="Pulsar_shutDownEngine()"
            onPress={handleShutDownEngine}
          />
        </View>

        {/* Haptic Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Haptic Support</Text>

          <ApiButton
            title="Get Haptic Support"
            subtitle="Pulsar_hapticSupport()"
            onPress={handleGetHapticSupport}
            status={hapticSupport !== null ? HAPTIC_SUPPORT_LABELS[hapticSupport] : 'Unknown'}
          />

          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Force Support Level:</Text>
            {Object.entries(HAPTIC_SUPPORT_LABELS).map(([level, label]) => (
              <ApiButton
                key={level}
                title={label}
                subtitle={`Force to ${label}`}
                onPress={() => handleForceSupport(Number(level) as HapticSupport)}
                status={forcedSupportLevel === Number(level) ? '✓ Active' : ''}
                compact
              />
            ))}
          </View>
        </View>

        {/* Pattern Composer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎵 Pattern Composer</Text>

          <ApiButton
            title="Parse Pattern"
            subtitle="PatternComposer_parsePattern()"
            onPress={handleParsePattern}
            status={`${patternIds.length} pattern(s) parsed`}
          />

          <ApiButton
            title="Play Pattern"
            subtitle="PatternComposer_play()"
            onPress={handlePlayPattern}
            disabled={patternIds.length === 0}
          />

          <ApiButton
            title="Release Pattern"
            subtitle="PatternComposer_release()"
            onPress={handleReleasePattern}
            disabled={patternIds.length === 0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ApiButtonProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  status?: string;
  disabled?: boolean;
  compact?: boolean;
}

function ApiButton({ title, subtitle, onPress, status, disabled, compact }: ApiButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.apiButton,
        disabled && styles.apiButtonDisabled,
        compact && styles.apiButtonCompact,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <View style={styles.apiButtonContent}>
        <View style={styles.apiButtonText}>
          <Text style={[styles.apiButtonTitle, disabled && styles.apiButtonTitleDisabled]}>
            {title}
          </Text>
          <Text style={styles.apiButtonSubtitle}>{subtitle}</Text>
        </View>
        {status && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{status}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  statusBox: {
    backgroundColor: '#e8f4f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subSection: {
    marginTop: 12,
    marginLeft: 12,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  apiButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  apiButtonCompact: {
    padding: 12,
    marginBottom: 8,
  },
  apiButtonDisabled: {
    opacity: 0.5,
  },
  apiButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  apiButtonText: {
    flex: 1,
  },
  apiButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  apiButtonTitleDisabled: {
    color: '#999',
  },
  apiButtonSubtitle: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  statusBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
});
