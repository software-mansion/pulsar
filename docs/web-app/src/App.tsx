import { useEffect } from 'react';
import { TabBar, type TabId } from './components/TabBar';
import { useRoute } from './router';
import { stopPattern } from './haptics';
import { PresetsScreen } from './screens/PresetsScreen';
import { PlaygroundScreen } from './screens/PlaygroundScreen';
import { DemosScreen } from './screens/DemosScreen';
import { GamesScreen } from './screens/GamesScreen';
import { DemoScreen, isDemoSlug } from './screens/demos';
import { GameScreen, isGameSlug } from './screens/games';

const TAB_IDS: TabId[] = ['presets', 'playground', 'demos', 'games'];

export function App() {
  const [route, navigate] = useRoute();

  // Leaving a screen must silence whatever it was playing — the Vibration API
  // keeps running a queued pattern long after its component unmounts.
  useEffect(() => stopPattern, [route]);

  const [section, sub] = route.split('/');
  const tab = (TAB_IDS as string[]).includes(section) ? (section as TabId) : 'presets';

  return (
    <div className="shell">
      {renderScreen()}
      <TabBar active={tab} onSelect={(next) => navigate(next)} />
    </div>
  );

  function renderScreen() {
    if (tab === 'playground') return <PlaygroundScreen />;
    if (tab === 'games') {
      return isGameSlug(sub) ? (
        <GameScreen slug={sub} onBack={() => navigate('games')} />
      ) : (
        <GamesScreen onOpen={(slug) => navigate(`games/${slug}`)} />
      );
    }
    if (tab === 'demos') {
      return isDemoSlug(sub) ? (
        <DemoScreen slug={sub} onBack={() => navigate('demos')} />
      ) : (
        <DemosScreen onOpen={(slug) => navigate(`demos/${slug}`)} />
      );
    }
    return <PresetsScreen />;
  }
}
