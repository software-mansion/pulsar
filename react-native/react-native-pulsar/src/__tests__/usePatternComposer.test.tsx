import usePatternComposer from '../usePatternComposer';
import Pulsar from '../NativeRNPulsar';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useCallback: (fn: unknown) => fn,
    useEffect: (fn: () => void) => {
      fn();
    },
  };
});

jest.mock('../useSharableState', () => ({
  useSharableState: (initialValue: number) => {
    let value = initialValue;
    return {
      get: () => value,
      set: (next: number) => {
        value = next;
      },
    };
  },
}));

jest.mock('../NativeRNPulsar', () => ({
  __esModule: true,
  default: {
    PatternComposer_parsePattern: jest.fn(),
    PatternComposer_parsePatternWithSound: jest.fn(),
    PatternComposer_play: jest.fn(),
    PatternComposer_stop: jest.fn(),
    PatternComposer_release: jest.fn(),
  },
}));

const native = Pulsar as jest.Mocked<typeof Pulsar>;

const pattern = (amplitude: number) => ({
  continuousPattern: {
    amplitude: [{ time: 0, value: amplitude }],
    frequency: [{ time: 0, value: 0.5 }],
  },
  discretePattern: [{ time: 0, amplitude, frequency: 0.5 }],
});

const withSound = (amplitude: number) => ({
  ...pattern(amplitude),
  sound: { uri: 'file:///clip.wav' },
});

beforeEach(() => {
  jest.clearAllMocks();
  let nextId = 100;
  native.PatternComposer_parsePattern.mockImplementation(() => nextId++);
  native.PatternComposer_parsePatternWithSound.mockImplementation(
    () => nextId++
  );
});

it('releases the previous native composer when it parses again', () => {
  const composer = usePatternComposer();

  composer.parse(pattern(0.4));
  expect(native.PatternComposer_release).not.toHaveBeenCalled();

  composer.parse(pattern(0.8));
  expect(native.PatternComposer_release).toHaveBeenCalledWith(100);

  composer.parse(pattern(0.2));
  expect(native.PatternComposer_release).toHaveBeenCalledWith(101);
  expect(native.PatternComposer_release).toHaveBeenCalledTimes(2);
});

it('releases the previous composer before registering the next audio resource', () => {
  const calls: string[] = [];
  native.PatternComposer_release.mockImplementation((id) =>
    calls.push(`release:${id}`)
  );
  native.PatternComposer_parsePatternWithSound.mockImplementation(() => {
    calls.push('parseWithSound');
    return 200;
  });

  const composer = usePatternComposer();
  composer.parse(withSound(0.4));
  composer.parse(withSound(0.8));

  expect(calls).toEqual(['parseWithSound', 'release:200', 'parseWithSound']);
});

it('plays the composer it parsed last', () => {
  const composer = usePatternComposer();

  composer.parse(pattern(0.4));
  composer.parse(pattern(0.8));
  composer.play();

  expect(native.PatternComposer_play).toHaveBeenCalledWith(101);
});
