import { Modal } from '../Modal/Modal';
import style from '../ChartModal/ChartModal.module.scss';

interface Props {
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={style.section}>
      <h3 className={style.sectionTitle}>{title}</h3>
      <div className={style.sectionContent}>{children}</div>
    </div>
  );
}

/**
 * Reference guide for the WEB preset chart. Unlike the mobile chart (which encodes
 * amplitude as height and frequency as color), the web chart draws the exact on/off
 * vibration signal sent to the Web Vibration API — uniform blocks, only timing varies.
 */
export function WebChartModal({ onClose }: Props) {
  return (
    <Modal title="Reference guide" onClose={onClose}>
      <div className={style.elementsGap}>
        <Section title="The signal">
          <p>
            The chart shows the exact on/off vibration signal that this preset sends to the Web
            Vibration API as it plays.
          </p>
          <ul>
            <li><strong>Filled blocks:</strong> moments the device is actively vibrating.</li>
            <li><strong>Gaps:</strong> pauses between vibrations, when nothing plays.</li>
          </ul>
          <p>Press play and a marker sweeps across the chart in sync, so you can match what you feel to what you see.</p>
        </Section>

        <Section title="Time">
          <p>The horizontal axis (X-axis) is time, read left to right in the order the vibrations fire.</p>
          <ul>
            <li><strong>Wider blocks:</strong> longer vibrations.</li>
            <li><strong>Narrower blocks:</strong> short, instantaneous taps.</li>
          </ul>
        </Section>

        <Section title="Blocks & bursts">
          <p>The shape of the blocks reveals the character of the effect:</p>
          <ul>
            <li><strong>A single solid block:</strong> one sustained, continuous vibration.</li>
            <li><strong>A run of closely-spaced blocks:</strong> a pulsing or buzzing effect — each block is an individual vibration shot.</li>
          </ul>
        </Section>

        <Section title="Why every block looks the same">
          <p>
            Web haptics are on/off only — there is no intensity or frequency control like on native
            iOS and Android. So every block has the same height and color; a preset's whole
            character comes from its timing and rhythm.
          </p>
        </Section>
      </div>
    </Modal>
  );
}
