import { SelectBox } from '../SelectBox/SelectBox';
import { Tag } from '../Tag/Tag';
import style from './Filters.module.scss';
import { TagsInfo } from '../PresetsList/Tags';
import { useCallback, useMemo } from 'react';

interface Props {
  selectedTags: string[];
  setSelectedTags: (tags: string[] | ((tags: string[]) => string[])) => void;
}

export function Filters({ selectedTags, setSelectedTags }: Props) {
  const onOptionChange = useCallback((options: { label: string; checked: boolean }[]) => {
    setSelectedTags(current => {
      const tags = new Set(current);
      options.forEach(opt => {
        opt.checked ? tags.add(opt.label) : tags.delete(opt.label);
      });
      return Array.from(tags);
    });
  }, [setSelectedTags]);

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
          className={style.tagMargin}
          cancellable
          onCancel={(label) => {
            setSelectedTags(current => current.filter(t => t !== label));
          }}
        />
      )}
      {selectedTags.length > 0 && 
        <Tag
          label="Clear all"
          className={style.tagMargin}
          onClick={() => {
            setSelectedTags([]);
          }}
        />}
    </div>

  </div>
}
