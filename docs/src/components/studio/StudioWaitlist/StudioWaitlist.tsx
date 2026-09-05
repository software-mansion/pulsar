import { useState } from 'react';
import styles from './StudioWaitlist.module.scss';
import btnStyles from '../../landing/Button/Button.module.scss';
import { API_SERVER_URL } from '../../../content/docs/components/config';
import star from '../../../assets/landing-page/star.svg';
import arrowIcon from '../../../assets/landing-page/arrow-icon.svg';
import wavePattern from '../../../assets/landing-page/pattern.svg';
import { track } from '../../../analytics/analytics';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function StudioWaitlist() {
  const [status, setStatus] = useState<Status>('idle');
  // The mandatory consent checkbox starts unchecked — the user must opt in
  // explicitly. `consentError` drives the inline hint shown when they try to
  // submit without it.
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const trackFirstFieldFilled = () => {
    if (hasStarted) return;
    setHasStarted(true);
    track('studio_landing_waitlist_started');
  };

  // Posts to the server's public /waitlist route, which adds the subscriber to the
  // MailerLite "Pulsar Studio" group (and, when opted in, the "SWM newsletter"
  // group too). The API token stays server-side — the browser only ever sees this
  // endpoint.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'loading') return;

    // The product-updates consent is required. Block submission and surface a
    // message instead of silently sending nothing.
    if (!consent) {
      setConsentError(true);
      track('studio_landing_waitlist_consent_blocked');
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus('loading');
    track('studio_landing_waitlist_submitted', { newsletter });

    let failureReported = false;
    try {
      const res = await fetch(`${API_SERVER_URL}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          name: data.get('name'),
          company: data.get('company'),
          position: data.get('position'),
          newsletter,
        }),
      });
      if (!res.ok) {
        failureReported = true;
        track('studio_landing_waitlist_failed', { reason: 'http', status: res.status });
        throw new Error(`Request failed (${res.status})`);
      }
      track('studio_landing_waitlist_succeeded', { newsletter });
      setStatus('success');
      setConsent(false);
      setNewsletter(false);
      form.reset();
    } catch {
      if (!failureReported) track('studio_landing_waitlist_failed', { reason: 'network' });
      setStatus('error');
    }
  };

  return (
    <section className={styles.section} id="waitlist">
      <div className={styles.waves} aria-hidden="true">
        <img src={wavePattern.src} alt="" />
      </div>

      <img className={`${styles.star} ${styles.starTopLeft}`} src={star.src} alt="" aria-hidden="true" />
      <img className={`${styles.star} ${styles.starBottomLeft}`} src={star.src} alt="" aria-hidden="true" />
      <img className={`${styles.star} ${styles.starTopRight}`} src={star.src} alt="" aria-hidden="true" />
      <img className={`${styles.star} ${styles.starBottomRight}`} src={star.src} alt="" aria-hidden="true" />

      <div className={styles.inner}>
        <h2 className={styles.heading}>Join the waitlist</h2>
        <p className={styles.subtitle}>
          Pulsar Haptics Studio is currently in development. Join the waitlist and we'll let
          you know as soon as early access is available.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} onFocusCapture={trackFirstFieldFilled}>
          <input className={styles.input} type="text" name="name" placeholder="Name" aria-label="Name" required />
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Work email"
            aria-label="Work email"
            required
          />
          <input
            className={styles.input}
            type="text"
            name="company"
            placeholder="Company (optional)"
            aria-label="Company (optional)"
          />
          <input
            className={styles.input}
            type="text"
            name="position"
            placeholder="Your position (optional)"
            aria-label="Your position (optional)"
          />

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (e.target.checked) setConsentError(false);
              }}
            />
            <span>I would like to receive Pulsar Haptics Studio product updates.*</span>
          </label>
          {consentError && (
            <p className={styles.error} role="alert">
              Please confirm you'd like to receive product updates to join the waitlist.
            </p>
          )}
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
            />
            <span>I would also like to receive the Software Mansion newsletter (optional).</span>
          </label>

          <p className={styles.fineprint}>
            By subscribing, you agree to receive newsletters and marketing emails from us. You
            can unsubscribe at any time. See our{' '}
            <a href="https://swmansion.com/privacy/policy/">Privacy Policy</a> for details.
          </p>

          <div className={styles.submitRow}>
            {status === 'success' ? (
              <p className={styles.thanks}>Thanks! We'll be in touch. 🎉</p>
            ) : (
              <>
                <div className={btnStyles.background}>
                  <button
                    className={`${btnStyles.innerHolder} ${btnStyles.unfilled}`}
                    type="submit"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
                    <img src={arrowIcon.src} alt="" aria-hidden="true" />
                  </button>
                </div>
                {status === 'error' && (
                  <p className={styles.error} role="alert">
                    Something went wrong. Please try again.
                  </p>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
