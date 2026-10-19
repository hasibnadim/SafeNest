"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Save, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  createPropertyAction,
  updatePropertyAction,
  type PropertyActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  propertyTypeLabels,
  propertyTypes,
  bedTypeLabels,
  bedTypes,
  rentPeriodLabels,
  rentPeriods,
  unitHref,
  type ContactDetails,
  type Property,
  type PropertyAddress,
} from "@/services/properties";
import {
  propertySchema,
  unitSchema,
  MAX_UNITS,
  type PropertyFormValues,
} from "@/services/property-schema";

export const idleState: PropertyActionState = { status: "idle", message: "" };

/**
 * Shared create/edit form for a property and its units.
 *
 * The same Zod schema validates here and again inside the server action, so
 * this form is a convenience layer rather than the security boundary. The
 * submission is a real server action call, not a fetch to an API route, which
 * keeps the authorization logic in one place.
 *
 * Every field is a string, matching the schema exactly, so the form needs no
 * type casts to line up with the shared `FormField` component.
 *
 * There is no agent field: the listing agent is whoever is signed in, and the
 * server action fills that in from the session.
 *
 * A property can carry up to `MAX_UNITS` units, so units are managed as a
 * table, not a stack of fieldsets: the list renders one lightweight row per
 * unit (a hundred rows are trivial; a hundred open forms are not), and a
 * single-unit editor panel handles both adding and editing — only ever one
 * unit's inputs mounted at a time. New units copy the last one's settings and
 * receive the next free code, and a failed submit opens the first broken unit
 * so its validation messages are visible.
 */

const emptyAddress: PropertyAddress = {
  street: "",
  area: "",
  city: "",
  region: "",
  postalCode: "",
};

const emptyContact = (): ContactDetails => ({
  name: "",
  role: "",
  phone: "",
});

const emptyUnit = (): PropertyFormValues["units"][number] => ({
  code: "",
  rooms: "1",
  bedType: "1:1",
  bathrooms: "",
  kitchens: "",
  price: "",
  period: "month",
  amenities: "",
  notes: "",
});

/**
 * Suggests the next unit code by advancing the trailing number of the most
 * recent one — "101" becomes "102" — a code with no number at all yields "",
 * asking the user to name the unit themselves.
 */
function nextSequentialCode(issued: string[]): string {
  const filled = issued.map((code) => code.trim()).filter(Boolean);
  const last = filled[filled.length - 1];
  if (!last) return "1";
  const match = last.match(/^(.*?)(\d+)$/);
  if (!match) return "";
  const [, prefix, digits] = match;
  const next = String(Number(digits) + 1).padStart(digits.length, "0");
  return `${prefix}${next}`;
}

