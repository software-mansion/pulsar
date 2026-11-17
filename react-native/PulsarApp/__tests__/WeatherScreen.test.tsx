import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Presets } from 'react-native-pulsar';
import WeatherScreen from '../src/screens/WeatherScreen';

jest.mock('react-native-pulsar', () => require('react-native-pulsar/jest-mock'));

const weatherResponse = (weatherCode: number, temperature = 12.4) => ({
  ok: true,
  json: async () => ({
    current: { temperature_2m: temperature, weather_code: weatherCode },
  }),
});

const flush = () => ReactTestRenderer.act(async () => {});

const renderScreen = async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<WeatherScreen />);
  });
  return renderer;
};

const textOf = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  JSON.stringify(renderer.toJSON());

describe('WeatherScreen', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('shows loading, then the weather card and plays the condition haptic', async () => {
    let resolveFetch!: (value: unknown) => void;
    globalThis.fetch = jest.fn(
      () => new Promise(resolve => (resolveFetch = resolve)),
    ) as never;

    const renderer = await renderScreen();
    expect(renderer.root.findAllByProps({ testID: 'weather-loading' }).length).toBeGreaterThan(0);
    expect(Presets.rain).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      resolveFetch(weatherResponse(61));
    });

    const text = textOf(renderer);
    expect(text).toContain('Warsaw');
    expect(text).toContain('12');
    expect(text).toContain('Rain');
    expect(text).toContain('🌧️');
    expect(renderer.root.findAllByProps({ testID: 'weather-loading' })).toHaveLength(0);
    expect(Presets.rain).toHaveBeenCalledTimes(1);
  });

  it('replays the haptic when the card is tapped', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(weatherResponse(95)) as never;
    const renderer = await renderScreen();
    expect(Presets.thunder).toHaveBeenCalledTimes(1);

    await ReactTestRenderer.act(async () => {
      renderer.root.findByProps({ testID: 'weather-card' }).props.onPress();
    });
    expect(Presets.thunder).toHaveBeenCalledTimes(2);
  });

  it('plays different presets for different conditions', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(weatherResponse(71)) as never;
    await renderScreen();
    expect(Presets.feather).toHaveBeenCalledTimes(1);
    expect(Presets.rain).not.toHaveBeenCalled();
  });

  it.each([
    ['a network error', () => jest.fn().mockRejectedValue(new Error('offline'))],
    ['a non-OK response', () => jest.fn().mockResolvedValue({ ok: false, status: 500 })],
  ])('shows an error with Retry on %s and plays no haptic', async (_name, makeFetch) => {
    globalThis.fetch = makeFetch() as never;
    const renderer = await renderScreen();

    expect(textOf(renderer)).toContain('Could not load the weather.');
    expect(textOf(renderer)).toContain('Retry');
    expect(Presets.rain).not.toHaveBeenCalled();
    expect(Presets.thunder).not.toHaveBeenCalled();
  });

  it('refetches on Retry and shows the data on success', async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(weatherResponse(0, 21));
    globalThis.fetch = fetchMock as never;
    const renderer = await renderScreen();

    const retry = renderer.root.findAll(
      node => typeof node.props.onPress === 'function',
    )[0];
    await ReactTestRenderer.act(async () => {
      retry.props.onPress();
    });
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(textOf(renderer)).toContain('Clear');
    expect(textOf(renderer)).toContain('21');
    expect(Presets.bloom).toHaveBeenCalledTimes(1);
  });
});
