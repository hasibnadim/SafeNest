"use client"; 
import Link from "next/link"; 
import UserBullet from "../UserBullet";
import { Playwrite_US_Modern } from "next/font/google";
import { cn } from "@/lib/utils"; 
import { Building2 } from "lucide-react";

const playWrite = Playwrite_US_Modern({
  weight: ["400"],
});
const Header = () => { 
  return (
    <header
      className={cn(
        "sticky top-0 z-40 backdrop-blur-xl bg-slate-50/70 dark:bg-slate-900/90 text-slate-900 dark:text-white",
      )}
    >
      <div className="max-w-7xl mx-auto px-2 md:px-4 lg:px-1">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 group">
            <span
              className={`${playWrite.className} font-bold text-lg bg-linear-to-r from-gray-800 to-blue-600 dark:from-gray-100 dark:to-blue-200 bg-clip-text text-transparent`}
            >
              Safe Nest
            </span>
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-1 md:gap-3">
            <Link
              href="/property"
              aria-label="Browse property"
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <Building2 />
            </Link>
            <UserBullet />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
