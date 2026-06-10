// Brute-force mitigation for the WebSocket pairing flow.
//
// The pairing code is only 4 digits (9000 possible values), so without a cap an
// attacker can race the legitimate receiver by scanning the whole code space
// over WebSocket connections. This limiter throttles pairing attempts on two
// axes:
//
//   * per-IP   — a single source can only make a handful of failed attempts
//                before it is locked out, which crushes the scan rate of a
//                linear brute-force from one host.
//   * per-code — a single code value that accumulates too many failed attempts
//                is "burned" (rejected for a cooldown), so a code that is being
//                actively probed can never be claimed — not even by a correct
//                guess. The legitimate user simply re-pairs with a fresh code.
//
// Together with the existing 15-minute self-expiry and the one-shot semantics in
// ConnectionManager (a slot can be claimed once), this makes hijacking a pending
// pairing impractical without changing the 4-digit code the mobile app shows.

export interface RateLimiterOptions {
  /** Sliding window over which per-IP failed attempts are counted. */
  ipWindowMs?: number;
  /** Failed attempts from one IP within the window before it is locked out. */
  maxAttemptsPerIp?: number;
  /** How long an IP stays locked out once it trips the limit. */
  ipLockoutMs?: number;
  /** Sliding window over which per-code failed attempts are counted. */
  codeWindowMs?: number;
  /** Failed attempts against one code within the window before it is burned. */
  maxAttemptsPerCode?: number;
  /** How long a code stays burned once it trips the limit. */
  codeBurnMs?: number;
  /** How often expired records are swept from memory. */
  sweepIntervalMs?: number;
  /** Injectable clock for deterministic tests. Defaults to Date.now. */
  now?: () => number;
}

export interface AttemptDecision {
  allowed: boolean;
  // Present only when allowed is false.
  reason?: 'ip_rate_limited' | 'code_burned';
  retryAfterMs?: number;
}

interface IpRecord {
  // Timestamps of recent failed attempts, pruned to the window on each touch.
  attempts: number[];
  lockedUntil: number;
}

interface CodeRecord {
  attempts: number[];
  burnedUntil: number;
}

const DEFAULTS = {
  ipWindowMs: 60_000,
  maxAttemptsPerIp: 10,
  ipLockoutMs: 15 * 60_000,
  codeWindowMs: 15 * 60_000,
  maxAttemptsPerCode: 5,
  codeBurnMs: 15 * 60_000,
  sweepIntervalMs: 60_000,
};

export class PairingRateLimiter {
  private readonly ipWindowMs: number;
  private readonly maxAttemptsPerIp: number;
  private readonly ipLockoutMs: number;
  private readonly codeWindowMs: number;
  private readonly maxAttemptsPerCode: number;
  private readonly codeBurnMs: number;
  private readonly now: () => number;

  private readonly ipRecords: Map<string, IpRecord> = new Map();
  private readonly codeRecords: Map<string, CodeRecord> = new Map();
  private sweepTimer?: NodeJS.Timeout;

  constructor(options: RateLimiterOptions = {}) {
    this.ipWindowMs = options.ipWindowMs ?? DEFAULTS.ipWindowMs;
    this.maxAttemptsPerIp = options.maxAttemptsPerIp ?? DEFAULTS.maxAttemptsPerIp;
    this.ipLockoutMs = options.ipLockoutMs ?? DEFAULTS.ipLockoutMs;
    this.codeWindowMs = options.codeWindowMs ?? DEFAULTS.codeWindowMs;
    this.maxAttemptsPerCode = options.maxAttemptsPerCode ?? DEFAULTS.maxAttemptsPerCode;
    this.codeBurnMs = options.codeBurnMs ?? DEFAULTS.codeBurnMs;
    this.now = options.now ?? (() => Date.now());

    const sweepInterval = options.sweepIntervalMs ?? DEFAULTS.sweepIntervalMs;
    if (sweepInterval > 0) {
      this.sweepTimer = setInterval(() => this.sweep(), sweepInterval);
      // Don't keep the process (or a jest run) alive just for the sweep.
      this.sweepTimer.unref?.();
    }
  }

  /**
   * Decide whether a pairing attempt may proceed. Call BEFORE touching the
   * connection manager — a denied attempt must never reach the pairing logic.
   */
  public checkAttempt(ip: string, code: string): AttemptDecision {
    const t = this.now();

    const ipRec = this.ipRecords.get(ip);
    if (ipRec && ipRec.lockedUntil > t) {
      return { allowed: false, reason: 'ip_rate_limited', retryAfterMs: ipRec.lockedUntil - t };
    }

    const codeRec = this.codeRecords.get(code);
    if (codeRec && codeRec.burnedUntil > t) {
      return { allowed: false, reason: 'code_burned', retryAfterMs: codeRec.burnedUntil - t };
    }

    return { allowed: true };
  }

  /** Record a failed pairing attempt (unknown/invalid code, or claimed slot). */
  public recordFailure(ip: string, code: string): void {
    const t = this.now();

    const ipRec = this.ipRecords.get(ip) ?? { attempts: [], lockedUntil: 0 };
    ipRec.attempts = ipRec.attempts.filter((ts) => ts > t - this.ipWindowMs);
    ipRec.attempts.push(t);
    if (ipRec.attempts.length >= this.maxAttemptsPerIp) {
      ipRec.lockedUntil = t + this.ipLockoutMs;
      ipRec.attempts = [];
    }
    this.ipRecords.set(ip, ipRec);

    const codeRec = this.codeRecords.get(code) ?? { attempts: [], burnedUntil: 0 };
    codeRec.attempts = codeRec.attempts.filter((ts) => ts > t - this.codeWindowMs);
    codeRec.attempts.push(t);
    if (codeRec.attempts.length >= this.maxAttemptsPerCode) {
      codeRec.burnedUntil = t + this.codeBurnMs;
      codeRec.attempts = [];
    }
    this.codeRecords.set(code, codeRec);
  }

  /**
   * Record a successful pairing. The code is consumed, so drop its failure
   * history (a fresh code reusing the value later starts clean).
   */
  public recordSuccess(_ip: string, code: string): void {
    this.codeRecords.delete(code);
  }

  /** Drop records that have fully expired so the maps don't grow unbounded. */
  private sweep(): void {
    const t = this.now();
    for (const [ip, rec] of this.ipRecords) {
      const lastAttempt = rec.attempts.length ? rec.attempts[rec.attempts.length - 1] : 0;
      if (rec.lockedUntil <= t && lastAttempt <= t - this.ipWindowMs) {
        this.ipRecords.delete(ip);
      }
    }
    for (const [code, rec] of this.codeRecords) {
      const lastAttempt = rec.attempts.length ? rec.attempts[rec.attempts.length - 1] : 0;
      if (rec.burnedUntil <= t && lastAttempt <= t - this.codeWindowMs) {
        this.codeRecords.delete(code);
      }
    }
  }

  /** Stop the background sweep. Call when the owning server shuts down. */
  public dispose(): void {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = undefined;
    }
  }
}
