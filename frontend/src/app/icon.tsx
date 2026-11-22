import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#D4FF00',
          fontSize: 20,
          fontWeight: 900,
          fontFamily: 'sans-serif',
        }}
      >
        V
      </div>
    ),
    { ...size }
  );
}
