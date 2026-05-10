import { z } from "zod";
import { bookingSchema, type BookingFormData } from "@/lib/booking-schema";

export const bookingCompletionKindSchema = z.enum(["stripe_paid", "manual_confirm", "quote_request"]);

export type BookingCompletionKind = z.infer<typeof bookingCompletionKindSchema>;

/** Passed from the wizard when step 2 completes (maps to API `completionKind`). */
export type BookingStep2SuccessMeta = {
  kind: BookingCompletionKind;
  paymentIntentId?: string | null;
};

/** Optional device timezone hint (no country/region/city stored). */
export const bookingClientGeoSchema = z.object({
  timezone: z.string().max(128).optional(),
});

export type BookingClientGeoInput = z.infer<typeof bookingClientGeoSchema>;

/** Nest booking fields so contact-style hints stay separate from trip data. */
export const bookingSubmissionApiSchema = z.object({
  completionKind: bookingCompletionKindSchema,
  paymentIntentId: z.string().min(1).max(200).optional(),
  distanceKm: z.number().min(0).max(9999).optional(),
  locale: z.string().max(24).optional(),
  pagePath: z.string().max(512).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(200).optional(),
  clientGeo: bookingClientGeoSchema.optional(),
  booking: z.record(z.string(), z.unknown()),
});

export type BookingSubmissionApiBody = z.infer<typeof bookingSubmissionApiSchema>;

/** Coerce ISO / timestamp strings into Date for `bookingSchema`. */
export function normalizeBookingPayloadForZod(booking: Record<string, unknown>): Record<string, unknown> {
  const o = { ...booking };
  const raw = o.pickupDate;
  if (typeof raw === "string") {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      o.pickupDate = d;
    }
  }
  return o;
}

function trimGeoField(s: unknown, max: number): string | undefined {
  if (typeof s !== "string") return undefined;
  const t = s.trim().slice(0, max);
  return t.length === 0 ? undefined : t;
}

export function normalizeBookingClientGeo(raw?: BookingClientGeoInput | null) {
  if (!raw || typeof raw !== "object") return undefined;
  const timezone = trimGeoField(raw.timezone, 128);
  if (!timezone) return undefined;
  return { timezone };
}

export function parseBookingSubmissionBody(body: unknown) {
  const outer = bookingSubmissionApiSchema.safeParse(body);
  if (!outer.success) return { ok: false as const, error: "validation_error" };

  const { booking: bookingRaw, clientGeo: clientGeoRaw, ...rest } = outer.data;

  const normalized = normalizeBookingPayloadForZod(bookingRaw as Record<string, unknown>);
  const parsedBooking = bookingSchema.safeParse(normalized);
  if (!parsedBooking.success) return { ok: false as const, error: "booking_validation_error" };

  return {
    ok: true as const,
    data: {
      ...rest,
      clientGeo: normalizeBookingClientGeo(clientGeoRaw),
      booking: parsedBooking.data as BookingFormData,
    },
  };
}
