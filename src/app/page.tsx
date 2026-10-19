import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Building2 } from "lucide-react";
import { PropertyCard } from "@/app/property/PropertyCard";
import { listPublicUnitCards } from "@/services/property-db";
import { parsePropertyFilters } from "@/services/property-filters";
import SearchForm from "./SearchForm";

export const metadata: Metadata = {
  title: "Safe Nest — A Protected Place Online",
  description:
    "Safe Nest is a calm, secure home for your digital life — your account, wallet, and settings behind a single protected door.",
};

export default async function Home() {
  // Fetch up to 4 featured units for the home page
  const filters = parsePropertyFilters({});
  const featuredCards = await listPublicUnitCards(filters, 4);

  return (
    <div className="min-h-screen">
      {/* ==== Hero ==== */}
      {/* A compact photo band in the header's rounded-card idiom; the photo
          and shade reuse the existing `.hero-photo`/`.hero-shade` layers. */}
      <section
        id="top"
        aria-labelledby="hero-title"
        className="mx-auto mt-4 w-[calc(100%-2rem)] max-w-7xl"
      >
        <div className="relative h-[170px] overflow-hidden rounded-2xl bg-[#446e68] sm:h-[210px] lg:h-[240px]">
          <div
            className="hero-photo"
            role="img"
            aria-label="A modern hillside home with a pool and mountain views"
          />
          <div className="hero-shade" />
          <div className="relative z-[1] flex h-full flex-col justify-center px-5 sm:px-10">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-[#dcf1e5] uppercase">
              <span className="h-px w-4 bg-blue-500" />
              Stays with a little more soul
            </span>
            <h1
              id="hero-title"
              className="mt-2.5 max-w-md text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl"
            >
              Find a place to feel{" "}
              <em className="font-normal italic text-teal-200">at home.</em>
            </h1>
          </div>
        </div>

        {/* Search pill, overlapping the photo's bottom edge — shown at every width */}
        <div className="relative z-10 mx-auto -mt-6 w-full max-w-2xl px-4 sm:px-0">
          <SearchForm />
        </div>
      </section>

      {/* ==== Featured Property List Section ==== */}
      <section id="featured" className="bg-white py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase dark:text-slate-500">
                A FEW VERY GOOD PLACES
              </span>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
                Stay somewhere{" "}
                <em className="italic text-blue-600 dark:text-blue-400">
                  special.
                </em>
              </h2>
            </div>
            <Link
              href="/property"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Browse all nest <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCards.length > 0 ? (
              featuredCards.map((card) => (
                <PropertyCard
                  key={`${card.property.id}-${card.unit.code}`}
                  property={card.property}
                  unit={card.unit}
                />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center dark:border-slate-700 dark:bg-slate-900">
                <Building2 className="mx-auto h-5 w-5 text-slate-400 dark:text-slate-500" />
                <p className="mt-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  No featured properties yet
                </p>
                <p className="mx-auto mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                  Be the first to list a property on Safe Nest.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer is rendered by layout.tsx */}
    </div>
  );
}
