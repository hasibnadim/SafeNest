/**
 * Domain types, labels, and formatters for properties and their units.
 *
 * Listing data lives in MongoDB (see `property-db.ts`); this module is the
 * framework-free vocabulary that the database layer, the public pages, the
 * dashboard forms, and the URL filters all share.
 *
 * A property is the parent record — the address, the people you can call, and a
 * description. Its rentable units live inside it as `PropertyUnit[]`, so a
 * single building with several rooms is one listing with several cards rather
 * than several near-duplicate listings.
 */

export const CURRENCY = "BDT" as const;
export type CurrencyCode = typeof CURRENCY;
/** The taka sign, used directly because Intl does not emit it in en-US. */
export const CURRENCY_SYMBOL = "৳";

export type PropertyType =
  | "house"
  | "boys-boarding"
  | "girls-boarding";

/**
 * Every listing is a rental. This used to be a choice between for-sale,
 * for-rent, and sold, but nothing is sold here, so the value is fixed instead of
 * asking the user a question with only one possible answer.
 */
export type ListingStatus = "for-rent";

/** How often the rent is charged. */
export type RentPeriod = "day" | "month" | "year";
export type BedType = "1:1" | "1:2" | "1:3" | "mixed";

export interface PropertyAddress {
  street: string;
  area: string;
  city: string;
  region: string;
  postalCode: string;
}

/**
 * A person someone can contact about the property. A property can hold several
 * — an owner and a caretaker, say — so this is a list and not a single "agent"
 * object.
 */
export interface ContactDetails {
  name: string;
  role: string;
  phone: string;
}

/**
 * Placeholder cover art. Uploads are out of scope for now, so a property gets a
 * deterministic gradient from this palette plus the shared line art in
 * `PropertyCoverArt`.
 */
export interface PropertyCover {
  from: string;
  via: string;
  to: string;
}

export const coverPalette: PropertyCover[] = [
  { from: "from-emerald-900", via: "via-slate-800", to: "to-slate-950" },
  { from: "from-sky-900", via: "via-slate-800", to: "to-slate-950" },
  { from: "from-amber-900", via: "via-slate-800", to: "to-slate-950" },
  { from: "from-emerald-900", via: "via-slate-900", to: "to-slate-950" },
  { from: "from-slate-700", via: "via-slate-800", to: "to-slate-950" },
  { from: "from-violet-900", via: "via-slate-900", to: "to-slate-950" },
  { from: "from-rose-900", via: "via-slate-900", to: "to-slate-950" },
  { from: "from-teal-900", via: "via-slate-900", to: "to-slate-950" },
];

/** Stable, non-random cover choice so re-saving a property keeps its look. */
export function coverForId(id: string): PropertyCover {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return coverPalette[hash % coverPalette.length];
}

/**
 * One rentable unit inside a property: a room, a flat, or a bed in a boarding
 * house.
 */
export interface PropertyUnit {
  /** Always the parent property's id; set by the database layer, not the form. */
  propertyId: string;
  /** Short label, unique within the property and part of its public URL. */
  code: string;
  rooms: number;
  bedType: BedType;
  bathrooms: number;
  kitchens: number;
  price: number;
  period: RentPeriod;
  amenities: string[];
  notes: string;
  lastUpdatedAt: Date;
}

/** What the form supplies; `propertyId` and `lastUpdatedAt` are added on save. */
export interface PropertyUnitInput {
  code: string;
  rooms: number;
  bedType: BedType;
  bathrooms: number;
  kitchens: number;
  price: number;
  period: RentPeriod;
  amenities: string[];
  notes: string;
}

export interface Property {
  /** URL slug, also the document's primary key. */
  id: string;
  name: string;
  type: PropertyType;
  status: ListingStatus;
  description: string;
  address: PropertyAddress;
  contacts: ContactDetails[];
  /** The Safe Nest account that published it. Never chosen by the browser. */
  agentUid: string | null;
  verified: boolean;
  cover: PropertyCover;
  listedAt: string;
  units: PropertyUnit[];
  createdAt: Date;
  updatedAt: Date;
}

