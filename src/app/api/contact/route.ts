import { NextResponse } from "next/server";
import { contactSubmissionSchema } from "@/lib/contact-schema";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  const data = parsed.data;
  const webhook = process.env.CONTACT_FORM_WEBHOOK_URL?.trim();

  if (webhook) {
    try {
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source: "bookarlandataxi-contact",
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!r.ok) {
        console.error("[contact] webhook HTTP", r.status);
        return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
      }
    } catch (e) {
      console.error("[contact] webhook fetch", e);
      return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
    }
  } else {
    console.info("[contact]", JSON.stringify(data));
  }

  return NextResponse.json({ ok: true });
}
