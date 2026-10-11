import { z } from "zod";

import {
  propertyTypes,
  rentPeriods,
  type BedType,
  type PropertyInput,
} from "./properties";

/**
 * Validation for properties and their units, shared by the dashboard form and
 * the server actions that persist them.
 *
 * The server action re-parses with this schema and never trusts the client, so
 * these rules are the actual boundary, not just a client-side convenience.
 *
 * Every field describes exactly what a form input holds — a string — and all
 * normalisation happens in `toPropertyInput`. That keeps the schema's input and
 * output types identical, which in turn keeps the form free of casts: the
 * project's shadcn `FormField` does not forward react-hook-form's third
 * (transformed values) generic, so a `.transform()` in here would make the
 * control type impossible to satisfy.
 */

/** A plain number in a text input, bounded and optionally integral. */
function numberField(
  label: string,
  options: { min: number; max: number; integer?: boolean },
) {
  return z
    .string()
    .trim()
    .regex(
      options.integer ? /^\d+$/ : /^\d+(\.\d+)?$/,
      `${label} must be a number`,
    )
    .refine((value) => {
      const parsed = Number(value);
      return parsed >= options.min && parsed <= options.max;
    }, `${label} must be between ${options.min} and ${options.max}`);
}

/**
 * A newline-separated list. The text is bounded here; the line count and
 * trimming happen in `toPropertyInput`.
 */
function listField(label: string, maxLength: number) {
  return z.string().max(maxLength, `${label} is too long`);
}

const AMENITY_LIMIT = 16;

/** Splits a newline-separated textarea into a trimmed, capped list. */
function toList(value: string, limit: number): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

const contactSchema = z.object({
  name: z.string().trim().max(120, "Name is too long"),
  role: z.string().trim().max(120, "Role is too long"),
  phone: z.string().trim().min(1, "Phone is required").max(40, "Phone is too long"),
});

const unitSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Unit code is required")
    .max(20, "Unit code is too long"),
  rooms: numberField("Rooms", { min: 1, max: 99, integer: true }),
  bedType: z.enum(["1:1", "1:2", "1:3", "mixed"] satisfies [BedType, ...BedType[]]),
  bathrooms: numberField("Bathrooms", { min: 0, max: 99, integer: true }),
  kitchens: numberField("Kitchens", { min: 0, max: 99, integer: true }),
  price: numberField("Price", { min: 0, max: 1_000_000_000, integer: true }),
  period: z.enum(rentPeriods, { message: "Choose a rent period" }),
  amenities: listField("Amenities", 2000),
  notes: z.string().trim().max(1000, "Notes is too long"),
});

export const propertySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(120, "Name must be at most 120 characters"),
    type: z.enum(propertyTypes, { message: "Choose a property type" }),
    description: z
      .string()
      .trim()
      .max(4000, "Description is too long")
      .refine((value) => value !== "", "Describe the property"),
    address: z.object({
      street: z.string().trim().min(1, "Street is required").max(160),
      area: z.string().trim().min(1, "Area is required").max(80),
      city: z.string().trim().min(1, "City is required").max(80),
      region: z.string().trim().min(1, "Region is required").max(80),
      postalCode: z.string().trim().max(20, "Postcode is too long"),
    }),
    contacts: z
      .array(contactSchema)
      .min(1, "At least one contact is required")
      .max(5, "Five contacts is the maximum"),
    units: z
      .array(unitSchema)
      .min(1, "At least one unit is required")
      .max(50, "Fifty units is the maximum"),
  })
  // Unit codes identify a unit inside its property, so two units cannot share
  // one: the public URL and the unit lookup both key off the code.
  .superRefine((values, ctx) => {
    const seen = new Set<string>();
    values.units.forEach((unit, index) => {
      const key = unit.code.toLowerCase();
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["units", index, "code"],
          message: "Each unit needs its own code",
        });
      }
      seen.add(key);
    });
  });

/** What the form holds and what the schema accepts: all strings. */
export type PropertyFormValues = z.infer<typeof propertySchema>;

