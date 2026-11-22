import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: `Sell on ${SITE_NAME} — Open Your Verified Storefront`,
  description: `Launch your independent store on ${SITE_NAME}. Reach shoppers via Vibe Reels discovery, fast settlements, and automated inventory management.`,
  alternates: { canonical: '/seller' },
};

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
