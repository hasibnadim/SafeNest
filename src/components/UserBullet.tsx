"use client";
import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import {
  Bell,
  Building2,
  Download,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
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

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const handler = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (!deferredPrompt) return null;

  return (
    <Button
      variant={"ghost"}
      className="w-full cursor-pointer justify-start"
      onClick={async () => {
        (deferredPrompt as any).prompt();
      }}
    >
      <Download /> Install as App
    </Button>
  );
};

type ColorScheme = "light" | "dark";

// The stored/OS theme is an external store, so read it with useSyncExternalStore
// instead of mirroring it into state inside an effect.
function readColorScheme(): ColorScheme {
  const storedTheme = window.localStorage.getItem("theme");
  if (storedTheme) {
    return storedTheme === "dark" ? "dark" : "light";
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribeToColorScheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

const UserBullet = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const systemColorScheme = useSyncExternalStore(
    subscribeToColorScheme,
    readColorScheme,
    () => "light" as ColorScheme
  );
  // null means "follow the stored/OS theme"; a string means the user picked one.
  const [themeOverride, setThemeOverride] = useState<ColorScheme | null>(null);
  const colorScheme = themeOverride ?? systemColorScheme;
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
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
    const next: ColorScheme = colorScheme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    setThemeOverride(next);
  };
  if (!user) {
    return (
      <Button asChild variant={"ghost"}>
        <Link href="/auth/login">
          <LogIn className="w-4 h-4" />
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="hidden md:inline font-normal font-sans">
              Sign In
            </span>
          )}
        </Link>
      </Button>
    );
  }
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-900 dark:text-gray-200 bg-white/80 dark:bg-slate-900/80 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:focus-visible:ring-teal-500 dark:focus-visible:ring-offset-slate-900">
        <div className="relative">
          <Avatar className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-800 object-cover">
            <AvatarImage src={user.photoURL} alt="avatar" />
            <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <ul className="py-1">
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
          ].map((item, index) => (
            <li key={index}>
              <Link
                href={item.link}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 dark:focus-visible:ring-teal-500"
                onClick={() => setOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.title}
              </Link>
            </li>
          ))}
          <hr />
          <li>
            <Button
              variant="ghost"
              onClick={handleDarkModeToggle}
              className="flex w-full justify-start gap-2 px-4 py-2 text-sm text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 dark:focus-visible:ring-teal-500"
            >
              {colorScheme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {colorScheme === "dark" ? "Switch to light" : "Switch to dark"}
            </Button>
          </li>
          <li>
            <PWAInstallButton />
          </li>
          <hr />
          <li>
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 dark:focus-visible:ring-teal-500"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default UserBullet;
