import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { PropertyCard } from "./PropertyCard";
import { ClearFiltersButton } from "./PropertyFilters";
import { hasActiveFilters, type PropertyFilters } from "@/services/property-filters";
import type { UnitCard } from "@/services/properties";

/**
 * Server-rendered results grid, one card per unit. The page queries MongoDB
 * using the URL's search params, so this component only has to lay out whatever
 * it is given.
 *
 * An empty collection and an over-narrow filter are different situations and
 * get different copy, since the database starts empty by design.
 */
export function PropertyGrid({
  cards,
  filters,
  totalCount,
}: {
  cards: UnitCard[];
  filters: PropertyFilters;
  /** Unfiltered number of units, used to tell the two empty states apart. */
  totalCount: number;
}) {
  if (cards.length === 0) {
    const filtered = hasActiveFilters(filters);
    return (
      <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center dark:border-slate-700 dark:bg-slate-900">
        {filtered ? (
          <>
            <Search className="mx-auto h-5 w-5 text-slate-400 dark:text-slate-500" />
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              No units match your filters
            </p>
            <ClearFiltersButton className="mt-3 text-xs font-medium text-blue-600 underline underline-offset-4 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" />
          </>
        ) : (
          <>
            <Building2 className="mx-auto h-5 w-5 text-slate-400 dark:text-slate-500" />
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              No units listed yet
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              {totalCount === 0
                ? "Be the first to list a property on Safe Nest."
                : "Every listing is currently hidden by your filters."}
            </p>
            {totalCount === 0 && (
              <Link
                href="/auth/login"
                className="mt-3 inline-block text-xs font-medium text-blue-600 underline underline-offset-4 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in to list a property
              </Link>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <PropertyCard
          key={`${card.property.id}-${card.unit.code}`}
          property={card.property}
          unit={card.unit}
        />
      ))}
    </div>
  );
}
