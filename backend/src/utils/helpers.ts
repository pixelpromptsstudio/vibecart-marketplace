/**
 * Shared backend utility helpers for regex escaping, pagination bounds,
 * mass-assignment field allowlisting, and variant-aware pricing.
 */

const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

/** Escape regex metacharacters to prevent ReDoS or invalid RegExp crashes. */
export function escapeRegex(value: string): string {
  return value.replace(REGEX_SPECIAL_CHARS, '\\$&');
}

/** Parse positive integers safely without allowing NaN, <=0, or excessive limits. */
export function parsePositiveInt(
  value: unknown,
  fallback: number,
  max = 100
): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, max);
}

/** Extract only explicitly allowlisted keys from untrusted request payloads. */
export function pickAllowedFields<T extends Record<string, any>>(
  source: Record<string, any> | undefined,
  allowedKeys: readonly string[]
): Partial<T> {
  const result: Record<string, any> = {};
  if (!source || typeof source !== 'object') {
    return result as Partial<T>;
  }
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result as Partial<T>;
}

interface ProductVariantLike {
  _id?: any;
  id?: string;
  sku?: string;
  price?: number;
  color?: string;
  size?: string;
  name?: string;
}

function findProductVariant(
  product: { variants?: ProductVariantLike[] },
  variantId?: string
): ProductVariantLike | undefined {
  if (!variantId || !Array.isArray(product.variants) || product.variants.length === 0) {
    return undefined;
  }
  const target = String(variantId);
  return product.variants.find(
    (v) => v?._id?.toString() === target || v?.id === target || v?.sku === target
  );
}

/** Resolve unit price respecting optional variant price overrides. */
export function resolveVariantPrice(
  product: {
    price: number;
    variants?: ProductVariantLike[];
  },
  variantId?: string
): number {
  const matched = findProductVariant(product, variantId);
  if (matched && typeof matched.price === 'number' && matched.price > 0) {
    return matched.price;
  }
  return product.price;
}

/** Resolve human-readable variant label from a stored variant ID or SKU. */
export function resolveVariantLabel(
  product: { variants?: ProductVariantLike[] },
  variantId?: string
): string | undefined {
  if (!variantId) return undefined;
  const matched = findProductVariant(product, variantId);
  if (!matched) {
    return /^[a-f0-9]{24}$/i.test(String(variantId)) ? undefined : String(variantId);
  }
  return (
    matched.name ||
    [matched.color, matched.size].filter(Boolean).join(' • ') ||
    undefined
  );
}

/** Basic email format validator. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
