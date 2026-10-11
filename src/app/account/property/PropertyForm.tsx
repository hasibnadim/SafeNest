"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
export const idleState: PropertyActionState = { status: "idle", message: "" };

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
import { propertySchema, type PropertyFormValues } from "@/services/property-schema";

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
        units: [emptyUnit()],
      };

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: defaults,
  });

  const contacts = useFieldArray({ control: form.control, name: "contacts" });
  const units = useFieldArray({ control: form.control, name: "units" });

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

  const publicHref = property
    ? unitHref(property.id, property.units[0]?.code ?? "")
    : "";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
                  <FormLabel>Description</FormLabel>
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
          <CardHeader className="px-4">
            <CardTitle className="text-lg">Units</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4">
              {units.fields.map((field, index) => (
              <div key={field.id} className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Unit {index + 1}
                  </p>
                  {units.fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => units.remove(index)}
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name={`units.${index}.code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={String(field.value ?? "")}
                            onChange={(event) => field.onChange(event.target.value)}
                            placeholder="2B"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`units.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rent</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={String(field.value ?? "")}
                            onChange={(event) => field.onChange(event.target.value)}
                            inputMode="numeric"
                            placeholder="12500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`units.${index}.period`}
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
                    name={`units.${index}.rooms`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={String(field.value ?? "")}
                            onChange={(event) => field.onChange(event.target.value)}
                            inputMode="numeric"
                            placeholder="1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`units.${index}.bedType`}
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
                    name={`units.${index}.bathrooms`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathroom</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={String(field.value ?? "")}
                            onChange={(event) => field.onChange(event.target.value)}
                            inputMode="numeric"
                            placeholder="1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`units.${index}.kitchens`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kitchen</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={String(field.value ?? "")}
                            onChange={(event) => field.onChange(event.target.value)}
                            inputMode="numeric"
                            placeholder="1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`units.${index}.amenities`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amenities</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={String(field.value ?? "")}
                            onChange={(event) => field.onChange(event.target.value)}
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
                    name={`units.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={String(field.value ?? "")}
                            onChange={(event) => field.onChange(event.target.value)}
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
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => units.append(emptyUnit())}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add a unit
            </Button>
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
