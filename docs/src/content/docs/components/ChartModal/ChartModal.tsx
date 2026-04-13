import { Modal } from '../Modal/Modal';
import style from './ChartModal.module.scss';

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

export function ChartModal({ onClose }: Props) {
  return (
    <Modal title="Reference guide" onClose={onClose}>
      <div className={style.elementsGap}>
        <Section title="Frequency">
          <p>The color of the haptic bars indicates the frequency (the "pitch" or "texture") of the vibration.</p>
          <ul>
            <li><strong>Warm colors (e.g., Red/Orange):</strong> Represent higher frequencies, creating a sharper, more buzzing sensation.</li>
            <li><strong>Cool colors (e.g., Blue/Purple):</strong> Represent lower frequencies, resulting in a deeper, more "thumping" feel. This allows you to see the "tone" of the vibration at a glance before even touching the screen.</li>
          </ul>
          <p className={style.scaleLabel}>Our scale:</p>
          <div className={style.colorScale} />
        </Section>

        <Section title="Intensity">
          <p>The vertical height (Y-axis) of each element represents the amplitude or intensity of the signal.</p>
          <ul>
            <li><strong>Higher values:</strong> Indicate a stronger, more forceful vibration that will be more "felt" by the hand.</li>
            <li><strong>Lower values:</strong> Represent a subtle, delicate haptic touch. The higher the bar climbs, the more powerful the feedback becomes.</li>
          </ul>
        </Section>

        <Section title="Time">
          <p>The horizontal axis (X-axis) represents time and the duration of the feedback.</p>
          <ul>
            <li><strong>Wider elements:</strong> Cover a longer time span, meaning the haptic effect lasts longer.</li>
            <li><strong>Narrower elements:</strong> Represent shorter, more instantaneous feedback.</li>
          </ul>
        </Section>

        <Section title="Chart elements">
          <p>Two types of elements are used to represent different kinds of haptic feedback:</p>
          <ul>
            <li><strong>Continuous line:</strong> Represents sustained haptic feedback that plays over a duration — a smooth, ongoing vibration.</li>
            <li><strong>Vertical bars:</strong> Represent short impulses or taps — instantaneous pulses that feel like a click or a brief burst.</li>
          </ul>
        </Section>
      </div>
    </Modal>
  );
}
