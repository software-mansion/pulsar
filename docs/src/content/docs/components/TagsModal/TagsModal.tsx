import { Modal } from '../Modal/Modal';
import { Tab, Tabs } from '../Tabs/Tabs';
import { TagDescription } from '../TagDescription/TagDescription';
import style from './TagsModal.module.scss';
import { TagsInfo } from '../PresetsList/Tags';

interface Props {
  onClose: () => void;
}

export function TagsModal({ onClose }: Props) {
  return (
    <Modal title="Connection guide" onClose={onClose}>
      <Tabs defaultTab={0}>
        {TagsInfo.map((group, index) => (
          <Tab key={index} name={group.groupName}>
            <div className={style.elementsGap}>
              {group.tags.map((tag, tagIndex) => (
                <TagDescription
                  key={tagIndex}
                  name={tag.name}
                  description={tag.description}
                  usage={tag.usage}
                />
              ))}
            </div>
          </Tab>
        ))}
      </Tabs>
    </Modal>
  );
}
