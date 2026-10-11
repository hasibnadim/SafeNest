import { NextRequest, NextResponse } from 'next/server';
import { UpdateFilter } from 'mongodb';

import { clearSessionCookie, getSessionFromRequest } from '@/services/auth/session';
import { toPublicUser } from '@/services/auth/user';
import db, { CName } from '@/services/mongodb';
import { UserAccount } from '@/services/auth/interface';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
}).strict();

// Sign-in happens through the Google OAuth redirect flow:
//   GET /auth/google   -> redirect to Google's consent screen
//   GET /auth/callback -> exchange the code, issue the session cookie
// This route only serves the authenticated session, profile updates and logout.

export async function GET(request: NextRequest) {
  try {
    // Get session from request
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Get user from database
    const userCollection = db.collection<UserAccount>(CName.User);
    const userProfile = await userCollection.findOne({ uid: session.uid });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: toPublicUser(userProfile) });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Get session from request
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    const parsedUpdates = profileUpdateSchema.safeParse(await request.json());
    if (!parsedUpdates.success) {
      return NextResponse.json(
        { error: 'Invalid profile fields' },
        { status: 400 }
      );
    }
    const updateData = parsedUpdates.data;

    // Check if there is anything to write
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update user in database
    const userCollection = db.collection<UserAccount>(CName.User);
    const update: UpdateFilter<UserAccount> = {};
    update.$set = updateData;

    const result = await userCollection.updateOne(
      { uid: session.uid },
      update
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  clearSessionCookie(response);
  return response;
}
