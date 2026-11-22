import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seller Portal Dashboard',
  robots: { index: false, follow: false },
};

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
