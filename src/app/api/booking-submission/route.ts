import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SERVICES } from "@/lib/constants";
import { buildSubmissionContext } from "@/lib/form-submissions/context";
import { recordFormSubmission } from "@/lib/form-submissions/record";
import { FORM_TYPES } from "@/lib/form-submissions/types";
import { parseBookingSubmissionBody } from "@/lib/booking-submission-schema";

export const runtime = "nodejs";

function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { typescript: true });
}

async function verifyStripePaid(args: {
  paymentIntentId: string;
  serviceType: string;
}): Promise<boolean> {
  const stripe = stripeClient();
  if (!stripe) return false;
  try {
    const pi = await stripe.paymentIntents.retrieve(args.paymentIntentId);
    if (pi.status !== "succeeded") return false;
    const svc = SERVICES.find((s) => s.id === args.serviceType);
    const expectedMinor = svc?.price != null ? Math.round(svc.price * 100) : null;
    if (expectedMinor != null && pi.amount !== expectedMinor) return false;
    const metaSid = pi.metadata?.service_id;
    if (metaSid && metaSid !== args.serviceType) return false;
    return true;
  } catch {
    return false;
  }
}

function serializeBooking(booking: {
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  pickupDate: Date;
  pickupTime: string;
  passengers: string;
  pickupLocation: string;
  dropoffLocation?: string;
  flightNumber?: string;
  message?: string;
}) {
  return {
    fullName: booking.fullName.trim(),
    email: booking.email.trim(),
    phone: booking.phone.trim(),
    serviceType: booking.serviceType,
    pickupDate: booking.pickupDate.toISOString(),
    pickupTime: booking.pickupTime,
    passengers: booking.passengers,
    pickupLocation: booking.pickupLocation,
    dropoffLocation: booking.dropoffLocation ?? null,
    flightNumber: booking.flightNumber ?? null,
    message: booking.message ?? null,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = parseBookingSubmissionBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const {
    completionKind,
    paymentIntentId,
    distanceKm,
    locale,
    pagePath,
    utmSource,
    utmMedium,
    utmCampaign,
    clientGeo,
    booking,
  } = parsed.data;

  const service = SERVICES.find((s) => s.id === booking.serviceType);

  if (completionKind === "stripe_paid") {
    if (!service || service.price == null) {
      return NextResponse.json({ error: "invalid_service_for_payment" }, { status: 400 });
    }
  }

  if (completionKind === "quote_request" && booking.serviceType !== "custom-route") {
    return NextResponse.json({ error: "invalid_completion_for_service" }, { status: 400 });
  }

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.trim());

  if (completionKind === "stripe_paid") {
    if (stripeConfigured) {
      if (!paymentIntentId?.trim()) {
        return NextResponse.json({ error: "payment_intent_required" }, { status: 400 });
      }
      const okPi = await verifyStripePaid({
        paymentIntentId: paymentIntentId.trim(),
        serviceType: booking.serviceType,
      });
      if (!okPi) {
        return NextResponse.json({ error: "payment_verification_failed" }, { status: 400 });
      }
    }
  }

  const context = buildSubmissionContext(request, {
    locale,
    pagePath,
    utmSource,
    utmMedium,
    utmCampaign,
    ...(clientGeo?.timezone ? { timezone: clientGeo.timezone } : {}),
  });

  const fields = {
    completion_kind: completionKind,
    payment_intent_id: paymentIntentId?.trim() ?? null,
    distance_km: distanceKm ?? null,
    package_label: service?.priceLabel ?? null,
    booking: serializeBooking(booking),
  };

  await recordFormSubmission({
    formType: FORM_TYPES.BOOKING,
    fields,
    context,
  });

  return NextResponse.json({ ok: true });
}
