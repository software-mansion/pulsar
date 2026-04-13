import { SelectBox } from '../SelectBox/SelectBox';
import { Tag } from '../Tag/Tag';
import style from './Filters.module.scss';
import { TagsInfo } from '../PresetsList/Tags';
import { useCallback, useMemo } from 'react';

const SYSTEM_PRESET_OPTIONS = ['iOS', 'Android Primitives', 'Android Effects', 'Android Vendor'];

interface Props {
  selectedTags: string[];
  setSelectedTags: (tags: string[] | ((tags: string[]) => string[])) => void;
  selectedSystemPresets: string[];
  setSelectedSystemPresets: (value: string[] | ((v: string[]) => string[])) => void;
}

export function Filters({ selectedTags, setSelectedTags, selectedSystemPresets, setSelectedSystemPresets }: Props) {
  const onOptionChange = useCallback(
    (options: { label: string; checked: boolean }[]) => {
      setSelectedTags((current) => {
        const tags = new Set(current);
        options.forEach((opt) => {
          opt.checked ? tags.add(opt.label) : tags.delete(opt.label);
        });
        return Array.from(tags);
      });
    },
    [setSelectedTags],
  );

  const onSystemPresetChange = useCallback(
    (options: { label: string; checked: boolean }[]) => {
      setSelectedSystemPresets((current) => {
        const set = new Set(current);
        options.forEach((opt) => {
          opt.checked ? set.add(opt.label) : set.delete(opt.label);
        });
        return Array.from(set);
      });
    },
    [setSelectedSystemPresets],
  );

  const renderGroups = useMemo(() => {
    return TagsInfo.map((group) => ({
      groupName: group.groupName,
      options: group.tags.map((tag) => ({
        label: tag.name,
        checked: selectedTags.includes(tag.name),
      })),
    }));
  }, [selectedTags]);

  const systemPresetsOptions = useMemo(() => {
    return SYSTEM_PRESET_OPTIONS.map((name) => ({
      label: name,
      checked: selectedSystemPresets.includes(name),
    }));
  }, [selectedSystemPresets]);

  return (
    <div className={style.filters}>
      <div className={style.optionsBar}>
        {renderGroups.map((group) => (
          <SelectBox
            key={group.groupName}
            title={group.groupName}
            options={group.options}
            onOptionChange={onOptionChange}
          />
        ))}
        <SelectBox
          title="System presets"
          options={systemPresetsOptions}
          onOptionChange={onSystemPresetChange}
          wide
        />
      </div>

      <div className={style.tagsBar}>
        {selectedTags.map((tag) => (
          <Tag
            key={tag}
            label={tag}
            className={style.tagMargin}
            cancellable
            onCancel={(label) => {
              setSelectedTags((current) => current.filter((t) => t !== label));
            }}
          />
        ))}
        {selectedTags.length > 0 && (
          <Tag
            label="Clear all"
            className={style.tagMargin}
            onClick={() => {
              setSelectedTags([]);
            }}
          />
        )}
      </div>
    </div>
  );
}