/** Scrolls an element into view once it has been painted. */
function scrollTo(selector: string) {
  window.setTimeout(() => {
    document.querySelector(selector)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 60);
}

type UnitFormValues = ReturnType<typeof unitSchema.parse>;

/**
 * Flattens validated values back into the string-keyed shape a server action
 * expects. The repeating groups are keyed by index — `units.0.rooms` — which is
 * the path React Hook Form uses, so `propertyValuesFromFormData` on the server
 * can rebuild the same nesting. Lists become newline-separated text, which the
 * schema re-splits, so the round trip is stable.
 */
function toFormData(values: PropertyFormValues, id?: string): FormData {
  const formData = new FormData();
  if (id) formData.set("id", id);

  formData.set("name", values.name);
  formData.set("type", values.type);
  formData.set("description", values.description);
  formData.set("address.street", values.address.street);
  formData.set("address.area", values.address.area);
  formData.set("address.city", values.address.city);
  formData.set("address.region", values.address.region);
  formData.set("address.postalCode", values.address.postalCode);

  values.contacts.forEach((contact, index) => {
    formData.set(`contacts.${index}.name`, contact.name);
    formData.set(`contacts.${index}.role`, contact.role);
    formData.set(`contacts.${index}.phone`, contact.phone);
  });

  values.units.forEach((unit, index) => {
    formData.set(`units.${index}.code`, unit.code);
    formData.set(`units.${index}.rooms`, unit.rooms);
    formData.set(`units.${index}.bedType`, unit.bedType);
    formData.set(`units.${index}.bathrooms`, unit.bathrooms);
    formData.set(`units.${index}.kitchens`, unit.kitchens);
    formData.set(`units.${index}.price`, unit.price);
    formData.set(`units.${index}.period`, unit.period);
    formData.set(`units.${index}.amenities`, unit.amenities);
    formData.set(`units.${index}.notes`, unit.notes);
  });

  return formData;
}

/**
 * The single-unit editor: one panel that both adds and edits, so the page
 * never mounts more than one unit's inputs. It carries its own small form
 * validated by the very same `unitSchema` the server re-checks, and refuses a
 * code another unit already uses before it ever reaches the main form.
 *
 * It deliberately renders no <form> element — it lives inside the property
 * form, and nested forms are invalid HTML — so the save button triggers
 * validation itself.
 */
function UnitEditor({
  initial,
  index,
  otherCodes,
  onSave,
  onCancel,
}: {
  initial: UnitFormValues;
  /** The row being edited, or null when adding a new unit. */
  index: number | null;
  /** Codes belonging to every unit except the one being edited. */
  otherCodes: string[];
  onSave: (unit: UnitFormValues, index: number | null) => void;
  onCancel: () => void;
}) {
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: initial,
  });

  const submit = (values: UnitFormValues) => {
    const code = values.code.trim().toLowerCase();
    const clash = otherCodes.some(
      (existing) => existing.trim().toLowerCase() === code,
    );
    if (clash) {
      form.setError(
        "code",
        { message: "Each unit needs its own code" },
        { shouldFocus: true },
      );
      return;
    }
    onSave(values, index);
  };

  return (
    <div
      data-unit-editor
      className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 dark:border-blue-900/60 dark:bg-blue-950/20"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {index === null ? "New unit" : `Editing unit ${index + 1}`}
        </p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close unit editor"
          className="rounded-full p-1 text-slate-400 transition-colors outline-none hover:bg-white hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-teal-600 dark:hover:bg-slate-900 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Form {...form}>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="2B" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rent</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="12500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rent period</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue>
                        {rentPeriodLabels[
                          field.value as keyof typeof rentPeriodLabels
                        ] ?? field.value}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rentPeriods.map((value) => (
                      <SelectItem key={value} value={value}>
                        {rentPeriodLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bedType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bed</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue>
                        {bedTypeLabels[field.value] ?? field.value}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bedTypes.map((value) => (
                      <SelectItem key={value} value={value}>
                        {bedTypeLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathroom</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kitchens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kitchen</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="numeric"
                    placeholder="0, 0 Means No Kitchen"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="amenities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amenities</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    className="resize-y"
                    placeholder={"One per line, up to 16"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    className="resize-y"
                    placeholder="Anything specific to this unit."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-3 flex gap-2">
          <Button type="button" onClick={form.handleSubmit(submit)}>
            <Save className="mr-2 h-4 w-4" />
            {index === null ? "Add unit" : "Save unit"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}

export function PropertyForm({
  mode,
  property,
  contactDefaults,
}: {
  mode: "create" | "edit";
  /** Present in edit mode; supplies the initial values. */
  property?: Property;
  /** Pre-fills the first contact block on create, from the signed-in account. */
  contactDefaults?: ContactDetails;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");

  // The single-unit editor: which panel is open (adding, or editing row N).
  const [editor, setEditor] = useState<{
    initial: UnitFormValues;
    index: number | null;
    key: number;
  } | null>(null);
  const [unitFilter, setUnitFilter] = useState("");
  const [bulkCount, setBulkCount] = useState("10");

  const defaults: PropertyFormValues = property
    ? {
        name: property.name,
        type: property.type,
        description: property.description,
        address: property.address,
        contacts:
          property.contacts.length > 0
            ? property.contacts.map((contact) => ({ ...contact }))
            : [emptyContact()],
        units: property.units.map((unit) => ({
          code: unit.code,
          rooms: String(unit.rooms),
          bedType: unit.bedType,
          bathrooms: String(unit.bathrooms),
          kitchens: String(unit.kitchens),
          price: String(unit.price),
          period: unit.period,
          amenities: unit.amenities.join("\n"),
          notes: unit.notes,
        })),
      }
    : {
        name: "",
        type: "house",
        description: "",
        address: { ...emptyAddress },
        contacts: [contactDefaults ? { ...contactDefaults } : emptyContact()],
        units: [],
      };

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: defaults,
  });

  const contacts = useFieldArray({ control: form.control, name: "contacts" });
  const units = useFieldArray({ control: form.control, name: "units" });

  // Subscribing to the errors tree here is what tints the broken rows;
  // validation runs on submit, so this does not re-render while typing. RHF
  // types array errors as a merged object/array hybrid — but when a root-level
  // array constraint fires (e.g. min(1)), errors.units is a plain object with
  // { message, type }, NOT an array.  Always guard with Array.isArray.
  const rawUnitErrors = form.formState.errors.units;
  const unitErrors: (object | undefined)[] | undefined = Array.isArray(
    rawUnitErrors,
  )
    ? (rawUnitErrors as (object | undefined)[])
    : undefined;
  /** Root-level array message, e.g. "At least one unit is required". */
  const unitRootError: string | undefined =
    !Array.isArray(rawUnitErrors) && rawUnitErrors
      ? (rawUnitErrors as { message?: string }).message
      : undefined;
  const errorUnitCount = useMemo(
    () => unitErrors?.filter((e): e is object => Boolean(e)).length ?? 0,
    [unitErrors],
  );

  /** The live unit values, refreshed whenever the field array changes. */
  const unitRows = useMemo(
    () => form.getValues("units"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [units.fields],
  );

  /** Which table rows the filter box lets through, by code or by number. */
  const visibleUnitIndexes = useMemo(() => {
    const all = unitRows.map((_, index) => index);
    const needle = unitFilter.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((index) => {
      const code = (unitRows[index]?.code ?? "").trim().toLowerCase();
      return code.includes(needle) || String(index + 1) === needle;
    });
  }, [unitFilter, unitRows]);

  const openAddEditor = () => {
    // New units start from the last one — a hostel's rooms are mostly alike —
    // with the next free code suggested.
    const current = form.getValues("units");
    const base =
      current.length > 0 ? { ...current[current.length - 1] } : emptyUnit();
    base.code = nextSequentialCode(current.map((unit) => unit.code));
    setEditor((previous) => ({
      initial: base,
      index: null,
      key: (previous?.key ?? 0) + 1,
    }));
    scrollTo("[data-unit-editor]");
  };

  const openEditEditor = (index: number) => {
    const current = form.getValues("units")[index];
    if (!current) return;
    setEditor((previous) => ({
      initial: { ...current },
      index,
      key: (previous?.key ?? 0) + 1,
    }));
    scrollTo("[data-unit-editor]");
  };

  const handleUnitSave = (
    unit: UnitFormValues,
    index: number | null,
  ) => {
    if (index === null) {
      if (units.fields.length >= MAX_UNITS) {
        toast.info(`The limit is ${MAX_UNITS} units per property.`);
        return;
      }
      units.append(unit);
    } else {
      units.update(index, unit);
    }
    setEditor(null);
  };

  const addUnitsBulk = (count: number) => {
    const remaining = MAX_UNITS - units.fields.length;
    if (remaining <= 0) {
      toast.info(`The limit is ${MAX_UNITS} units per property.`);
      return;
    }
    const take = Math.min(Math.max(1, Math.floor(count)), remaining);
    if (take < count) {
      toast.info(`Added up to the ${MAX_UNITS}-unit limit.`);
    }

    const current = form.getValues("units");
    const base =
      current.length > 0 ? { ...current[current.length - 1] } : emptyUnit();
    const issued = current.map((unit) => unit.code);
    const additions = Array.from({ length: take }, () => {
      const code = nextSequentialCode(issued);
      if (code) issued.push(code);
      return { ...base, code };
    });
    units.append(additions);
  };

  const removeUnit = (index: number) => {
    const label = unitRows[index]?.code?.trim() || `unit ${index + 1}`;
    if (!window.confirm(`Remove ${label}?`)) return;
    units.remove(index);
    setEditor(null);
  };

  const onSubmit = (values: PropertyFormValues) => {
    setFormError("");
    startTransition(async () => {
      const formData = toFormData(values, mode === "edit" ? property?.id : undefined);
      const action = mode === "edit" ? updatePropertyAction : createPropertyAction;
      const result: PropertyActionState = await action(idleState, formData);

      if (result.status === "error") {
        setFormError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success(result.message);

      // A property has no page of its own; its units do. Land on the first
      // unit the user just saved.
      const firstCode = values.units[0]?.code;
      const id = result.id ?? property?.id ?? "";
      router.push(firstCode ? unitHref(id, firstCode) : `/account/property/${id}`);
      router.refresh();
    });
  };

  /**
   * Validation failed: say so, then open the first broken unit in the editor
   * so its exact field messages are on screen instead of hidden in a table.
   */
  const onInvalid = () => {
    // Root-level array error (e.g. "At least one unit is required").
    if (unitRootError) {
      setFormError(unitRootError);
      return;
    }
    // Per-index unit errors — open the first broken unit in the editor.
    const firstBad = unitErrors?.findIndex((error) => Boolean(error)) ?? -1;
    if (firstBad >= 0) {
      setFormError("Some units need attention — the broken one is open below.");
      setUnitFilter("");
      openEditEditor(firstBad);
      return;
    }
    setFormError("Please fix the highlighted fields.");
  };

  const publicHref = property
    ? unitHref(property.id, property.units[0]?.code ?? "")
    : "";

  const otherCodesFor = (index: number | null) =>
    unitRows
      .filter((_, i) => i !== index)
      .map((unit) => unit.code);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-3 **:data-[slot=form-item]:gap-1"
      >
        {formError && (
          <p
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
          >
            {formError}
          </p>
        )}

        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-lg">The property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property name</FormLabel>
                  <FormControl>
                    <Input {...field} value={String(field.value ?? "")} placeholder="e.g. Willowbrook House" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

              <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {propertyTypeLabels[
                            field.value as keyof typeof propertyTypeLabels
                          ] ?? field.value}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {propertyTypes.map((value) => (
                        <SelectItem key={value} value={value}>
                          {propertyTypeLabels[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={String(field.value ?? "")}
                      onChange={(event) => field.onChange(event.target.value)}
                      rows={3}
                      className="resize-y"
                      placeholder="What is this property like? Where is it, who lives there, what is nearby?"
                    />
                  </FormControl>
                  <FormDescription>
                    Shared by every unit in this property.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={String(field.value ?? "")}
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder="House 42, Road 11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="address.area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={String(field.value ?? "")}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder="Gulshan 1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={String(field.value ?? "")}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder="Dhaka"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / division</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={String(field.value ?? "")}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder="Dhaka Division"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={String(field.value ?? "")}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder="1212"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-lg">Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4">
            {contacts.fields.map((field, index) => (
              <div key={field.id} className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Contact {index + 1}
                  </p>
                  {contacts.fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => contacts.remove(index)}
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={String(field.value ?? "")}
                            onChange={(event) => field.onChange(event.target.value)}
                            placeholder="Rumana Haque"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role (optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={String(field.value ?? "")}
                            onChange={(event) => field.onChange(event.target.value)}
                            placeholder="Owner, caretaker, warden…"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.phone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={String(field.value ?? "")}
                            onChange={(event) => field.onChange(event.target.value)}
                            type="tel"
                            placeholder="+880 1711 000142"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => contacts.append(emptyContact())}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add a contact
            </Button>
          </CardContent>
        </Card>

        <Card className="gap-3 py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4">
            <CardTitle className="text-lg">Units</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {units.fields.length}
              </span>
              /{MAX_UNITS} units
              {errorUnitCount > 0 && (
                <span className="ml-2 font-medium text-red-600 dark:text-red-400">
                  {errorUnitCount} need{errorUnitCount === 1 ? "s" : ""} fixes
                </span>
              )}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 px-4">
            {/* Toolbar: filter the table, open the editor, or append many */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-40 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <Input
                  value={unitFilter}
                  onChange={(event) => setUnitFilter(event.target.value)}
                  placeholder="Filter units by code…"
                  aria-label="Filter units by code"
                  className="h-8 pl-8 pr-8 text-sm"
                />
                {unitFilter && (
                  <button
                    type="button"
                    onClick={() => setUnitFilter("")}
                    aria-label="Clear unit filter"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={openAddEditor}
                disabled={units.fields.length >= MAX_UNITS}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add unit
              </Button>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={1}
                  max={MAX_UNITS}
                  value={bulkCount}
                  onChange={(event) => setBulkCount(event.target.value)}
                  aria-label="How many units to add"
                  className="h-8 w-16 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addUnitsBulk(Number(bulkCount) || 1)}
                  disabled={units.fields.length >= MAX_UNITS}
                >
                  Add units
                </Button>
              </div>
            </div>

            {editor && (
              <UnitEditor
                key={editor.key}
                initial={editor.initial}
                index={editor.index}
                otherCodes={otherCodesFor(editor.index)}
                onSave={handleUnitSave}
                onCancel={() => setEditor(null)}
              />
            )}

            {units.fields.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No units yet. Use{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Add unit
                </span>{" "}
                for one, or add many at once above.
              </p>
            )}

            {units.fields.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium">Code</th>
                      <th className="px-3 py-2 font-medium">Rent</th>
                      <th className="px-3 py-2 text-right font-medium">Rooms</th>
                      <th className="px-3 py-2 font-medium">Bed</th>
                      <th className="px-3 py-2 text-right font-medium">Bath</th>
                      <th className="px-3 py-2 text-right font-medium">Kitchen</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUnitIndexes.map((index) => {
                      const unit = unitRows[index];
                      const hasErrors = Boolean(unitErrors?.[index]);
                      if (!unit) return null;

                      return (
                        <tr
                          key={index}
                          data-unit-index={index}
                          className={`border-b border-slate-100 last:border-b-0 dark:border-slate-800 ${
                            hasErrors
                              ? "bg-red-50/60 dark:bg-red-950/20"
                              : "hover:bg-slate-50 dark:hover:bg-slate-900/60"
                          }`}
                        >
                          <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {unit.code.trim() || "—"}
                            </span>
                            {hasErrors && (
                              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                                Needs fixes
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                            ৳{unit.price.trim() || "?"}/{unit.period}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                            {unit.rooms.trim() || "—"}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                            {bedTypeLabels[unit.bedType] ?? unit.bedType}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                            {unit.bathrooms.trim() || "—"}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                            {Number(unit.kitchens || 0) > 0
                              ? unit.kitchens
                              : "—"}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label={`Edit unit ${index + 1}`}
                                onClick={() => openEditEditor(index)}
                                className="h-7 px-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                              >
                                <Pencil className="mr-1 h-3 w-3" />
                                Edit
                              </Button>
                              {units.fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  aria-label={`Remove unit ${index + 1}`}
                                  onClick={() => removeUnit(index)}
                                  className="h-7 px-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {visibleUnitIndexes.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                          No unit matches “{unitFilter}”.{" "}
                          <button
                            type="button"
                            onClick={() => setUnitFilter("")}
                            className="font-medium text-blue-600 underline underline-offset-4 dark:text-blue-400"
                          >
                            Show all
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {units.fields.length > 1 && unitFilter && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {visibleUnitIndexes.length} of {units.fields.length} units shown
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {isPending
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Create property"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/account/property">Cancel</Link>
          </Button>
          {mode === "edit" && property && (
            <Button type="button" variant="ghost" asChild className="sm:ml-auto">
              <Link href={publicHref}>View public page</Link>
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
