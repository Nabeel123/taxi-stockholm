-- Remove approximate location columns; timezone + user_agent remain for light context.

DROP INDEX IF EXISTS public.idx_form_submissions_country;

ALTER TABLE public.form_submissions
  DROP COLUMN IF EXISTS country_code,
  DROP COLUMN IF EXISTS region,
  DROP COLUMN IF EXISTS city;

CREATE OR REPLACE VIEW public.booking_form_snapshots AS
SELECT
  fs.id,
  fs.created_at,
  fs.locale,
  fs.page_path,
  fs.fields->>'completion_kind' AS completion_kind,
  fs.fields->>'payment_intent_id' AS payment_intent_id,
  fs.distance_km AS distance_km,
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

COMMENT ON VIEW public.booking_form_snapshots IS 'Booking-only slice of form_submissions; booking_json is fields.booking; distance_km is the generated column.';

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
