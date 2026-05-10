/** Keep names lowercase_snake for stable analytics (`GROUP BY form_type`). */
export const FORM_TYPES = {
  CONTACT: "contact",
  /** Wizard completions: paid packages, manual step-2 confirm, custom-route quote */
  BOOKING: "booking",
} as const;

export type KnownFormType = (typeof FORM_TYPES)[keyof typeof FORM_TYPES];

export type SubmissionContext = {
  locale?: string | null;
  pagePath?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  timezone?: string | null;
  userAgent?: string | null;
};
