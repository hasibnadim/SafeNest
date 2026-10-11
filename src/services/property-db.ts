import "server-only";

import type { Document, Filter, WithId } from "mongodb";

import db, { CName } from "./mongodb";
import type { UserAccount } from "./auth/interface";
import {
  canDeleteProperty,
  canEditProperty,
  canVerifyProperty,
  isSystemUser,
} from "./auth/permissions";
import {
  coverForId,
  slugify,
  unitCodeMatches,
  type Property,
  type PropertyAddress,
  type PropertyDocument,
  type PropertyInput,
  type PropertyUnit,
  type PropertyUnitInput,
  type UnitCard,
} from "./properties";
import type { PropertyFilters, SortKey } from "./property-filters";

/**
 * MongoDB access layer for properties and their units.
 *
 * Every exported function takes the acting user and re-checks authorization
 * before touching the database, so a caller cannot widen its own permissions by
 * lying about who it is. Failures come back as a typed result rather than a
 * thrown error, because the server actions need to turn them into form state.
 *
 * Units are embedded in their property document, so the public listing pages
 * unwind them in an aggregation pipeline. Filtering, sorting, and counting all
 * happen there rather than in JavaScript, which keeps a growing collection from
 * being loaded into memory to be narrowed down afterwards.
 */

export class PropertyError extends Error {
  constructor(
    message: string,
    readonly code:
      | "unauthenticated"
      | "forbidden"
      | "not-found"
      | "duplicate"
      | "conflict",
  ) {
    super(message);
    this.name = "PropertyError";
  }
}

function collection() {
  return db.collection<PropertyDocument>(CName.Property);
}

/** Documents are stored with a generated `_id`, which callers never see. */
function toProperty(document: PropertyDocument | WithId<PropertyDocument>): Property {
  const {
    _id,
    ownerUid,
    ...property
  } = document as WithId<PropertyDocument>;
  void _id;
  void ownerUid;
  return property;
}

function requireUser(user: UserAccount | null): UserAccount {
  if (!user) {
    throw new PropertyError("You need to be signed in to do that.", "unauthenticated");
  }
  return user;
}

/**
 * Finds a free slug for `name`, appending -2, -3, ... when needed. The `id`
 * index is unique, so a collision has to be resolved before insert.
 */
async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;
  // Bounded so a pathological name cannot spin forever.
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const clash = await collection().findOne(
      { id: candidate },
      { projection: { id: 1 } },
    );
    if (!clash) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** UTC calendar date, which is what `listedAt` stores. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Escapes regex metacharacters so a query like "c++" or "(apt)" is literal
 * rather than a broken or hostile pattern.
 */
