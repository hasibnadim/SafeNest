import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Building2, ChevronRight, KeyRound } from "lucide-react";

import { getAuthUser } from "@/services/auth/session";
import { isSystemUser } from "@/services/auth/permissions";
import { getCustomerProfile } from "@/services/user-db";
import { listPropertiesForOwner } from "@/services/property-db";
import { listUnlocksForCustomer } from "@/services/unlock-db";
import { propertyTypeLabels } from "@/services/properties";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Full profile for one customer: every account field on file, sign-up and
 * activity dates, social counts, and the properties the account owns.
 *
 * Like the index this is a server component behind an explicit system-user
 * check — knowing a uid is enough to guess this URL, so the gate is what keeps
 * the page admin-only. An unknown uid is a plain 404: it never confirms which
 * ids exist.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customer profile | Safe Nest",
  description: "Account details and activity for a registered Safe Nest customer.",
};

type CustomerProfilePageProps = {
  params: Promise<{ id: string }>;
};

const fullFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const roleLabel = (role: string | undefined) =>
  role === "superadmin"
    ? "Super admin"
    : role === "admin"
      ? "Admin"
      : "Regular user";

/** Shown for a field that is simply not on file, rather than left blank. */
const NotProvided = () => (
  <span className="font-normal text-slate-400">Not provided</span>
);

/** One label/value line in a profile card. */
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm font-medium text-slate-900 dark:text-slate-100 sm:text-right">
        {children}
      </dd>
    </div>
  );
}

