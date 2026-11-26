type AttemptBucket = { count: number; resetAt: number };

const buckets = new Map<string, AttemptBucket>();
const windowMs = 15 * 60 * 1000;
const maxAttempts = 5;
const maxTrackedBuckets = 500;

export function getTrustedClientIdentifier(headers: Headers): string {
  if (process.env.VERCEL === "1") {
    const vercelIp =
      headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip")?.trim();
    if (vercelIp) return vercelIp;
  }

  if (process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true") {
    const forwarded = headers
      .get("x-forwarded-for")
      ?.split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const trustedHop = forwarded?.at(-1) || headers.get("x-real-ip")?.trim();
    if (trustedHop) return trustedHop;
  }

  return "direct-client";
}

function pruneExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkLoginRateLimit(
  identifier: string,
  now = Date.now(),
): { allowed: boolean; retryAfter: number } {
  if (buckets.size >= maxTrackedBuckets) {
    pruneExpiredBuckets(now);
  }
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
