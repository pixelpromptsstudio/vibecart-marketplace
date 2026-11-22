'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  X,
  Heart,
  Share2,
  Volume2,
  VolumeX,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { cartApi, reelApi } from '@/lib/api';

export interface ReelData {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  likesCount: number;
  viewsCount: number;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    images: string[];
    rating?: number;
  };
  seller?: {
    storeName: string;
    slug: string;
    storeLogo?: string;
  };
}

interface VibeReelModalProps {
  reels: ReelData[];
  initialIndex?: number;
  onClose: () => void;
}

export const VibeReelModal: React.FC<VibeReelModalProps> = ({
  reels,
  initialIndex = 0,
  onClose,
}) => {
  const { refreshCartCount } = useAuth();
  const { showToast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [hasLikedMap, setHasLikedMap] = useState<Record<string, boolean>>({});
  const [addedNotice, setAddedNotice] = useState(false);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < reels.length - 1 ? prev + 1 : prev));
  }, [reels.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') handleNext();
      else if (e.key === 'ArrowUp') handlePrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, handleNext, handlePrev]);

  if (!reels || reels.length === 0) return null;

  const currentReel = reels[currentIndex];
  const currentLikes =
    likesMap[currentReel._id] !== undefined
      ? likesMap[currentReel._id]
      : currentReel.likesCount;
  const hasLiked = Boolean(hasLikedMap[currentReel._id]);

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      setHasLikedMap((prev) => ({ ...prev, [currentReel._id]: true }));
      setLikesMap((prev) => ({ ...prev, [currentReel._id]: currentLikes + 1 }));
      await reelApi.likeReel(currentReel._id);
    } catch {
      // Ignore
    }
  };

  const handleAddToCart = async () => {
    try {
      await cartApi.addToCart(currentReel.product._id, undefined, 1);
      await refreshCartCount();
      setAddedNotice(true);
      showToast('success', 'Added to Cart', `${currentReel.product.name} added to your shopping bag.`);
      setTimeout(() => setAddedNotice(false), 2500);
    } catch (err: any) {
      showToast('error', 'Cart Error', err.message || 'Could not add item to cart');
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Shoppable Vibe Reel Player"
      style={{ zIndex: 1000 }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close Reel Modal"
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1010,
        }}
      >
        <X size={24} />
      </button>

      {/* Reel Player Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(390px, 95vw)',
          height: 'min(670px, 86vh)',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#000000',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* HTML5 Video */}
        <video
          key={currentReel._id}
          src={currentReel.videoUrl}
          poster={currentReel.thumbnailUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Top Controls: Sound toggle & Brand badge */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(6px)',
              padding: '4px 10px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <Sparkles size={12} color="#D4FF00" />
            <span>VIBE REELS</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Right Action Rail (Likes, Share, Navigation) */}
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
          {/* Like */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleLike}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: hasLiked ? '#EF4444' : 'rgba(0,0,0,0.5)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(6px)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Heart size={22} fill={hasLiked ? '#FFFFFF' : 'none'} />
            </button>
            <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 700, marginTop: '4px', display: 'block' }}>
              {currentLikes}
            </span>
          </div>

          {/* Share */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              aria-label="Share reel"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('success', 'Link Copied', 'Reel link copied to clipboard.');
                }
              }}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(6px)',
              }}
            >
              <Share2 size={20} />
            </button>
            <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 700, marginTop: '4px', display: 'block' }}>
              Share
            </span>
          </div>

          {/* Prev/Next arrows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            <button
              disabled={currentIndex === 0}
              onClick={handlePrev}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: currentIndex === 0 ? 0.3 : 1,
              }}
            >
              <ChevronUp size={18} />
            </button>
            <button
              disabled={currentIndex === reels.length - 1}
              onClick={handleNext}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: currentIndex === reels.length - 1 ? 0.3 : 1,
              }}
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* Bottom Tagged Product Drawer */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)',
            zIndex: 10,
          }}
        >
          {/* Reel Caption */}
          <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
            {currentReel.title}
          </h4>
          <p style={{ color: '#CBD5E1', fontSize: '12px', marginBottom: '12px', lineHeight: 1.3 }}>
            {currentReel.description}
          </p>

          {/* Shoppable Product Card */}
          {currentReel.product && (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              {/* Product Thumbnail & Details */}
              <Link
                href={`/product/${currentReel.product.slug}`}
                onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    currentReel.product.images && currentReel.product.images.length > 0
                      ? currentReel.product.images[0]
                      : currentReel.thumbnailUrl
                  }
                  alt={currentReel.product.name}
                  style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '8px' }}
                />
                <div style={{ minWidth: 0 }}>
                  <p
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
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                      ₹{currentReel.product.price.toLocaleString('en-IN')}
                    </span>
                    {currentReel.product.originalPrice && (
                      <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ₹{currentReel.product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* 1-Click Buy / Add to Cart */}
              <button
                onClick={handleAddToCart}
                style={{
                  background: addedNotice ? '#16A34A' : '#111827',
                  color: '#FFFFFF',
                  padding: '8px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s',
                }}
              >
                <ShoppingCart size={14} />
                <span>{addedNotice ? 'Added!' : 'Add to Cart'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
