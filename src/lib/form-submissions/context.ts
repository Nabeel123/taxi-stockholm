import type { SubmissionContext } from "./types";

/** Optional hints from the browser. */
export type ClientSubmissionHints = {
  locale?: string;
  pagePath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  /** Device IANA TZ (e.g. from booking wizard); used when CDN headers lack tz. */
  timezone?: string;
};

function trimmedOrEmpty(s: string | null | undefined): string | null {
  const t = typeof s === "string" ? s.trim() : "";
  return t.length > 0 ? t : null;
}

/**
 * Builds analytics context from Request + optional client hints.
 * On Vercel, timezone may come from `x-vercel-ip-timezone` / `cf-timezone`; client hint wins when supplied.
 */
export function buildSubmissionContext(
  request: Request,
  hints: ClientSubmissionHints = {},
): SubmissionContext {
  const h = request.headers;

  const ua = h.get("user-agent")?.trim() || null;
  const refererHeader = h.get("referer")?.trim() || h.get("referrer")?.trim() || null;

  const timezoneHdr =
    h.get("x-vercel-ip-timezone")?.trim() || h.get("cf-timezone")?.trim() || undefined;

  const tzHint = hints.timezone;
  const timezone = trimmedOrEmpty(tzHint) ?? trimmedOrEmpty(timezoneHdr) ?? null;

  return {
    locale: hints.locale?.trim() || null,
    pagePath: hints.pagePath?.trim() || null,
    referrer: refererHeader || null,
    utmSource: hints.utmSource?.trim() || null,
    utmMedium: hints.utmMedium?.trim() || null,
    utmCampaign: hints.utmCampaign?.trim() || null,
    timezone,
    userAgent: ua,
  };
}
