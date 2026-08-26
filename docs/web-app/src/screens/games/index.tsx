import type { ReactElement } from 'react';
import { TopBar } from '../../components/TopBar';
import { CandyCascade } from './candy/CandyCascade';

export const GAMES = [
  {
    slug: 'candy-cascade',
    title: 'Candy Cascade',
    tagline: 'Match three, chase cascades, feel every combo.',
    render: () => <CandyCascade />,
  },
] as const satisfies readonly {
  slug: string;
  title: string;
  tagline: string;
  render: () => ReactElement;
}[];

export type GameSlug = (typeof GAMES)[number]['slug'];

export function isGameSlug(value: string | undefined): value is GameSlug {
  return GAMES.some((game) => game.slug === value);
}

export function GameScreen({ slug, onBack }: { slug: GameSlug; onBack: () => void }) {
  const game = GAMES.find((entry) => entry.slug === slug)!;
  return (
    <div className="screen">
      <TopBar onBack={onBack} label="Games" />
      {game.render()}
    </div>
  );
}
