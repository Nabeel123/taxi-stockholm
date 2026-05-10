-- Route distance surfaced as a typed column for reporting (canonical value remains in fields.distance_km jsonb).

ALTER TABLE public.form_submissions ADD COLUMN IF NOT EXISTS distance_km double precision GENERATED ALWAYS AS (
  CASE
    WHEN
      fields ? 'distance_km'
      AND jsonb_typeof(fields -> 'distance_km') = 'number'
    THEN (fields->>'distance_km')::double precision
    ELSE NULL
  END
) STORED;

COMMENT ON COLUMN public.form_submissions.distance_km IS 'Stored copy of numeric fields.distance_km (km); null without route calculation or non-booking rows.';

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
