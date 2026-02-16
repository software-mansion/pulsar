import { SelectBox } from '../SelectBox/SelectBox';
import { Tag } from '../Tag/Tag';
import style from './Filters.module.scss';
import { TagsInfo } from '../PresetsList/Tags';
import { useCallback, useState, useMemo } from 'react';

interface Props {}

function toOptions(tags: { name: string; description: string; usage: string }[]) {
  return tags.map(tag => ({
    label: tag.name,
    checked: false,
  }));
}

export function Filters({}: Props) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const onOptionChange = useCallback((options: { label: string; checked: boolean }[]) => {
    setSelectedTags(current => {
      const tags = new Set(current);
      options.forEach(opt => {
        opt.checked ? tags.add(opt.label) : tags.delete(opt.label);
      });
      return Array.from(tags);
    });
  }, []);

  const renderGroups = useMemo(() => {
    return TagsInfo.map((group) => ({
      groupName: group.groupName,
      options: group.tags.map(tag => ({
        label: tag.name,
        checked: selectedTags.includes(tag.name),
      })),
    }));
  }, [selectedTags]);

  return <div className={style.filters}>

    <div className={style.optionsBar}>
      {renderGroups.map((group) => (
        <SelectBox
          key={group.groupName}
          title={group.groupName}
          options={group.options}
          onOptionChange={onOptionChange}
        />
      ))}
    </div>

    <div className={style.tagsBar}>
      {selectedTags.map(tag => 
        <Tag 
          key={tag}
          label={tag}
          cancellable
          onCancel={(label) => {
            setSelectedTags(current => current.filter(t => t !== label));
          }}
        />
      )}
      {selectedTags.length > 0 && 
        <Tag
          label="Clear all"
          onClick={() => {
            setSelectedTags([]);
          }}
        />}
    </div>

    <div className={style.resultCount}>3 results</div>

  </div>
}
