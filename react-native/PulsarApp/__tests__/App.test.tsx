/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { Presets } from 'react-native-pulsar';
import App from '../App';

jest.mock('react-native-pulsar', () => require('react-native-pulsar/jest-mock'));
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: require('react-native').View,
}));

function mockStubScreen(label: string) {
  const { Text: StubText } = require('react-native');
  return { __esModule: true, default: () => <StubText>{label}</StubText> };
}

jest.mock('../src/screens/PresetsScreen', () => mockStubScreen('presets screen'));
jest.mock('../src/screens/RealtimeComposerScreen', () =>
  mockStubScreen('realtime screen'),
);
jest.mock('../src/screens/AudioHapticsScreen', () => mockStubScreen('audio screen'));
jest.mock('../src/screens/LottieHapticsScreen', () => mockStubScreen('lottie screen'));
jest.mock('../src/screens/BundlesScreen', () => mockStubScreen('bundles screen'));
jest.mock('../src/screens/PublicApisScreen', () => mockStubScreen('apis screen'));

const originalFetch = globalThis.fetch;

beforeEach(() => {
  jest.clearAllMocks();
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      current: { temperature_2m: 18.2, weather_code: 3 },
    }),
  }) as never;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const renderApp = async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  return renderer;
};

const textOf = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  JSON.stringify(renderer.toJSON());

const selectTab = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  title: string,
) => {
  const label = renderer.root.findAllByType(Text).find(
    node => node.props.children === title,
  );
  let node: ReactTestRenderer.ReactTestInstance | null = label ?? null;
  while (node && typeof node.props.onPress !== 'function') {
    node = node.parent;
  }
  await ReactTestRenderer.act(async () => {
    node?.props.onPress();
  });
};

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('shows the Weather tab and renders the weather card when selected', async () => {
  const renderer = await renderApp();
  expect(textOf(renderer)).toContain('Weather');

  await selectTab(renderer, 'Weather');

  const text = textOf(renderer);
  expect(text).toContain('Warsaw');
  expect(text).toContain('18');
  expect(text).toContain('Cloudy');
  expect(Presets.sway).toHaveBeenCalledTimes(1);
});

test.each([
  ['Presets', 'presets screen'],
  ['Realtime', 'realtime screen'],
  ['Audio', 'audio screen'],
  ['Lottie', 'lottie screen'],
  ['Bundles', 'bundles screen'],
  ['APIs', 'apis screen'],
])('switches to the %s tab', async (title, screenText) => {
  const renderer = await renderApp();
  await selectTab(renderer, 'Weather');
  await selectTab(renderer, title);

  expect(textOf(renderer)).toContain(screenText);
  expect(textOf(renderer)).not.toContain('Warsaw');
});
