import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  message?: string;
}

interface BucketEntry {
  count: number;
  resetAt: number;
}

/**
 * Set baseline HTTP security headers across all Express API responses.
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  next();
}

/**
 * In-memory fixed-window rate limiter to protect auth and mutation endpoints.
 * Keeps periodic cleanup `.unref()`ed so test/shutdown processes exit cleanly.
 */
export function createRateLimiter({
  windowMs,
  max,
  keyPrefix = 'rl',
  message = 'Too many requests. Please try again shortly.',
}: RateLimitOptions) {
  const buckets = new Map<string, BucketEntry>();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets.entries()) {
      if (entry.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }, Math.max(windowMs, 60_000));
  cleanup.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - 1)));
      next();
      return;
    }

    current.count += 1;
    const remaining = Math.max(0, max - current.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));

    if (current.count > max) {
      const retryAfterSec = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(Math.max(1, retryAfterSec)));
      res.status(429).json({
        success: false,
        message,
      });
      return;
    }

    next();
  };
}

/**
 * Cache-Control helper for public read-only catalog endpoints.
 */
export function publicCacheControl(sMaxAgeSec = 60, staleWhileRevalidateSec = 300) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET') {
      res.setHeader(
        'Cache-Control',
        `public, s-maxage=${sMaxAgeSec}, stale-while-revalidate=${staleWhileRevalidateSec}`
      );
    }
    next();
  };
}

/**
 * Build dynamic CORS origin allowlist from CLIENT_URL / ALLOWED_ORIGINS env vars.
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // allow SSR, curl, Postman, same-origin server requests
  if (process.env.NODE_ENV !== 'production') {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
      return true;
    }
  }
  const baseConfigured = [
    process.env.CLIENT_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
  ]
    .map((val) => val?.trim().replace(/\/+$/, ''))
    .filter(Boolean) as string[];

  const allowSet = new Set<string>();
  const seeds = baseConfigured.length > 0 ? baseConfigured : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  for (const entry of seeds) {
    allowSet.add(entry);
    // Allow matching loopback alias (localhost <-> 127.0.0.1 on the same protocol & port)
    const loopbackMatch = entry.match(/^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/i);
    if (loopbackMatch) {
      const [, proto, host, port = ''] = loopbackMatch;
      const altHost = host.toLowerCase() === 'localhost' ? '127.0.0.1' : 'localhost';
      allowSet.add(`${proto}${altHost}${port}`);
    }
  }

  const normalizedOrigin = origin.trim().replace(/\/+$/, '');
  return allowSet.has(normalizedOrigin);
}
