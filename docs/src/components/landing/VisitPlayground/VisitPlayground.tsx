import { Button } from '../Button/Button';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import styles from './VisitPlayground.module.scss';
import { BASE_PATH } from '../../../../config';
import commonStyles from '../common.module.scss';
import { EmojiButton } from '../EmojiButton/EmojiButton';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function VisitPlayground({ className }: { className?: string }) {
  return (
    <div className={`${styles.section} ${className || ''}`}>
      <div className={`${styles.layout} ${commonStyles.centerColumn}`}>
        <div className={styles.emojiBar}>
          <EmojiButton emoji="emoji1" size="small" />
          <EmojiButton emoji="emoji2" size="small" />
          <EmojiButton emoji="emoji3" size="small" />
          <EmojiButton emoji="emoji4" size="small" />
        </div>
        <SectionHeader
          title="Live Preview Playground"
          subtitle="Haptics are about feeling and emotions. With Pulsar, you can hear and feel with Live Preview."
        />
        <Button
          label="Connect your phone"
          url={`${BASE_PATH}/presets-playground`}
          className={commonStyles.spaceTopSmall}
          onClick={() => window.posthog?.capture('connect_phone_cta_clicked')}
        />
      </div>
    </div>
  );
}
