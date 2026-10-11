"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";
import type { ContactDetails } from "@/services/properties";

type SensitiveInfo = {
  street: string;
  contacts: ContactDetails[];
};

type PropertySensitiveInfoProps = {
  authenticated: boolean;
  loginHref: string;
  propertyId: string;
};

export function PropertySensitiveInfo({
  authenticated,
  loginHref,
  propertyId,
}: PropertySensitiveInfoProps) {
  const [sensitiveInfo, setSensitiveInfo] = useState<SensitiveInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function unlock() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/property/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Could not unlock this listing.");
        return;
      }

      setSensitiveInfo(result as SensitiveInfo);
    } catch {
      setError("Could not unlock this listing. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        Contact &amp; address
      </h2>

      {sensitiveInfo ? (
        <div className="mt-4 space-y-4">
          {sensitiveInfo.street && (
            <p className="text-sm text-slate-700 dark:text-slate-200">
              {sensitiveInfo.street}
            </p>
          )}
          {sensitiveInfo.contacts.length > 0 ? (
            sensitiveInfo.contacts.map((contact, index) => (
              <div
                key={`${contact.name}-${index}`}
                className={index > 0 || sensitiveInfo.street ? "border-t border-slate-100 pt-4 dark:border-slate-800" : undefined}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {contact.name || contact.role || "Property contact"}
                </p>
                {contact.name && contact.role && (
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {contact.role}
                  </p>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone.replace(/[^\d]/g, "")}`}
                    className="mt-3 flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    {contact.phone}
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No contact information is available for this listing.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {authenticated
              ? "Unlock to view the full contact details and street address."
              : "Sign in to view the full contact details and street address."}
          </p>
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {authenticated ? (
            <button
              type="button"
              onClick={unlock}
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {loading ? "Unlocking…" : "Unlock"}
            </button>
          ) : (
            <Link
              href={loginHref}
              className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
