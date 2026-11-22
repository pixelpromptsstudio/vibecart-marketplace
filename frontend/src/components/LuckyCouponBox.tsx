'use client';

import React, { useState } from 'react';
import { Tag, Check, Copy, Sparkles } from 'lucide-react';
import { ConfettiBurst } from '@/components/ConfettiBurst';
import { useToast } from '@/context/ToastContext';

export const LuckyCouponBox: React.FC = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleReveal = () => {
    setIsRevealed(true);
    setShowConfetti(true);
    showToast(
      'success',
      'Privilege Code Unlocked',
      'Apply SUPERVIBE in your bag for 20% seasonal savings.'
    );
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('SUPERVIBE');
      setCopied(true);
      showToast('info', 'Code Copied', 'Paste SUPERVIBE at cart or checkout to apply 20% off.');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="lucky-coupon-card">
      <div className="lucky-coupon-left">
        <div className="lucky-icon-box">
          <Tag size={20} strokeWidth={1.6} />
        </div>
        <div>
          <div className="lucky-title">
            <span>Member Privilege Voucher</span>
          </div>
          <p className="lucky-sub">
            {isRevealed
              ? 'Code unlocked — enjoy flat 20% privilege across electronics and seasonal wardrobe edits.'
              : 'Reveal today’s private voucher code for curated electronics & wardrobe savings.'}
          </p>
        </div>
      </div>

      <div>
        {!isRevealed ? (
          <button type="button" className="scratch-box-trigger" onClick={handleReveal}>
            <Sparkles size={14} />
            <span>Reveal Privilege Code</span>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="luxe-code-chip">SUPERVIBE</span>
            <button type="button" onClick={handleCopy} className="scratch-box-trigger">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        )}
      </div>

      {showConfetti && <ConfettiBurst onComplete={() => setShowConfetti(false)} />}
    </div>
  );
};
