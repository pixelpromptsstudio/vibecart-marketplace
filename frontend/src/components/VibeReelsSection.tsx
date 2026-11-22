'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Eye } from 'lucide-react';
import { VibeReelModal, ReelData } from './VibeReelModal';

interface VibeReelsSectionProps {
  reels: ReelData[];
}

export const VibeReelsSection: React.FC<VibeReelsSectionProps> = ({ reels }) => {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  if (!reels || reels.length === 0) return null;

  return (
    <>
      <section className="fk-reels-container">
        <div className="fk-reels-header">
          <div>
            <span className="luxe-section-kicker dark">IN MOTION • LOOKBOOK</span>
            <h3 className="fk-reels-title">Vibe Reels Showcase</h3>
            <p className="luxe-reels-sub">
              Experience craftsmanship, texture, and styling in vertical video before you acquire.
            </p>
          </div>

          <Link href="/reels" className="luxe-reel-feed-btn">
            <span>Open Full Feed</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Horizontal Reels Showcase */}
        <div className="fk-reels-scroll-row">
          {reels.map((reel, idx) => {
            const views = 15 + ((idx * 17) % 80);

            return (
              <div
                key={reel._id}
                className="fk-reel-card-item"
                onClick={() => setActiveModalIndex(idx)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={reel.thumbnailUrl} alt={reel.title} />

                <div className="fk-reel-gradient-overlay">
                  <div className="fk-reel-top-bar">
                    <span className="fk-reel-live-badge">LOOKBOOK</span>
                    <span className="fk-reel-views">
                      <Eye size={10} style={{ display: 'inline', marginRight: '4px' }} />
                      {views}.4K
                    </span>
                  </div>

                  <div className="fk-reel-play-circle">
                    <Play size={16} fill="#18181B" style={{ marginLeft: '2px' }} />
                  </div>

                  <div className="fk-reel-bottom-info">
                    <div className="fk-reel-title-txt">{reel.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span className="fk-reel-price-pill">
                        ₹{reel.product?.price ? reel.product.price.toLocaleString('en-IN') : '1,999'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#D4D4D8' }}>
                        {reel.seller?.storeName || 'Curated Seller'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {activeModalIndex !== null && (
        <VibeReelModal
          reels={reels}
          initialIndex={activeModalIndex}
          onClose={() => setActiveModalIndex(null)}
        />
      )}
    </>
  );
};
