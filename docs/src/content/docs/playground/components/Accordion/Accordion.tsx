import { useState } from 'react';
import styles from './Accordion.module.scss';
import arrowIcon from '../../../assets/new_assets/arrow.svg';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Accordion({ title, children, defaultOpen = false, className }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`${styles.accordion} ${className || ''}`}>
      <div 
        className={styles.header} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <img 
          src={arrowIcon.src} 
          alt="toggle" 
          className={`${styles.arrow} ${isOpen ? styles.open : ''}`}
        />
        <span className={styles.title}>{title}</span>
      </div>
      {isOpen && (
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
}
