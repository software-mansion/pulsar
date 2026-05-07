import { SectionHeader } from '../SectionHeader/SectionHeader';
import {
  leftColumn,
  middleColumn,
  rightColumn,
} from '../../../data/testimonials';
import { TestimonialCarousel } from './TestimonialCarousel';
import styles from './Testimonials.module.scss';

export function Testimonials({ className }: { className?: string }) {
  const allColumns = [...leftColumn, ...middleColumn, ...rightColumn];

  return (
    <section className={`${styles.section} ${className || ''}`}>
      <SectionHeader
        title="People love it"
        subtitle="See what developers say about Pulsar across communities."
      />
      <div className={styles.container}>
        <div className={styles.gradientTop} />
        <div className={styles.gradientBottom} />
        <div className={styles.desktop}>
          <TestimonialCarousel data={leftColumn} scrollUp />
          <TestimonialCarousel data={middleColumn} scrollUp={false} />
          <TestimonialCarousel data={rightColumn} scrollUp />
        </div>
        <div className={styles.mobile}>
          <TestimonialCarousel data={allColumns} scrollUp />
        </div>
      </div>
    </section>
  );
}
