import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '38px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
          color: '#D4FF00',
          fontSize: 108,
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
