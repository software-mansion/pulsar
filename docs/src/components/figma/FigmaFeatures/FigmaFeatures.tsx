import { useState } from 'react';
import styles from './FigmaFeatures.module.scss';
import { BasicLayout } from '../../landing/Layouts/BasicLayout';
import { BASE_PATH } from '../../../../config';
import { track, trackingAttributes } from '../../../analytics/analytics';

import presetsList from '../../../assets/landing-page/plugin/presets-list.webp';
import presetDetail from '../../../assets/landing-page/plugin/preset-detail.webp';
import presetsBound from '../../../assets/landing-page/plugin/presets-bound-panel.webp';
import studioPatterns from '../../../assets/landing-page/plugin/presets-studio-patterns.webp';
import liveConnected from '../../../assets/landing-page/plugin/live-connected.webp';
import share from '../../../assets/landing-page/plugin/share.webp';

interface Feature {
  title: string;
  body: string;
  docs: string;
  screenshot: ImageMetadata;
  alt: string;
}

const features: Feature[] = [
  {
    title: 'The preset library',
    body: '206 haptics — 151 designed presets plus every iOS and Android built-in — searchable, filterable by tag, and playable without leaving Figma.',
    docs: 'presets',
    screenshot: presetsList,
    alt: 'The Presets tab listing haptics with waveform previews',
  },
  {
    title: 'Binding haptics to layers',
    body: 'Attach a preset to a selected layer and it travels with the file. The panel keeps every binding in the page grouped and one tap from playing.',
    docs: 'binding',
    screenshot: presetsBound,
    alt: 'The panel of haptics already bound in a file, grouped by frame',
  },
  {
    title: 'Every pattern in detail',
    body: 'Open a preset for its waveform, its duration and tags, the raw JSON, and a ready-to-paste snippet for each of the six platforms.',
    docs: 'presets',
    screenshot: presetDetail,
    alt: 'A preset opened to show its waveform, usage snippet and raw pattern data',
  },
  {
    title: 'Live preview on a phone',
    body: 'Pair a device with a QR code and your own prototype runs on it, firing the real vibration on every bound element as you edit.',
    docs: 'live-preview',
    screenshot: liveConnected,
    alt: 'The Live preview tab with a phone paired and connected',
  },
  {
    title: 'Sharing & handoff',
    body: 'Publish a link and anyone can open the prototype in a browser, feel every bound haptic and copy the code — no Figma access, no Pulsar account.',
    docs: 'sharing',
    screenshot: share,
    alt: 'The Share tab with the visibility toggle and copy-link buttons',
  },
  {
    title: 'Your own patterns',
    body: 'Anything you draw in Pulsar Studio shows up here, grouped by project, ready to bind alongside the built-in presets.',
    docs: 'studio-patterns',
    screenshot: studioPatterns,
    alt: 'Pulsar Studio patterns listed in the plugin, grouped by project',
  },
];

function Screenshot({ feature, className }: { feature: Feature; className: string }) {
  return (
    <img
      className={className}
      src={feature.screenshot.src}
      width={feature.screenshot.width}
      height={feature.screenshot.height}
      alt={feature.alt}
      loading="lazy"
    />
  );
}

export function FigmaFeatures() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = features[activeIndex];

  return (
    <section className={styles.section}>
      <BasicLayout>
        <h2 className={styles.heading}>A closer look at the plugin</h2>
        <p className={styles.subtitle}>
          Every panel is covered in more depth in the{' '}
          <a
            href={`${BASE_PATH}/plugin-for-figma/overview/`}
            {...trackingAttributes('figma_landing_docs_link_clicked', { location: 'features' })}
          >
            documentation
          </a>
          .
        </p>

        <div className={styles.inner}>
          <ul className={styles.list}>
            {features.map((feature, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={feature.title} className={isActive ? styles.itemActive : styles.item}>
                  <button
                    type="button"
                    className={styles.itemHeader}
                    aria-expanded={isActive}
                    onClick={() => {
                      setActiveIndex(index);
                      track('figma_landing_feature_selected', { feature: feature.docs });
                    }}
                  >
                    {feature.title}
                  </button>

                  {isActive && (
                    <div className={styles.itemBody}>
                      <p>{feature.body}</p>

                      <div className={styles.previewInline}>
                        <Screenshot feature={feature} className={styles.screenshot} />
                      </div>

                      <a
                        className={styles.docsLink}
                        href={`${BASE_PATH}/plugin-for-figma/${feature.docs}/`}
                        {...trackingAttributes('figma_landing_docs_link_clicked', {
                          location: feature.docs,
                        })}
                      >
                        Read the docs
                      </a>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className={styles.preview}>
            <Screenshot key={active.title} feature={active} className={styles.screenshot} />
          </div>
        </div>
      </BasicLayout>
    </section>
  );
}
