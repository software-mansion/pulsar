import type { ReactElement } from 'react';
import { TopBar } from '../../components/TopBar';
import { ShapeCascade } from './shape/ShapeCascade';

export const GAMES = [
  {
    slug: 'shape-cascade',
    title: 'Shape Cascade',
    tagline: 'Match three, chase cascades, feel every combo.',
    render: () => <ShapeCascade />,
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
