import type { Metadata } from 'next';
import { ReelsClient } from '@/components/ReelsClient';
import { fetchServerReels } from '@/lib/serverApi';
import { SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vibe Reels — Shoppable Short Video Drops',
  description: `Watch vertical product unboxings, creator reviews, and shop trending items directly inside ${SITE_NAME} Vibe Reels.`,
  alternates: { canonical: '/reels' },
  openGraph: {
    title: `Vibe Reels | ${SITE_NAME}`,
    description: `Watch vertical product unboxings and shop trending drops directly on ${SITE_NAME}.`,
    url: '/reels',
  },
};

export default async function ReelsPage() {
  const initialReels = await fetchServerReels();
  return <ReelsClient initialReels={initialReels} />;
}
