import "server-only";

import type { Document } from "mongodb";

import db, { CName } from "./mongodb";
import type { UserAccount } from "./auth/interface";

/**
 * Read-only queries behind the admin Customers screen.
 *
 * All callers are server components or server actions that have already
 * resolved the session, but nothing here relies on that: the query text and
 * page number are treated as untrusted input, capped and clamped before they
 * reach MongoDB. Search terms are escaped, so a query full of regex
 * metacharacters searches for itself rather than for a broken pattern.
 *
 * The screen is the first paginated list in the app, so the page size lives
 * here — the page imports it to stay consistent with what was actually
 * fetched.
 */

/** Fixed page size for the customers list. */
export const CUSTOMER_PAGE_SIZE = 50;

/** Longest search term accepted, mirroring the property search cap. */
const MAX_QUERY_LENGTH = 120;

/** The columns the list shows; everything else stays out of the payload. */
const CUSTOMER_PROJECTION = {
  firstName: 1,
  lastName: 1,
  email: 1,
  phone: 1,
  systemRole: 1,
  createdAt: 1,
  lastActivity: 1,
  uid: 1,
} as const;

export interface CustomerRow {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  systemRole?: UserAccount["systemRole"];
  createdAt?: Date;
  lastActivity?: Date | null;
}

export interface CustomerList {
  rows: CustomerRow[];
  total: number;
  /** The effective page, after clamping a stale or hand-edited number. */
  page: number;
  pageCount: number;
}

export interface CustomerStats {
  /** Accounts registered in the trailing 30 days. */
  lastMonth: number;
  /** Accounts registered in the trailing 7 days. */
  lastWeek: number;
  /** Accounts registered since UTC midnight, matching the stored dates. */
  today: number;
  total: number;
}

function collection() {
  return db.collection<UserAccount>(CName.User);
}

/**
 * Escapes regex metacharacters so a query like "c++" or "s.mith" is literal
 * rather than a hostile or broken pattern.
 */
function searchPattern(query: string): RegExp {
  return new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

/**
 * Every whitespace-separated token must match at least one searchable field.
 * "rumana haq" therefore finds Rumana Haque — one token per name part — while
 * a single token still reaches email and phone.
 */
function buildSearchFilter(rawQuery: string): Document {
  const tokens = rawQuery.trim().slice(0, MAX_QUERY_LENGTH).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return {};

  return {
    $and: tokens.map((token) => {
      const pattern = searchPattern(token);
      return {
        $or: [
          { firstName: pattern },
          { lastName: pattern },
          { email: pattern },
          { phone: pattern },
        ],
      };
    }),
  };
}

/** Sign-up counts for the stat cards: total, trailing 30 days, 7 days, today. */
export async function getCustomerStats(): Promise<CustomerStats> {
  const now = Date.now();
  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);
  const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const users = collection();
  const [total, today, week, month] = await Promise.all([
    users.countDocuments(),
    users.countDocuments({ createdAt: { $gte: startOfToday } }),
    users.countDocuments({ createdAt: { $gte: lastWeek } }),
    users.countDocuments({ createdAt: { $gte: lastMonth } }),
  ]);

  return { total, today, lastWeek: week, lastMonth: month };
}

/**
 * One page of customers, newest sign-up first.
 *
 * The count runs first so an out-of-range page number (a stale link, a
 * hand-edited URL) resolves to the last page instead of an empty one — the
 * returned `page` is therefore not always the one that was requested.
 */
export async function listCustomers(
  rawQuery: string,
  requestedPage: number,
): Promise<CustomerList> {
  const filter = buildSearchFilter(rawQuery);
  const users = collection();

  const total = await users.countDocuments(filter);
  const pageCount = Math.max(1, Math.ceil(total / CUSTOMER_PAGE_SIZE));
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, Math.trunc(requestedPage)), pageCount)
    : 1;

  const rows = await users
    .find(filter, { projection: { ...CUSTOMER_PROJECTION } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * CUSTOMER_PAGE_SIZE)
    .limit(CUSTOMER_PAGE_SIZE)
    .toArray();

  return { rows, total, page, pageCount };
}

/**
 * The whole account document for the customer profile page — deliberately
 * unprojected, since that page's job is to show every field on file.
 *
 * The `id` is the `uid` the list links with, so an unknown value is simply a
 * missing customer; the page turns that into a 404 rather than an error. The
 * returned document carries an `ObjectId` (`sellerId`), which means it must
 * stay in server components — exactly where the profile page renders it.
 */
export async function getCustomerProfile(uid: string): Promise<UserAccount | null> {
  const trimmed = uid.trim().slice(0, MAX_QUERY_LENGTH);
  if (!trimmed) return null;
  return (await collection().findOne({ uid: trimmed })) ?? null;
}
