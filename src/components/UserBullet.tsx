"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import {
  Building2,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Onboarding } from "./Onbording";
import {
  applyTheme,
  readColorScheme,
  serverColorScheme,
  subscribeToColorScheme,
  type ColorScheme,
} from "@/lib/theme";

/**
 * Account menu in the header's tone: a rounded-2xl white card that opens under
 * the pill, with an identity header (avatar, name, email), grouped menu rows
 * on soft hover backgrounds, and hairline dividers instead of bare `<hr>`s.
 * Destructive sign-out gets its own red hover; everything else is blue.
 */

/** Menu-row styling shared by the link items and the action buttons. */
const rowClass =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors outline-none hover:bg-slate-50 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400 dark:focus-visible:ring-teal-500";

const logoutRowClass =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors outline-none hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 dark:text-slate-200 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:focus-visible:ring-teal-500";

const iconClass = "h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500";

/** Hairline divider matching the card's rounded padding. */
const Divider = () => (
  <div className="mx-2 border-t border-slate-100 dark:border-slate-800" />
);

const UserBullet = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  // The stored/OS theme is an external store, so read it with
  // useSyncExternalStore instead of mirroring it into state inside an effect.
  const colorScheme = useSyncExternalStore<ColorScheme>(
    subscribeToColorScheme,
    readColorScheme,
    serverColorScheme,
  );
  useEffect(() => {
    // Reflect the resolved theme onto the document. This is an external system,
    // so updating it from an effect is correct.
    document.documentElement.classList.toggle("dark", colorScheme === "dark");
  }, [colorScheme]);
  // Logout handler (replace with your actual logout logic)
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout().catch((err) => {
        toast.error(err.message || "Logout failed");
      });
    }
  };
  const handleDarkModeToggle = () => {
    // The shared helper persists, flips the document class, and raises the
    // synthetic storage event that keeps the footer toggle in step.
    applyTheme(colorScheme === "dark" ? "light" : "dark");
  };
  if (!user) {
    return (
      <Button
        asChild
        variant="ghost"
        className="rounded-full border border-slate-300 px-3 font-medium hover:bg-white hover:shadow-md md:px-4 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <Link href="/auth/login">
          <LogIn className="w-4 h-4" />
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="hidden sm:inline font-normal font-sans">
              Sign In
            </span>
          )}
        </Link>
      </Button>
    );
  }
  if (!user.phone) {
    return (
      <div className="fixed top-0 left-0 w-full h-screen bg-white dark:bg-black flex items-center justify-center z-50">
        <Onboarding phone />
      </div>
    )
  }
  return (
    // Radix handles outside clicks and Escape, so the open state only has to
    // close the menu when a link is chosen.
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Account menu"
        className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white py-1 pr-1 pl-3 transition-all duration-200 outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:focus-visible:ring-teal-500 dark:focus-visible:ring-offset-slate-900"
      >
        <Menu className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        <Avatar className="h-8 w-8 rounded-full border border-slate-200 object-cover dark:border-slate-700">
          <AvatarImage src={user.photoURL} alt="avatar" />
          <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-72 rounded-2xl border border-slate-200 bg-white p-0 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        {/* Identity header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
          <Avatar className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-700">
            <AvatarImage src={user.photoURL} alt="avatar" />
            <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          </div>
        </div>

        {/* Account links */}
        <ul className="space-y-0.5 p-2">
          {[
            {
              title: "Profile",
              icon: UserIcon,
              link: "/account",
            },
            {
              title: "My Property",
              icon: Building2,
              link: "/account/property",
            },
          ].map((item) => (
            <li key={item.link}>
              <Link
                href={item.link}
                className={rowClass}
                onClick={() => setOpen(false)}
              >
                <item.icon className={iconClass} />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        <Divider />

        {/* Preferences */}
        <ul className="space-y-0.5 p-2">
          <li>
            <button
              type="button"
              onClick={handleDarkModeToggle}
              className={rowClass}
            >
              {colorScheme === "dark" ? (
                <Sun className={iconClass} />
              ) : (
                <Moon className={iconClass} />
              )}
              {colorScheme === "dark" ? "Switch to light" : "Switch to dark"}
            </button>
          </li>
        </ul>

        <Divider />

        {/* Sign out */}
        <ul className="p-2">
          <li>
            <button
              type="button"
              className={logoutRowClass}
              onClick={handleLogout}
            >
              <LogOut className={iconClass} />
              Logout
            </button>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default UserBullet;
