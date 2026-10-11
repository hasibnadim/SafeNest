"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  propertyTypeLabels,
  propertyTypes,
} from "@/services/properties";
import {
  ALL_TYPES_LABEL,
  ALL_VERIFIED_LABEL,
  FILTER_PARAMS,
  defaultFilters,
  hasActiveFilters,
  sortFilterLabel,
  sortKeys,
  sortLabels,
  typeFilterLabel,
  verifiedFilterLabel,
  type PropertyFilters as Filters,
} from "@/services/property-filters";

/** Debounce so typing does not push a router update per keystroke. */
const SEARCH_DEBOUNCE_MS = 250;

/**
 * Writes one filter to the URL. The URL is the only state: the page is a
 * server component that re-renders from `searchParams`, so there is nothing to
 * keep in sync here beyond the input's own text.
 */
function useFilterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParam = useCallback(
    (key: string, value: string, fallback: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === fallback || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams],
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  return { setParam, clearAll, isPending };
}

export function ClearFiltersButton({
  className,
  label = "Clear all filters",
}: {
  className?: string;
  label?: string;
}) {
  const { clearAll } = useFilterNavigation();
  return (
    <button
      type="button"
      onClick={clearAll}
      className={className}
    >
      {label}
    </button>
  );
}

export function PropertyFilters({
  filters,
  resultCount,
  totalCount,
}: {
  filters: Filters;
  resultCount: number;
  totalCount: number;
}) {
  const searchParams = useSearchParams();
  const { setParam, clearAll, isPending } = useFilterNavigation();

  const urlQuery = searchParams.get(FILTER_PARAMS.query) ?? "";
  const [text, setText] = useState(filters.query);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);

  // Adopt the URL when it changes from outside this component, which is how
  // back/forward navigation reaches the input. Adjusting during render rather
  // than in an effect keeps the input focused while typing.
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setText(urlQuery);
  }

  // Push the debounced term to the URL. Skipped while the input already agrees
  // with the URL, so adopting an external change does not bounce back.
  useEffect(() => {
    if (text.trim() === urlQuery.trim()) return;
    const timer = setTimeout(() => {
      setParam(FILTER_PARAMS.query, text.trim(), defaultFilters.query);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, urlQuery, setParam]);

  const hasFilters = hasActiveFilters(filters);

  const isFiltered = resultCount !== totalCount;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative lg:w-72 lg:shrink-0">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Search units, properties, amenities"
            aria-label="Search units and properties"
            className="h-8 pl-8 text-sm"
          />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2 lg:flex lg:items-center">
          <Select
            value={filters.type}
            onValueChange={(value) =>
              setParam(
                FILTER_PARAMS.type,
                value,
                defaultFilters.type,
              )
            }
          >
            <SelectTrigger
              className="h-8 w-full text-xs lg:w-36"
              aria-label="Filter by type"
            >
              <SelectValue>{typeFilterLabel(filters.type)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ALL_TYPES_LABEL}</SelectItem>
              {propertyTypes.map((propertyType) => (
                <SelectItem key={propertyType} value={propertyType}>
                  {propertyTypeLabels[propertyType]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.verified}
            onValueChange={(value) =>
              setParam(
                FILTER_PARAMS.verified,
                value === "verified" ? "true" : value === "unverified" ? "false" : "",
                "",
              )
            }
          >
            <SelectTrigger
              className="h-8 w-full text-xs lg:w-36"
              aria-label="Filter by verification"
            >
              <SelectValue>{verifiedFilterLabel(filters.verified)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ALL_VERIFIED_LABEL}</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sort}
            onValueChange={(value) =>
              setParam(FILTER_PARAMS.sort, value, defaultFilters.sort)
            }
          >
            <SelectTrigger
              className="h-8 w-full text-xs lg:w-40"
              aria-label="Sort units"
            >
              <SelectValue>{sortFilterLabel(filters.sort)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sortKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {sortLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 lg:shrink-0">
          <p
            className="text-[11px] text-slate-500 dark:text-slate-400"
            aria-live="polite"
            aria-busy={isPending}
          >
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {resultCount}
            </span>
            {resultCount === 1 ? " unit" : " units"}
            {isFiltered && <span className="text-slate-400"> of {totalCount}</span>}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setText("");
                clearAll();
              }}
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
