import Link from "next/link";
import {
  ArrowUpRight,
  Bath,
  BedDouble,
  Check,
  CookingPot,
  DoorOpen,
  MapPin,
} from "lucide-react";
import {
  formatPrice,
  propertyTypeLabels,
  unitHref,
  type PropertySummary,
  type PropertyUnit,
} from "@/services/properties";
 
/**
 * One card per unit, not per property: a house with three rooms is three cards
 * that link to three pages. The property name is the card's heading, because
 * that is what someone scanning a list is looking for.
 */
export function PropertyCard({
  property,
  unit,
}: {
  property: PropertySummary;
  unit: PropertyUnit;
}) {
  return (
    <Link
      href={unitHref(property.id, unit.code)}
      aria-label={`Open ${property.name} unit ${unit.code}`}
      className="group block cursor-pointer rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950"
    >
      <article className="relative overflow-hidden">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Unit {unit.code}
          </span>

          {property.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Check className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
              {property.name}
            </h3>
            <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {[property.address.area, property.address.city, property.address.region]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-base font-bold text-slate-900 dark:text-slate-50">
              {formatPrice(unit)}
            </p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              {propertyTypeLabels[property.type]}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <DoorOpen className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-slate-100">{unit.rooms}</span>
            rooms
          </div>
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-slate-100">{unit.bedType}</span>
            bed
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-slate-100">{unit.bathrooms}</span>
            baths
          </div>
          <div className="flex items-center gap-1.5">
            <CookingPot className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-slate-100">{unit.kitchens}</span>
            kitchen
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span className="truncate">{property.address.city}</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-sky-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-sky-400" />
        </div>
      </article>
    </Link>
  );
}
