import { SelectBox } from '../SelectBox/SelectBox';
import { Tag } from '../Tag/Tag';
import style from './Filters.module.scss';
import { TagsInfo } from '../PresetsList/Tags';

interface Props {
  index?: number;
  children?: React.ReactNode;
}

function toOptions(tags: { name: string; description: string; usage: string }[]) {
  return tags.map(tag => ({
    label: tag.name,
    checked: false,
  }));
}

export function Filters({ index, children }: Props) {
  return <div className={style.filters}>

    <div className={style.optionsBar}>
      {TagsInfo.map((group) => (
        <SelectBox
          key={group.groupName}
          title={group.groupName}
          options={toOptions(group.tags)}
          onOptionsChange={(options) => console.log(options)}
        />
      ))}
    </div>

    <div className={style.tagsBar}>
      <Tag label="Success" cancellable />
      <Tag label="Warning" cancellable />
      <Tag label="Fail" cancellable />
      <Tag label="Clear all" />
    </div>

    <div className={style.resultCount}>3 results</div>

  </div>
}
