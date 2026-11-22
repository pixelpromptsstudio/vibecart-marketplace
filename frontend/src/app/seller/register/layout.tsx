import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Seller',
  description: 'Register your store on VibeCart Marketplace and start selling to verified shoppers across India.',
  alternates: { canonical: '/seller/register' },
  robots: { index: true, follow: true },
};

export default function SellerRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
