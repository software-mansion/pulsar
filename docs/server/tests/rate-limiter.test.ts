import { describe, it, expect } from '@jest/globals';
import { PairingRateLimiter } from '../src/rate-limiter';

// A controllable clock so the sliding-window / lockout logic is deterministic.
function makeClock(start = 1_000_000) {
  let t = start;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

describe('PairingRateLimiter', () => {
  const baseOpts = {
    ipWindowMs: 60_000,
    maxAttemptsPerIp: 3,
    ipLockoutMs: 5 * 60_000,
    codeWindowMs: 10 * 60_000,
    maxAttemptsPerCode: 3,
    codeBurnMs: 10 * 60_000,
    // Disable the background sweep timer in tests; we drive time via the clock.
    sweepIntervalMs: 0,
  };

  describe('per-IP lockout', () => {
    it('allows attempts under the limit', () => {
      const clock = makeClock();
      const rl = new PairingRateLimiter({ ...baseOpts, now: clock.now });

      expect(rl.checkAttempt('1.1.1.1', '1234').allowed).toBe(true);
      rl.recordFailure('1.1.1.1', '1234');
      rl.recordFailure('1.1.1.1', '5678');
      // 2 failures < limit of 3 → still allowed.
      expect(rl.checkAttempt('1.1.1.1', '0000').allowed).toBe(true);
    });

    it('locks out an IP after maxAttemptsPerIp failures', () => {
      const clock = makeClock();
      const rl = new PairingRateLimiter({ ...baseOpts, now: clock.now });

      // Each failure is against a distinct code so per-code burn never fires.
      rl.recordFailure('2.2.2.2', '0001');
      rl.recordFailure('2.2.2.2', '0002');
      rl.recordFailure('2.2.2.2', '0003');

      const decision = rl.checkAttempt('2.2.2.2', '0004');
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('ip_rate_limited');
      expect(decision.retryAfterMs).toBe(baseOpts.ipLockoutMs);
    });

    it('keeps other IPs unaffected by one IP being locked out', () => {
      const clock = makeClock();
      const rl = new PairingRateLimiter({ ...baseOpts, now: clock.now });

      rl.recordFailure('2.2.2.2', '0001');
      rl.recordFailure('2.2.2.2', '0002');
      rl.recordFailure('2.2.2.2', '0003');

      expect(rl.checkAttempt('2.2.2.2', '0004').allowed).toBe(false);
      expect(rl.checkAttempt('9.9.9.9', '0004').allowed).toBe(true);
    });

    it('forgets failures that fall outside the sliding window', () => {
      const clock = makeClock();
      const rl = new PairingRateLimiter({ ...baseOpts, now: clock.now });

      rl.recordFailure('3.3.3.3', '0001');
      rl.recordFailure('3.3.3.3', '0002');
      // Move past the window so the earlier two attempts no longer count.
      clock.advance(baseOpts.ipWindowMs + 1);
      rl.recordFailure('3.3.3.3', '0003');
      rl.recordFailure('3.3.3.3', '0004');

      // Only 2 in-window failures → not locked.
      expect(rl.checkAttempt('3.3.3.3', '0005').allowed).toBe(true);
    });

    it('lifts the lockout once it expires', () => {
      const clock = makeClock();
      const rl = new PairingRateLimiter({ ...baseOpts, now: clock.now });

      rl.recordFailure('4.4.4.4', '0001');
      rl.recordFailure('4.4.4.4', '0002');
      rl.recordFailure('4.4.4.4', '0003');
      expect(rl.checkAttempt('4.4.4.4', '0004').allowed).toBe(false);

      clock.advance(baseOpts.ipLockoutMs + 1);
      expect(rl.checkAttempt('4.4.4.4', '0004').allowed).toBe(true);
    });
  });

  describe('per-code burn', () => {
    it('burns a code that is probed too many times, regardless of source IP', () => {
      const clock = makeClock();
      const rl = new PairingRateLimiter({ ...baseOpts, now: clock.now });

      // A distributed probe of the SAME code from different IPs (no single IP
      // trips its own limit) still burns the code.
      rl.recordFailure('10.0.0.1', '4242');
      rl.recordFailure('10.0.0.2', '4242');
      rl.recordFailure('10.0.0.3', '4242');

      const decision = rl.checkAttempt('10.0.0.99', '4242');
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('code_burned');
    });

    it('does not burn codes that are each missed only once (linear scan)', () => {
      const clock = makeClock();
      const rl = new PairingRateLimiter({ ...baseOpts, now: clock.now });

      // A linear scan hits each code once → no single code reaches the burn cap.
      for (let i = 0; i < 50; i++) {
        rl.recordFailure(`11.0.0.${i}`, `${1000 + i}`);
      }
      expect(rl.checkAttempt('12.0.0.1', '1007').allowed).toBe(true);
    });
  });

  describe('recordSuccess', () => {
    it('clears the code failure history so a reused value starts clean', () => {
      const clock = makeClock();
      const rl = new PairingRateLimiter({ ...baseOpts, now: clock.now });

      rl.recordFailure('10.0.0.1', '4242');
      rl.recordFailure('10.0.0.2', '4242');
      rl.recordSuccess('10.0.0.3', '4242');

      // History was reset; two fresh failures must not push it over the cap.
      rl.recordFailure('10.0.0.4', '4242');
      rl.recordFailure('10.0.0.5', '4242');
      expect(rl.checkAttempt('10.0.0.6', '4242').allowed).toBe(true);
    });
  });
});
