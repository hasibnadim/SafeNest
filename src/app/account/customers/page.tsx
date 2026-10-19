import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

import { getAuthUser } from "@/services/auth/session";
import { isSystemUser } from "@/services/auth/permissions";
import {
  CUSTOMER_PAGE_SIZE,
  getCustomerStats,
  listCustomers,
  type CustomerRow,
} from "@/services/user-db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerSearch } from "./CustomerSearch";

/**
 * Admin-only customer index: sign-up counts across the trailing day, week,
 * and month, plus a searchable list paginated 50 at a time.
 *
 * The page is a server component on purpose — the session, the admin check,
 * and every query happen here, so the role is never taken from anything the
 * browser sends. The URL is the only state: `q` for the search, `page` for
 * the position, which keeps the list linkable and shareable.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customers | Safe Nest",
  description: "Registered Safe Nest accounts and their sign-up activity.",
};

type CustomersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** `searchParams` values may arrive repeated; only the first is meaningful. */
const firstValue = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

const parsePage = (value: string | string[] | undefined) => {
  const parsed = Number.parseInt(firstValue(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const joinedFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const activeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/** Falls back to the email when a Google account carries no usable name. */
const displayName = (customer: CustomerRow) =>
  [customer.firstName, customer.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ") || customer.email;

const roleLabel = (role: CustomerRow["systemRole"]) =>
  role === "superadmin" ? "Super admin" : role === "admin" ? "Admin" : null;

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const user = await getAuthUser(await cookies());
  // The sidebar only hides the link for everyone else; this is the guard.
  if (!user) redirect("/auth/login");
  if (!isSystemUser(user)) redirect("/account");

  const params = await searchParams;
  const query = firstValue(params.q).trim();
  const requestedPage = parsePage(params.page);

  const [stats, list] = await Promise.all([
    getCustomerStats(),
    listCustomers(query, requestedPage),
  ]);

  const statCards = [
    { label: "Total users", value: stats.total },
    { label: "Last month", value: stats.lastMonth },
    { label: "Last week", value: stats.lastWeek },
    { label: "Today", value: stats.today },
  ];

  const rangeStart = list.total === 0 ? 0 : (list.page - 1) * CUSTOMER_PAGE_SIZE + 1;
  const rangeEnd = Math.min(list.total, list.page * CUSTOMER_PAGE_SIZE);

  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (page > 1) next.set("page", String(page));
    const search = next.toString();
    return search ? `/account/customers?${search}` : "/account/customers";
  };

  return (
    <div className="mx-auto max-w-6xl px-1 py-2 md:px-4">
      <div className="mb-6">
        <h1 className="text-2xl text-slate-900 dark:text-slate-100">Customers</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Every registered account, newest sign-ups first.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CustomerSearch value={query} />
        <p
          className="text-sm text-slate-500 dark:text-slate-400"
          aria-live="polite"
        >
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {list.total}
          </span>
          {list.total === 1 ? " customer" : " customers"}
          {query && <span className="text-slate-400"> matching “{query}”</span>}
        </p>
      </div>

      {list.rows.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
          <Users className="mb-3 h-8 w-8 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {query ? "No matching customers" : "No customers yet"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {query
              ? "Try a name, email, or phone number."
              : "Registered accounts will appear here."}
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {list.rows.map((customer) => {
              const role = roleLabel(customer.systemRole);
              return (
                <li key={customer.uid}>
                  <Link
                    href={`/account/customers/${encodeURIComponent(customer.uid)}`}
                    className="flex flex-col gap-2 p-4 outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/40 dark:focus-visible:bg-slate-800/40"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-semibold text-slate-900 dark:text-slate-100">
                          {displayName(customer)}
                        </h2>
                        {role && (
                          <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
                            {role}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {customer.email}
                        {customer.phone ? ` · ${customer.phone}` : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">
                        {customer.createdAt && (
                          <p>Joined {joinedFormatter.format(customer.createdAt)}</p>
                        )}
                        {customer.lastActivity && (
                          <p className="mt-0.5">
                            Last active {activeFormatter.format(customer.lastActivity)}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <nav
            className="flex flex-wrap items-center justify-between gap-3 pt-3"
            aria-label="Pagination"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
              Showing {rangeStart}–{rangeEnd} of {list.total}
              <span className="text-slate-400">
                {" · "}page {list.page} of {list.pageCount}
              </span>
            </p>

            <div className="flex items-center gap-2">
              {list.page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(list.page - 1)} rel="prev">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
              )}

              {list.page < list.pageCount ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(list.page + 1)} rel="next">
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
