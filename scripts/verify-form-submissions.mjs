/**
 * Smoke test: insert one row into form_submissions (requires migration applied + SUPABASE_SECRET_KEY).
 * Usage: node --env-file=.env.local scripts/verify-form-submissions.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key =
  process.env.SUPABASE_SECRET_KEY?.trim() ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).");
  process.exit(2);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase
  .from("form_submissions")
  .insert({
    form_type: "contact",
    fields: { verify: true, source: "scripts/verify-form-submissions.mjs" },
  })
  .select("id")
  .single();

if (error) {
  console.error("Failed:", error.code ?? "", error.message);
  if (error.code === "PGRST205" || /schema cache/i.test(error.message ?? "")) {
    console.error(
      "\n→ Run supabase/migrations/20260206160000_form_submissions.sql in Supabase → SQL Editor.\n",
    );
  }
  process.exit(1);
}

console.log("OK: inserted row id", data?.id);
