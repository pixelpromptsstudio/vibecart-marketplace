'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, ArrowUp, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export const FloatingVibeDock: React.FC = () => {
  const { cartCount, wishlistCount } = useAuth();
  const { isSoundEnabled, toggleSound, showToast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 220);
      setShowScrollTop(y > 400);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isScrolled) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSoundToggle = () => {
    toggleSound();
    showToast(
      'info',
      isSoundEnabled ? 'UI Audio Muted' : 'UI Audio Enabled',
      isSoundEnabled ? 'Soft interactive sound effects disabled' : 'Soft interactive sound effects active'
    );
  };

  return (
    <aside className="vibe-floating-dock" aria-label="Quick Actions">
      {/* 1. Quick Cart Button */}
      <Link href="/cart" className="vibe-dock-btn" title="View Shopping Cart">
        <ShoppingBag size={18} />
        {cartCount > 0 && <span className="vibe-dock-badge">{cartCount}</span>}
      </Link>

      {/* 2. Quick Wishlist Button */}
      <Link href="/wishlist" className="vibe-dock-btn" title="View Wishlist">
        <Heart size={18} />
        {wishlistCount > 0 && <span className="vibe-dock-badge">{wishlistCount}</span>}
      </Link>

      <div className="vibe-dock-divider" />

      {/* 3. Audio Toggle */}
      <button
        onClick={handleSoundToggle}
        className={`vibe-dock-btn ${isSoundEnabled ? 'active' : ''}`}
        title={isSoundEnabled ? 'Mute Interface Sound' : 'Enable Interface Sound'}
      >
        {isSoundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
      </button>

      {/* 4. Scroll To Top Button */}
      {showScrollTop && (
        <>
          <div className="vibe-dock-divider" />
          <button
            onClick={scrollToTop}
            className="vibe-dock-btn"
            title="Scroll to top"
          >
            <ArrowUp size={17} />
          </button>
        </>
      )}
    </aside>
  );
};
