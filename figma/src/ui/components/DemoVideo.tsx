import { useState } from 'react';
import styles from './DemoVideo.module.css';
import iconPlay from '../assets/icon-play.svg';
import iconExternalLink from '../assets/icon-external-link.svg';
import { send } from '../figmaBridge';

// A media slot for a short demo. Pass `src` (a remote clip) to play it muted +
// looping; until it has buffered enough to play we overlay a spinner + caption,
// and on a load error we fall back to the labelled placeholder.
export default function DemoVideo({ src, caption }: { src?: string; caption: string }) {
  // 'loading' until the clip can play, 'ready' once it can, 'error' if it fails.
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(src ? 'loading' : 'error');
  const showVideo = !!src && status !== 'error';
  return (
    <div className={styles['media-wrap']}>
      <figure className={styles['media']}>
        {showVideo ? (
          <>
            <video
              className={styles['media-img']}
              src={src}
              aria-label={caption}
              // Buffer up front so a clip inside a collapsed step is ready when
              // the tab opens, without waiting for its accordion to be expanded.
              preload="auto"
              controls
              autoPlay
              loop
              muted
              playsInline
              onCanPlay={() => setStatus('ready')}
              onError={() => setStatus('error')}
            />
            {status === 'loading' && (
              <div className={styles['media-loading']}>
                <span className={styles['media-spinner']} aria-hidden="true" />
                <span className={styles['media-caption']}>{caption}</span>
              </div>
            )}
          </>
        ) : (
          <div className={styles['media-ph']}>
            <img src={iconPlay} alt="" width={18} height={18} />
            <span className={styles['media-caption']}>{caption}</span>
            <span className={styles['media-tag']}>Demo</span>
          </div>
        )}
      </figure>
      {src && (
        <button
          type="button"
          className={styles['media-link']}
          onClick={() => send({ type: 'open-external', url: src })}
          title="Open this video full size in your browser"
        >
          <img src={iconExternalLink} alt="" width={11} height={11} />
          Open full size video
        </button>
      )}
    </div>
  );
}
