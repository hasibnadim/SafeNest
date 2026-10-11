import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ShieldCheck } from "lucide-react";
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
      {/* Page header */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5 sm:px-6 lg:px-8">
          <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Property
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {counts.total} {counts.total === 1 ? "unit" : "units"} for rent
          </p>
          <p className="ml-auto inline-flex items-center gap-1 rounded border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[11px] font-medium text-teal-800 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300">
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
