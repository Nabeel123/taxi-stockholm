import { NextResponse } from "next/server";
import { contactApiBodySchema } from "@/lib/contact-schema";

async function verifyRecaptchaToken(token: string, secretKey: string): Promise<boolean> {
  const params = new URLSearchParams();
  params.set("secret", secretKey);
  params.set("response", token);

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactApiBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  const captchaSecret = process.env.GOOGLE_CAPTCHA_SECRET_KEY?.trim();
  if (captchaSecret) {
    const token = parsed.data.recaptchaToken?.trim() ?? "";
    if (!token) {
      return NextResponse.json({ error: "captcha_required" }, { status: 400 });
    }
    const ok = await verifyRecaptchaToken(token, captchaSecret);
    if (!ok) {
      return NextResponse.json({ error: "captcha_invalid" }, { status: 400 });
    }
  }

  const { recaptchaToken: _token, ...data } = parsed.data;

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
