import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PropertyFilters } from "./PropertyFilters";
import { PropertyGrid } from "./PropertyGrid";
import {
  countPublicUnits,
  getPublicUnitCounts,
  listPublicUnitCards,
} from "@/services/property-db";
import { parsePropertyFilters, type RawSearchParams } from "@/services/property-filters";

export const metadata: Metadata = {
  title: "Property — Safe Nest",
  description:
    "Browse houses, apartments, hostels, and boarding rooms listed on Safe Nest. Filter by type, verification, and rent.",
};

type PropertyPageProps = {
  searchParams: Promise<RawSearchParams>;
};

/**
 * Every filter lives in the URL, so this page reads `searchParams` and renders
 * the matching view server-side. That keeps each view linkable, crawlable, and
 * correct without JavaScript, at the cost of making the route dynamic.
 *
 * Results are units rather than properties, and both the cards and the counts
 * come from MongoDB: filtering, sorting, and counting all happen there, so the
 * page never loads the whole collection into memory to narrow it down itself.
 */
export default async function PropertyPage({
  searchParams,
}: PropertyPageProps) {
  const params = await searchParams;
  const filters = parsePropertyFilters(params);

  const [cards, resultCount, counts] = await Promise.all([
    listPublicUnitCards(filters),
    countPublicUnits(filters),
    getPublicUnitCounts(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page header — compact white band, Airbnb-style title with counts */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-xl">
              Property
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {counts.total}
              </span>{" "}
              {counts.total === 1 ? "unit" : "units"} for rent
            </p>
          </div>
          <p className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            {counts.verified} verified
          </p>
        </div>
      </div>

      {/* Filters + results */}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <PropertyFilters
          filters={filters}
          resultCount={resultCount}
          totalCount={counts.total}
        />
        <PropertyGrid
          cards={cards}
          filters={filters}
          totalCount={counts.total}
        />
      </div>
    </div>
  );
}
