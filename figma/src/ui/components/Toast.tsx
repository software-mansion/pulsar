import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import type { ToastLevel } from '../../shared/types';

export interface ToastOptions {
  level?: ToastLevel;
  // Auto-dismiss delay in ms. Falls back to the per-level default below.
  // Pass 0 to keep the toast on screen until the user dismisses it.
  duration?: number;
}

interface ToastItem {
  id: number;
  message: string;
  level: ToastLevel;
  duration: number;
}

interface ToastApi {
  // Show a toast; returns its id so the caller can dismiss it programmatically.
  notify: (message: string, opts?: ToastOptions) => number;
  dismiss: (id: number) => void;
}

// The more severe the message, the longer it lingers so the user has time to
// read it before it auto-dismisses. 0 would mean sticky (none are by default).
const DEFAULT_DURATION: Record<ToastLevel, number> = {
  info: 4000,
  success: 4000,
  warning: 6000,
  error: 8000
};

// At most this many toasts stack at once; a burst trims the oldest.
const MAX_TOASTS = 4;

// Length of the slide-in / slide-out animation (keep in sync with theme.css).
const LEAVE_MS = 180;

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((message: string, opts: ToastOptions = {}) => {
    const level = opts.level ?? 'info';
    const id = nextId.current++;
    const duration = opts.duration ?? DEFAULT_DURATION[level];
    setToasts((prev) => [...prev, { id, message, level, duration }].slice(-MAX_TOASTS));
    return id;
  }, []);

  const api = useMemo<ToastApi>(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-viewport" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const { message, level, duration } = toast;
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  // Time left on the auto-dismiss timer, carried across hover pauses.
  const remainingRef = useRef(duration);

  const beginClose = useCallback(() => {
    // Play the exit animation, then actually drop the toast from the list.
    setLeaving(true);
    setTimeout(onClose, LEAVE_MS);
  }, [onClose]);

  useEffect(() => {
    if (duration <= 0 || paused || leaving) return;
    const startedAt = Date.now();
    const timer = setTimeout(beginClose, remainingRef.current);
    return () => {
      clearTimeout(timer);
      // Pausing (hover) freezes the countdown; remember what's left.
      remainingRef.current -= Date.now() - startedAt;
    };
  }, [duration, paused, leaving, beginClose]);

  return (
    <div
      className={`toast toast--${level}${leaving ? ' toast--leaving' : ''}`}
      role={level === 'error' || level === 'warning' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="toast-icon" aria-hidden>
        {ICONS[level]}
      </span>
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        onClick={beginClose}
        title="Dismiss"
        aria-label="Dismiss notification"
      >
        ×
      </button>
      {duration > 0 && (
        <span
          className="toast-progress"
          style={{
            animationDuration: `${duration}ms`,
            animationPlayState: paused || leaving ? 'paused' : 'running'
          }}
        />
      )}
    </div>
  );
}

// Simple line icons (currentColor takes the per-level accent from CSS).
const ICONS: Record<ToastLevel, ReactNode> = {
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3.5l9 16H3l9-16z" strokeLinejoin="round" />
      <line x1="12" y1="10" x2="12" y2="14" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" />
      <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" />
    </svg>
  )
};
