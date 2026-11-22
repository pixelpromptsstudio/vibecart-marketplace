'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';

const ProgressBarInner: React.FC = () => {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(35);

    const t1 = setTimeout(() => setProgress(75), 120);
    const t2 = setTimeout(() => setProgress(100), 280);
    const t3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="top-nav-progress"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
      }}
    />
  );
};

export const TopProgressBar: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
};
