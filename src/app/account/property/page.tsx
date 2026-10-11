import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Building2 } from "lucide-react";

import { getAuthUser } from "@/services/auth/session";
import { isSystemUser, canEditProperty, canVerifyProperty, canDeleteProperty } from "@/services/auth/permissions";
import { listPropertiesForUser } from "@/services/property-db";
import {
  cheapestUnit,
  formatPrice,
  propertyTypeLabels,
} from "@/services/properties";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyRowActions } from "./PropertyRowActions";

/**
 * Dashboard property index.
 *
 * A regular user sees the properties they own; a system user sees every one.
 * This page is a server component so the scope is decided from the session
 * rather than from anything the browser sends.
 *
 * Editing happens on the property, not on a unit: units are added and removed
 * inside the property form.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "My properties | Safe Nest",
  description: "Manage the properties and units on your Safe Nest account.",
};

const updatedFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export default async function AccountPropertyPage() {
  const user = await getAuthUser(await cookies());
  // The account layout already gates this, but the page must stand on its own
  // so it cannot be rendered without a session.
  if (!user) redirect("/auth/login");

  const properties = await listPropertiesForUser(user);
  const adminView = isSystemUser(user);

  return (
    <div className="mx-auto max-w-6xl px-1 py-2 md:px-4">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl text-slate-900 dark:text-slate-100">
            My properties
          </h1>
        </div>
        <Button asChild variant={"link"}>
          <Link href="/account/property/new"> 
            <Plus /> Add property
          </Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
          <Building2 className="mb-3 h-8 w-8 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            No properties yet
          </h2> 
          <Button asChild variant={"outline"} className="mt-4">
            <Link href="/account/property/new">
              <Plus className="mr-2 h-4 w-4" />
              Create a property
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {properties.map((property) => {
            const location = [
              property.address.area,
              property.address.city,
              property.address.region,
            ]
              .filter(Boolean)
              .join(", ");
            const lowest = cheapestUnit(property.units);
            return (
              <li
                key={property.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold text-slate-900 dark:text-slate-100">
                      {property.name}
                    </h2>
                    {property.verified && (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {propertyTypeLabels[property.type]} · {location}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {property.units.length}{" "}
                      {property.units.length === 1 ? "unit" : "units"}
                    </span>
                    {lowest && (
                      <>
                        {" · from "}
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {formatPrice(lowest)}
                        </span>
                      </>
                    )}
                    <span className="text-slate-400">
                      {" · updated "}
                      {updatedFormatter.format(property.updatedAt)}
                    </span>
                  </p>
                </div>
                <PropertyRowActions
                  id={property.id}
                  firstUnitCode={lowest?.code}
                  verified={property.verified}
                  canManage={canEditProperty(user, property)}
                  canVerify={canVerifyProperty(user)}
                  canDelete={canDeleteProperty(user, property)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
