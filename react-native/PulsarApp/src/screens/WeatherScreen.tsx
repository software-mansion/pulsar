import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Presets } from 'react-native-pulsar';
import { fetchCurrentWeather } from '../weather/fetchWeather';
import type { CurrentWeather } from '../weather/fetchWeather';
import {
  CONDITION_HAPTICS,
  mapWeatherCode,
} from '../weather/weatherCondition';

type WeatherState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; weather: CurrentWeather };

const playConditionHaptic = (weather: CurrentWeather) => {
  const { preset } = CONDITION_HAPTICS[mapWeatherCode(weather.weatherCode)];
  Presets[preset]();
};

export default function WeatherScreen() {
  const [state, setState] = useState<WeatherState>({ status: 'loading' });

  const load = useCallback(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    fetchCurrentWeather()
      .then(weather => {
        if (cancelled) return;
        setState({ status: 'success', weather });
        playConditionHaptic(weather);
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  const renderContent = () => {
    if (state.status === 'loading') {
      return <ActivityIndicator size="large" color="#007AFF" testID="weather-loading" />;
    }
    if (state.status === 'error') {
      return (
        <View style={styles.card}>
          <Text style={styles.errorText}>Could not load the weather.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    const { weather } = state;
    const { icon, label } = CONDITION_HAPTICS[mapWeatherCode(weather.weatherCode)];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        testID="weather-card"
        onPress={() => playConditionHaptic(weather)}
      >
        <Text style={styles.city}>{weather.city}</Text>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.temperature}>{Math.round(weather.temperature)}°C</Text>
        <Text style={styles.condition}>{label}</Text>
        <Text style={styles.hint}>Tap the card to feel the weather</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Weather</Text>
        <Text style={styles.subtitle}>Current conditions, felt through haptics</Text>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
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
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  city: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  icon: {
    fontSize: 64,
    marginVertical: 12,
  },
  temperature: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  condition: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
