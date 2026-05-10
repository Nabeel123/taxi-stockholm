-- Partial indexes for booking analytics (form_type fixed + stable JSON extract paths).
-- Helps queries like COUNT BY completion_kind or service_type without full table scans.

CREATE INDEX IF NOT EXISTS idx_form_submissions_booking_completion
ON public.form_submissions (((fields ->> 'completion_kind')))
WHERE
  form_type = 'booking';

CREATE INDEX IF NOT EXISTS idx_form_submissions_booking_service
ON public.form_submissions (((fields #>> '{booking,service_type}')))
WHERE
  form_type = 'booking';
