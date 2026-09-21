import styles from './FigmaStats.module.scss';
import { BasicLayout } from '../../landing/Layouts/BasicLayout';

import star from '../../../assets/landing-page/star.svg';

interface Stat {
  value: string;
  label: string;
  decoration: 'mint' | 'star' | 'coral' | 'sky';
}

const stats: Stat[] = [
  {
    value: '200+',
    label: 'presets in the plugin, including built-in iOS and Android system presets',
    decoration: 'mint',
  },
  { value: '151', label: 'patterns from the open-source Pulsar library', decoration: 'star' },
  { value: '6', label: 'platforms available in the export panel', decoration: 'coral' },
  { value: '1', label: 'click needed to share an interactive preview', decoration: 'sky' },
];

export function FigmaStats() {
  return (
    <section className={styles.section}>
      <BasicLayout>
        <ul className={styles.grid}>
          {stats.map((stat) => (
            <li key={stat.label} className={styles.card}>
              {stat.decoration === 'star' ? (
                <img className={styles.star} src={star.src} alt="" aria-hidden="true" />
              ) : (
                <span className={`${styles.shape} ${styles[stat.decoration]}`} aria-hidden="true" />
              )}
              <span className={styles.value}>{stat.value}</span>
              <span className={styles.label}>{stat.label}</span>
            </li>
          ))}
        </ul>
      </BasicLayout>
    </section>
  );
}
