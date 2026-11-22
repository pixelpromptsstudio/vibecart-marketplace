import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-columns-grid">
          {/* Editorial Brand Info */}
          <div>
            <div className="brand-logo-wrap" style={{ marginBottom: '14px' }}>
              <div className="logo-v-mark footer-mark">V</div>
              <div className="brand-text">
                <span className="brand-title" style={{ color: '#FFFFFF' }}>
                  VibeCart
                </span>
                <span className="brand-tagline" style={{ color: '#A1A1AA' }}>
                  CURATED MARKETPLACE
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#A1A1AA', lineHeight: 1.7, maxWidth: '300px' }}>
              Curated technology, timeless wardrobe staples, and independent design houses — verified
              for authenticity and delivered directly to you.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h5 className="footer-col-title">Collections</h5>
            <ul className="footer-links-list">
              <li><Link href="/category/mobiles">Mobiles</Link></li>
              <li><Link href="/category/electronics">Electronics</Link></li>
              <li><Link href="/category/fashion">Fashion</Link></li>
              <li><Link href="/category/home-living">Home &amp; Living</Link></li>
              <li><Link href="/reels">Vibe Reels</Link></li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h5 className="footer-col-title">Partners</h5>
            <ul className="footer-links-list">
              <li><Link href="/seller/register">Become a Partner</Link></li>
              <li><Link href="/seller/dashboard">Seller Studio</Link></li>
              <li><Link href="/seller">Partner Program</Link></li>
            </ul>
          </div>

          {/* Client Account */}
          <div>
            <h5 className="footer-col-title">Account</h5>
            <ul className="footer-links-list">
              <li><Link href="/orders">Order History</Link></li>
              <li><Link href="/wishlist">Saved Items</Link></li>
              <li><Link href="/cart">Shopping Bag</Link></li>
              <li><Link href="/profile">Addresses &amp; Profile</Link></li>
            </ul>
          </div>

          {/* Concierge */}
          <div>
            <h5 className="footer-col-title">Concierge</h5>
            <p style={{ fontSize: '13px', color: '#A1A1AA', marginBottom: '10px', lineHeight: 1.5 }}>
              Personal assistance for orders, returns, and brand inquiries.
            </p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>concierge@vibecart.com</p>
            <p style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '4px' }}>
              +91 1800 200 8423 (Toll Free)
            </p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>© {new Date().getFullYear()} VibeCart Curated Marketplace. All rights reserved.</div>
          <div className="footer-legal-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/trust">Buyer Protection</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
