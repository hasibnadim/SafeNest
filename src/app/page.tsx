import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  LifeBuoy,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Testimonial } from "@/components/Testimonial";
import { PropertyCard } from "@/app/property/PropertyCard";
import { listPublicUnitCards } from "@/services/property-db";
import { parsePropertyFilters } from "@/services/property-filters";

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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#04080f] dark:text-slate-200">
      {/* ==== Small Hero Section ==== */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center px-4 py-3">
        {/* Daylight: pale sky above, golden warmth below */}
        <div className="pointer-events-none absolute inset-0 dark:hidden bg-[radial-gradient(ellipse_at_50%_-10%,rgba(204,251,241,0.95),transparent_62%)]" />
        <div className="pointer-events-none absolute inset-0 dark:hidden bg-[radial-gradient(ellipse_at_50%_125%,rgba(253,224,138,0.65),transparent_58%)]" />
        {/* Night: calm dark above, hearth glow from below */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_50%_130%,rgba(251,191,36,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_50%_-10%,rgba(15,42,58,0.9),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-40 dark:block bg-[radial-gradient(ellipse_at_50%_100%,rgba(45,212,191,0.12),transparent_70%)]" />

        <div className="relative text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            SafeNest
          </h1>
          <p className="mt-1 text-base text-slate-600 dark:text-slate-300/90">
            Your trusted partner to find your best home
          </p>

          <div className="mt-4">
            <Link
              href="/property"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 dark:from-amber-400 dark:to-amber-500 dark:text-slate-950 dark:shadow-[0_0_25px_rgba(251,191,36,0.35)] dark:hover:shadow-[0_0_40px_rgba(251,191,36,0.6)]"
            >
              Find your home
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==== Featured Property List Section ==== */}
      <section
        id="featured"
        className="relative border-t border-slate-200 bg-white py-12 px-4 dark:border-white/5 dark:bg-[#060d16]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent dark:via-teal-400/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-teal-700/80 dark:text-teal-300/70">
              Featured Properties
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
              Properties You Might Like
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCards.length > 0 ? (
              featuredCards.map((card) => (
                <PropertyCard
                  key={`${card.property.id}-${card.unit.code}`}
                  property={card.property}
                  unit={card.unit}
                />
              ))
            ) : (
              <div
                className="col-span-3 sm:col-span-2 lg:col-span-3 rounded-lg border border-dashed border-slate-300 py-12 text-center dark:border-slate-700"
              >
                <span className="mx-auto h-5 w-5 text-slate-400" />
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

      {/* ==== Testimonial Section ==== */}
      <Testimonial />

      {/* Footer is rendered by layout.tsx */}
    </div>
  );
}