import { ChevronRightIcon } from '../components/Icons';
import { DEMOS, type DemoSlug } from './demos';

type Props = {
  onOpen: (slug: DemoSlug) => void;
};

export function DemosScreen({ onOpen }: Props) {
  return (
    <div className="screen">
      <h1 className="title">Haptics demos</h1>
      <p className="lead">Feel them with real use cases.</p>

      <div className="stack">
        {DEMOS.map((demo) => (
          <button
            key={demo.slug}
            type="button"
            className="row-card"
            onClick={() => onOpen(demo.slug)}
          >
            <span className="row-card__label">{demo.title}</span>
            <ChevronRightIcon size={20} />
          </button>
        ))}
      </div>
    </div>
  );
}
