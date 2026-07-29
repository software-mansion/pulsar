import styles from './StudioWhyPulsar.module.scss';
import { BasicLayout } from '../../landing/Layouts/BasicLayout';
import { BASE_PATH } from '../../../../config';

import emojiStar from '../../../assets/landing-page/emoji2.svg';
import emojiSad from '../../../assets/landing-page/emoji3.svg';
import emojiNeutral from '../../../assets/landing-page/emoji_neutral.svg';

// A short base sequence, duplicated so the column can loop seamlessly: the CSS
// marquee scrolls up by exactly one copy's height (translateY -50%), landing the
// second copy right where the first started.
const baseTiles = [emojiStar, emojiSad, emojiNeutral];
const tiles = [...baseTiles, ...baseTiles];

export function StudioWhyPulsar() {
  return (
    <section className={styles.section}>
      <BasicLayout>
        <div className={styles.inner}>
          <div className={styles.left}>
            <h2 className={styles.heading}>Why Pulsar?</h2>
            <p className={styles.paragraph}>
              Pulsar is an open-source haptics ecosystem with 150+ ready-to-use patterns for
              React Native, Swift, Kotlin, Kotlin Multiplatform, Flutter and the web. It comes with a
              companion app that lets you browse the presets and feel them on a real device
              before shipping. Now it also includes a Figma plugin, so designers can add real
              haptic prototypes directly to their designs.
            </p>
            <p className={styles.paragraph}>
              All to make haptics easy to build, ship, and maintain across platforms.
            </p>
            <a className={styles.link} href={`${BASE_PATH}/getting-started/`}>
              Learn more about Pulsar
            </a>
          </div>

          <div className={styles.right} aria-hidden="true">
            <div className={styles.tileColumn}>
              {tiles.map((tile, i) => (
                <div key={i} className={styles.tile}>
                  <img src={tile.src} alt="" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </BasicLayout>
    </section>
  );
}
