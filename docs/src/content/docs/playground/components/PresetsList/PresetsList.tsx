import style from './PresetsList.module.scss';
import infoIcon from '../../../assets/new_assets/info.svg'
import { Filters } from '../Filters/Filters';
import { Preset } from '../Preset/Preset';
import { useState, useMemo } from 'react';
import type { PresetProps } from '../Preset/types';
import { TagsModal } from '../TagsModal/TagsModal';
import { TagsInfo } from './Tags';

const presets: Array<PresetProps> = [
  {
    name: '🧱 Falling Bricks',
    shortName: 'FallingBricks',
    description: "That feeling when some bricks fall onto your foot!",
    tags: [
      { label: "Short", variant: "blue" },
      { label: "Happiness", variant: "blue" }
    ]
  },
  {
    name: '🧱 Falling Bricks 2',
    shortName: 'FallingBricks',
    description: "That feeling when some bricks fall onto your foot!",
    tags: [
      { label: "Super short", variant: "blue" },
      { label: "Sadness", variant: "blue" }
    ]
  },
  {
    name: '🧱 Falling Bricks 2',
    shortName: 'FallingBricks',
    description: "That feeling when some bricks fall onto your foot!",
    tags: [
      { label: "Super short", variant: "blue" },
      { label: "Happiness", variant: "blue" }
    ]
  },
  {
    name: '🧱 Falling Bricks 2',
    shortName: 'FallingBricks',
    description: "That feeling when some bricks fall onto your foot!",
    tags: [
      { label: "Super short", variant: "blue" },
      { label: "Happiness", variant: "blue" }
    ]
  },
];

export function PresetsList() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const selectedTagsByGroup = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    
    selectedTags.forEach(tagName => {
      TagsInfo.forEach(group => {
        const tagExists = group.tags.some(tag => tag.name === tagName);
        if (tagExists) {
          if (!grouped[group.groupName]) {
            grouped[group.groupName] = [];
          }
          grouped[group.groupName].push(tagName);
        }
      });
    });
    
    return grouped;
  }, [selectedTags]);
  
  const filteredPresets = useMemo(() => {
    if (selectedTags.length === 0) {
      return presets;
    }
    
    return presets.filter(preset => {
      const presetTagLabels = preset.tags.map(tag => tag.label);
      
      for (const groupName in selectedTagsByGroup) {
        const selectedTagsInGroup = selectedTagsByGroup[groupName];
        const hasTagFromGroup = selectedTagsInGroup.some(tagName => 
          presetTagLabels.includes(tagName)
        );
        if (!hasTagFromGroup) {
          return false;
        }
      }
      
      return true;
    });
  }, [selectedTags, selectedTagsByGroup]);
  
  return <div className={['not-content', style.presets].join(' ')}>

    <div className={style.header}>
      <div className={style.title}>Presets</div>
      <div className={style.info} onClick={() => setShowModal(true)}>
        <div>Learn more about tags</div>
        <img src={infoIcon.src} />
      </div>
    </div>

    <Filters
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
    />

    <div className={style.resultCount}>{filteredPresets.length} results</div>

    {filteredPresets.map((preset, index) => (
      <Preset key={index} {...preset} />
    ))}
    
    {showModal && (
      <TagsModal onClose={() => setShowModal(false)} />
    )}
  </div>
}
