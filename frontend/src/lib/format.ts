/**
 * Shared formatting and display utility helpers for VibeCart.
 */

export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

export function formatINR(amount: number | undefined | null): string {
  const num = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}

export function computeDiscountPercent(
  price: number,
  originalPrice?: number,
  explicitDiscount?: number
): number {
  if (typeof explicitDiscount === 'number' && explicitDiscount > 0) {
    return Math.round(explicitDiscount);
  }
  if (originalPrice && originalPrice > price && price > 0) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }
  return 0;
}

export function formatCompactCount(count: number | undefined | null): string {
  const val = typeof count === 'number' && Number.isFinite(count) ? count : 0;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return String(val);
}

export function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function safeImageUrl(
  url?: string | null,
  fallback: string = FALLBACK_PRODUCT_IMAGE
): string {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return fallback;
  }
  return url.trim();
}
