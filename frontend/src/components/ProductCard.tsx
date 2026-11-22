'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ShoppingCart, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { cartApi } from '@/lib/api';
import {
  computeDiscountPercent,
  FALLBACK_PRODUCT_IMAGE,
  formatINR,
  safeImageUrl,
} from '@/lib/format';

export interface ProductCardData {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  stock?: number;
}

interface ProductCardProps {
  product: ProductCardData;
  isWishlistPage?: boolean;
  onRemoveFromWishlist?: (id: string) => void;
  claimedPercent?: number;
  priorityImage?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlistPage = false,
  onRemoveFromWishlist,
  claimedPercent: _claimedPercent,
  priorityImage = false,
}) => {
  const { refreshCartCount, isWishlisted: checkWishlisted, toggleWishlistItem } = useAuth();
  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const wishlisted = checkWishlisted(product._id);
  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const discountPercent = computeDiscountPercent(
    product.price,
    product.originalPrice,
    product.discount
  );

  const displayImage = safeImageUrl(product.images?.[0], FALLBACK_PRODUCT_IMAGE);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlistPage && onRemoveFromWishlist) {
      onRemoveFromWishlist(product._id);
      showToast('info', 'Removed from Wishlist', `${product.name} removed from your saved items.`);
      return;
    }

    try {
      const nowSaved = await toggleWishlistItem(product._id);
      if (nowSaved) {
        showToast('success', 'Saved to Wishlist', `${product.name} added to your wishlist.`);
      } else {
        showToast('info', 'Removed from Wishlist', `${product.name} removed from your wishlist.`);
      }
    } catch {
      showToast('error', 'Sign In Required', 'Please sign in to save items to your wishlist.');
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding || isAdded || isOutOfStock) return;

    try {
      setIsAdding(true);
      await cartApi.addToCart(product._id, undefined, 1);
      await refreshCartCount();
      setIsAdding(false);
      setIsAdded(true);
      showToast('success', 'Added to Cart', `${product.name} has been added to your shopping bag.`);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err: any) {
      setIsAdding(false);
      showToast('error', 'Cart Error', err.message || 'Failed to add item to cart');
    }
  };

  return (
    <article className="fk-product-card">
      {/* Wishlist / Remove Button */}
      <button
        type="button"
        className={`fk-wishlist-btn ${wishlisted || isWishlistPage ? 'active' : ''}`}
        onClick={handleToggleWishlist}
        aria-label={isWishlistPage ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      >
        {isWishlistPage ? (
          <Trash2 size={16} color="#DC2626" />
        ) : (
          <Heart
            size={16}
            fill={wishlisted ? '#EF4444' : 'none'}
            color={wishlisted ? '#EF4444' : '#64748B'}
          />
        )}
      </button>

      {/* Product Image Box */}
      <Link href={`/product/${product.slug}`} className="fk-card-img-box" style={{ position: 'relative' }}>
        {discountPercent > 0 && (
          <span className="luxe-discount-pill">-{discountPercent}%</span>
        )}
        <Image
          src={displayImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 28vw, 240px"
          priority={priorityImage}
          style={{ objectFit: 'contain', padding: '14px' }}
        />
      </Link>

      {/* Product Information */}
      <div className="fk-card-info">
        <div className="luxe-card-meta-row">
          <span className="fk-card-brand">{product.brand}</span>
          <span className="luxe-card-rating">
            <Star size={11} fill="#18181B" color="#18181B" />
            <span>{product.rating && product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
          </span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="fk-card-title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Pricing Row */}
        <div className="fk-price-row">
          <span className="fk-price-current">{formatINR(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="fk-price-mrp">{formatINR(product.originalPrice)}</span>
          )}
          {discountPercent > 0 && (
            <span className="fk-discount-badge">Save {discountPercent}%</span>
          )}
        </div>

        {isOutOfStock ? (
          <div className="product-stock-pill out-stock" style={{ marginBottom: '10px' }}>
            Sold Out
          </div>
        ) : typeof product.stock === 'number' && product.stock <= 3 ? (
          <div className="product-stock-pill low-stock" style={{ marginBottom: '10px' }}>
            Only {product.stock} left
          </div>
        ) : null}

        {/* Add to Bag CTA */}
        <button
          type="button"
          className={`fk-add-cart-btn ${isAdded ? 'added' : ''}`}
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
        >
          {isOutOfStock ? (
            <span>Sold Out</span>
          ) : isAdded ? (
            <>
              <Check size={14} />
              <span>Added to Bag</span>
            </>
          ) : (
            <>
              <ShoppingCart size={14} strokeWidth={1.75} />
              <span>{isAdding ? 'Adding...' : 'Add to Bag'}</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
