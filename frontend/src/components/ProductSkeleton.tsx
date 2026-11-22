'use client';

import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 4 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Shimmer Image Stage */}
          <div
            className="skeleton-shimmer"
            style={{
              width: '100%',
              height: '180px',
              borderRadius: '8px',
              marginBottom: '12px',
            }}
          />

          {/* Shimmer Brand pill */}
          <div
            className="skeleton-shimmer"
            style={{
              width: '45px',
              height: '10px',
              borderRadius: '4px',
              marginBottom: '8px',
            }}
          />

          {/* Shimmer Title lines */}
          <div
            className="skeleton-shimmer"
            style={{
              width: '90%',
              height: '14px',
              borderRadius: '4px',
              marginBottom: '6px',
            }}
          />
          <div
            className="skeleton-shimmer"
            style={{
              width: '65%',
              height: '14px',
              borderRadius: '4px',
              marginBottom: '12px',
            }}
          />

          {/* Shimmer Rating & Badge */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <div
              className="skeleton-shimmer"
              style={{
                width: '42px',
                height: '18px',
                borderRadius: '4px',
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: '60px',
                height: '18px',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* Shimmer Price & Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <div
              className="skeleton-shimmer"
              style={{
                width: '75px',
                height: '22px',
                borderRadius: '4px',
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: '85px',
                height: '32px',
                borderRadius: '6px',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
