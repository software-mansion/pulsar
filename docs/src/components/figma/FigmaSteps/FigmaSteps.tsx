import styles from './FigmaSteps.module.scss';
import { BasicLayout } from '../../landing/Layouts/BasicLayout';

interface Step {
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    title: 'Browse 200+ presets',
    body: 'Find the right haptics by searching or filtering by name, tag, category, or platform.',
  },
  {
    title: 'Bind a preset to your design component',
    body: 'Attach haptics directly to a selected layer, so everything stays in one place instead of getting lost in a comment or ticket.',
  },
  {
    title: 'Hear the pattern as you design',
    body: 'Select a bound layer to play the pattern through your speakers and quickly try different options without leaving Figma.',
  },
  {
    title: 'Feel everything on a real device',
    body: 'Pair your phone with a QR code and use the free Pulsar app to feel the actual vibration and see how the pattern works in practice.',
  },
  {
    title: 'Share an interactive preview',
    body: 'Send your team a link to try the prototype in the browser, without having to install the plugin or sign up.',
  },
  {
    title: 'Hand off to engineering',
    body: 'Export pattern visualisations, raw JSON, and ready-to-use snippets for Swift, Android, Kotlin Multiplatform, React Native, Flutter, and web. Bindings are also mirrored into shared plugin data, so Dev Mode and design-to-code tooling can read them. Developers can also use Figma MCP with our skill to implement haptics.',
  },
];

export function FigmaSteps() {
  return (
    <section className={styles.section} id="how-it-works">
      <BasicLayout>
        <h2 className={styles.heading}>Bring haptics into your Figma file</h2>

        <ol className={styles.timeline}>
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={`${styles.step} ${index % 2 === 0 ? styles.stepLeft : styles.stepRight}`}
            >
              <span
                className={`${styles.dot} ${index === 0 ? styles.dotStart : ''}`}
                aria-hidden="true"
              />
              <div className={styles.card}>
                <span className={styles.badge}>Step {index + 1}</span>
                <h3 className={styles.title}>{step.title}</h3>
                <p className={styles.body}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </BasicLayout>
    </section>
  );
}
