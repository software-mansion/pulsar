import { SectionHeader } from '../SectionHeader/SectionHeader';
import { PhoneCarousel } from './PhoneCarousel';
import styles from './AppShowcase.module.scss';
import appleBadge from '../../../assets/landing-page/apple-store-badge.svg';
import googleBadge from '../../../assets/landing-page/google-play-badge.png';

const APP_STORE_URL =
  'https://apps.apple.com/pl/app/haptics-presets-pulsar/id6761362104';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.swmansion.pulsar.app';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function AppShowcase({ className }: { className?: string }) {
  return (
    <div className={`${styles.section} ${className || ''}`}>
      <div className={styles.left}>
        <SectionHeader
          title="Feel Pulsar in a real app"
          subtitle="Pulsar ships with a companion app built entirely around its haptics. Browse the preset library, fine-tune patterns in the playground, and feel them come alive across interactive demos — all on your own phone."
          align="left"
        />
        <div className={styles.storeButtons}>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              window.posthog?.capture('app_showcase_store_clicked', {
                store: 'app_store',
              })
            }
          >
            <img
              src={appleBadge.src}
              alt="Download on the App Store"
              className={styles.storeBadge}
            />
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              window.posthog?.capture('app_showcase_store_clicked', {
                store: 'google_play',
              })
            }
          >
            <img
              src={googleBadge.src}
              alt="Get it on Google Play"
              className={styles.storeBadge}
            />
          </a>
        </div>
      </div>
      <div className={styles.right}>
        <PhoneCarousel />
      </div>
    </div>
  );
}