export default async function CustomerProfilePage({
  params,
}: CustomerProfilePageProps) {
  const user = await getAuthUser(await cookies());
  // The sidebar only hides the link for everyone else; this is the guard.
  if (!user) redirect("/auth/login");
  if (!isSystemUser(user)) redirect("/account");

  const { id } = await params;
  const customer = await getCustomerProfile(id);
  if (!customer) notFound();

  const [properties, unlocks] = await Promise.all([
    listPropertiesForOwner(customer.uid),
    listUnlocksForCustomer(customer.uid),
  ]);

  const unitCount = properties.reduce((sum, p) => sum + p.units.length, 0);
  const verifiedCount = properties.filter((p) => p.verified).length;
  const followerCount = customer.followers?.length ?? 0;
  const followingCount = customer.following?.length ?? 0;
  const totalUnlockCount = unlocks.reduce((sum, u) => sum + u.count, 0);

  const displayName =
    [customer.firstName, customer.lastName]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(" ") || customer.email;

  const initials =
    [customer.firstName, customer.lastName]
      .map((part) => part?.trim().charAt(0))
      .filter(Boolean)
      .join("")
      .slice(0, 2) || customer.email.slice(0, 1).toUpperCase();

  const statCards = [
    { label: "Properties", value: properties.length },
    { label: "Units", value: unitCount },
    { label: "Verified", value: verifiedCount },
    { label: "Followers", value: followerCount },
  ];

  const addressLine = [
    customer.address,
    customer.city,
    customer.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-6xl px-1 py-2 md:px-4">
      <Link
        href="/account/customers"
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Customers
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-16 w-16 border border-slate-200 dark:border-slate-700">
          <AvatarImage src={customer.photoURL} alt="" />
          <AvatarFallback className="bg-teal-100 text-lg font-semibold text-teal-700 dark:bg-teal-900/50 dark:text-teal-200">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl text-slate-900 dark:text-slate-100">
              {displayName}
            </h1>
            <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
              {roleLabel(customer.systemRole)}
            </Badge>
            <Badge
              className={
                customer.emailVerified
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }
            >
              {customer.emailVerified ? "Email verified" : "Email unverified"}
            </Badge>
          </div>
          <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
            {customer.email}
            {customer.phone ? ` · ${customer.phone}` : ""}
          </p>
          {customer.createdAt && (
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              Joined {fullFormatter.format(customer.createdAt)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="gap-2 py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <dl className="divide-y divide-slate-100 dark:divide-slate-800">
              <DetailRow label="Phone">{customer.phone || <NotProvided />}</DetailRow>
              <DetailRow label="Gender">
                {customer.gender ? (
                  customer.gender === "other"
                    ? "Other"
                    : customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1)
                ) : (
                  <NotProvided />
                )}
              </DetailRow>
              <DetailRow label="Date of birth">
                {customer.dateOfBirth || <NotProvided />}
              </DetailRow>
              <DetailRow label="Address">
                {addressLine || <NotProvided />}
              </DetailRow>
              <DetailRow label="City">{customer.city || <NotProvided />}</DetailRow>
              <DetailRow label="Country">
                {customer.country || <NotProvided />}
              </DetailRow>
            </dl>
          </CardContent>
        </Card>

        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <dl className="divide-y divide-slate-100 dark:divide-slate-800">
              <DetailRow label="User ID">
                <span className="font-mono text-xs">{customer.uid}</span>
              </DetailRow>
              <DetailRow label="Role">{roleLabel(customer.systemRole)}</DetailRow>
              <DetailRow label="Email status">
                {customer.emailVerified ? "Verified" : "Not verified"}
              </DetailRow>
              <DetailRow label="Joined">
                {customer.createdAt ? (
                  fullFormatter.format(customer.createdAt)
                ) : (
                  <NotProvided />
                )}
              </DetailRow>
              <DetailRow label="Last active">
                {customer.lastActivity ? (
                  fullFormatter.format(customer.lastActivity)
                ) : (
                  <span className="font-normal text-slate-400">Never</span>
                )}
              </DetailRow>
              <DetailRow label="Following">{followingCount}</DetailRow>
              <DetailRow label="Seller profile">
                {customer.sellerId ? "Linked" : "None"}
              </DetailRow>
              <DetailRow label="Listings unlocked">
                {totalUnlockCount > 0 ? (
                  <span>
                    {totalUnlockCount} ({unlocks.length} {unlocks.length === 1 ? "unit" : "units"})
                  </span>
                ) : (
                  <span className="font-normal text-slate-400">0</span>
                )}
              </DetailRow>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-3 gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-lg">
            Unlocked Listings
            <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
              {unlocks.length} {unlocks.length === 1 ? "unit" : "units"} ·{" "}
              {totalUnlockCount} {totalUnlockCount === 1 ? "unlock" : "unlocks"} total
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {unlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
              <KeyRound className="mb-3 h-8 w-8 text-slate-400" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                No unlocks yet
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Contact and address details unlocked by this account will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {unlocks.map((unlock) => (
                <li key={unlock.id}>
                  <div className="flex flex-col gap-2 py-3 outline-none sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={unlock.href}
                          className="truncate font-semibold text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                        >
                          {unlock.propertyName}
                        </Link>
                        {unlock.unit && (
                          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Unit {unlock.unit}
                          </Badge>
                        )}
                        <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
                          {unlock.count} {unlock.count === 1 ? "unlock" : "unlocks"}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {unlock.propertyType ? propertyTypeLabels[unlock.propertyType] : "Listing"}
                        {unlock.location ? ` · ${unlock.location}` : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          Last unlocked
                        </p>
                        <p className="mt-0.5">
                          {fullFormatter.format(unlock.lastUnlockedAt)}
                        </p>
                      </div>
                      <Link
                        href={unlock.href}
                        className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                        aria-label={`View ${unlock.propertyName}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mt-3 gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-lg">
            Properties
            <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
              {properties.length} total · {unitCount} {unitCount === 1 ? "unit" : "units"} ·{" "}
              {verifiedCount} verified
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
              <Building2 className="mb-3 h-8 w-8 text-slate-400" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                No properties yet
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Listings created by this account will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {properties.map((property) => {
                const location = [
                  property.address.area,
                  property.address.city,
                  property.address.region,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <li key={property.id}>
                    <Link
                      href={`/account/property/${property.id}`}
                      className="flex flex-col gap-2 py-3 outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/40 dark:focus-visible:bg-slate-800/40"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">
                            {property.name}
                          </h3>
                          {property.verified && (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                          {propertyTypeLabels[property.type]}
                          {location ? ` · ${location}` : ""}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">
                          <p>
                            {property.units.length}{" "}
                            {property.units.length === 1 ? "unit" : "units"}
                          </p>
                          <p className="mt-0.5">
                            Updated {fullFormatter.format(property.updatedAt)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
