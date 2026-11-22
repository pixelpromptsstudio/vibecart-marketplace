'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Heart,
  ShoppingCart,
  ChevronDown,
  User as UserIcon,
  Store,
  Package,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { productApi } from '@/lib/api';

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, cartCount, wishlistCount, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    city: 'Bhopal',
    pincode: '462001',
  });

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLFormElement>(null);

  const copyCoupon = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCouponCopied(true);
      setTimeout(() => setCouponCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
      if (locationMenuRef.current && !locationMenuRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setIsAccountOpen(false);
        setIsLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productApi.getProducts({ search: trimmed, limit: 5 });
        if (!cancelled) {
          setSuggestions(Array.isArray(res?.products) ? res.products : []);
          setShowSuggestions(true);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Minimal Editorial Announcement Strip */}
      <div className="fk-announcement-bar">
        <div className="container">
          <div className="fk-announcement-inner">
            <div className="fk-announcement-left">
              <span className="fk-tag-flash">Privilege</span>
              <span>Complimentary Insured Express Shipping Above ₹499 • 10% Card Privilege</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ opacity: 0.78 }}>First-order privilege:</span>
              <button
                type="button"
                className="fk-copy-chip"
                onClick={() => copyCoupon('WELCOME100')}
                title="Click to copy coupon code"
              >
                {couponCopied ? 'COPIED: WELCOME100' : 'CODE: WELCOME100'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <header className="header-top">
        <div className="container">
          <div className="header-top-inner">
            {/* Editorial Brand Mark */}
            <Link href="/" className="brand-logo-wrap">
              <div className="logo-v-mark">V</div>
              <div className="brand-text">
                <span className="brand-title">VibeCart</span>
                <span className="brand-tagline">CURATED MARKETPLACE</span>
              </div>
            </Link>

            {/* Search Bar */}
            <form
              ref={searchBarRef}
              className="header-search-bar"
              onSubmit={handleSearchSubmit}
              role="search"
              style={{ position: 'relative' }}
            >
              <div className="search-input-box">
                <input
                  id="header-search"
                  name="search"
                  type="search"
                  className="search-input-field"
                  aria-label="Search for products, brands, categories and more"
                  aria-expanded={showSuggestions}
                  aria-controls="header-search-suggestions"
                  autoComplete="off"
                  placeholder="Search collections, designers, electronics..."
                  value={searchQuery}
                  onFocus={() => {
                    if (suggestions.length > 0 && searchQuery.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="search-submit-btn"
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>
              </div>

              {showSuggestions && searchQuery.trim().length >= 2 && (
                <div
                  id="header-search-suggestions"
                  className="header-search-dropdown"
                  role="listbox"
                  aria-label="Search suggestions"
                >
                  {searchLoading ? (
                    <div className="header-search-empty">Searching VibeCart catalog...</div>
                  ) : suggestions.length === 0 ? (
                    <div className="header-search-empty">
                      No instant matches for &ldquo;{searchQuery.trim()}&rdquo;
                    </div>
                  ) : (
                    suggestions.map((item) => (
                      <Link
                        key={item._id}
                        href={`/product/${item.slug || item._id}`}
                        className="header-search-item"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <img
                          src={item.images?.[0] || '/placeholder.png'}
                          alt={item.name}
                          className="header-search-thumb"
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="header-search-title">{item.name}</div>
                          <div className="header-search-meta">
                            {item.brand} • ₹{Number(item.price || 0).toLocaleString()}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                  <Link
                    href={`/search?search=${encodeURIComponent(searchQuery.trim())}`}
                    className="header-search-footer"
                    onClick={() => setShowSuggestions(false)}
                  >
                    View all results for &ldquo;{searchQuery.trim()}&rdquo; →
                  </Link>
                </div>
              )}
            </form>

            {/* Header Right Actions */}
            <div className="header-actions">
              {/* Become a Seller Link */}
              <Link
                href="/seller/register"
                className="action-icon-link header-seller-link"
                style={{ gap: '6px', color: '#18181B' }}
              >
                <Store size={17} strokeWidth={1.75} color="#18181B" />
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Sell</span>
              </Link>

              {/* Location Selector */}
              <div className="relative header-location-wrap" ref={locationMenuRef} style={{ position: 'relative' }}>
                <div
                  className="location-chip"
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                >
                  <MapPin size={17} strokeWidth={1.75} color="#18181B" />
                  <div>
                    <div className="loc-title flex items-center gap-1">
                      {currentLocation.city} <ChevronDown size={12} />
                    </div>
                    <div className="loc-sub">{currentLocation.pincode}</div>
                  </div>
                </div>

              {isLocationOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '8px',
                    width: '240px',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    zIndex: 200,
                  }}
                >
                  <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                    Select Delivery Location
                  </p>
                  {[
                    { city: 'Bhopal', pincode: '462001' },
                    { city: 'Mumbai', pincode: '400001' },
                    { city: 'Bengaluru', pincode: '560001' },
                    { city: 'Delhi NCR', pincode: '110001' },
                  ].map((loc) => (
                    <div
                      key={loc.city}
                      onClick={() => {
                        setCurrentLocation(loc);
                        setIsLocationOpen(false);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: currentLocation.city === loc.city ? 700 : 500,
                        backgroundColor: currentLocation.city === loc.city ? '#F1F5F9' : 'transparent',
                      }}
                    >
                      <span>{loc.city}</span>
                      <span style={{ color: '#94A3B8', fontSize: '11px' }}>{loc.pincode}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link href="/wishlist" className="action-icon-link" aria-label="Wishlist">
              <Heart size={19} strokeWidth={1.75} color="#18181B" />
              <span className="header-action-label">Saved</span>
              {wishlistCount > 0 && (
                <span className="count-badge">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link href="/cart" className="action-icon-link" aria-label="Shopping Cart">
              <ShoppingCart size={19} strokeWidth={1.75} color="#18181B" />
              <span className="header-action-label">Bag</span>
              {cartCount > 0 && (
                <span className="count-badge">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Menu */}
            <div style={{ position: 'relative' }} ref={accountMenuRef}>
              <div
                className="account-chip"
                onClick={() => setIsAccountOpen(!isAccountOpen)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user?.name || 'User'}
                  className="user-avatar-img"
                />
                <div className="header-account-summary" style={{ textAlign: 'left', lineHeight: 1.1 }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Hi, {user ? user.name.split(' ')[0] : 'Sign In'}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Account <ChevronDown size={12} />
                  </div>
                </div>
              </div>

              {isAccountOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '260px',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    zIndex: 200,
                  }}
                >
                  <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '10px' }}>
                    <p style={{ fontWeight: 800, fontSize: '14px', color: '#111827' }}>
                      {user?.name || 'Guest User'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748B' }}>{user?.email || 'Not logged in'}</p>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '6px',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: '#EEF2FF',
                        color: '#4F46E5',
                      }}
                    >
                      ROLE: {user?.role || 'GUEST'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Link
                      href="/orders"
                      onClick={() => setIsAccountOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        color: '#1E293B',
                      }}
                    >
                      <Package size={16} /> My Orders
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setIsAccountOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        color: '#1E293B',
                      }}
                    >
                      <UserIcon size={16} /> Profile & Addresses
                    </Link>

                    {/* Seller Portal Link */}
                    <Link
                      href="/seller/dashboard"
                      onClick={() => setIsAccountOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        color: '#065F46',
                        background: '#ECFDF5',
                      }}
                    >
                      <Store size={16} /> Seller Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setIsAccountOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        color: '#EF4444',
                        marginTop: '6px',
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};