/** The editable subset of a property. Owned fields are added by the database. */
export interface PropertyInput {
  name: string;
  type: PropertyType;
  status: ListingStatus;
  description: string;
  address: PropertyAddress;
  contacts: ContactDetails[];
  units: PropertyUnitInput[];
}

/** How a property is stored in MongoDB. */
export interface PropertyDocument extends Property {
  /** Google `sub` of the owner. The authorization key for "my properties". */
  ownerUid: string;
}

/**
 * The part of a property a unit card needs. Deliberately smaller than the whole
 * document: the listing page returns one card per unit, so shipping every unit
 * of every property for every card would scale badly.
 */
export type PropertySummary = Pick<
  Property,
  | "id"
  | "name"
  | "type"
  | "status"
  | "verified"
  | "cover"
  | "listedAt"
  | "address"
>;

/** A unit paired with the property it belongs to, as the public grid shows it. */
export interface UnitCard {
  property: PropertySummary;
  unit: PropertyUnit;
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  house: "House",
  "boys-boarding": "Boys Boarding-Hostel",
  "girls-boarding": "Girls Boarding-Hostel",
};

export const listingStatusLabels: Record<ListingStatus, string> = {
  "for-rent": "For rent",
};

export const rentPeriodLabels: Record<RentPeriod, string> = {
  day: "Day",
  month: "Month",
  year: "Year",
};

export const bedTypeLabels: Record<BedType, string> = {
  "1:1": "1:1",
  "1:2": "1:2",
  "1:3": "1:3",
  mixed: "Mixed",
};

export const propertyTypes = Object.keys(propertyTypeLabels) as PropertyType[];
export const listingStatuses = Object.keys(
  listingStatusLabels,
) as ListingStatus[];
export const rentPeriods = Object.keys(rentPeriodLabels) as RentPeriod[];
export const bedTypes = Object.keys(bedTypeLabels) as BedType[];

/**
 * Turns a name into a URL slug. Falls back to a generated id when the name has
 * no usable characters, so the slug is never empty.
 */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || `property-${Date.now().toString(36)}`;
}

/**
 * Makes a unit code safe to put in a URL segment, so "Unit 2 (Ground)" becomes
 * "unit-2-ground".
 */
export function slugifyUnitCode(code: string): string {
  const slug = code
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "unit";
}

/** The public page for one unit of one property. */
export function unitHref(propertyId: string, unitCode: string): string {
  return `/property/${propertyId}/${slugifyUnitCode(unitCode)}`;
}

/** Case-insensitive code match, so a URL slug still finds "Unit 2". */
export function unitCodeMatches(unitCode: string, candidate: string): boolean {
  return slugifyUnitCode(unitCode) === slugifyUnitCode(candidate);
}

/** Cheapest unit first, so a property can advertise "from ৳x". */
export function cheapestUnit(units: PropertyUnit[]): PropertyUnit | null {
  if (units.length === 0) return null;
  return units.reduce((best, unit) => (unit.price < best.price ? unit : best));
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/**
 * Formats a rent for display, e.g. "৳12,500/month". The sentinel values 1 and
 * 0 represent negotiable and unavailable rent, respectively.
 *
 * `Intl` renders BDT as the literal code "BDT" in the en-US locale, so the taka
 * sign is added here. The locale and pattern are pinned so server and client
 * render identically.
 */
export function formatPrice(
  unit: Pick<PropertyUnit, "price" | "period">,
): string {
  if (unit.price === 1) return "Negotiable";
  if (unit.price === 0) return "Unavailable";

  return `${CURRENCY_SYMBOL}${numberFormatter.format(unit.price)}/${unit.period}`;
}

const listedOnFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** Formats an ISO date, pinned to UTC so SSR and hydration agree. */
export function formatListedOn(iso: string): string {
  return listedOnFormatter.format(new Date(`${iso}T00:00:00Z`));
}

const unitUpdatedFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

/** Formats a unit's `lastUpdatedAt` for the dashboard and detail pages. */
export function formatUnitUpdatedAt(date: Date): string {
  return unitUpdatedFormatter.format(date);
}
