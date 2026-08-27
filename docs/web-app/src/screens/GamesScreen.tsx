import { ChevronRightIcon } from '../components/Icons';
import { GAMES, type GameSlug } from './games';

type Props = {
  onOpen: (slug: GameSlug) => void;
};

export function GamesScreen({ onOpen }: Props) {
  return (
    <div className="screen">
      <h1 className="title">Games</h1>
      <p className="lead">
        Haptics make games feel physical. Every hit, drop and combo below is a Pulsar pattern.
      </p>

      <div className="stack">
        {GAMES.map((game) => (
          <button
            key={game.slug}
            type="button"
            className="row-card"
            onClick={() => onOpen(game.slug)}
          >
            <span>
              <span className="row-card__label">{game.title}</span>
              <br />
              <span className="muted">{game.tagline}</span>
            </span>
            <ChevronRightIcon size={20} />
          </button>
        ))}
      </div>

      <a className="footer-link" href="../">
        Back to the Pulsar docs
      </a>
    </div>
  );
}
