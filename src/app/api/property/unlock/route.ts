import { NextRequest, NextResponse } from 'next/server';

import { getAuthUser } from '@/services/auth/session';
import { getPropertySensitiveInfo } from '@/services/property-db';
import { recordUnlock } from '@/services/unlock-db';

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Authentication required.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const propertyId =
    typeof body?.propertyId === 'string'
      ? body.propertyId.trim()
      : typeof body?.property === 'string'
        ? body.property.trim()
        : '';
  const unit =
    typeof body?.unit === 'string'
      ? body.unit.trim()
      : typeof body?.unitCode === 'string'
        ? body.unitCode.trim()
        : null;

  if (!propertyId) {
    return NextResponse.json({ ok: false, message: 'Property ID is required.' }, { status: 400 });
  }

  const sensitiveInfo = await getPropertySensitiveInfo(propertyId);
  if (!sensitiveInfo) {
    return NextResponse.json({ ok: false, message: 'Property not found.' }, { status: 404 });
  }

  await recordUnlock({
    user: user.uid,
    property: propertyId,
    unit: unit || null,
  });

  return NextResponse.json(sensitiveInfo, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
