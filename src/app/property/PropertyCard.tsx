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
 *
 * Styled to the header's tone: a white bordered card that lifts on hover, the
 * type and location folded into one muted subtitle line, specs as a single
 * wrapping row (so a unit without a kitchen does not leave a hole in a grid),
 * and the price anchoring the bottom in Airbnb's position — period muted, blue
 * arrow appearing on hover. Focus follows the app-wide teal ring.
 */
export function PropertyCard({
  property,
  unit,
}: {
  property: PropertySummary;
  unit: PropertyUnit;
}) {
  const location = [
    property.address.area,
    property.address.city,
    property.address.region,
  ]
    .filter(Boolean)
    .join(", ");

  const subtitle = [propertyTypeLabels[property.type], location]
    .filter(Boolean)
    .join(" · ");

  // `formatPrice` returns one string ("৳12,500/month"); splitting on the only
  // slash lets the period read as the muted suffix Airbnb shows under a price.
  const [amount, period] = formatPrice(unit).split("/");

  return (
    <Link
      href={unitHref(property.id, unit.code)}
      aria-label={`Open ${property.name} unit ${unit.code}`}
      className="group block cursor-pointer rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:focus-visible:ring-teal-500 dark:focus-visible:ring-offset-slate-950"
    >
      <article className="relative overflow-hidden">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Unit {unit.code}
          </span>

          {property.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Check className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>

        <h3 className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {property.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{subtitle}</span>
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2.5 text-[11px] text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <DoorOpen className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {unit.rooms}
            </span>
            rooms
          </span>
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {unit.bedType}
            </span>
            bed
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {unit.bathrooms}
            </span>
            baths
          </span>
          {unit.kitchens > 0 && (
            <span className="flex items-center gap-1.5">
              <CookingPot className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {unit.kitchens}
              </span>
              kitchen
            </span>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
            {amount}
            {period && (
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                /{period}
              </span>
            )}
          </p>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-400" />
        </div>
      </article>
    </Link>
  );
}
