import PresetsLight from '../PresetsLight';
import Presets from '../Presets';
import Pulsar from '../NativeRNPulsar';

jest.mock('../NativeRNPulsar', () => ({
  __esModule: true,
  default: { Pulsar_play: jest.fn() },
}));

const native = Pulsar as jest.Mocked<typeof Pulsar>;

beforeEach(() => native.Pulsar_play.mockClear());

describe('PresetsLight.playByName', () => {
  it('forwards the name to the native module', () => {
    PresetsLight.playByName('Afterglow');

    expect(native.Pulsar_play).toHaveBeenCalledWith('Afterglow');
  });

  it('plays what the matching Presets entry plays', () => {
    Presets.System.impactLight();
    const viaPresets = native.Pulsar_play.mock.calls[0]?.[0];
    native.Pulsar_play.mockClear();

    PresetsLight.playByName('SystemImpactLight');

    expect(native.Pulsar_play).toHaveBeenCalledWith(viaPresets);
  });
});
