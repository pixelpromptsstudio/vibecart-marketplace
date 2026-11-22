'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Zap,
  Heart,
  Share2,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Store,
  Plus,
  Minus,
  MessageSquarePlus,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { productApi, cartApi, reviewApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { VibeLoader } from '@/components/VibeLoader';
import {
  computeDiscountPercent,
  FALLBACK_PRODUCT_IMAGE,
  formatINR,
  safeImageUrl,
} from '@/lib/format';

interface ProductDetailClientProps {
  slug: string;
  initialProduct?: any | null;
  initialReviews?: any[];
  initialRelatedProducts?: any[];
}

export function ProductDetailClient({
  slug,
  initialProduct = null,
  initialReviews = [],
  initialRelatedProducts = [],
}: ProductDetailClientProps) {
  const router = useRouter();
  const { refreshCartCount, isWishlisted, toggleWishlistItem } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<any>(initialProduct);
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [relatedProducts, setRelatedProducts] = useState<any[]>(initialRelatedProducts);
  const [loading, setLoading] = useState(!initialProduct);
  const [notFoundState, setNotFoundState] = useState(false);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    initialProduct?.variants?.[0]?._id || initialProduct?.variants?.[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // Review Modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setReviews(initialReviews);
      setRelatedProducts(initialRelatedProducts);
      setSelectedVariantId(
        initialProduct.variants?.[0]?._id || initialProduct.variants?.[0]?.id
      );
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    productApi
      .getBySlugOrId(slug)
      .then((res) => {
        if (cancelled) return;
        if (res?.product) {
          setProduct(res.product);
          setReviews(res.reviews || []);
          setRelatedProducts(res.relatedProducts || []);
          setSelectedVariantId(
            res.product.variants?.[0]?._id || res.product.variants?.[0]?.id
          );
        } else {
          setNotFoundState(true);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFoundState(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, initialProduct, initialReviews, initialRelatedProducts]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants || !selectedVariantId) return null;
    return product.variants.find(
      (v: any) =>
        (v._id && String(v._id) === String(selectedVariantId)) ||
        (v.id && String(v.id) === String(selectedVariantId))
    );
  }, [product, selectedVariantId]);

  const activePrice =
    selectedVariant?.price && selectedVariant.price > 0
      ? selectedVariant.price
      : product?.price ?? 0;

  const originalPrice =
    product?.originalPrice && product.originalPrice > activePrice
      ? product.originalPrice
      : undefined;

  const discountPct = computeDiscountPercent(
    activePrice,
    originalPrice,
    product?.discount
  );

  const images: string[] =
    product?.images && product.images.length > 0
      ? product.images
      : [FALLBACK_PRODUCT_IMAGE];

  const mainImage = safeImageUrl(images[selectedImageIdx] || images[0], FALLBACK_PRODUCT_IMAGE);
  const availableStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const isOutOfStock = availableStock <= 0;
  const wishlisted = product?._id ? isWishlisted(product._id) : false;

  const handleToggleWishlist = async () => {
    if (!product?._id) return;
    try {
      const saved = await toggleWishlistItem(product._id);
      showToast(
        saved ? 'success' : 'info',
        saved ? 'Saved to Wishlist' : 'Removed from Wishlist',
        saved
          ? `${product.name} added to your saved items.`
          : `${product.name} removed from your wishlist.`
      );
    } catch {
      showToast('error', 'Sign In Required', 'Please sign in to save items to your wishlist.');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.name,
          text: `Check out ${product?.name} on VibeCart`,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('success', 'Link Copied', 'Product link copied to your clipboard.');
      }
    } catch {
      // ignore user-dismissed native share
    }
  };

  const handleAddToCart = async (): Promise<boolean> => {
    if (!product?._id || isOutOfStock) return false;
    try {
      setAddingCart(true);
      await cartApi.addToCart(product._id, selectedVariantId, quantity);
      await refreshCartCount();
      showToast(
        'success',
        'Added to Cart',
        `${quantity} × ${product.name} added to your shopping bag.`
      );
      return true;
    } catch (err: any) {
      showToast('error', 'Cart Error', err.message || 'Please sign in to add items to cart.');
      return false;
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product?._id || isOutOfStock) return;
    setBuyingNow(true);
    const added = await handleAddToCart();
    setBuyingNow(false);
    if (added) {
      router.push('/checkout');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?._id || !reviewTitle.trim() || !reviewComment.trim()) {
      showToast('error', 'Missing Details', 'Please provide both a headline and review comment.');
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await reviewApi.addReview(product._id, {
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      if (res?.review) {
        setReviews((prev) => [res.review, ...prev]);
        setProduct((prev: any) =>
          prev
            ? {
                ...prev,
                rating: res.productRating ?? prev.rating,
                reviewCount: res.reviewCount ?? (prev.reviewCount || 0) + 1,
              }
            : prev
        );
      }
      showToast('success', 'Review Published', 'Thank you for sharing your verified feedback!');
      setReviewOpen(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      showToast('error', 'Review Error', err.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <VibeLoader label="Loading product details" />
      </div>
    );
  }

  if (notFoundState || !product) {
    return (
      <div className="container section-wrap" style={{ paddingBlock: '64px' }}>
        <div className="state-empty-card" style={{ maxWidth: '580px', marginInline: 'auto' }}>
          <div className="state-empty-badge">PRODUCT UNAVAILABLE</div>
          <h1 className="state-empty-title">Product Not Found</h1>
          <p className="state-empty-copy">
            This item may have sold out or moved to a new listing. Browse thousands of verified products in our catalog.
          </p>
          <div className="state-empty-actions">
            <Link href="/search" className="btn-pill-dark">Browse Marketplace</Link>
            <Link href="/" className="btn-pill-outline">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    ...(product.category?.name
      ? [{ label: product.category.name, href: `/category/${product.category.slug}` }]
      : []),
    { label: product.name },
  ];

  const specEntries = product.specifications
    ? Array.isArray(product.specifications)
      ? product.specifications
      : Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
    : [];

  return (
    <div className="container" style={{ paddingBlock: '28px 64px' }}>
      <Breadcrumbs items={breadcrumbs} />

      {/* Main Two-Column PDP Showcase */}
      <div className="pdp-main-grid">
        {/* Left: Product Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              background: '#FFFFFF',
              borderRadius: '22px',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}
          >
            {discountPct > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  zIndex: 2,
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '5px 12px',
                  borderRadius: '999px',
                }}
              >
                {discountPct}% OFF
              </span>
            )}
            <Image
              src={mainImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 960px) 100vw, 45vw"
              style={{ objectFit: 'contain', padding: '24px' }}
            />
          </div>

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {images.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  aria-label={`View photo ${idx + 1}`}
                  style={{
                    position: 'relative',
                    width: '74px',
                    height: '74px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    border:
                      selectedImageIdx === idx
                        ? '2.5px solid #4F46E5'
                        : '1px solid var(--border-default)',
                    cursor: 'pointer',
                  }}
                >
                  <Image
                    src={safeImageUrl(imgUrl)}
                    alt={`${product.name} view ${idx + 1}`}
                    fill
                    sizes="74px"
                    style={{ objectFit: 'contain', padding: '6px' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Panel */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid var(--border-default)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <Link
              href={`/search?brand=${encodeURIComponent(product.brand || '')}`}
              style={{ fontSize: '12px', fontWeight: 800, color: '#4F46E5', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              {product.brand}
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleToggleWishlist}
                className="btn-pill-outline"
                style={{ padding: '7px 12px' }}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={15} fill={wishlisted ? '#EF4444' : 'none'} color={wishlisted ? '#EF4444' : '#334155'} />
                <span>{wishlisted ? 'Saved' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="btn-pill-outline"
                style={{ padding: '7px 12px' }}
                aria-label="Share product"
              >
                <Share2 size={15} />
                <span>Share</span>
              </button>
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.2, marginBottom: '12px' }}>
            {product.name}
          </h1>

          {/* Ratings + Verified Assured Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#059669',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '999px',
              }}
            >
              <span>{product.rating && product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
              <Star size={12} fill="#FFFFFF" />
            </div>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
              {reviews.length || product.reviewCount || 0} Verified Reviews
            </span>
            <span className={`product-stock-pill ${isOutOfStock ? 'out-stock' : availableStock <= 5 ? 'low-stock' : 'in-stock'}`}>
              {isOutOfStock
                ? 'Out of Stock'
                : availableStock <= 5
                ? `Hurry • Only ${availableStock} left`
                : 'In Stock • Ready to Ship'}
            </span>
          </div>

          {/* Pricing Block */}
          <div style={{ padding: '16px 20px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid var(--border-default)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A' }}>
                {formatINR(activePrice)}
              </span>
              {originalPrice && (
                <span style={{ fontSize: '16px', color: '#94A3B8', textDecoration: 'line-through', fontWeight: 600 }}>
                  {formatINR(originalPrice)}
                </span>
              )}
              {discountPct > 0 && (
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>
                  Save {discountPct}% ({formatINR((originalPrice || activePrice) - activePrice)})
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
              Inclusive of all taxes • Extra savings with code <strong>WELCOME100</strong> or <strong>SUPERVIBE</strong>
            </p>
          </div>

          <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, marginBottom: '22px' }}>
            {product.description}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                Select Option
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.variants.map((variant: any, idx: number) => {
                  const vid = String(variant._id || variant.id || idx);
                  const isActive = String(selectedVariantId) === vid;
                  return (
                    <button
                      key={vid}
                      type="button"
                      onClick={() => setSelectedVariantId(vid)}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '12px',
                        border: isActive ? '2px solid #0F172A' : '1px solid var(--border-default)',
                        background: isActive ? '#0F172A' : '#FFFFFF',
                        color: isActive ? '#D4FF00' : '#334155',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {variant.name || variant.color || variant.size || `Option ${idx + 1}`}
                      {variant.price ? ` • ${formatINR(variant.price)}` : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid var(--border-default)',
                borderRadius: '999px',
                padding: '4px',
                background: '#F8FAFC',
              }}
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={14} />
              </button>
              <span style={{ minWidth: '34px', textAlign: 'center', fontWeight: 800, fontSize: '14px' }}>
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(Math.max(1, availableStock), q + 1))}
                disabled={quantity >= availableStock || isOutOfStock}
                style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingCart || isOutOfStock}
              className="btn-pill-dark"
              style={{ flex: 1, minWidth: '170px', justifyContent: 'center', padding: '14px 22px', fontSize: '14px' }}
            >
              <ShoppingBag size={17} />
              <span>{isOutOfStock ? 'Out of Stock' : addingCart ? 'Adding...' : 'Add to Cart'}</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={buyingNow || addingCart || isOutOfStock}
              style={{
                flex: 1,
                minWidth: '170px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 22px',
                borderRadius: '9999px',
                border: 'none',
                background: isOutOfStock ? '#CBD5E1' : '#D4FF00',
                color: '#0F172A',
                fontWeight: 800,
                fontSize: '14px',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              }}
            >
              <Zap size={17} />
              <span>{buyingNow ? 'Preparing...' : 'Buy Now'}</span>
            </button>
          </div>

          {/* Buyer Assurance Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', paddingTop: '18px', borderTop: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              <Truck size={18} color="#4F46E5" />
              <span>Free Express Shipping</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              <RotateCcw size={18} color="#059669" />
              <span>7-Day Easy Replacement</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              <ShieldCheck size={18} color="#0F172A" />
              <span>100% Buyer Protection</span>
            </div>
          </div>

          {/* Verified Seller Card */}
          {product.sellerId && (
            <div
              style={{
                marginTop: '18px',
                padding: '14px 16px',
                borderRadius: '14px',
                background: '#F8FAFC',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0F172A', color: '#D4FF00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>SOLD BY VERIFIED STORE</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    {product.sellerId.storeName || 'VibeCart Official Partner'}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Rating {product.sellerId.rating?.toFixed(1) || '4.8'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      {specEntries.length > 0 && (
        <section style={{ marginTop: '40px', background: '#FFFFFF', borderRadius: '22px', border: '1px solid var(--border-default)', padding: '26px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Technical Specifications</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {specEntries.map((spec: any, i: number) => (
              <div
                key={`${spec.key || spec.label || i}`}
                style={{ padding: '12px 16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid var(--border-default)' }}
              >
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  {spec.key || spec.label}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {String(spec.value)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews */}
      <section style={{ marginTop: '36px', background: '#FFFFFF', borderRadius: '22px', border: '1px solid var(--border-default)', padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Written Customer Reviews ({reviews.length})</h2>
            <p style={{ fontSize: '13px', color: '#64748B' }}>Ratings and honest reviews from marketplace shoppers</p>
          </div>
          <button type="button" onClick={() => setReviewOpen(true)} className="btn-pill-dark">
            <MessageSquarePlus size={16} />
            <span>Write a Review</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#64748B' }}>
            No reviews yet. Be the first to review {product.name}!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {reviews.map((rev: any) => (
              <article
                key={rev._id}
                style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border-default)', background: '#F8FAFC' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                    {rev.userId?.name || 'Verified Buyer'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 800, color: '#059669' }}>
                    {rev.rating} <Star size={12} fill="#059669" />
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  {rev.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{rev.comment}</p>
                {rev.verifiedPurchase && (
                  <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 700, color: '#4F46E5' }}>
                    ✓ Verified Purchase
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '44px' }}>
          <div className="section-header">
            <h2 className="section-title">Similar Curated Finds</h2>
            <Link href="/search" className="section-view-all">Explore More</Link>
          </div>
          <div className="product-catalog-grid">
            {relatedProducts.map((rel: any) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Accessible Review Modal */}
      {reviewOpen && (
        <div
          className="confirm-dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Write a Product Review"
          onClick={() => setReviewOpen(false)}
        >
          <div className="confirm-dialog-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="confirm-dialog-close" onClick={() => setReviewOpen(false)} aria-label="Close modal">
              <X size={16} />
            </button>
            <h3 className="confirm-dialog-title">Rate {product.name}</h3>
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Your Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-default)',
                        background: reviewRating >= star ? '#FEF3C7' : '#F8FAFC',
                        color: reviewRating >= star ? '#B45309' : '#64748B',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-title" style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Headline
                </label>
                <input
                  id="review-title"
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Outstanding build quality"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-default)' }}
                />
              </div>

              <div>
                <label htmlFor="review-comment" style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Detailed Experience
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share performance, fit, battery life, or delivery experience..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-default)', resize: 'vertical' }}
                />
              </div>

              <div className="confirm-dialog-actions">
                <button type="button" className="btn-pill-outline" onClick={() => setReviewOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-pill-dark" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
