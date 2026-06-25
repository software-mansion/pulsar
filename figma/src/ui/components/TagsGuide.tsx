import styles from './TagsGuide.module.css';
import { useEffect, useState } from 'react';
import { TagsInfo } from './tagsInfo';
import iconClose from '../assets/icon-close.svg';

// "Tags guide" modal - the plugin counterpart to the docs TagsModal
// (docs/.../components/TagsModal). Explains every haptic tag grouped by
// dimension (Intensity / Sharpness / Shape / Duration) behind underlined
// tabs, with one blue-10 card per tag describing it and listing typical
// usage. Rendered inside App's shared .modal-card chrome, so it reuses the
// same head bar / close button recipe as PresetDetail.
export default function TagsGuide({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const group = TagsInfo[activeTab];

  // Esc closes - matches PresetDetail's affordance.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <header className={styles['modal-head']}>
        <div className={styles['modal-head-text']}>
          <div className={styles['modal-title']}>Tags guide</div>
        </div>
        <button
          className={styles['modal-close']}
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close"
        >
          <img src={iconClose} alt="" width={14} height={14} />
        </button>
      </header>

      <div className={styles['modal-body']}>
        <div className={styles['docs-tabs']} role="tablist">
          {TagsInfo.map((g, i) => (
            <button
              key={g.groupName}
              type="button"
              role="tab"
              aria-selected={activeTab === i}
              className={`${styles['docs-tab']}${activeTab === i ? ` ${styles['active']}` : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {g.groupName}
            </button>
          ))}
        </div>

        <div className={styles['tag-cards']}>
          {group.tags.map((tag) => (
            <div key={tag.name} className={styles['tag-card']}>
              <div className={styles['tag-pill']}>{tag.name}</div>
              <div className={styles['tag-desc']}>{tag.description}</div>
              <div className={styles['tag-usage']}>
                <span className={styles['tag-usage-label']}>Usage:</span> {tag.usage}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
