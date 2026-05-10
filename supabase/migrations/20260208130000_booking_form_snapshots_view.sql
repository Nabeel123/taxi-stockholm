-- Query layer for paid/quote booking rows: full booking stays in form_submissions.fields (jsonb).
-- After client fix, fields->'booking' holds the full structured object (not the string "[object]").

CREATE OR REPLACE VIEW public.booking_form_snapshots AS
SELECT
  fs.id,
  fs.created_at,
  fs.locale,
  fs.page_path,
  fs.fields->>'completion_kind' AS completion_kind,
  fs.fields->>'payment_intent_id' AS payment_intent_id,
  CASE
    WHEN jsonb_typeof(fs.fields->'distance_km') = 'number'
    THEN (fs.fields->>'distance_km')::double precision
    ELSE NULL
  END AS distance_km,
  fs.fields->>'package_label' AS package_label,
  fs.fields->'booking' AS booking_json,
  fs.referrer,
  fs.utm_source,
  fs.utm_medium,
  fs.utm_campaign,
  fs.timezone,
  fs.user_agent
FROM public.form_submissions AS fs
WHERE
  fs.form_type = 'booking';

COMMENT ON VIEW public.booking_form_snapshots IS 'Booking-only slice of form_submissions; booking_json is fields.booking (structured jsonb).';

REVOKE ALL ON public.booking_form_snapshots
FROM
  PUBLIC;

REVOKE ALL ON public.booking_form_snapshots
FROM
  anon;

REVOKE ALL ON public.booking_form_snapshots
FROM
  authenticated;

GRANT SELECT ON public.booking_form_snapshots TO service_role;
