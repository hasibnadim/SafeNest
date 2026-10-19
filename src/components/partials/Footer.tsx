import Link from "next/link";
import { Playwrite_US_Modern } from "next/font/google";

import { ThemeToggle } from "../ThemeToggle";

const playWrite = Playwrite_US_Modern({
  weight: ["400"],
});

/**
 * Footer in the header's tone: the Playwrite wordmark on the left, compact
 * info links and the theme switch on the right, on the same white / slate-900
 * surface pairing the header uses. All on one row to keep it tight.
 */
const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 sm:px-6 md:flex-row lg:px-8">
        {/* Brand — the same wordmark the header carries */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <span
              className={`${playWrite.className} font-bold text-sm bg-linear-to-r from-gray-800 to-blue-600 dark:from-gray-100 dark:to-blue-200 bg-clip-text text-transparent`}
            >
              Safe Nest
            </span>
          </Link>
          <span
            aria-hidden="true"
            className="hidden h-3 w-px bg-slate-200 dark:bg-slate-700 sm:block"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            A protected place online
          </span>
        </div>

        {/* Legal & info links + theme switch */}
        <div className="flex items-center gap-3 text-xs">
          {[
            { href: "/property", label: "Property" },
            { href: "/info/about", label: "About" },
            { href: "/info/terms", label: "Terms" },
            { href: "/info/privacy", label: "Privacy" },
            { href: "/info/faq", label: "FAQ" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-600 transition-colors outline-none hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-teal-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
              {link.label}
            </Link>
          ))}
          <span
            aria-hidden="true"
            className="h-3 w-px bg-slate-200 dark:bg-slate-700"
          />
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
