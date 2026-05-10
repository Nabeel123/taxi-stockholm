import { createClient } from "@supabase/supabase-js";
import type { SubmissionContext } from "./types";

const FORM_TYPE_RE = /^[a-z][a-z0-9_-]{0,63}$/;

function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Truncate JSON-safe values for Postgres jsonb inserts (bounded size, no leaked class instances). */
function capNestedValue(v: unknown, depth: number, maxDepth: number, maxScalarLen: number, maxPerArray: number, budget: { nodes: number }): unknown {
  if (budget.nodes <= 0) return null;
  budget.nodes -= 1;

  if (v === null || typeof v === "number" || typeof v === "boolean") return v;
  if (typeof v === "string") return v.slice(0, maxScalarLen);

  if (v instanceof Date) return v.toISOString().slice(0, maxScalarLen);

  if (Array.isArray(v)) {
    if (depth >= maxDepth) return null;
    const out: unknown[] = [];
    const len = Math.min(v.length, maxPerArray);
    for (let i = 0; i < len; i++) {
      if (budget.nodes <= 0) break;
      out.push(capNestedValue(v[i], depth + 1, maxDepth, maxScalarLen, maxPerArray, budget));
    }
    return out;
  }

  if (typeof v === "object") {
    const proto = Object.getPrototypeOf(v);
    if (proto !== null && proto !== Object.prototype) {
      return String(v).slice(0, maxScalarLen);
    }
    if (depth >= maxDepth) return null;

    const out: Record<string, unknown> = {};
    let keys = 0;
    const maxKeysPerObj = 64;
    for (const [k, child] of Object.entries(v as Record<string, unknown>)) {
      if (keys >= maxKeysPerObj || budget.nodes <= 0) break;
      const key = k.slice(0, 80);
      const capped = capNestedValue(child, depth + 1, maxDepth, maxScalarLen, maxPerArray, budget);
      /* Drop undefined produced by exhaustion; Postgres json omits absent keys similarly */
      out[key] = capped;
      keys += 1;
    }
    return out;
  }

  return String(v).slice(0, maxScalarLen);
}

function capFields(fields: Record<string, unknown>, maxKeys = 40, maxScalarLen = 8000): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const budget = { nodes: 512 };
  let n = 0;
  for (const [k, v] of Object.entries(fields)) {
    if (n >= maxKeys || budget.nodes <= 0) break;
    out[k.slice(0, 80)] = capNestedValue(v, 0, 14, maxScalarLen, 64, budget);
    n += 1;
  }
  return out;
}

export async function recordFormSubmission(args: {
  formType: string;
  fields: Record<string, unknown>;
  context: SubmissionContext;
}): Promise<{ ok: boolean }> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    console.warn("[form_submissions] Supabase URL or secret service key missing; skipping insert");
    return { ok: false };
  }

  if (!FORM_TYPE_RE.test(args.formType)) {
    console.warn("[form_submissions] invalid form_type", args.formType);
    return { ok: false };
  }

  const { error } = await supabase.from("form_submissions").insert({
    form_type: args.formType,
    fields: capFields(args.fields),
    locale: args.context.locale ?? null,
    page_path: args.context.pagePath ?? null,
    referrer: args.context.referrer ?? null,
    utm_source: args.context.utmSource ?? null,
    utm_medium: args.context.utmMedium ?? null,
    utm_campaign: args.context.utmCampaign ?? null,
    timezone: args.context.timezone ?? null,
    user_agent: args.context.userAgent ?? null,
  });

  if (error) {
    const msg = error.message ?? String(error);
    const code = "code" in error ? String((error as { code?: string }).code) : "";
    const missingTable =
      code === "PGRST205" ||
      /could not find the table/i.test(msg) ||
      /schema cache/i.test(msg);
    if (missingTable) {
      console.error(
        "[form_submissions] Table missing or not yet visible to the API. Run the SQL in supabase/migrations/20260206160000_form_submissions.sql in the Supabase SQL Editor, then retry.",
      );
    }
    console.error("[form_submissions] insert failed", code, msg);
    return { ok: false };
  }
  return { ok: true };
}
