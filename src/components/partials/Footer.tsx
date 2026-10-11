import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="backdrop-blur-xl bg-white/95 dark:bg-[#181622]/95 border-t border-slate-200/60 dark:border-[#2d1e4d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
          {/* Brand */}
          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-3 h-3 text-white bg-gradient-to-br from-teal-600 to-amber-500 rounded-md" />
              <span className="font-semibold text-xs text-slate-900 dark:text-teal-100">
                Safe Nest
              </span>
            </div>
            <span className="text-xs text-slate-600 dark:text-teal-400">
                A protected place online
              </span>
          </div>
          {/* Legal & Info Links */}
          <div className="flex items-center gap-3">
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
                className="text-slate-600 transition-colors hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
