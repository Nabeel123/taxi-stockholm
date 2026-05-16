import type { BookingFormData } from "@/lib/booking-schema";
import type { BookingCompletionKind } from "@/lib/booking-submission-schema";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function completionKindLabel(kind: BookingCompletionKind): string {
  switch (kind) {
    case "stripe_paid":
      return "Paid online (Stripe)";
    case "manual_confirm":
      return "Confirmed (manual)";
    case "quote_request":
      return "Quote request";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function cellLabel(html: string): string {
  return `<td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:38%;vertical-align:top;font-weight:500">${html}</td>`;
}

function cellValue(html: string): string {
  return `<td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;vertical-align:top;line-height:1.45">${html}</td>`;
}

function sectionTitle(title: string): string {
  return `<tr>
  <td colspan="2" style="padding:24px 16px 10px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#0f766e;border-bottom:2px solid #ccfbf1">${escapeHtml(title)}</td>
</tr>`;
}

function row(label: string, valueHtml: string): string {
  return `<tr>${cellLabel(escapeHtml(label))}${cellValue(valueHtml)}</tr>`;
}

export type BookingNotificationInput = {
  booking: BookingFormData;
  completionKind: BookingCompletionKind;
  paymentIntentId?: string | null;
  distanceKm?: number | null;
  packageLabel: string | null;
  serviceLabel: string;
  locale?: string | null;
  pagePath?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  timezone?: string | null;
};

export function buildBookingNotificationEmail(input: BookingNotificationInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { booking, completionKind, paymentIntentId, distanceKm, packageLabel, serviceLabel } = input;

  const b = booking;
  const name = b.fullName.trim();
  const email = b.email.trim();
  const phone = b.phone.trim();
  const pickupDateStr = b.pickupDate.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const drop =
    b.dropoffLocation && b.dropoffLocation.trim().length > 0
      ? escapeHtml(b.dropoffLocation.trim())
      : "—";
  const flight =
    b.flightNumber && b.flightNumber.trim().length > 0
      ? escapeHtml(b.flightNumber.trim())
      : "—";
  const notes =
    b.message && b.message.trim().length > 0
      ? escapeHtml(b.message.trim()).replace(/\n/g, "<br/>")
      : "—";
  const dist =
    distanceKm != null && Number.isFinite(distanceKm)
      ? `${distanceKm.toFixed(1)} km (est.)`
      : "—";
  const pkg = packageLabel ? escapeHtml(packageLabel) : "—";
  const pi =
    completionKind === "stripe_paid" && paymentIntentId?.trim()
      ? `<code style="font-size:12px;background:#f1f5f9;padding:2px 6px;border-radius:4px">${escapeHtml(paymentIntentId.trim())}</code>`
      : "—";

  const subject = `Confirmed Booking - ${name} — ${serviceLabel}`;

  const textLines = [
    "New booking from the website",
    "",
    "--- Customer ---",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    "",
    "--- Trip ---",
    `Service: ${serviceLabel}`,
    `Package: ${packageLabel ?? "—"}`,
    `Pickup date: ${pickupDateStr}`,
    `Pickup time: ${b.pickupTime}`,
    `Passengers: ${b.passengers}`,
    `Pickup: ${b.pickupLocation.trim()}`,
    `Drop-off: ${b.dropoffLocation?.trim() || "—"}`,
    `Flight number: ${b.flightNumber?.trim() || "—"}`,
    `Notes: ${b.message?.trim() || "—"}`,
    `Route distance: ${dist}`,
    "",
    "--- Status ---",
    `Completion: ${completionKindLabel(completionKind)}`,
    `Payment intent: ${paymentIntentId?.trim() || "—"}`,
  ];

  if (input.locale) textLines.push("", `Locale: ${input.locale}`);
  if (input.pagePath) textLines.push(`Page: ${input.pagePath}`);
  if (input.utmSource) textLines.push(`UTM source: ${input.utmSource}`);
  if (input.utmMedium) textLines.push(`UTM medium: ${input.utmMedium}`);
  if (input.utmCampaign) textLines.push(`UTM campaign: ${input.utmCampaign}`);
  if (input.timezone) textLines.push(`Visitor TZ: ${input.timezone}`);

  const tableRows = [
    sectionTitle("Customer"),
    row("Full name", escapeHtml(name)),
    row(
      "Email",
      `<a href="mailto:${escapeHtml(email)}" style="color:#0f766e;text-decoration:none">${escapeHtml(email)}</a>`,
    ),
    row("Phone", escapeHtml(phone)),
    sectionTitle("Trip details"),
    row("Service", escapeHtml(serviceLabel)),
    row("Package / price", pkg),
    row("Pickup date", escapeHtml(pickupDateStr)),
    row("Pickup time", escapeHtml(b.pickupTime)),
    row("Passengers", escapeHtml(b.passengers)),
    row("Pickup location", escapeHtml(b.pickupLocation.trim())),
    row("Drop-off location", drop),
    row("Flight number", flight),
    row("Notes / requests", notes),
    row("Route distance (est.)", dist),
    sectionTitle("Booking status"),
    row("Completion", escapeHtml(completionKindLabel(completionKind))),
    row("Stripe payment intent", pi),
  ];

  const ctxRows: string[] = [];
  if (
    input.locale ||
    input.pagePath ||
    input.utmSource ||
    input.utmMedium ||
    input.utmCampaign ||
    input.timezone
  ) {
    ctxRows.push(sectionTitle("Submission context"));
    if (input.locale) ctxRows.push(row("Locale", escapeHtml(input.locale)));
    if (input.pagePath) ctxRows.push(row("Page path", escapeHtml(input.pagePath)));
    if (input.utmSource) ctxRows.push(row("UTM source", escapeHtml(input.utmSource)));
    if (input.utmMedium) ctxRows.push(row("UTM medium", escapeHtml(input.utmMedium)));
    if (input.utmCampaign) ctxRows.push(row("UTM campaign", escapeHtml(input.utmCampaign)));
    if (input.timezone) ctxRows.push(row("Visitor timezone", escapeHtml(input.timezone)));
  }

  const html = `
<!DOCTYPE html><html><body style="margin:0;padding:28px 16px;background:#f1f5f9;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.5;color:#0f172a">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 28px rgba(15,23,42,0.1);border:1px solid #e2e8f0">
<tr><td style="background:linear-gradient(125deg,#0f766e 0%,#115e59 45%,#134e4a 100%);color:#ffffff;padding:28px 32px 26px 32px">
<h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em">New booking</h1>
<p style="margin:10px 0 0;font-size:14px;opacity:0.92">Arlanda Taxi — website form</p>
</td></tr>
<tr><td style="padding:8px 0 28px 0">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;width:100%">
${tableRows.join("\n")}
${ctxRows.join("\n")}
</table>
</td></tr>
<tr><td style="padding:0 32px 24px;font-size:12px;color:#94a3b8;border-top:1px solid #f1f5f9">
Reply directly to this email to reach the customer at ${escapeHtml(email)}.
</td></tr>
</table>
</td></tr></table>
</body></html>`.trim();

  return { subject, html, text: textLines.join("\n") };
}

export async function sendBookingNotificationViaResend(
  input: BookingNotificationInput,
  apiKey: string,
  from: string,
  to: string,
): Promise<boolean> {
  const { subject, html, text } = buildBookingNotificationEmail(input);
  const replyTo = input.booking.email.trim();
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: replyTo,
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[booking-submission] Resend HTTP", res.status, errBody);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[booking-submission] Resend fetch", e);
    return false;
  }
}
