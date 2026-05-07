import type { Testimonial } from '../../../data/testimonials';
import { TestimonialItem } from './TestimonialItem';
import styles from './Testimonials.module.scss';

export function TestimonialCarousel({
  data,
  scrollUp = true,
}: {
  data: Testimonial[];
  scrollUp?: boolean;
}) {
  const items = [...data, ...data];
  return (
    <div className={styles.carousel}>
      <div
        className={`${styles.track} ${scrollUp ? styles.up : styles.down}`}
      >
        {items.map((testimonial, index) => (
          <TestimonialItem key={index} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}
