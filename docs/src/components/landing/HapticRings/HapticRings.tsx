import styles from './HapticRings.module.scss';

export type RingsAnimation = 'wave' | 'sonar' | 'quake' | 'heartbeat';
export type RingsColor = 'blue' | 'yellow' | 'red' | 'green';

const RING_RADII = [500, 400, 300, 200, 100];

interface HapticRingsProps {
  animation: RingsAnimation;
  color: RingsColor;
  className?: string;
}

export function HapticRings({ animation, color, className = '' }: HapticRingsProps) {
  return (
    <div
      className={`${styles.rings} ${styles[animation]} ${styles[color]} ${className}`}
      aria-hidden="true"
    >
      {RING_RADII.map((radius) => (
        <svg
          key={radius}
          className={styles.ring}
          width="1000"
          height="1000"
          viewBox="0 0 1200 1200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="600"
            cy="600"
            r={radius}
            fill="#87CCE8"
            stroke="#2B85AB"
            strokeMiterlimit="16"
            strokeDasharray="8 8"
          />
        </svg>
      ))}
    </div>
  );
}
