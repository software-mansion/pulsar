import styles from './EmojiButton.module.scss';
import emoji1 from '../../../assets/landing-page/emoji1.svg';
import emoji2 from '../../../assets/landing-page/emoji2.svg';
import emoji3 from '../../../assets/landing-page/emoji3.svg';
import emoji4 from '../../../assets/landing-page/emoji4.svg';

const emojiMap = {
  emoji1,
  emoji2,
  emoji3,
  emoji4,
};

interface EmojiButtonProps {
  emoji: string;
  size?: 'large' | 'small';
}

export function EmojiButton({ emoji, size = 'large' }: EmojiButtonProps) {
  const emojiSrc = emojiMap[emoji as keyof typeof emojiMap]?.src || '';
  const buttonClass = size === 'large' ? styles.large : styles.small;

  return (
    <div className={`${styles.buttonBackground} ${buttonClass}`}>
      <div className={styles.button}>
        <img className={styles.emoji} src={emojiSrc} alt={`${emoji} emoji`} />
      </div>
    </div>
  );
}
