import styles from './Tag.module.scss';
import xIcon from '../../../assets/new_assets/x.svg';

interface TagProps {
  label: string;
  variant?: 'white' | 'blue';
  className?: string;
  cancellable?: boolean;
  onCancel?: (label: string) => void;
  onClick?: () => void;
}

export function Tag(
  { 
    label, 
    variant = 'white', 
    className = '',
    cancellable = false,
    onCancel,
    onClick
  }
  : TagProps
) {
  const variantClass = variant === 'blue' ? styles.blue : styles.white;

  return (
    <div className={`${styles.tag} ${variantClass} ${className}`} onClick={onClick}>
      {label}
      {cancellable && <img src={xIcon.src} alt="remove" className={styles.xIcon} onClick={() => onCancel && onCancel(label)} />}
    </div>
  );
}
