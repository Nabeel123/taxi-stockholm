import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SERVICES } from "@/lib/constants";

export const runtime = "nodejs";

function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { typescript: true });
}

/**
 * POST { serviceId: string }
 * Amount is derived only from SERVER-side SERVICES — never trust a client-sent price.
 *
 * Requires env: STRIPE_SECRET_KEY (+ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY on the client).
 * Apple Pay domain verification is done in the Stripe Dashboard.
 */
export async function POST(req: Request) {
  const stripe = stripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const serviceId =
    typeof body === "object" && body !== null && "serviceId" in body
      ? String((body as { serviceId: unknown }).serviceId)
      : "";

  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service || service.price === null) {
    return NextResponse.json({ error: "invalid_service" }, { status: 400 });
  }

  const amount = Math.round(service.price * 100);

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: "sek",
    automatic_payment_methods: { enabled: true },
    metadata: { service_id: service.id },
  });

  if (!intent.client_secret) {
    return NextResponse.json({ error: "intent_failed" }, { status: 500 });
  }

  return NextResponse.json({
    clientSecret: intent.client_secret,
    amount,
    currency: "sek",
  });
}
