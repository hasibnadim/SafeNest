"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  CreditCard,
  Settings,
  Bell,
  LayoutDashboard,
  Building2,
  Users,
} from "lucide-react";
import Protected from "@/components/Protected";
import { useAuth } from "@/contexts/AuthContext";
import { isSystemUser } from "@/services/auth/permissions";

/**
 * `exact` is needed for section index routes. A plain prefix match would light
 * up "/account" on /account/property, /account/wallet, and every other nested
 * page, so two items would look selected at once.
 *
 * `adminOnly` entries are hidden unless the signed-in account is a system user
 * (admin or superadmin). Hiding the link is a convenience — the customers page
 * re-checks the role on the server and cannot render for anyone else.
 */
const links: {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  adminOnly?: boolean;
}[] = [
  // { label: "Dashboard", href: "/account/dashboard", icon: LayoutDashboard },
  // { label: "Wallet", href: "/account/wallet", icon: CreditCard },
  // { label: "Notification", href: "/account/notification", icon: Bell },
  { label: "Profile", href: "/account", icon: User, exact: true },
  { label: "My Property", href: "/account/property", icon: Building2 },
  { label: "Customers", href: "/account/customers", icon: Users, adminOnly: true },
  // { label: "Settings", href: "/account/settings", icon: Settings },
];

/**
 * Highlights the current section. Nested routes such as /account/property/new
 * keep the parent highlighted, while index routes match only themselves.
 */
const isActive = (pathname: string, href: string, exact?: boolean) =>
  pathname === href || (!exact && pathname.startsWith(`${href}/`));

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname() || "";
  const { user } = useAuth();
  // One list feeds both the desktop and the mobile nav, so the role is
  // decided once. Before the session resolves `user` is null and the admin
  // entry stays hidden for a frame — never the other way around.
  const visibleLinks = links.filter(
    (link) => !link.adminOnly || isSystemUser(user),
  );
  return (
    <Protected>
      <div className="flex bg-white dark:bg-slate-900">
        <aside className="w-42 lg:w-50 hidden md:block border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="space-y-1">
            {visibleLinks.map((l) => {
              const Icon = l.icon;
              const active = isActive(pathname, l.href, l.exact);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-inset focus-visible:ring-offset-0 ${active ? "bg-teal-50 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-medium" : "text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-normal md:text-lg lg:text-xl">
                    {l.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="overflow-hidden flex-1">
          {/* Mobile sidebar (top) */}
          <div className="md:hidden w-full overflow-x-auto flex justify-between flex-nowrap border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80">
            {visibleLinks.map((l) => {
              const Icon = l.icon;
              const active = isActive(pathname, l.href, l.exact);

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-label={l.label}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center px-4 py-3 rounded-md text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 dark:focus-visible:ring-teal-500 ${active ? "bg-teal-50 dark:bg-slate-800 text-teal-700 dark:text-teal-400" : "text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>

          <main className="p-1">{children}</main>
        </div>
      </div>
    </Protected>
  );
};

export default Layout;
