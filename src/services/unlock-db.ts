import "server-only";

import type { ObjectId } from "mongodb";
import db, { CName } from "./mongodb";
import type { PropertyDocument, PropertyType } from "./properties";
import { unitHref } from "./properties";

export interface UnlockDocument {
  _id?: ObjectId;
  user: string;
  property: string;
  unit?: string | null;
  lastUnlockedAt: Date;
  count: number;
}

export interface CustomerUnlockDetail {
  id: string;
  property: string;
  unit: string | null;
  count: number;
  lastUnlockedAt: Date;
  propertyName: string;
  propertyType?: PropertyType;
  location: string;
  href: string;
}

export interface RecordUnlockParams {
  user: string;
  property: string;
  unit?: string | null;
}

function collection() {
  return db.collection<UnlockDocument>(CName.Unlock);
}

/**
 * Logs or increments an unlock record for a user and property/unit.
 */
export async function recordUnlock({
  user,
  property,
  unit,
}: RecordUnlockParams): Promise<void> {
  const trimmedUser = user?.trim();
  const trimmedProperty = property?.trim();
  const normalizedUnit = typeof unit === "string" && unit.trim().length > 0 ? unit.trim() : null;

  if (!trimmedUser || !trimmedProperty) {
    return;
  }

  const now = new Date();

  await collection().updateOne(
    {
      user: trimmedUser,
      property: trimmedProperty,
      unit: normalizedUnit,
    },
    {
      $inc: { count: 1 },
      $set: {
        lastUnlockedAt: now,
      },
      $setOnInsert: {
        user: trimmedUser,
        property: trimmedProperty,
        unit: normalizedUnit,
      },
    },
    { upsert: true },
  );
}

/**
 * Returns all unlock records for a given customer UID, enriched with property details.
 */
export async function listUnlocksForCustomer(
  userUid: string,
): Promise<CustomerUnlockDetail[]> {
  const trimmed = userUid?.trim();
  if (!trimmed) return [];

  const records = await collection()
    .find({ user: trimmed })
    .sort({ lastUnlockedAt: -1 })
    .toArray();

  if (records.length === 0) return [];

  const propertyIds = Array.from(new Set(records.map((r) => r.property)));
  const propertyDocs = await db
    .collection<PropertyDocument>(CName.Property)
    .find({ id: { $in: propertyIds } })
    .toArray();

  const propertyMap = new Map<string, PropertyDocument>();
  for (const doc of propertyDocs) {
    propertyMap.set(doc.id, doc);
  }

  return records.map((record) => {
    const propertyDoc = propertyMap.get(record.property);
    const locationParts = propertyDoc
      ? [
          propertyDoc.address?.area,
          propertyDoc.address?.city,
          propertyDoc.address?.region,
        ].filter(Boolean)
      : [];

    const href = record.unit
      ? unitHref(record.property, record.unit)
      : `/property/${encodeURIComponent(record.property)}`;

    return {
      id: record._id ? record._id.toString() : `${record.property}-${record.unit ?? "prop"}`,
      property: record.property,
      unit: record.unit ?? null,
      count: record.count,
      lastUnlockedAt: record.lastUnlockedAt,
      propertyName: propertyDoc?.name || record.property,
      propertyType: propertyDoc?.type,
      location: locationParts.join(", "),
      href,
    };
  });
}
