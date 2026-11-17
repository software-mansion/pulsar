import type { Presets } from 'react-native-pulsar';

export type WeatherCondition =
  | 'clear'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

export const DEFAULT_CONDITION: WeatherCondition = 'cloudy';

export const mapWeatherCode = (code: number): WeatherCondition => {
  if (code === 0 || code === 1) return 'clear';
  if (code === 2 || code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  return DEFAULT_CONDITION;
};

type PresetName = Extract<keyof typeof Presets, string>;

export const CONDITION_HAPTICS: Record<
  WeatherCondition,
  { label: string; icon: string; preset: PresetName }
> = {
  clear: { label: 'Clear', icon: '☀️', preset: 'bloom' },
  cloudy: { label: 'Cloudy', icon: '☁️', preset: 'sway' },
  fog: { label: 'Fog', icon: '🌫️', preset: 'murmur' },
  rain: { label: 'Rain', icon: '🌧️', preset: 'rain' },
  snow: { label: 'Snow', icon: '❄️', preset: 'feather' },
  thunderstorm: { label: 'Thunderstorm', icon: '⛈️', preset: 'thunder' },
};
