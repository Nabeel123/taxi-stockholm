import { NextResponse } from "next/server";
import { contactApiBodySchema, type ContactSubmission } from "@/lib/contact-schema";
import { COMPANY } from "@/lib/site";

const CONTACT_INBOX = COMPANY.emails.bookings;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildContactEmail(data: ContactSubmission): { subject: string; html: string; text: string } {
  const phone = data.phone?.trim() ? data.phone.trim() : "—";
  const subject = `[Contact] ${data.name.trim()}`;
  const text = [
    "New message from the website contact form.",
    "",
    `Name: ${data.name.trim()}`,
    `Email: ${data.email.trim()}`,
    `Phone: ${phone}`,
    "",
    data.message.trim(),
  ].join("\n");

  const html = `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
<p><strong>Website contact form</strong></p>
<table style="border-collapse:collapse;margin:0 0 1rem">
<tr><td style="padding:0.25rem 1rem 0.25rem 0;color:#555">Name</td><td>${escapeHtml(data.name.trim())}</td></tr>
<tr><td style="padding:0.25rem 1rem 0.25rem 0;color:#555">Email</td><td><a href="mailto:${escapeHtml(data.email.trim())}">${escapeHtml(data.email.trim())}</a></td></tr>
<tr><td style="padding:0.25rem 1rem 0.25rem 0;color:#555">Phone</td><td>${escapeHtml(phone)}</td></tr>
</table>
<p style="white-space:pre-wrap;margin:0">${escapeHtml(data.message.trim())}</p>
</body></html>`.trim();

  return { subject, html, text };
}

async function sendContactViaResend(
  data: ContactSubmission,
  apiKey: string,
  from: string,
): Promise<boolean> {
  const { subject, html, text } = buildContactEmail(data);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [CONTACT_INBOX],
        reply_to: data.email.trim(),
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[contact] Resend HTTP", res.status, errBody);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[contact] Resend fetch", e);
    return false;
  }
}

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
    const payload = (await res.json()) as { success?: boolean };
    return payload.success === true;
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

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.RESEND_CONTACT_FROM?.trim();
  const webhook = process.env.CONTACT_FORM_WEBHOOK_URL?.trim();

  let delivered = false;

  if (resendKey && resendFrom) {
    const ok = await sendContactViaResend(data, resendKey, resendFrom);
    if (!ok) {
      return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
    }
    delivered = true;
  }

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
        if (!delivered) {
          return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
        }
      }
    } catch (e) {
      console.error("[contact] webhook fetch", e);
      if (!delivered) {
        return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
      }
    }
    delivered = true;
  }

  if (!delivered) {
    console.info(`[contact] (no Resend/webhook) → would email ${CONTACT_INBOX}`, JSON.stringify(data));
  }

  return NextResponse.json({ ok: true });
}
