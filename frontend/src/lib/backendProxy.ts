import { NextRequest, NextResponse } from 'next/server';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

/**
 * Resolve the live backend origin dynamically at request time so `next start`
 * respects runtime env changes without rebuilding `.next`.
 */
export function resolveBackendOrigin(): string {
  const raw =
    process.env.BACKEND_URL ||
    (process.env.API_INTERNAL_URL ? process.env.API_INTERNAL_URL.replace(/\/api\/?$/, '') : '') ||
    (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') : '') ||
    'http://127.0.0.1:5000';
  return raw.replace(/\/+$/, '');
}

/**
 * Forward an incoming Next.js Route Handler request to the live Express backend.
 */
export async function proxyToBackend(
  req: NextRequest,
  prefix: 'api' | 'uploads',
  pathSegments: string[]
): Promise<NextResponse> {
  const backendOrigin = resolveBackendOrigin();
  const safePath = pathSegments.map((seg) => encodeURIComponent(seg)).join('/');
  const targetUrl = `${backendOrigin}/${prefix}${safePath ? `/${safePath}` : ''}${req.nextUrl.search}`;

  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  const hasBody = !['GET', 'HEAD'].includes(req.method.toUpperCase());
  const bodyBuffer = hasBody ? await req.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: hasBody ? bodyBuffer : undefined,
      redirect: 'manual',
    });

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!HOP_BY_HOP_HEADERS.has(lower) && lower !== 'content-encoding') {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await upstream.arrayBuffer();
    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Backend service unavailable.' },
      { status: 502 }
    );
  }
}
