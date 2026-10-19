"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { getAuthUser } from "@/services/auth/session";
import {
  propertySchema,
  propertyValuesFromFormData,
  toPropertyInput,
} from "@/services/property-schema";
import {
  createProperty,
  deleteProperty,
  PropertyError,
  setPropertyVerified,
  updateProperty,
} from "@/services/property-db";

/**
 * Server actions for property CRUD.
 *
 * Each action re-resolves the session from cookies and re-checks permissions
 * on the server. The `can*` helpers are also used in the UI, but that is only
 * to hide controls the user cannot use — it is never the enforcement point.
 *
 * Failures come back as state rather than exceptions so the form can show a
 * message next to the submit button instead of tearing down the page.
 */

export interface PropertyActionState {
  status: "idle" | "success" | "error";
  message: string;
  /** Set on success so the caller can navigate to the saved listing. */
  id?: string;
}


/** Turns a zod failure into a single human-readable sentence. */
function firstIssueMessage(error: {
  issues: { message: string }[];
}): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

/**
 * Shared front door: resolve the user, run the action, and convert any thrown
 * `PropertyError` into form state. Keeps the authorization failure messages
 * consistent and, importantly, keeps the raw exceptions from reaching the
 * client.
 */
async function withAuth<T>(
  run: (
    user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>,
  ) => Promise<T>,
): Promise<T | PropertyActionState> {
  try {
    const user = await getAuthUser(await cookies());
    if (!user) {
      throw new PropertyError("You need to be signed in to do that.", "unauthenticated");
    }
    return await run(user);
  } catch (error) {
    if (error instanceof PropertyError) {
      return { status: "error", message: error.message };
    }
    if (
      error &&
      typeof error === "object" &&
      "issues" in error &&
      Array.isArray((error as { issues: unknown[] }).issues)
    ) {
      return {
        status: "error",
        message: firstIssueMessage(error as { issues: { message: string }[] }),
      };
    }
    // Unexpected failures are logged server-side but reported generically so
    // internals are not leaked to the browser.
    console.error("Property action failed:", error);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Revalidates the pages a saved property can appear on. The public detail route
 * is per unit, so the whole `/property` tree is refreshed rather than guessing
 * which unit codes are affected.
 */
function revalidatePropertyViews(id?: string) {
  // Home page — must be listed so a new property appears without a rebuild.
  revalidatePath("/");
  revalidatePath("/property");
  revalidatePath("/account/property");
  revalidatePath("/account/dashboard");
  if (id) revalidatePath(`/account/property/${id}`);
  revalidatePath("/property/[id]/[unitCode]", "page");
}

function isErrorState(value: unknown): value is PropertyActionState {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    (value as PropertyActionState).status !== "idle"
  );
}

/** Creates a property owned by the signed-in user. */
export async function createPropertyAction(
  _prev: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  const result = await withAuth(async (user) => {
    const values = propertySchema.parse(propertyValuesFromFormData(formData));
    const property = await createProperty(user, toPropertyInput(values));
    revalidatePropertyViews(property.id);
    return {
      status: "success" as const,
      message: `Property created with ${property.units.length} unit${property.units.length === 1 ? "" : "s"}.`,
      id: property.id,
    };
  });
  return isErrorState(result) ? result : result;
}

/** Updates a property the user is allowed to manage. */
export async function updatePropertyAction(
  _prev: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { status: "error", message: "That property could not be found." };
  }

  const result = await withAuth(async (user) => {
    // `propertyValuesFromFormData` drops the routing `id`, so the schema only
    // sees property fields.
    const values = propertySchema.parse(propertyValuesFromFormData(formData));
    await updateProperty(user, id, toPropertyInput(values));
    revalidatePropertyViews(id);
    return { status: "success" as const, message: "Changes saved.", id };
  });
  return isErrorState(result) ? result : result;
}

/** Removes a property the user is allowed to manage. */
export async function deletePropertyAction(
  id: string,
  formData?: FormData,
): Promise<PropertyActionState> {
  void formData;
  if (!id) {
    return { status: "error", message: "That property could not be found." };
  }
  const result = await withAuth(async (user) => {
    await deleteProperty(user, id);
    revalidatePropertyViews(id);
    return { status: "success" as const, message: "Property deleted." };
  });
  return isErrorState(result) ? result : result;
}

/** Sets or clears a property's verified flag. Administrators only. */
export async function setPropertyVerifiedAction(
  id: string,
  verified: boolean,
): Promise<PropertyActionState> {
  const result = await withAuth(async (user) => {
    await setPropertyVerified(user, id, verified);
    revalidatePropertyViews(id);
    return {
      status: "success" as const,
      message: verified ? "Property verified." : "Verification removed.",
    };
  });
  return isErrorState(result) ? result : result;
}
