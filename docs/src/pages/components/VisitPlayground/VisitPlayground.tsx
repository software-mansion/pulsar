import { Button } from '../Button/Button';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import styles from './VisitPlayground.module.scss';
import commonStyles from './../../common.module.scss';
import { EmojiButton } from '../EmojiButton/EmojiButton';

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
        <Button label="Connect your phone" className={commonStyles.spaceTopSmall} />
      </div>
    </div>
  );
}
