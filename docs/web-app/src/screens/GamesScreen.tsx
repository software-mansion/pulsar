import { GamepadIcon } from '../components/Icons';

export function GamesScreen() {
  return (
    <div className="screen">
      <h1 className="title">Games</h1>
      <p className="lead">Haptics make games feel physical. This is where they will live.</p>

      <div className="card placeholder">
        <GamepadIcon size={44} />
        <h2 className="subtitle">Coming soon</h2>
        <p className="lead" style={{ marginTop: 0 }}>
          We are building a set of small games that lean on haptics for feedback — hits, misses,
          near-misses and the rest. Nothing to play just yet.
        </p>
      </div>

      <a className="footer-link" href="../">
        Back to the Pulsar docs
      </a>
    </div>
  );
}
