'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { wishlistApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ProductCard } from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/ProductSkeleton';

export default function WishlistPage() {
  const { refreshCartCount, refreshWishlistCount } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist();
      if (res && res.wishlist) {
        setProducts(res.wishlist);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleMoveToCart = async (productId: string) => {
    try {
      await wishlistApi.moveToCart(productId);
      await refreshCartCount();
      await refreshWishlistCount();
      await fetchWishlist();
      showToast('success', 'Moved to Cart', 'Product moved to your cart!');
    } catch (err: any) {
      showToast('error', 'Cart Error', err.message || 'Failed to move to cart');
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      await refreshWishlistCount();
      await fetchWishlist();
    } catch (err: any) {
      showToast('error', 'Wishlist Error', err.message || 'Failed to remove product');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '36px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>
          My Wishlist
        </h1>
        <ProductSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>
        My Wishlist ({products.length})
      </h1>

      {products.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid #F1F5F9',
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#EF4444',
            }}
          >
            <Heart size={32} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Your Wishlist is Empty</h3>
          <p style={{ color: '#64748B', marginBottom: '20px' }}>
            Explore what is trending on VibeCart and save items you love.
          </p>
          <Link href="/" className="btn-pill-dark">
            Explore Trending
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isWishlistPage={true}
              onRemoveFromWishlist={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
