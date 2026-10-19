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
  unitCode?: string;
};

export function PropertySensitiveInfo({
  authenticated,
  loginHref,
  propertyId,
  unitCode,
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
        body: JSON.stringify({ propertyId, unitCode, unit: unitCode }),
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        Contact &amp; address
      </h2>

      {sensitiveInfo ? (
        <div className="mt-3 space-y-3">
          {sensitiveInfo.street && (
            <p className="text-sm text-slate-700 dark:text-slate-200">
              {sensitiveInfo.street}
            </p>
          )}
          {sensitiveInfo.contacts.length > 0 ? (
            sensitiveInfo.contacts.map((contact, index) => (
              <div
                key={`${contact.name}-${index}`}
                className={
                  index > 0 || sensitiveInfo.street
                    ? "border-t border-slate-100 pt-3 dark:border-slate-800"
                    : undefined
                }
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
                    className="mt-2 flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
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
        <div className="mt-3 space-y-2.5">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {authenticated
              ? "Unlock to view the full contact details and street address."
              : "Sign in to view the full contact details and street address."}
          </p>
          {error && (
            <p role="alert" className="text-sm text-blue-600 dark:text-blue-400">
              {error}
            </p>
          )}
          {authenticated ? (
            <button
              type="button"
              onClick={unlock}
              disabled={loading}
              className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Unlocking…" : "Unlock"}
            </button>
          ) : (
            <Link
              href={loginHref}
              className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
