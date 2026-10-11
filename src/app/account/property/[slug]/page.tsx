import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getAuthUser } from "@/services/auth/session";
import { getPropertyForUser, PropertyError } from "@/services/property-db";
import { PropertyForm } from "../PropertyForm";

/**
 * Edit form.
 *
 * The permission check lives in `getPropertyForUser`, so requesting another
 * user's listing slug returns 404 rather than revealing that it exists. The
 * update action re-checks before writing.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit property | Safe Nest",
  description: "Update a property and its units on Safe Nest.",
};

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getAuthUser(await cookies());
  if (!user) redirect("/auth/login");

  let property;
  try {
    property = await getPropertyForUser(user, slug);
  } catch (error) {
    if (error instanceof PropertyError && error.code === "forbidden") {
      // Do not confirm the property exists to someone who may not manage it.
      notFound();
    }
    throw error;
  }
  if (!property) notFound();

  return (
    <div className="mx-auto max-w-3xl px-1 py-6 md:px-4">
      <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
        Edit {property.name}
      </h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Add or remove units freely. The property&rsquo;s address in the URL stays
        the same after saving.
      </p>
      <PropertyForm mode="edit" property={property} />
    </div>
  );
}
