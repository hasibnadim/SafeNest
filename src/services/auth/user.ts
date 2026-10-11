import { WithId } from 'mongodb';

import { UserAccount } from './interface';
import { GoogleIdentity } from '@/lib/google-oauth';
import db, { CName } from '../mongodb';

/**
 * Resolves the Google identity onto a Mongo user document, creating the record
 * on first sign-in and refreshing the mutable Google-owned fields afterwards.
 */
export async function upsertUserFromGoogle(
  identity: GoogleIdentity
): Promise<WithId<UserAccount>> {
  const userCollection = db.collection<UserAccount>(CName.User);
  let userProfile = await userCollection.findOne({ email: identity.email });

  if (!userProfile) {
    const nameParts = (identity.name || identity.email.split('@')[0]).split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUserProfile: UserAccount = {
      firstName,
      lastName,
      uid: identity.uid,
      email: identity.email,
      phone: '',
      address: '',
      city: '',
      country: '',
      dateOfBirth: '',
      gender: '',
      photoURL: identity.photoURL,
      emailVerified: identity.emailVerified,
      systemRole: 'user',
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    try {
      const insertResult = await userCollection.insertOne(newUserProfile);
      userProfile = { ...newUserProfile, _id: insertResult.insertedId };
    } catch {
      throw new Error('Failed to create user account');
    }
  } else {
    // `uid` is the Google `sub` claim, which is the canonical identity going
    // forward. Accounts created under the previous provider still carry their
    // old identifier here, so refresh it on every sign-in; otherwise the
    // session (which carries the `sub`) would not resolve to this document.
    if (userProfile.uid !== identity.uid) {
      await userCollection.updateOne(
        { email: identity.email },
        { $set: { uid: identity.uid } }
      );
      userProfile.uid = identity.uid;
    }

    if (identity.photoURL && userProfile.photoURL !== identity.photoURL) {
      await userCollection.updateOne(
        { email: identity.email },
        { $set: { photoURL: identity.photoURL } }
      );
      userProfile.photoURL = identity.photoURL;
    }

    const now = new Date();
    await userCollection.updateOne(
      { email: identity.email },
      { $set: { lastActivity: now } }
    );
    userProfile.lastActivity = now;
  }

  return userProfile;
}

/** The public shape of a user. Never includes the session token. */
export function toPublicUser(userProfile: WithId<UserAccount>) {
  return {
    _id: userProfile._id,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    displayName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
    uid: userProfile.uid,
    email: userProfile.email,
    phone: userProfile.phone,
    address: userProfile.address,
    city: userProfile.city,
    country: userProfile.country,
    dateOfBirth: userProfile.dateOfBirth,
    gender: userProfile.gender,
    photoURL: userProfile.photoURL,
    emailVerified: userProfile.emailVerified,
    createdAt: userProfile.createdAt,
    lastActivity: userProfile.lastActivity,
    systemRole: userProfile.systemRole || 'user',
  };
}