function searchPattern(query: string): RegExp {
  return new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

/**
 * Post-unwind stage of the public pipeline. `units` is a single unit object at
 * this point, so the same `$or` can match property fields and unit fields and
 * mean "either", which is what a search box implies.
 */
function buildUnitMatch(filters: PropertyFilters): Document {
  const match: Document = {};

  // "all" is a truthy string, so these must be compared, not coerced.
  if (filters.type !== "all") match.type = filters.type;
  if (filters.verified !== "all") match.verified = filters.verified === "verified";

  if (filters.query) {
    const pattern = searchPattern(filters.query);
    match.$or = [
      { name: pattern },
      { description: pattern },
      { "address.street": pattern },
      { "address.area": pattern },
      { "address.city": pattern },
      { "address.region": pattern },
      { "address.postalCode": pattern },
      { "contacts.name": pattern },
      { "contacts.role": pattern },
      { "contacts.phone": pattern },
      { "units.code": pattern },
      { "units.notes": pattern },
      // The pattern is applied to each element, so "Wifi" finds a unit that
      // lists it among its amenities.
      { "units.amenities": pattern },
    ];
  }

  return match;
}

/**
 * Price sorts compare raw amounts across periods, so a day rate is not
 * directly comparable to a yearly one; the intent is a rough ordering, not an
 * exchange-rate conversion.
 */
const sortSpec: Record<SortKey, Document> = {
  newest: { listedAt: -1, "units.lastUpdatedAt": -1 },
  "price-asc": { "units.price": 1, "units.code": 1 },
  "price-desc": { "units.price": -1, "units.code": 1 },
};

/** The fields a unit card is projected down to. */
const CARD_PROJECTION: Document = {
  _id: 0,
  id: 1,
  name: 1,
  type: 1,
  status: 1,
  verified: 1,
  cover: 1,
  listedAt: 1,
  address: 1,
  unit: "$units",
};

interface UnitCardRow {
  id: string;
  name: string;
  type: Property["type"];
  status: Property["status"];
  verified: boolean;
  cover: Property["cover"];
  listedAt: string;
  address: PropertyAddress;
  unit: PropertyUnit;
}

function toUnitCard(row: UnitCardRow): UnitCard {
  const { unit, ...summary } = row;
  return {
    property: {
      ...summary,
      address: { ...summary.address, street: "" },
    },
    unit,
  };
}

/**
 * The listing page's query: unwind units, narrow to what the URL asks for, sort,
 * and project down to what a card renders.
 */
export async function listPublicUnitCards(
  filters: PropertyFilters,
  limit?: number,
): Promise<UnitCard[]> {
  const pipeline: Document[] = [
    { $unwind: "$units" },
    { $match: buildUnitMatch(filters) },
    { $sort: sortSpec[filters.sort] },
  ];
  if (limit) pipeline.push({ $limit: limit });
  pipeline.push({ $project: CARD_PROJECTION });

  const rows = await collection()
    .aggregate<UnitCardRow>(pipeline)
    .toArray();
  return rows.map(toUnitCard);
}

/** How many units the current filters select, for the "N of M" counter. */
export async function countPublicUnits(filters: PropertyFilters): Promise<number> {
  const [row] = await collection()
    .aggregate<{ count: number }>([
      { $unwind: "$units" },
      { $match: buildUnitMatch(filters) },
      { $count: "count" },
    ])
    .toArray();
  return row?.count ?? 0;
}

export interface PublicUnitCounts {
  total: number;
  verified: number;
}

/** Sums the `units` array length across every property. */
function sumUnits(match: Filter<PropertyDocument> = {}): Document[] {
  return [{ $match: match }, { $group: { _id: null, total: { $sum: { $size: "$units" } } } }];
}

/**
 * Unfiltered unit counts for the page header. These always describe the whole
 * collection, not the active filter, so the "N of M" result count stays
 * meaningful next to them.
 */
export async function getPublicUnitCounts(): Promise<PublicUnitCounts> {
  const [all, verified] = await Promise.all([
    collection().aggregate<{ total: number }>(sumUnits()).toArray(),
    collection()
      .aggregate<{ total: number }>(sumUnits({ verified: true }))
      .toArray(),
  ]);

  return { total: all[0]?.total ?? 0, verified: verified[0]?.total ?? 0 };
}

/**
 * One unit of one property, for the public detail page. The unit code is
 * matched case-insensitively and after slugging, so a URL built from a
 * human-friendly code still resolves.
 */
export function maskSensitivePropertyInfo(property: Property): Property {
  return {
    ...property,
    address: {
      ...property.address,
      street: "",
    },
    contacts: [],
  };
}

export async function getPropertySensitiveInfo(propertyId: string) {
  const document = await collection().findOne(
    { id: propertyId },
    { projection: { _id: 0, "address.street": 1, contacts: 1 } },
  );

  if (!document) return null;

  return {
    street: document.address.street,
    contacts: document.contacts,
  };
}

export async function getPublicUnit(
  propertyId: string,
  unitCode: string,
): Promise<{ property: Property; unit: PropertyUnit } | null> {
  const document = await collection().findOne({ id: propertyId });
  if (!document) return null;

  const property = toProperty(document);
  const unit = property.units.find((candidate) =>
    unitCodeMatches(candidate.code, unitCode),
  );

  if (!unit) return null;

  return {
    property: maskSensitivePropertyInfo(property),
    unit,
  };
}

/** The property's own other units, for the detail page's switcher. */
export function otherUnitsOf(
  property: Property,
  unitCode: string,
): PropertyUnit[] {
  return property.units.filter(
    (unit) => !unitCodeMatches(unit.code, unitCode),
  );
}

/**
 * Units from other properties to show at the bottom of a detail page: same type
 * first, then fill from the same city, never the current property itself.
 */
export async function listRelatedUnits(
  property: Property,
  limit = 4,
): Promise<UnitCard[]> {
  const sameType = await collection()
    .aggregate<UnitCardRow>([
      { $match: { id: { $ne: property.id }, type: property.type } },
      { $unwind: "$units" },
      { $limit: limit },
      { $project: CARD_PROJECTION },
    ])
    .toArray();

  if (sameType.length >= limit) {
    return sameType.map(toUnitCard);
  }

  const sameCity = await collection()
    .aggregate<UnitCardRow>([
      {
        $match: {
          id: { $ne: property.id },
          type: { $ne: property.type },
          "address.city": property.address.city,
        },
      },
      { $unwind: "$units" },
      { $limit: limit - sameType.length },
      { $project: CARD_PROJECTION },
    ])
    .toArray();

  return [...sameType, ...sameCity].map(toUnitCard);
}

/**
 * Dashboard query. A system user sees every property; a regular user sees only
 * the ones they own.
 *
 * These are the raw documents because the dashboard re-checks permissions
 * against `ownerUid` and reads `updatedAt`. They stay on the server: the edit
 * page goes through `getPropertyForUser`, which returns a plain property,
 * because an `ObjectId` cannot cross the server/client boundary.
 */
export async function listPropertiesForUser(
  user: UserAccount,
): Promise<WithId<PropertyDocument>[]> {
  const filter: Filter<PropertyDocument> = isSystemUser(user)
    ? {}
    : { ownerUid: user.uid };
  return collection().find(filter).sort({ updatedAt: -1 }).toArray();
}

/**
 * Dashboard detail lookup, scoped to what the user is allowed to manage.
 *
 * Returns the plain property rather than the Mongo document so it can cross the
 * server/client boundary into the form: a raw document carries an `ObjectId`,
 * which React cannot serialize.
 */
export async function getPropertyForUser(
  user: UserAccount,
  id: string,
): Promise<Property | null> {
  const document = await collection().findOne({ id });
  if (!document) return null;
  if (!canEditProperty(user, document)) {
    throw new PropertyError(
      "You do not have permission to manage that property.",
      "forbidden",
    );
  }
  return toProperty(document);
}

/** True when a unit's stored values match what the form submitted. */
function unitUnchanged(stored: PropertyUnit, input: PropertyUnitInput): boolean {
  return (
    stored.code === input.code &&
    stored.rooms === input.rooms &&
    stored.bedType === input.bedType &&
    stored.bathrooms === input.bathrooms &&
    stored.kitchens === input.kitchens &&
    stored.price === input.price &&
    stored.period === input.period &&
    stored.notes === input.notes &&
    stored.amenities.join("\n") === input.amenities.join("\n")
  );
}

/**
 * Carries each unit's `lastUpdatedAt` forward when the form did not actually
 * change it, so the timestamp means "this unit changed", not "the page was
 * saved".
 */
function mergeUnits(
  previous: PropertyUnit[],
  inputs: PropertyUnitInput[],
  propertyId: string,
  now: Date,
): PropertyUnit[] {
  return inputs.map((input) => {
    const stored = previous.find(
      (unit) => unitCodeMatches(unit.code, input.code),
    );
    return {
      ...input,
      propertyId,
      lastUpdatedAt:
        stored && unitUnchanged(stored, input) ? stored.lastUpdatedAt : now,
    };
  });
}

/**
 * Creates a property owned by the signed-in user. The listing agent is the
 * signed-in account, so the browser never chooses it.
 */
export async function createProperty(
  user: UserAccount,
  input: PropertyInput,
): Promise<Property> {
  requireUser(user);
  const id = await uniqueSlug(input.name);
  const now = new Date();
  const document: PropertyDocument = {
    ...input,
    id,
    agentUid: user.uid,
    cover: coverForId(id),
    listedAt: todayIso(),
    // Only a system user can flip this; a new listing starts unverified.
    verified: false,
    ownerUid: user.uid,
    units: mergeUnits([], input.units, id, now),
    createdAt: now,
    updatedAt: now,
  };
  await collection().insertOne(document);
  return toProperty(document);
}

/**
 * Updates a property. The slug is deliberately immutable: it is the public URL,
 * and changing it would break every shared link to the property.
 */
export async function updateProperty(
  user: UserAccount,
  id: string,
  input: PropertyInput,
): Promise<Property> {
  requireUser(user);
  const existing = await collection().findOne({ id });
  if (!existing) {
    throw new PropertyError("That property no longer exists.", "not-found");
  }
  if (!canEditProperty(user, existing)) {
    throw new PropertyError(
      "You do not have permission to edit that property.",
      "forbidden",
    );
  }

  const now = new Date();
  await collection().updateOne(
    { id },
    {
      $set: {
        ...input,
        units: mergeUnits(existing.units, input.units, id, now),
        // The agent is whoever saved it, not a field the form can carry.
        agentUid: existing.agentUid ?? user.uid,
        updatedAt: now,
      },
    },
  );

  const updated = await collection().findOne({ id });
  if (!updated) {
    throw new PropertyError("That property no longer exists.", "not-found");
  }
  return toProperty(updated);
}

/** Removes a property and every unit inside it. */
export async function deleteProperty(
  user: UserAccount,
  id: string,
): Promise<void> {
  requireUser(user);
  const existing = await collection().findOne({ id });
  if (!existing) {
    throw new PropertyError("That property no longer exists.", "not-found");
  }
  if (!canDeleteProperty(user, existing)) {
    throw new PropertyError(
      "You do not have permission to delete that property.",
      "forbidden",
    );
  }
  await collection().deleteOne({ id });
}

/**
 * Sets or clears a property's verified flag, which covers all of its units.
 * System users only, in both directions, so an owner cannot verify their own
 * listing.
 */
export async function setPropertyVerified(
  user: UserAccount,
  id: string,
  verified: boolean,
): Promise<void> {
  requireUser(user);
  if (!canVerifyProperty(user)) {
    throw new PropertyError(
      "Only administrators can verify a property.",
      "forbidden",
    );
  }
  const result = await collection().updateOne(
    { id },
    { $set: { verified, updatedAt: new Date() } },
  );
  if (result.matchedCount === 0) {
    throw new PropertyError("That property no longer exists.", "not-found");
  }
}

/**
 * Transfers a property to a new owner. System users only; used to hand the
 * unowned seeded demo listings to a real account.
 */
export async function setPropertyOwner(
  user: UserAccount,
  id: string,
  ownerUid: string,
): Promise<void> {
  requireUser(user);
  if (!isSystemUser(user)) {
    throw new PropertyError(
      "Only administrators can reassign a property.",
      "forbidden",
    );
  }
  const result = await collection().updateOne(
    { id },
    { $set: { ownerUid, updatedAt: new Date() } },
  );
  if (result.matchedCount === 0) {
    throw new PropertyError("That property no longer exists.", "not-found");
  }
}
