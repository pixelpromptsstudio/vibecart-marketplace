import { VibeLoader } from '@/components/VibeLoader';

export default function RootLoading() {
  return (
    <div
      className="container"
      style={{
        minHeight: '55vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <VibeLoader label="Loading curated storefront" size="md" />
    </div>
  );
}
