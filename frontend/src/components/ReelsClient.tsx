'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { reelApi, cartApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatINR, safeImageUrl } from '@/lib/format';
import {
  Heart,
  Share2,
  Volume2,
  VolumeX,
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface ReelsClientProps {
  initialReels?: any[];
}

export function ReelsClient({ initialReels = [] }: ReelsClientProps) {
  const { refreshCartCount } = useAuth();
  const { showToast } = useToast();
  const [reels, setReels] = useState<any[]>(initialReels);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [hasLikedMap, setHasLikedMap] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(initialReels.length === 0);

  useEffect(() => {
    if (initialReels.length > 0) return;
    reelApi
      .getReels()
      .then((res) => {
        if (res && res.reels) setReels(res.reels);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [initialReels.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < reels.length - 1 ? prev + 1 : prev));
  }, [reels.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'm') {
        setIsMuted((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev]);

  useEffect(() => {
    const reel = reels[currentIndex];
    if (reel?._id) {
      reelApi.viewReel(reel._id).catch(() => undefined);
    }
  }, [currentIndex, reels]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ color: '#64748B', fontWeight: 600 }}>Loading Vibe Reels feed...</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="container section-wrap" style={{ paddingBlock: '64px' }}>
        <div className="state-empty-card" style={{ maxWidth: '540px', marginInline: 'auto' }}>
          <h1 className="state-empty-title">No Vibe Reels Available</h1>
          <p className="state-empty-copy">
            Shoppable short videos from creators and verified brands will appear here shortly.
          </p>
          <Link href="/" className="btn-pill-dark">
            Back to Storefront
          </Link>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];
  const currentLikes =
    likesMap[currentReel._id] !== undefined
      ? likesMap[currentReel._id]
      : currentReel.likesCount || 0;
  const hasLiked = Boolean(hasLikedMap[currentReel._id]);

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      setHasLikedMap((prev) => ({ ...prev, [currentReel._id]: true }));
      setLikesMap((prev) => ({ ...prev, [currentReel._id]: currentLikes + 1 }));
      await reelApi.likeReel(currentReel._id);
      showToast('info', 'Liked Reel', 'Added to your liked Vibe Reels.');
    } catch {
      // ignore offline error
    }
  };

  const handleAddToCart = async () => {
    if (!currentReel.product?._id) return;
    try {
      setAdding(true);
      await cartApi.addToCart(currentReel.product._id, undefined, 1);
      await refreshCartCount();
      showToast('success', 'Added to Cart', `${currentReel.product.name} added to your shopping bag.`);
    } catch (err: any) {
      showToast('error', 'Cart Error', err.message || 'Please sign in to add items to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentReel.title, url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('success', 'Link Copied', 'Reel link copied to clipboard.');
      }
    } catch {
      showToast('info', 'Share Cancelled', 'Sharing was dismissed.');
    }
  };

  return (
    <div
      style={{
        minHeight: '82vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'radial-gradient(circle at top, #1E1B4B 0%, #090D16 65%)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 'min(410px, 100%)',
          height: 'min(720px, 82vh)',
          borderRadius: '28px',
          overflow: 'hidden',
          backgroundColor: '#000000',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <video
          key={currentReel._id}
          src={currentReel.videoUrl}
          poster={currentReel.thumbnailUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Top Controls */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <Link
            href="/"
            aria-label="Back to Store"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              color: '#FFFFFF',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={18} />
          </Link>

          <div
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            <Sparkles size={14} color="#D4FF00" />
            <span>VIBE REELS ({currentIndex + 1}/{reels.length})</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Right Interaction Bar */}
        <div
          style={{
            position: 'absolute',
            right: '16px',
            bottom: '160px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleLike}
              aria-label="Like reel"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: hasLiked ? '#EF4444' : 'rgba(0,0,0,0.55)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Heart size={22} fill={hasLiked ? '#FFFFFF' : 'none'} />
            </button>
            <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 700, marginTop: '4px', display: 'block' }}>
              {currentLikes}
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share reel"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0,0,0,0.55)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Share2 size={20} />
            </button>
            <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 700, marginTop: '4px', display: 'block' }}>
              Share
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              aria-label="Previous reel"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.22)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === 0 ? 0.35 : 1,
              }}
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              disabled={currentIndex === reels.length - 1}
              onClick={handleNext}
              aria-label="Next reel"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.22)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentIndex === reels.length - 1 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === reels.length - 1 ? 0.35 : 1,
              }}
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* Bottom Tagged Product */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px 16px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 70%, transparent 100%)',
            zIndex: 10,
          }}
        >
          <h1 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>
            {currentReel.title}
          </h1>
          {currentReel.description && (
            <p style={{ color: '#CBD5E1', fontSize: '12px', marginBottom: '12px' }}>
              {currentReel.description}
            </p>
          )}

          {currentReel.product && (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <Link
                href={`/product/${currentReel.product.slug}`}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={safeImageUrl(currentReel.product.images?.[0], currentReel.thumbnailUrl)}
                  alt={currentReel.product.name}
                  style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentReel.product.name}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                    {formatINR(currentReel.product.price)}
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-pill-dark"
                style={{ padding: '8px 14px', fontSize: '12px', flexShrink: 0 }}
              >
                <ShoppingCart size={14} />
                <span>{adding ? 'Adding...' : 'Buy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
