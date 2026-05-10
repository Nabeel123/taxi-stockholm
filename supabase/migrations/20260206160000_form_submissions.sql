-- Unified form analytics: server inserts only (Supabase secret/service key from Next.js).
-- Query examples (SQL editor):
--
--   SELECT form_type, COUNT(*) AS n
--   FROM public.form_submissions
--   WHERE created_at > now() - interval '30 days'
--   GROUP BY 1 ORDER BY n DESC;

CREATE TABLE IF NOT EXISTS public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  created_at timestamptz NOT NULL DEFAULT now (),
  form_type text NOT NULL CHECK (
    form_type ~ '^[a-z][a-z0-9_-]{0,63}$'
  ),
  fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  locale text,
  page_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  timezone text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON public.form_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type ON public.form_submissions (form_type);

CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type_created ON public.form_submissions (form_type, created_at DESC);

COMMENT ON TABLE public.form_submissions IS 'Append-only form deliveries; insert via service role / secret key from backend only.';

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.form_submissions
FROM
  PUBLIC;

REVOKE ALL ON TABLE public.form_submissions
FROM
  anon;

REVOKE ALL ON TABLE public.form_submissions
FROM
  authenticated;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.form_submissions TO service_role;
