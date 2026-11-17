import Presets from '../../react-native-pulsar/src/Presets';
import {
  CONDITION_HAPTICS,
  mapWeatherCode,
  type WeatherCondition,
} from '../src/weather/weatherCondition';
import {
  buildForecastUrl,
  fetchCurrentWeather,
} from '../src/weather/fetchWeather';

jest.mock('../../react-native-pulsar/src/NativeRNPulsar', () => ({
  __esModule: true,
  default: new Proxy({}, { get: () => jest.fn() }),
}));

describe('mapWeatherCode', () => {
  it.each([
    [0, 'clear'],
    [3, 'cloudy'],
    [45, 'fog'],
    [61, 'rain'],
    [71, 'snow'],
    [95, 'thunderstorm'],
  ])('maps %d to %s', (code, condition) => {
    expect(mapWeatherCode(code)).toBe(condition);
  });

  it.each([999, -1, NaN])('falls back for unknown code %d', code => {
    expect(() => mapWeatherCode(code)).not.toThrow();
    expect(Object.keys(CONDITION_HAPTICS)).toContain(mapWeatherCode(code));
  });
});

describe('fetchCurrentWeather', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('requests Open-Meteo and returns the current weather', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: { temperature_2m: 12.5, weather_code: 61 } }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await fetchCurrentWeather();

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.host).toBe('api.open-meteo.com');
    expect(url.searchParams.get('latitude')).toBe('52.23');
    expect(url.searchParams.get('longitude')).toBe('21.01');
    expect(url.searchParams.get('current')).toContain('weather_code');
    expect(result).toEqual({ city: 'Warsaw', temperature: 12.5, weatherCode: 61 });
  });

  it('builds a forecast url for the given coordinates', () => {
    expect(buildForecastUrl(1, 2)).toContain('latitude=1');
  });

  it('rejects on a network error', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('offline')) as never;
    await expect(fetchCurrentWeather()).rejects.toThrow('offline');
  });

  it('rejects on a non-OK response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as never;
    await expect(fetchCurrentWeather()).rejects.toThrow();
  });

  it('rejects on a malformed payload', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) }) as never;
    await expect(fetchCurrentWeather()).rejects.toThrow();
  });
});

describe('CONDITION_HAPTICS', () => {
  const conditions: WeatherCondition[] = [
    'clear', 'cloudy', 'fog', 'rain', 'snow', 'thunderstorm',
  ];

  it('has an existing preset for every condition', () => {
    conditions.forEach(condition => {
      const { preset, label, icon } = CONDITION_HAPTICS[condition];
      expect(label).toBeTruthy();
      expect(icon).toBeTruthy();
      expect(typeof Presets[preset]).toBe('function');
    });
  });

  it('maps conditions to different presets', () => {
    const presets = new Set(conditions.map(c => CONDITION_HAPTICS[c].preset));
    expect(presets.size).toBeGreaterThan(1);
  });
});
