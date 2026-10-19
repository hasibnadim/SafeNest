"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  MapPin,
  Plus,
  Search,
  SearchX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatPrice,
  propertyTypeLabels,
  unitHref,
  type BedType,
  type PropertyType,
  type RentPeriod,
} from "@/services/properties";
import { PropertyRowActions } from "./PropertyRowActions";

type PropertyExplorerItem = {
  id: string;
  name: string;
  type: PropertyType;
  area: string;
  city: string;
  region: string;
  verified: boolean;
  updatedAt: string;
  units: {
    code: string;
    rooms: number;
    bedType: BedType;
    bathrooms: number;
    price: number;
    period: RentPeriod;
  }[];
  canManage: boolean;
  canVerify: boolean;
  canDelete: boolean;
};

export function PropertyExplorer({
  properties,
}: {
  properties: PropertyExplorerItem[];
}) {
  const [view, setView] = useState<"properties" | "units">("properties");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const unitCount = properties.reduce(
    (total, property) => total + property.units.length,
    0,
  );
  const filteredProperties = properties.filter(
    (property) =>
      !normalizedQuery ||
      property.name.toLocaleLowerCase().includes(normalizedQuery) ||
      property.units.some((unit) =>
        unit.code.toLocaleLowerCase().includes(normalizedQuery),
      ),
  );
  const filteredUnits = properties.flatMap((property) =>
    property.units
      .filter(
        (unit) =>
          !normalizedQuery ||
          property.name.toLocaleLowerCase().includes(normalizedQuery) ||
          unit.code.toLocaleLowerCase().includes(normalizedQuery),
      )
      .map((unit) => ({ property, unit })),
  );

  return (
    <div className="mx-auto max-w-6xl px-1 py-3 md:px-4 md:py-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">
            Portfolio
          </p>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
            My properties
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Find and manage your listings and units.
          </p>
        </div>
        <Button asChild className="bg-teal-700 text-white hover:bg-teal-800">
          <Link href="/account/property/new">
            <Plus /> Add property
          </Link>
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <p>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {properties.length}
          </span>{" "}
          <span className="text-slate-500 dark:text-slate-400">
            {properties.length === 1 ? "property" : "properties"}
          </span>
        </p>
        <p>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {unitCount}
          </span>{" "}
          <span className="text-slate-500 dark:text-slate-400">
            {unitCount === 1 ? "unit" : "units"}
          </span>
        </p>
        <p>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {properties.filter((property) => property.verified).length}
          </span>{" "}
          <span className="text-slate-500 dark:text-slate-400">verified</span>
        </p>
      </div>

      <section aria-label="Search and view options" className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-md">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by property or unit name"
              aria-label="Search by property or unit name"
              className="h-10 rounded-md border-slate-300 bg-white pl-9 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <div
            aria-label="Listing view"
            className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900"
            role="group"
          >
            <Button
              type="button"
              aria-pressed={view === "properties"}
              onClick={() => setView("properties")}
              className={`h-8 rounded-full px-4 text-sm ${view === "properties" ? "bg-white text-slate-950 shadow-sm hover:bg-white dark:bg-slate-700 dark:text-white dark:hover:bg-slate-700" : "bg-transparent text-slate-600 shadow-none hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800"}`}
            >
              Properties <span className="ml-1 opacity-70">{properties.length}</span>
            </Button>
            <Button
              type="button"
              aria-pressed={view === "units"}
              onClick={() => setView("units")}
              className={`h-8 rounded-full px-4 text-sm ${view === "units" ? "bg-white text-slate-950 shadow-sm hover:bg-white dark:bg-slate-700 dark:text-white dark:hover:bg-slate-700" : "bg-transparent text-slate-600 shadow-none hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800"}`}
            >
              Units <span className="ml-1 opacity-70">{unitCount}</span>
            </Button>
          </div>
        </div>
      </section>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center border-y border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
          <Building2 className="mb-3 h-8 w-8 text-teal-700 dark:text-teal-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            No properties yet
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add your first property to start listing units.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/account/property/new">
              <Plus /> Create a property
            </Link>
          </Button>
        </div>
      ) : view === "properties" ? (
        filteredProperties.length > 0 ? (
          <ul className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {filteredProperties.map((property) => {
              const location = [property.area, property.city, property.region]
                .filter(Boolean)
                .join(", ");
              const lowest = property.units.reduce<(typeof property.units)[number] | null>(
                (current, unit) =>
                  current === null || unit.price < current.price ? unit : current,
                null,
              );

              return (
                <li
                  key={property.id}
                  className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-slate-950 dark:text-slate-100">
                          {property.name}
                        </h2>
                        {property.verified && (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{location || "Location not provided"}</span>
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {propertyTypeLabels[property.type]} <span aria-hidden="true">/</span>{" "}
                        {property.units.length} {property.units.length === 1 ? "unit" : "units"}
                        {lowest && <> <span aria-hidden="true">/</span> From {formatPrice(lowest)}</>}
                        <span className="text-slate-400"> <span aria-hidden="true">/</span> Updated {property.updatedAt}</span>
                      </p>
                    </div>
                  </div>
                  <PropertyRowActions
                    id={property.id}
                    firstUnitCode={lowest?.code}
                    verified={property.verified}
                    canManage={property.canManage}
                    canVerify={property.canVerify}
                    canDelete={property.canDelete}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <NoSearchResults query={query} onClear={() => setQuery("")} />
        )
      ) : filteredUnits.length > 0 ? (
        <ul className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {filteredUnits.map(({ property, unit }) => (
            <li
              key={`${property.id}-${unit.code}`}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h2 className="font-semibold text-slate-950 dark:text-slate-100">
                    {unit.code}
                  </h2>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    at {property.name}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {unit.rooms} {unit.rooms === 1 ? "room" : "rooms"}
                  {unit.bathrooms > 0 && ` / ${unit.bathrooms} ${unit.bathrooms === 1 ? "bathroom" : "bathrooms"}`}
                  {` / ${unit.bedType} bed`}
                  {property.verified && <span className="text-emerald-700 dark:text-emerald-400"> / Verified property</span>}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p className="whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatPrice(unit)}
                </p>
                <div className="flex items-center gap-1">
                  {property.canManage && (
                    <Button
                      asChild
                      type="button"
                      variant="ghost"
                      size="icon"
                      title={`Edit ${property.name}`}
                    >
                      <Link
                        href={`/account/property/${property.id}`}
                        aria-label={`Edit ${property.name}`}
                      >
                        <Building2 />
                      </Link>
                    </Button>
                  )}
                  <Button
                    asChild
                    type="button"
                    variant="outline"
                    size="sm"
                  >
                    <a
                      href={unitHref(property.id, unit.code)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ArrowUpRight /> View
                    </a>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <NoSearchResults query={query} onClear={() => setQuery("")} />
      )}
    </div>
  );
}

function NoSearchResults({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center border-y border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
      <SearchX className="mb-3 h-7 w-7 text-slate-400" />
      <h2 className="font-semibold text-slate-900 dark:text-slate-100">
        No matches found
      </h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Nothing matches &ldquo;{query}&rdquo;. Try another property or unit name.
      </p>
      <Button type="button" variant="link" className="mt-2" onClick={onClear}>
        Clear search
      </Button>
    </div>
  );
}