/**
 * Maps validated form values onto the persisted shape. This is the single
 * place where the string form becomes the stored numbers and lists, and both
 * the client and the server action go through it.
 *
 * There is no `agentUid` here: the listing agent is whichever account is
 * signed in, and the server action fills that in from the session.
 */
export function toPropertyInput(values: PropertyFormValues): PropertyInput {
  return {
    name: values.name.trim(),
    type: values.type,
    status: "for-rent",
    description: values.description.trim(),
    address: {
      street: values.address.street.trim(),
      area: values.address.area.trim(),
      city: values.address.city.trim(),
      region: values.address.region.trim(),
      postalCode: values.address.postalCode.trim(),
    },
    contacts: values.contacts.map((contact) => ({
      name: contact.name.trim(),
      role: contact.role.trim(),
      phone: contact.phone.trim(),
    })),
    units: values.units.map((unit) => ({
      code: unit.code.trim(),
      rooms: Number(unit.rooms),
      bedType: unit.bedType,
      bathrooms: Number(unit.bathrooms),
      kitchens: Number(unit.kitchens),
      price: Number(unit.price),
      period: unit.period,
      amenities: toList(unit.amenities, AMENITY_LIMIT),
      notes: unit.notes.trim(),
    })),
  };
}

/**
 * Rebuilds the flat `FormData` a server action receives into the nested object
 * the schema expects.
 *
 * A form input is named `address.street` — or `units.2.rooms`, for the repeating
 * unit rows — because React Hook Form addresses its fields by path, but
 * `Object.fromEntries(formData)` yields a flat record with those literal dotted
 * keys. Passing that straight to `propertySchema` would fail with "address is
 * required" for every submission, so the groups are reassembled here.
 *
 * Every expected key is present but possibly blank, so a missing field reports
 * the schema's own message ("Street is required") instead of Zod's less helpful
 * complaint about an unexpected `undefined`. Only known field paths are read, so
 * a hand-crafted action payload cannot introduce extra keys.
 */
export function propertyValuesFromFormData(formData: FormData): unknown {
  const ADDRESS_KEYS = ["street", "area", "city", "region", "postalCode"];
  const CONTACT_KEYS = ["name", "role", "phone"];
  const UNIT_KEYS = [
    "code",
    "rooms",
    "bedType",
    "bathrooms",
    "kitchens",
    "price",
    "period",
    "amenities",
    "notes",
  ];

  const blank = (keys: string[]) =>
    Object.fromEntries(keys.map((key) => [key, ""])) as Record<string, string>;

  const indexed = new Set(["contacts", "units"]);
  const grouped: Record<string, Record<string, Record<string, string>>> = {
    address: {},
    contacts: {},
    units: {},
  };
  const flat: Record<string, string> = {};

  const bucket = (group: "contacts" | "units", index: string) => {
    grouped[group][index] ??= blank(group === "units" ? UNIT_KEYS : CONTACT_KEYS);
    return grouped[group][index];
  };

  for (const key of new Set(formData.keys())) {
    // `id` routes the edit request; it is not a listing field.
    if (key === "id") continue;
    const value = String(formData.get(key) ?? "");
    const parts = key.split(".");

    if (parts.length === 2 && parts[0] in grouped && !indexed.has(parts[0])) {
      grouped[parts[0]]["0"] ??= blank(ADDRESS_KEYS);
      grouped[parts[0]]["0"][parts[1]] = value;
      continue;
    }

    if (parts.length === 3 && indexed.has(parts[0])) {
      bucket(parts[0] as "contacts" | "units", parts[1])[parts[2]] = value;
      continue;
    }

    flat[key] = value;
  }

  const toArray = (group: "contacts" | "units") =>
    Object.entries(grouped[group])
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, entry]) => entry);

  return {
    ...flat,
    address: grouped.address["0"] ?? blank(ADDRESS_KEYS),
    contacts: toArray("contacts"),
    units: toArray("units"),
  };
}
