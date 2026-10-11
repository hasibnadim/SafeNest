import {
  propertyTypeLabels,
  propertyTypes,
  type PropertyType,
} from "./properties";

/**
 * Filter and sort state for /property, expressed entirely as URL query
 * parameters so any view can be linked, bookmarked, or reached with
 * back/forward.
 *
 *   /property?q=dhanmondi&type=hostel&verified=true&sort=price-asc
 *
 * One result is one unit, not one property, so the price sorts order units
 * within their property and the counts describe units too.
 *
 * This module parses and serialises that state. It does not filter anything:
 * the matching MongoDB query lives in `property-db.ts`, so there is only one
 * implementation of "what does this URL mean" rather than a second in-memory
 * copy that could drift out of step with the database query.
 *
 * There is no availability filter because every listing is a rental, so such a
 * control could only ever have one meaningful value.
 *
 * The module is deliberately framework-free so the server page and the client
 * controls can share one parser.
 */

export const FILTER_PARAMS = {
  query: "q",
  type: "type",
  verified: "verified",
  sort: "sort",
} as const;

/** Longest accepted search term, so a URL cannot grow unbounded. */
const MAX_QUERY_LENGTH = 120;

export type TypeFilter = PropertyType | "all";
/**
 * Verification is tri-state: the "all" option is the absence of the query
 * parameter, so the canonical unfiltered URL stays bare.
 */
export type VerifiedFilter = "all" | "verified" | "unverified";
export type SortKey = "newest" | "price-asc" | "price-desc";

export const sortKeys: SortKey[] = ["newest", "price-asc", "price-desc"];

export const sortLabels: Record<SortKey, string> = {
  newest: "Newest first",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

export const ALL_TYPES_LABEL = "All types";
export const ALL_VERIFIED_LABEL = "Any verification";

/**
 * Display text for a filter control.
 *
 * These are passed to the trigger explicitly rather than left to the select
 * primitive, which cannot resolve a label during server rendering and would
 * otherwise paint an empty control on a deep-linked URL.
 */
export const typeFilterLabel = (type: TypeFilter): string =>
  type === "all" ? ALL_TYPES_LABEL : propertyTypeLabels[type];

export const verifiedFilterLabel = (verified: VerifiedFilter): string => {
  if (verified === "verified") return "Verified";
  if (verified === "unverified") return "Unverified";
  return ALL_VERIFIED_LABEL;
};

export const sortFilterLabel = (sort: SortKey): string => sortLabels[sort];

export interface PropertyFilters {
  query: string;
  type: TypeFilter;
  verified: VerifiedFilter;
  sort: SortKey;
}

export const defaultFilters: PropertyFilters = {
  query: "",
  type: "all",
  verified: "all",
  sort: "newest",
};

/** Raw shape Next.js hands to a page for `searchParams`. */
export type RawSearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isSortKey(value: string): value is SortKey {
  return (sortKeys as string[]).includes(value);
}

/**
 * `verified` is a boolean in the URL, but a tri-state in the UI. Only the
 * exact strings "true" and "false" select a state; anything else, including
 * "1" and "yes", falls back to "all".
 */
function isVerifiedFilter(value: string): value is "true" | "false" {
  return value === "true" || value === "false";
}

/**
 * Builds filter state from a URL's search params, discarding anything
 * unrecognised so a hand-edited URL degrades to the default view instead of
 * erroring or rendering an empty grid.
 */
export function parsePropertyFilters(
  params: RawSearchParams,
): PropertyFilters {
  const rawQuery = firstValue(params[FILTER_PARAMS.query]).trim();
  const rawType = firstValue(params[FILTER_PARAMS.type]);
  const rawVerified = firstValue(params[FILTER_PARAMS.verified]);
  const rawSort = firstValue(params[FILTER_PARAMS.sort]);

  return {
    query: rawQuery.slice(0, MAX_QUERY_LENGTH),
    type: (propertyTypes as string[]).includes(rawType)
      ? (rawType as PropertyType)
      : defaultFilters.type,
    verified: isVerifiedFilter(rawVerified)
      ? rawVerified === "true"
        ? "verified"
        : "unverified"
      : defaultFilters.verified,
    sort: isSortKey(rawSort) ? rawSort : defaultFilters.sort,
  };
}

/** True when anything narrows the list, ignoring sort order. */
export function hasActiveFilters(filters: PropertyFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.type !== defaultFilters.type ||
    filters.verified !== defaultFilters.verified
  );
}

/**
 * Serialises filters back into a query string, omitting defaults so the
 * canonical unfiltered view is always a bare `/property`.
 */
export function toSearchParams(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query.trim() !== defaultFilters.query) {
    params.set(FILTER_PARAMS.query, filters.query.trim());
  }
  if (filters.type !== defaultFilters.type) {
    params.set(FILTER_PARAMS.type, filters.type);
  }
  if (filters.verified !== defaultFilters.verified) {
    params.set(
      FILTER_PARAMS.verified,
      filters.verified === "verified" ? "true" : "false",
    );
  }
  if (filters.sort !== defaultFilters.sort) {
    params.set(FILTER_PARAMS.sort, filters.sort);
  }
  return params;
}

