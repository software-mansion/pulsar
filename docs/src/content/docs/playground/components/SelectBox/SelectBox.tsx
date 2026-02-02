import { useState, useEffect } from 'react';
import styles from './SelectBox.module.scss';
import arrowIcon from '../../../assets/new_assets/arrow.svg';
import { Checkbox } from '../Checkbox/Checkbox';

interface SelectOption {
  id: string;
  label: string;
  checked: boolean;
}

interface SelectBoxProps {
  title: string;
  options: SelectOption[];
  onOptionsChange: (options: SelectOption[]) => void;
  className?: string;
}

export function SelectBox({ title, options: initialOptions, onOptionsChange, className = '' }: SelectBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(initialOptions);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleToggle = (id: string) => {
    const updated = options.map(opt => 
      opt.id === id ? { ...opt, checked: !opt.checked } : opt
    );
    setOptions(updated);
    onOptionsChange(updated);
  };

  const handleSelectAll = () => {
    const updated = options.map(opt => ({ ...opt, checked: true }));
    setOptions(updated);
    onOptionsChange(updated);
  };

  const handleDeselectAll = () => {
    const updated = options.map(opt => ({ ...opt, checked: false }));
    setOptions(updated);
    onOptionsChange(updated);
  };

  return (
    <div className={`${styles.selectBox} ${className}`}>
      <div
        className={styles.header}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.headerText}>{title}</span>
        <img 
          src={arrowIcon.src} 
          alt="toggle"
          className={`${styles.arrow} ${isOpen ? styles.open : ''}`}
        />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>

          <div className={styles.title}>{title}</div>

          <div className={styles.optionsContainer}>
            {options.map(option => (
              <Checkbox
                key={option.id}
                id={option.id}
                label={option.label}
                checked={option.checked}
                onChange={(id, checked) => {
                  const updated = options.map(opt =>
                    opt.id === id ? { ...opt, checked } : opt
                  );
                  setOptions(updated);
                  onOptionsChange(updated);
                }}
              />
            ))}
          </div>

          <div className={styles.actions}>
            <div onClick={handleSelectAll} className={styles.actionButton}>
              Select all
            </div>
            <div onClick={handleDeselectAll} className={styles.actionButton}>
              Deselect all
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
