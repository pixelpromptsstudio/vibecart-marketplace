'use client';

import React from 'react';

interface VibeLoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VibeLoader: React.FC<VibeLoaderProps> = ({
  label = 'Loading the Vibe...',
  size = 'md',
}) => {
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.3 : 1;

  return (
    <div className="vibe-loader-wrap" style={{ transform: `scale(${scale})` }}>
      <div className="vibe-loader-orb">
        <div className="vibe-loader-ring-outer" />
        <div className="vibe-loader-ring-inner" />
        <div className="vibe-loader-core">
          <span>V</span>
        </div>
      </div>

      <div className="vibe-loader-caption">
        <span>{label}</span>
        <div className="vibe-loader-dots" style={{ display: 'inline-flex', gap: '2px' }}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  );
};
