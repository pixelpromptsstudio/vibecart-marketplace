'use client';

import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const items = [
    {
      icon: Truck,
      title: 'Complimentary Shipping',
      sub: 'Insured express delivery over ₹499',
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Returns',
      sub: 'Hassle-free doorstep pickup',
    },
    {
      icon: ShieldCheck,
      title: 'Encrypted Checkout',
      sub: 'Verified payment & buyer protection',
    },
    {
      icon: Headphones,
      title: 'Dedicated Concierge',
      sub: 'Priority order & vendor support',
    },
  ];

  return (
    <section className="trust-bar-section" aria-label="Customer assurances">
      <div className="container">
        <div className="trust-bar-inner">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="trust-item">
                <div className="trust-icon-box">
                  <Icon size={19} strokeWidth={1.6} />
                </div>
                <div>
                  <h4 className="trust-title">{item.title}</h4>
                  <p className="trust-sub">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
