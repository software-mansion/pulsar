import styles from './Layout.module.scss';

export function BasicLayout({ 
  children,
  className
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.layout} ${className || ''}`}>
      {children}
    </div>
  );
}
