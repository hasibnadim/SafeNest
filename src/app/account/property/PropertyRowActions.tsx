"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ExternalLink, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deletePropertyAction, setPropertyVerifiedAction } from "./actions";
import { Button } from "@/components/ui/button";
import { unitHref } from "@/services/properties";

/**
 * Per-property controls in the dashboard.
 *
 * Which buttons render is decided by the server component from the same
 * permission helpers the server actions use, so the UI cannot offer an action
 * the user is not allowed to perform. Hiding a button is a courtesy; the
 * action itself re-checks.
 */
export function PropertyRowActions({
  id,
  firstUnitCode,
  verified,
  canManage,
  canVerify,
  canDelete,
}: {
  id: string;
  /** Where "View" goes: a property's public page is one of its units. */
  firstUnitCode?: string;
  verified: boolean;
  canManage: boolean;
  canVerify: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (label: string, work: () => Promise<{ status: string; message: string }>) => {
    startTransition(async () => {
      const result = await work();
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
      void label;
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {canVerify && (
        <Button
          type="button"
          size="sm"
          variant={verified ? "outline" : "default"}
          disabled={isPending}
          title={
            verified
              ? "Remove verification from this listing"
              : "Mark this listing as verified"
          }
          onClick={() =>
            run("verify", () => setPropertyVerifiedAction(id, !verified))
          }
          className={verified ? "" : "bg-emerald-600 text-white hover:bg-emerald-700"}
        >
          {verified ? (
            <>
              <BadgeCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
              Verified
            </>
          ) : (
            <>
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Verify
            </>
          )}
        </Button>
      )}

      {canManage && (
        <Button type="button" size="sm" variant="outline" disabled={isPending} asChild>
          <a href={`/account/property/${id}`}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </a>
        </Button>
      )}

      <Button type="button" size="sm" variant="outline" disabled={isPending} asChild>
        <a
          href={firstUnitCode ? unitHref(id, firstUnitCode) : `/account/property/${id}`}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          View
        </a>
      </Button>

      {canDelete && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isPending}
          title="Delete this listing"
          onClick={() => {
            // Deletion is irreversible, so it is confirmed before the action is
            // dispatched. The server does not trust this prompt either way.
            const confirmed = window.confirm(
              "Delete this property and all of its units permanently? This cannot be undone.",
            );
            if (confirmed) {
              run("delete", () => deletePropertyAction(id));
            }
          }}
          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">Delete</span>
        </Button>
      )}
    </div>
  );
}
