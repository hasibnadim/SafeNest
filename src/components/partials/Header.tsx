import Link from "next/link";
import { Playwrite_US_Modern } from "next/font/google";

import UserBullet from "../UserBullet";
import { PwaInstallButton } from "../PwaInstallButton";

/**
 * Site header in the Airbnb idiom: brand on the left, the browse link and the
 * account menu pill on the right. There is deliberately no search pill here —
 * searching lives on the home page and on /property's filters.
 *
 * The brand keeps the Playwrite treatment it has always had — only the layout
 * around it changed. This is a server component; the account pill is the only
 * interactive piece and stays a client island.
 */

const playWrite = Playwrite_US_Modern({
  weight: ["400"],
});

const Header = () => {
  return (
    <header className="sticky top-0 z-40  bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:bg-slate-900/95 dark:supports-backdrop-filter:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Brand — unchanged type and gradient */}
          <Link
            href="/"
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <span
              className={`${playWrite.className} font-bold text-lg bg-linear-to-r from-gray-800 to-blue-600 dark:from-gray-100 dark:to-blue-200 bg-clip-text text-transparent`}
            >
              Safe Nest
            </span>
          </Link>

          {/* Right cluster: install affordance, browse link, account pill */}
          <div className="flex items-center gap-1 md:gap-2">
            <PwaInstallButton />
            <Link
              href="/property"
              className="inline-flex rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-colors outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-600 sm:px-4 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Find Nest
            </Link>

            <UserBullet />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
