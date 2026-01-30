import { SelectBox } from '../SelectBox/SelectBox';
import { Tag } from '../Tag/Tag';
import style from './Filters.module.scss';

interface Props {
  index?: number;
  children?: React.ReactNode;
}

export function Filters({ index, children }: Props) {
  return <div className={style.filters}>
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

    <Tag label="New" />
    <Tag label="Featured" variant="blue" />
    <Tag label="Active" variant="white" className="custom-class" />
  </div>
}
