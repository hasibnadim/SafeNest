import { NextRequest, NextResponse } from 'next/server';

import { getAuthUser } from '@/services/auth/session';
import { getPropertySensitiveInfo } from '@/services/property-db';

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Authentication required.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const propertyId = typeof body?.propertyId === 'string' ? body.propertyId : '';

  if (!propertyId) {
    return NextResponse.json({ ok: false, message: 'Property ID is required.' }, { status: 400 });
  }

  const sensitiveInfo = await getPropertySensitiveInfo(propertyId);
  if (!sensitiveInfo) {
    return NextResponse.json({ ok: false, message: 'Property not found.' }, { status: 404 });
  }

  return NextResponse.json(sensitiveInfo, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
