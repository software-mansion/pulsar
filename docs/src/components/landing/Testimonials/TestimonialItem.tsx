import type { Testimonial } from '../../../data/testimonials';
import styles from './Testimonials.module.scss';

export function TestimonialItem({ testimonial }: { testimonial: Testimonial }) {
  const initial = testimonial.author.charAt(0).toUpperCase();

  return (
    <a
      href={testimonial.link}
      target="_blank"
      rel="noreferrer"
      className={styles.card}
    >
      <div className={styles.row}>
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            className={styles.avatarImage}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.avatar} aria-hidden="true">
            {initial}
          </div>
        )}
        <div className={styles.authorWrap}>
          <div className={styles.author}>{testimonial.author}</div>
          <div className={styles.handle}>{testimonial.handle}</div>
        </div>
      </div>
      <div className={styles.body}>{testimonial.body}</div>
    </a>
  );
}
