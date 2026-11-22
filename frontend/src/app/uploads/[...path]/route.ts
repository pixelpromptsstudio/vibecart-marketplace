import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/backendProxy';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxyToBackend(req, 'uploads', path);
}

export async function HEAD(req: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxyToBackend(req, 'uploads', path);
}
