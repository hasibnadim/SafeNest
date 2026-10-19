"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

/** Debounce so typing does not push a router update per keystroke. */
const SEARCH_DEBOUNCE_MS = 250;

/**
 * Search box whose only state is the URL: the page is a server component that
 * re-renders from `searchParams`, so this component just writes `q` and drops
 * `page` — a new term always starts on the first page.
 */
export function CustomerSearch({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";
  const [text, setText] = useState(value);
  const [syncedQuery, setSyncedQuery] = useState(value);

  // Adopt the URL when it changes from outside this component (back/forward
  // navigation). Adjusting during render rather than in an effect keeps the
  // input focused while typing.
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setText(urlQuery);
  }

  // Push the debounced term to the URL. Skipped while the input already agrees
  // with the URL, so adopting an external change does not bounce back.
  useEffect(() => {
    if (text.trim() === urlQuery.trim()) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = text.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      params.delete("page");
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, urlQuery, pathname, router, searchParams, startTransition]);

  return (
    <div className="relative w-full sm:w-80">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <Input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Search by name, email or phone"
        aria-label="Search customers by name, email or phone"
        className="h-9 pl-8 text-sm"
        aria-busy={isPending}
      />
    </div>
  );
}
