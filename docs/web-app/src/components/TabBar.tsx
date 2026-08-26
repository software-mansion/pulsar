import type { ReactElement } from 'react';
import { BrushIcon, GamepadIcon, ListIcon, SparklesIcon } from './Icons';
import { playTapCue } from '../haptics';

export type TabId = 'presets' | 'playground' | 'demos' | 'games';

const TABS: { id: TabId; label: string; icon: (props: { size?: number }) => ReactElement }[] = [
  { id: 'presets', label: 'Presets', icon: ListIcon },
  { id: 'playground', label: 'Playground', icon: BrushIcon },
  { id: 'demos', label: 'Demos', icon: SparklesIcon },
  { id: 'games', label: 'Games', icon: GamepadIcon },
];

type Props = {
  active: TabId;
  onSelect: (tab: TabId) => void;
};

export function TabBar({ active, onSelect }: Props) {
  return (
    <nav className="tabbar" aria-label="Sections">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`tabbar__item${active === id ? ' tabbar__item--active' : ''}`}
          aria-current={active === id ? 'page' : undefined}
          onClick={() => {
            playTapCue();
            onSelect(id);
          }}
        >
          <Icon size={24} />
          {label}
        </button>
      ))}
    </nav>
  );
}
