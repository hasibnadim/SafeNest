import type { UserAccount } from "./interface";
import type { PropertyDocument } from "../properties";

/**
 * Authorization rules for property listings.
 *
 * Two roles matter here:
 *   - a system user (`admin` or `superadmin`) may edit, delete, and verify any
 *     listing;
 *   - a regular user may edit and delete only the listings they own.
 *
 * Verification is system-user-only in both directions: a listing cannot be
 * marked verified, nor un-verified, by its owner.
 *
 * These helpers are pure and safe to call from the UI, but the server actions
 * call them again on the server. Never treat a client-side check as a guard.
 */

type Actor = Pick<UserAccount, "uid" | "systemRole"> | null | undefined;

export function isSystemUser(user: Actor): boolean {
  return user?.systemRole === "admin" || user?.systemRole === "superadmin";
}

/** True when the property has no owner yet, e.g. seeded demo data. */
export function isUnowned(property: Pick<PropertyDocument, "ownerUid">): boolean {
  return !property.ownerUid;
}

export function canEditProperty(
  user: Actor,
  property: Pick<PropertyDocument, "ownerUid">,
): boolean {
  if (!user) return false;
  if (isSystemUser(user)) return true;
  return Boolean(property.ownerUid) && property.ownerUid === user.uid;
}

export function canDeleteProperty(
  user: Actor,
  property: Pick<PropertyDocument, "ownerUid">,
): boolean {
  // Mirrors editing: the owner may remove their own listing, and a system user
  // may remove any listing. An unowned listing can only be removed by a system
  // user, so seeded demo data cannot be deleted by a regular account.
  return canEditProperty(user, property);
}

export function canVerifyProperty(user: Actor): boolean {
  return isSystemUser(user);
}
