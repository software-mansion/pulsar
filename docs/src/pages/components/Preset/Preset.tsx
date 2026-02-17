import style from './Preset.module.scss';
import { VisualizationPanel } from '../../../content/docs/components/VisualizationPanel/VisualizationPanel';
import { Tag } from '../../../content/docs/components/Tag/Tag';
import type { PresetProps } from '../../../content/docs/components/Preset/types';
import { Modal } from '../../../content/docs/components/Modal/Modal';
import { useState } from 'react';

export function Preset({ name, description, tags, duration = 0, visualization }: PresetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return <div className={style.preset}>

    {tags && tags.length > 0 && (
      <div className={style.tagsBar}>
        {tags.map((tag, idx) => (
          <Tag key={idx} label={tag.label} variant={tag.variant} />
        ))}
      </div>
    )}

    <div className={style.header}>
      <div className={style.name}>{name}</div>
      <div className={style.description}>{description}</div>
    </div>
    
    <VisualizationPanel
      visualization={visualization}
      duration={duration}
      playOnDevice={() => setIsModalOpen(true)}
    />

    {isModalOpen && (
      <Modal title='Play on device' onClose={() => setIsModalOpen(false)}>
        // TODO
      </Modal>
    )}
  </div>
}
