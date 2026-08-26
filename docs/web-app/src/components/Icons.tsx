type IconProps = {
  size?: number;
  color?: string;
};

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function ListIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <rect x="3" y="4" width="6" height="6" rx="1" />
      <rect x="3" y="14" width="6" height="6" rx="1" />
      <path d="M13 6h8M13 10h5M13 16h8M13 20h5" />
    </svg>
  );
}

export function BrushIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L11 16l-4 1 1-4Z" />
      <path d="M6 16c-1.5 0-3 1.2-3 3 0 1-.5 1.7-1 2 1 .5 2 .5 3 .5 2.2 0 4-1.3 4-3.5A2.5 2.5 0 0 0 6 16Z" />
    </svg>
  );
}

export function SparklesIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8Z" />
      <path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8Z" />
    </svg>
  );
}

export function GamepadIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M7 12h4M9 10v4M15.5 12.5h.01M18 10.5h.01" />
      <path d="M17.5 6h-11A4.5 4.5 0 0 0 2 10.5v3A4.5 4.5 0 0 0 6.5 18c1.4 0 2.2-.7 3-1.5h5c.8.8 1.6 1.5 3 1.5a4.5 4.5 0 0 0 4.5-4.5v-3A4.5 4.5 0 0 0 17.5 6Z" />
    </svg>
  );
}

export function PlayIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M6 4l14 8-14 8Z" />
    </svg>
  );
}

export function StopIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="1.5" />
    </svg>
  );
}

export function RecordIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="#FF6259" />
    </svg>
  );
}

export function DownloadIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function ArrowUpIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M12 20V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function XIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function InfoIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

export function SlidersIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M5 21v-7M5 10V3M12 21v-9M12 8V3M19 21v-5M19 12V3M2 14h6M9 8h6M16 16h6" />
    </svg>
  );
}

export function HeartIcon({ size = 22, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(size)} fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1Z" />
    </svg>
  );
}

export function VolumeIcon({ size = 20, muted = false }: IconProps & { muted?: boolean }) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9Z" />
      {muted ? (
        <path d="M17 9l4 6M21 9l-4 6" />
      ) : (
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
      )}
    </svg>
  );
}
