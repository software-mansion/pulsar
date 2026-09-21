import type { ReactElement } from 'react';
import styles from './FigmaStart.module.scss';
import { BasicLayout } from '../../landing/Layouts/BasicLayout';
import { ANDROID_APP_URL, FIGMA_COMMUNITY_URL, IOS_APP_URL } from '../figmaLinks';
import { trackingAttributes, type EventName } from '../../../analytics/analytics';

function FigmaIcon(): ReactElement {
  return (
    <svg viewBox="0 0 38 57" className={styles.icon} aria-hidden="true">
      <path d="M9.5 57a9.5 9.5 0 0 0 9.5-9.5V38H9.5a9.5 9.5 0 0 0 0 19Z" fill="#0ACF83" />
      <path d="M0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5Z" fill="#A259FF" />
      <path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5Z" fill="#F24E1E" />
      <path d="M19 0h9.5a9.5 9.5 0 0 1 0 19H19V0Z" fill="#FF7262" />
      <path d="M38 28.5A9.5 9.5 0 1 1 19 28.5a9.5 9.5 0 0 1 19 0Z" fill="#1ABCFE" />
    </svg>
  );
}

function AppleIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path
        d="M16.37 12.76c.02 2.53 2.22 3.37 2.25 3.38-.02.06-.36 1.22-1.17 2.42-.7 1.03-1.44 2.06-2.6 2.08-1.13.02-1.5-.67-2.8-.67-1.3 0-1.7.65-2.78.69-1.11.04-1.96-1.11-2.68-2.14C5.15 16.42 4.03 12.6 5.53 10c.74-1.3 2.07-2.12 3.51-2.14 1.1-.02 2.13.74 2.8.74.67 0 1.93-.91 3.25-.78.55.02 2.1.22 3.1 1.68-.08.05-1.85 1.08-1.82 3.26ZM14.23 6.4c.6-.72 1-1.72.89-2.72-.86.04-1.9.57-2.52 1.29-.55.63-1.03 1.65-.9 2.63.96.07 1.93-.49 2.53-1.2Z"
        fill="#001A72"
      />
    </svg>
  );
}

function GooglePlayIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 26" className={styles.icon} aria-hidden="true">
      <path d="M1.3.6A2 2 0 0 0 .8 2v22c0 .53.19 1.02.5 1.4L13.1 13 1.3.6Z" fill="#00C3FF" />
      <path
        d="m17.1 8.9-3.99 4.1 3.99 4.1 4.8-2.7c1.2-.67 1.2-2.13 0-2.8l-4.8-2.7Z"
        fill="#FFCE00"
      />
      <path d="M1.3.6c.5-.6 1.37-.78 2.1-.36L17.1 8.9 13.1 13 1.3.6Z" fill="#00E676" />
      <path d="M1.3 25.4c.5.6 1.37.78 2.1.36L17.1 17.1 13.1 13 1.3 25.4Z" fill="#FF3A44" />
    </svg>
  );
}

interface StartLink {
  label: string;
  url: string;
  Icon: () => ReactElement;
  event: EventName;
  props?: Record<string, string>;
}

const links: StartLink[] = [
  {
    label: 'Get your license',
    url: FIGMA_COMMUNITY_URL,
    Icon: FigmaIcon,
    event: 'figma_landing_cta_clicked',
    props: { location: 'get-started' },
  },
  {
    label: 'Pulsar app for iOS',
    url: IOS_APP_URL,
    Icon: AppleIcon,
    event: 'figma_landing_app_store_clicked',
    props: { store: 'ios' },
  },
  {
    label: 'Pulsar app for Android',
    url: ANDROID_APP_URL,
    Icon: GooglePlayIcon,
    event: 'figma_landing_app_store_clicked',
    props: { store: 'android' },
  },
];

export function FigmaStart() {
  return (
    <section className={styles.section}>
      <BasicLayout>
        <div className={styles.inner}>
          <h2 className={styles.heading}>What you need to get started</h2>

          <p className={styles.paragraph}>
            To get started with the Pulsar Figma plugin, you&rsquo;ll need a free Pulsar account and
            a plugin subscription (there&rsquo;s a 14-day free trial if you want to try it out
            first).
          </p>
          <p className={styles.paragraph}>
            Everything works in the browser, but if you want to feel the haptics on a real device,
            please download the Pulsar app for iOS or Android &mdash; you can find the links below.
          </p>

          <div className={styles.links}>
            {links.map(({ label, url, Icon, event, props }) => (
              <a
                key={label}
                className={styles.link}
                href={url}
                target="_blank"
                rel="noreferrer"
                {...trackingAttributes(event, props)}
              >
                <Icon />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </BasicLayout>
    </section>
  );
}
