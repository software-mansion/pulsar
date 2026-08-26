import { ChevronLeftIcon } from './Icons';

type Props = {
  onBack: () => void;
  label?: string;
};

export function TopBar({ onBack, label = 'Demos' }: Props) {
  return (
    <div className="topbar">
      <button type="button" className="topbar__back" onClick={onBack}>
        <ChevronLeftIcon size={20} />
        {label}
      </button>
    </div>
  );
}
