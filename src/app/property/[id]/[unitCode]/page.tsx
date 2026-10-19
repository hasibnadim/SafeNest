import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  Check,
  CookingPot,
  ChevronRight,
  DoorOpen,
  MapPin,
} from "lucide-react";
import { PropertyCard } from "../../PropertyCard";
import { PropertySensitiveInfo } from "./PropertySensitiveInfo";
import {
  getPublicUnit,
  listRelatedUnits,
  otherUnitsOf,
} from "@/services/property-db";
import { getAuthUser } from "@/services/auth/session";
import {
  formatListedOn,
  formatPrice,
  formatUnitUpdatedAt,
  propertyTypeLabels,
  unitHref,
  type PropertyUnit,
} from "@/services/properties";

type PageProps = {
  params: Promise<{ id: string; unitCode: string }>;
};

/**
 * Listings are user-generated at runtime, so this route reads from MongoDB on
 * every request instead of pre-rendering a fixed set of slugs. A short
 * revalidation window keeps repeat views cheap without going fully dynamic.
 *
 * The page is per unit: the property is the shared part (address, contacts,
 * description) and the unit is what is actually being shown and priced.
 */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, unitCode } = await params;
  const found = await getPublicUnit(id, unitCode);

  if (!found) {
    return { title: "Unit not found — Safe Nest" };
  }

  const { property, unit } = found;
  return {
    title: `${property.name} · Unit ${unit.code} — Safe Nest`,
    description: `${propertyTypeLabels[property.type]} in ${property.address.city}, ${property.address.region}. Unit ${unit.code}: ${formatPrice(unit)}, ${unit.rooms} rooms, ${unit.bedType} bed arrangement, ${unit.bathrooms} bathrooms.`,
  };
}

export default async function PropertyUnitPage({ params }: PageProps) {
  const { id, unitCode } = await params;
  const cookieStore = await cookies();
  const user = await getAuthUser(cookieStore);
  const found = await getPublicUnit(id, unitCode);

  if (!found) {
    notFound();
  }

  const { property, unit } = found;
  const loginHref = `/auth/login?redirect=${encodeURIComponent(`/property/${id}/${unitCode}`)}`;
  const related = await listRelatedUnits(property, 4);
  const otherUnits = otherUnitsOf(property, unit.code);

  const visibleAddressParts = [
    property.address.area,
    property.address.city,
    property.address.region,
    property.address.postalCode,
  ].filter(Boolean);

  // `formatPrice` returns one string ("৳12,500/month"); splitting on the only
  // slash lets the period read as the muted suffix the cards show.
  const [priceAmount, pricePeriod] = formatPrice(unit).split("/");

  const headlineSpecs = [
    { icon: DoorOpen, value: unit.rooms, label: "Rooms" },
    { icon: BedDouble, value: unit.bedType, label: "Bed" },
    { icon: Bath, value: unit.bathrooms, label: "Bathrooms" },
    {
      icon: CookingPot,
      value: unit.kitchens > 0 ? unit.kitchens : "No Kitchen",
      label: "Kitchens",
    },
  ];

  const detailRows = [
    { label: "Property type", value: propertyTypeLabels[property.type] },
    { label: "Unit code", value: unit.code },
    { label: "Rent period", value: unit.period },
    { label: "Rooms", value: `${unit.rooms}` },
    { label: "Bed arrangement", value: unit.bedType },
    { label: "Bathrooms", value: `${unit.bathrooms}` },
    {
      label: "Kitchens",
      value: unit.kitchens > 0 ? `${unit.kitchens}` : "No Kitchen",
    },
    { label: "Listed on", value: formatListedOn(property.listedAt) },
    {
      label: "Unit updated",
      value: formatUnitUpdatedAt(unit.lastUpdatedAt),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <nav
          className="text-sm text-slate-500 dark:text-slate-400"
          aria-label="Breadcrumb"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link
                href="/property"
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Property
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="font-medium text-slate-900 dark:text-slate-100">
              {property.name} · {unit.code}
            </li>
          </ol>
        </nav>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  Unit {unit.code}
                </span>
                {property.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Check className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
                    {property.name}
                  </h1>
                  <p className="mt-1.5 flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                    {visibleAddressParts.join(", ")}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left sm:text-right dark:border-slate-700">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Rent
                  </p>
                  <p className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {priceAmount}
                    {pricePeriod && (
                      <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                        /{pricePeriod}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {headlineSpecs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    <spec.icon className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                    {spec.label}
                  </div>
                  <p className="mt-1.5 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {spec.value}
                  </p>
                </div>
              ))}
            </section>

            {property.description && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  About this property
                </h2>
                <p className="mt-2.5 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {property.description}
                </p>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                In this unit
              </h2>
              {unit.notes && (
                <p className="mt-2.5 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {unit.notes}
                </p>
              )}
              {unit.amenities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {unit.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[13px] text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
              {!unit.notes && unit.amenities.length === 0 && (
                <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">
                  No extra notes were left for this unit.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Unit details
              </h2>
              <dl className="mt-2.5 border-t border-slate-100 dark:border-slate-800">
                {detailRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-b-0 dark:border-slate-800"
                  >
                    <dt className="text-slate-500 dark:text-slate-400">{row.label}</dt>
                    <dd className="text-right font-medium text-slate-900 dark:text-slate-100">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
            <PropertySensitiveInfo
              authenticated={Boolean(user)}
              loginHref={loginHref}
              propertyId={id}
            />

            {otherUnits.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Other units
                </h2>
                <ul className="mt-2.5 space-y-1.5">
                  {otherUnits.map((other: PropertyUnit) => (
                    <li key={other.code}>
                      <Link
                        href={unitHref(property.id, other.code)}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                      >
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Unit {other.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {formatPrice(other)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Similar units
              </h2>
              <Link
                href="/property"
                className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((card) => (
                <PropertyCard
                  key={`${card.property.id}-${card.unit.code}`}
                  property={card.property}
                  unit={card.unit}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

