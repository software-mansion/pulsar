import type { ReactElement } from 'react';
import { TopBar } from '../../components/TopBar';
import { SliderDemo } from './SliderDemo';
import { ButtonsDemo } from './ButtonsDemo';
import { CountdownDemo } from './CountdownDemo';
import { DotLoaderDemo } from './DotLoaderDemo';
import { NotificationDemo } from './NotificationDemo';

export const DEMOS = [
  { slug: 'slider', title: 'Slider', render: () => <SliderDemo /> },
  { slug: 'buttons', title: 'Buttons', render: () => <ButtonsDemo /> },
  { slug: 'countdown', title: 'Countdown timer', render: () => <CountdownDemo /> },
  { slug: 'dot-loader', title: 'Dot Loader', render: () => <DotLoaderDemo /> },
  { slug: 'notification', title: 'Notification', render: () => <NotificationDemo /> },
] as const satisfies readonly { slug: string; title: string; render: () => ReactElement }[];

export type DemoSlug = (typeof DEMOS)[number]['slug'];

export function isDemoSlug(value: string | undefined): value is DemoSlug {
  return DEMOS.some((demo) => demo.slug === value);
}

export function DemoScreen({ slug, onBack }: { slug: DemoSlug; onBack: () => void }) {
  const demo = DEMOS.find((entry) => entry.slug === slug)!;
  return (
    <div className="screen">
      <TopBar onBack={onBack} />
      {demo.render()}
    </div>
  );
}
