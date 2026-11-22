'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';

const activities = [
  { name: 'Rohit K.', city: 'Delhi', item: 'boAt Rockerz 450 Headphones', time: '1m ago' },
  { name: 'Pooja S.', city: 'Bengaluru', item: 'Nike Air Max Pulse Sneakers', time: '2m ago' },
  { name: 'Aditya M.', city: 'Mumbai', item: 'Sony WH-1000XM5 Headphones', time: '3m ago' },
  { name: 'Sneha R.', city: 'Bhopal', item: 'Fastrack Limitless Smartwatch', time: 'Just now' },
  { name: 'Vikas T.', city: 'Hyderabad', item: 'Apple iPhone 15 Pro 256GB', time: '4m ago' },
];

export const LiveSocialTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const act = activities[currentIndex];

  return (
    <aside className="live-social-ticker" aria-label="Recent purchase notifications">
      <div className="social-pulse-dot" />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB',
          }}
        >
          <ShoppingBag size={14} />
        </div>
        <div className="social-ticker-text">
          <div>
            <span className="social-ticker-bold">{act.name}</span> from {act.city} bought{' '}
            <span style={{ color: '#2563EB', fontWeight: 600 }}>{act.item}</span>
          </div>
          <div className="social-ticker-time">{act.time} • Verified Buyer ✓</div>
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="social-ticker-close"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </aside>
  );
};
