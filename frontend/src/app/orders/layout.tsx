import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders & Live Tracking',
  robots: { index: false, follow: false },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
