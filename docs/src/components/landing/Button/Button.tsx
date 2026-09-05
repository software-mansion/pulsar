import styles from './Button.module.scss';

import arrowIcon from '../../../assets/landing-page/arrow-icon.svg';

interface ButtonProps {
  label: string;
  url?: string;
  variant?: 'filled' | 'unfilled';
  className?: string;
  onClick?: () => void;
  analytics?: Record<string, string>;
}

export function Button({
  label,
  url,
  variant = 'unfilled',
  className = '',
  onClick,
  analytics,
}: ButtonProps) {
  const classes = [
    styles.innerHolder,
    variant === 'filled' ? styles.filled : styles.unfilled,
  ].join(' ');

  return (
    <div className={`${styles.background} ${className}`}>
      {url ? (
        <a className={classes} href={url} onClick={onClick} {...analytics}>
          {label}
          <img src={arrowIcon.src} alt="arrow" />
        </a>
      ) : (
        <button className={classes} type="button" onClick={onClick} {...analytics}>
          {label}
          <img src={arrowIcon.src} alt="arrow" />
        </button>
      )}
    </div>
  );
}
