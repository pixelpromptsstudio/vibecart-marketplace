import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/backendProxy';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ path?: string[] }> };

async function handleApiProxy(req: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxyToBackend(req, 'api', path);
}

export const GET = handleApiProxy;
export const POST = handleApiProxy;
export const PUT = handleApiProxy;
export const PATCH = handleApiProxy;
export const DELETE = handleApiProxy;
export const OPTIONS = handleApiProxy;
export const HEAD = handleApiProxy;
