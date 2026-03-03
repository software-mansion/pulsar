import style from './PresetsList.module.scss';
import infoIcon from '../../assets/new_assets/info.svg';
import { Filters } from '../Filters/Filters';
import { Preset } from '../Preset/Preset';
import { useState, useMemo } from 'react';
import { TagsModal } from '../TagsModal/TagsModal';
import { TagsInfo } from './Tags';
import { PresetsConfig } from './PresetsConfig';
import { NoResult } from '../NoResult/NoResult';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function PresetsList() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function handleSetSelectedTags(tags: string[]) {
    setSelectedTags(tags);
    if (tags.length > 0) {
      window.posthog?.capture('preset_filter_applied', {
        selected_tags: tags,
        tag_count: tags.length,
      });
    }
  }
  const selectedTagsByGroup = useMemo(() => {
    const grouped: Record<string, string[]> = {};

    selectedTags.forEach((tagName) => {
      TagsInfo.forEach((group) => {
        const tagExists = group.tags.some((tag) => tag.name === tagName);
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
      return PresetsConfig;
    }

    return PresetsConfig.filter((preset) => {
      const presetTagLabels = preset.tags.map((tag) => tag.label);

      for (const groupName in selectedTagsByGroup) {
        const selectedTagsInGroup = selectedTagsByGroup[groupName];
        const hasTagFromGroup = selectedTagsInGroup.some((tagName) =>
          presetTagLabels.includes(tagName),
        );
        if (!hasTagFromGroup) {
          return false;
        }
      }

      return true;
    });
  }, [selectedTags, selectedTagsByGroup]);

  return (
    <div className={['not-content', style.presets].join(' ')}>
      <div className={style.header}>
        <div className={style.title}>Presets</div>
        <div className={style.info} onClick={() => setShowModal(true)}>
          <div>Learn more about tags</div>
          <img src={infoIcon.src} />
        </div>
      </div>

      <Filters selectedTags={selectedTags} setSelectedTags={handleSetSelectedTags} />

      {filteredPresets.length > 0 && (
        <div className={style.resultCount}>{filteredPresets.length} results</div>
      )}

      {filteredPresets.length === 0 && <NoResult />}

      {filteredPresets.map((preset, index) => (
        <Preset key={index} {...preset} />
      ))}

      {showModal && <TagsModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
