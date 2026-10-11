import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthUser } from "@/services/auth/session";
import { PropertyForm } from "../PropertyForm";

/**
 * Create form. Pre-fills the first contact from the signed-in account so the
 * common case is one field away from done — the listing agent itself is always
 * the signed-in account, which the server action fills in.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "New property | Safe Nest",
  description: "Publish a new property and its units on Safe Nest.",
};

export default async function NewPropertyPage() {
  const user = await getAuthUser(await cookies());
  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 md:px-5">
      <h1 className="mb-1 text-xl text-slate-900 dark:text-slate-100">
        New property
      </h1>
      <PropertyForm
        mode="create"
        contactDefaults={{
          name: [user.firstName, user.lastName].filter(Boolean).join(" "),
          role: "Owner",
          phone: user.phone ?? "",
        }}
      />
    </div>
  );
}
