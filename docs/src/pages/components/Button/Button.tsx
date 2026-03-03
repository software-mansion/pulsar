import styles from './Button.module.scss';

import arrowIcon from '../../../assets/landing-page/arrow-icon.svg';

interface ButtonProps {
  label: string;
  url?: string;
  variant?: 'filled' | 'unfilled';
  className?: string;
  onClick?: () => void;
}

export function Button({
  label,
  url = '#',
  variant = 'unfilled',
  className = '',
  onClick,
}: ButtonProps) {
  return (
    <div className={`${styles.background} ${className}`}>
      <a
        className={[
          styles.innerHolder,
          variant === 'filled' ? styles.filled : styles.unfilled,
        ].join(' ')}
        href={url}
        onClick={onClick}
      >
        {label}
        <img src={arrowIcon.src} alt="arrow" />
      </a>
    </div>
  );
}
