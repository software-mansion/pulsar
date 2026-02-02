import { SelectBox } from '../SelectBox/SelectBox';
import { Tag } from '../Tag/Tag';
import style from './Filters.module.scss';

interface Props {
  index?: number;
  children?: React.ReactNode;
}

export function Filters({ index, children }: Props) {
  return <div className={style.filters}>

    <div className={style.optionsBar}>
      <SelectBox
        title="Feedback"
        options={[
          { id: 'success', label: 'Success', checked: true },
          { id: 'warning', label: 'Warning', checked: true },
          { id: 'fail', label: 'Fail', checked: true },
          { id: 'notification', label: 'Notification', checked: false },
        ]}
        onOptionsChange={(options) => console.log(options)}
      />
      <SelectBox
        title="Feedback"
        options={[
          { id: 'success', label: 'Success', checked: true },
          { id: 'warning', label: 'Warning', checked: true },
          { id: 'fail', label: 'Fail', checked: true },
          { id: 'notification', label: 'Notification', checked: false },
        ]}
        onOptionsChange={(options) => console.log(options)}
      />
      <SelectBox
        title="Feedback"
        options={[
          { id: 'success', label: 'Success', checked: true },
          { id: 'warning', label: 'Warning', checked: true },
          { id: 'fail', label: 'Fail', checked: true },
          { id: 'notification', label: 'Notification', checked: false },
        ]}
        onOptionsChange={(options) => console.log(options)}
      />
      <SelectBox
        title="Feedback"
        options={[
          { id: 'success', label: 'Success', checked: true },
          { id: 'warning', label: 'Warning', checked: true },
          { id: 'fail', label: 'Fail', checked: true },
          { id: 'notification', label: 'Notification', checked: false },
        ]}
        onOptionsChange={(options) => console.log(options)}
      />
      <SelectBox
        title="Feedback"
        options={[
          { id: 'success', label: 'Success', checked: true },
          { id: 'warning', label: 'Warning', checked: true },
          { id: 'fail', label: 'Fail', checked: true },
          { id: 'notification', label: 'Notification', checked: false },
        ]}
        onOptionsChange={(options) => console.log(options)}
      />
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
