import styles from './VisitComposer.module.scss';

import { BASE_PATH } from '../../../../config';
import star from '../../../assets/landing-page/star.svg';
import { Button } from '../Button/Button';
import { SelectBox } from '../../../content/docs/components/SelectBox/SelectBox';
import { TagsInfo } from '../../../content/docs/components/PresetsList/Tags';

const SYSTEM_PRESET_OPTIONS = ['iOS', 'Android Primitives', 'Android Effects', 'Android Vendor'];

interface VisitComposerProps {
  className?: string;
}

export function VisitComposer({ className }: VisitComposerProps) {
  return (
    <div className={`${styles.background} ${className || ''}`}>
      <div className={styles.section}>
        <div className={styles.stars}>
          <img className={styles.star1} src={star.src} />
          <img className={styles.star2} src={star.src} />
        </div>

        <div className={styles.leftBar}>
          <div className={styles.header}>Not sure which one to choose?</div>
          <div className={styles.text}>
            Choosing the right one isn't obvious. We know this, so we prepared a composer that will
            make your choice much easier.
          </div>

          <div className={styles.optionsBar}>
            {TagsInfo.map((group) => (
              <SelectBox
                key={group.groupName}
                className={styles.selectBox}
                title={group.groupName}
                options={group.tags.map((tag) => ({ label: tag.name, checked: false }))}
                onOptionChange={() => {}}
              />
            ))}
            <SelectBox
              className={styles.selectBox}
              title="System presets"
              options={SYSTEM_PRESET_OPTIONS.map((name) => ({ label: name, checked: false }))}
              onOptionChange={() => {}}
              wide
            />
          </div>

          <Button
            className={styles.button}
            label="Visit our composer"
            url={`${BASE_PATH}/presets-playground/`}
          />
        </div>
      </div>
    </div>
  );
}
