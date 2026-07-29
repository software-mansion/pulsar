import type { CSSProperties } from 'react';
import styles from './StudioFeatures.module.scss';
import { BasicLayout } from '../../landing/Layouts/BasicLayout';

import designArt from '../../../assets/landing-page/studio-features/design.svg';
import tweakArt from '../../../assets/landing-page/studio-features/tweak.svg';
import generateArt from '../../../assets/landing-page/studio-features/generate.svg';
import createArt from '../../../assets/landing-page/studio-features/create.svg';
import previewArt from '../../../assets/landing-page/studio-features/preview.svg';
import exportArt from '../../../assets/landing-page/studio-features/export.svg';

interface Feature {
  lead: string;
  rest: string;
  img: string;
  // Placement of the artwork inside the (square) image box, taken verbatim from
  // Figma's 180px container — several icons are oversized graphics cropped by the
  // box, so the offsets/scale are what make them read correctly.
  art: CSSProperties;
}

const features: Feature[] = [
  {
    lead: 'Design',
    rest: ' custom haptic patterns from scratch',
    img: designArt.src,
    art: { width: '257.4%', height: '101.92%', left: '-136.67%', top: '14.24%' },
  },
  {
    lead: 'Tweak',
    rest: ' existing presets so they match your project',
    img: tweakArt.src,
    art: { width: '218.9%', height: '74.71%', left: '19.99%', top: '12.72%' },
  },
  {
    lead: 'Generate',
    rest: ' haptics from audio',
    img: generateArt.src,
    art: { width: '290.34%', height: '84.46%', left: '11.01%', top: '7.77%' },
  },
  {
    lead: 'Create',
    rest: ' haptics that match your Lottie animations',
    img: createArt.src,
    art: { width: '85.39%', height: '42.69%', left: '-12.46%', top: '28.66%' },
  },
  {
    lead: 'Preview',
    rest: ' everything in Figma or on a real device, using our companion app',
    img: previewArt.src,
    art: { width: '44.98%', height: '67.46%', left: '27.51%', top: '16.27%' },
  },
  {
    lead: 'Export',
    rest: ' the generated code and hand it off to your developers',
    img: exportArt.src,
    art: { width: '78.44%', height: '85.69%', left: '10.78%', top: '-2.98%' },
  },
];

export function StudioFeatures() {
  return (
    <section className={styles.section}>
      <BasicLayout>
        <h2 className={styles.heading}>Bring tailor-made haptics into your product</h2>

        <div className={styles.grid}>
          {features.map((f) => (
            <div key={f.lead} className={styles.card}>
              <p className={styles.text}>
                <strong>{f.lead}</strong>
                {f.rest}
              </p>
              <div className={styles.art}>
                <img src={f.img} alt="" aria-hidden="true" style={f.art} />
              </div>
            </div>
          ))}
        </div>
      </BasicLayout>
    </section>
  );
}
