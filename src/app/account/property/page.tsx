import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthUser } from "@/services/auth/session";
import {
  canDeleteProperty,
  canEditProperty,
  canVerifyProperty,
} from "@/services/auth/permissions";
import { listPropertiesForUser } from "@/services/property-db";
import { PropertyExplorer } from "./PropertyExplorer";

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
  const propertyRows = properties.map((property) => ({
    id: property.id,
    name: property.name,
    type: property.type,
    area: property.address.area,
    city: property.address.city,
    region: property.address.region,
    verified: property.verified,
    updatedAt: updatedFormatter.format(property.updatedAt),
    units: property.units.map((unit) => ({
      code: unit.code,
      rooms: unit.rooms,
      bedType: unit.bedType,
      bathrooms: unit.bathrooms,
      price: unit.price,
      period: unit.period,
    })),
    canManage: canEditProperty(user, property),
    canVerify: canVerifyProperty(user),
    canDelete: canDeleteProperty(user, property),
  }));

  return <PropertyExplorer properties={propertyRows} />;
}
