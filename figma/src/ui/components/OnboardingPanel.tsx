import styles from './OnboardingPanel.module.css';

// Onboarding / help tab. Placeholder content for now — the real step-by-step
// instructions and explanations of the confusing parts of the plugin will be
// written later.
const SECTIONS = [
  { title: 'Getting started', body: 'How to bind a haptic preset to a component — coming soon.' },
  { title: 'Presets', body: 'Browsing, filtering and previewing haptic presets — coming soon.' },
  { title: 'Components', body: 'Reviewing and managing your bound components — coming soon.' },
  { title: 'Share', body: 'Sharing a live preview and pairing your phone — coming soon.' }
];

export default function OnboardingPanel() {
  return (
    <div className={`col scroll ${styles['onboarding-panel']}`}>
      <div>
        <div className="panel-title">How to use Pulsar</div>
        <p className={`muted ${styles['onboarding-intro']}`}>
          A quick guide to the plugin and the parts that need a little explanation.
          Full instructions are on the way.
        </p>
      </div>
      {SECTIONS.map((s) => (
        <section key={s.title} className={styles['onboarding-card']}>
          <span className={styles['onboarding-badge']}>Placeholder</span>
          <div className={styles['onboarding-card-title']}>{s.title}</div>
          <p className={`muted ${styles['onboarding-card-body']}`}>{s.body}</p>
        </section>
      ))}
    </div>
  );
}
