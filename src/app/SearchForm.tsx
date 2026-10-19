"use client";

import { Search } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
    FILTER_PARAMS,
    defaultFilters,
    typeFilterLabel,
    type TypeFilter,
} from "@/services/property-filters";
import {
    propertyTypeLabels,
    propertyTypes,
    type PropertyType,
} from "@/services/properties";

/** Only a known type reaches the URL; anything else falls back to "all". */
const readType = (raw: string | null): TypeFilter =>
    raw && (propertyTypes as readonly string[]).includes(raw)
        ? (raw as PropertyType)
        : defaultFilters.type;

/**
 * Home-page search in the header's idiom: a compact white pill with a "Where"
 * segment, a "Type" segment, and a blue search button, submitting the same
 * `q` and `type` parameters the /property page parses.
 *
 * Both segments render at every width — below `sm` they simply narrow and
 * truncate, so a phone gets the same search a desktop does. The pill overlaps
 * the hero photo's bottom edge, the way Airbnb seats its search bar.
 */
export default function SearchForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [query, setQuery] = useState("");
    const [type, setType] = useState<TypeFilter>(defaultFilters.type);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const params = new URLSearchParams();
        const q = query.trim().slice(0, 120);
        if (q) params.set(FILTER_PARAMS.query, q);
        if (type !== defaultFilters.type) params.set(FILTER_PARAMS.type, type);
        const search = params.toString();
        startTransition(() => {
            router.push(search ? `/property?${search}` : "/property");
        });
    };

    return (
        <form
            onSubmit={submit}
            role="search"
            aria-busy={isPending}
            className="flex h-12 w-full items-center rounded-full border border-slate-200 bg-white shadow-md focus-within:border-slate-300 focus-within:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20 dark:focus-within:border-slate-600"
        >
            <label
                htmlFor="home-search-where"
                className="flex min-w-0 flex-1 cursor-text flex-col justify-center gap-0.5 px-4 sm:px-5"
            >
                <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    Where
                </span>
                <input
                    id="home-search-where"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search cities or properties"
                    className="w-full truncate bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
            </label>

            <span
                aria-hidden="true"
                className="h-8 w-px shrink-0 bg-slate-200 dark:bg-slate-700"
            />

            <label
                htmlFor="home-search-type"
                className="flex min-w-0 flex-[0.9] cursor-pointer flex-col justify-center gap-0.5 px-4 sm:px-5"
            >
                <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    Type
                </span>
                <select
                    id="home-search-type"
                    value={type}
                    onChange={(event) => setType(readType(event.target.value))}
                    className="w-full cursor-pointer appearance-none truncate bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100 dark:[&>option]:bg-slate-800 dark:[&>option]:text-slate-100"
                >
                    <option value={defaultFilters.type}>
                        {typeFilterLabel(defaultFilters.type)}
                    </option>
                    {propertyTypes.map((value) => (
                        <option key={value} value={value}>
                            {propertyTypeLabels[value]}
                        </option>
                    ))}
                </select>
            </label>

            <button
                type="submit"
                aria-label="Search properties"
                className="mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:mr-2 sm:h-10 sm:w-10 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus-visible:ring-offset-slate-800"
            >
                <Search className="h-4 w-4" />
            </button>
        </form>
    );
}
