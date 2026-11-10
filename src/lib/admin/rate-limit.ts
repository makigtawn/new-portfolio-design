type AttemptBucket = { count: number; resetAt: number };

const buckets = new Map<string, AttemptBucket>();
const windowMs = 15 * 60 * 1000;
const maxAttempts = 5;

export function checkLoginRateLimit(
  identifier: string,
  now = Date.now(),
): { allowed: boolean; retryAfter: number } {
  const current = buckets.get(identifier);
  if (!current || current.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  if (current.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }
  current.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export function resetLoginRateLimitForTests() {
  buckets.clear();
}
