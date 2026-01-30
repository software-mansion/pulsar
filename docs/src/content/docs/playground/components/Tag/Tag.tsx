import styles from './Tag.module.scss';

interface TagProps {
  label: string;
  variant?: 'white' | 'blue';
  className?: string;
}

export function Tag({ label, variant = 'white', className = '' }: TagProps) {
  const variantClass = variant === 'blue' ? styles.blue : styles.white;

  return (
    <div className={`${styles.tag} ${variantClass} ${className}`}>
      {label}
    </div>
  );
}
