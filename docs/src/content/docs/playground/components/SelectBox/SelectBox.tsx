import { useState, useEffect, useRef } from 'react';
import styles from './SelectBox.module.scss';
import arrowIcon from '../../../assets/new_assets/arrow.svg';
import { Checkbox } from '../Checkbox/Checkbox';

interface SelectOption {
  label: string;
  checked: boolean;
}

interface SelectBoxProps {
  title: string;
  options: SelectOption[];
  onOptionChange: (options: SelectOption[]) => void;
  className?: string;
}

export function SelectBox({ title, options: initialOptions, onOptionChange: onOptionChange, className = '' }: SelectBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(initialOptions);
  const selectBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!selectBoxRef.current) return;

      const header = selectBoxRef.current.querySelector(`.${styles.header}`) as HTMLElement;
      const dropdown = selectBoxRef.current.querySelector(`.${styles.dropdown}`) as HTMLElement;

      const headerRect = header?.getBoundingClientRect();
      const dropdownRect = dropdown?.getBoundingClientRect();

      const isClickInHeader = headerRect &&
        event.clientX >= headerRect.left &&
        event.clientX <= headerRect.right &&
        event.clientY >= headerRect.top &&
        event.clientY <= headerRect.bottom;

      const isClickInDropdown = dropdownRect && 
        event.clientX >= dropdownRect.left &&
        event.clientX <= dropdownRect.right &&
        event.clientY >= dropdownRect.top &&
        event.clientY <= dropdownRect.bottom;

      const isClickInside = isClickInHeader || isClickInDropdown;

      if (!isClickInside && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSelectAll = () => {
    const updated = options.map(opt => ({ ...opt, checked: true }));
    setOptions(updated);
    onOptionChange(updated);
  };

  const handleDeselectAll = () => {
    const updated = options.map(opt => ({ ...opt, checked: false }));
    setOptions(updated);
    onOptionChange(updated);
  };

  return (
    <div className={`${styles.selectBox} ${className}`} ref={selectBoxRef}>
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
        <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>

          <div className={styles.title}>{title}</div>

          <div className={styles.optionsContainer}>
            {options.map(option => (
              <Checkbox
                key={option.label}
                id={option.label}
                label={option.label}
                checked={option.checked}
                onChange={(label, checked) => {
                  const updated = options.map(opt =>
                    opt.label === label ? { ...opt, checked } : opt
                  );
                  setOptions(updated);
                  onOptionChange([{label, checked}]);
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
