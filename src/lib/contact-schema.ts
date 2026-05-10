import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2, { message: "name_min" }).max(120, { message: "name_max" }),
  email: z.string().trim().email({ message: "email_invalid" }).max(254, { message: "email_max" }),
  phone: z
    .string()
    .trim()
    .max(40, { message: "phone_max" })
    .transform((val) => (val === "" ? undefined : val)),
  message: z
    .string()
    .trim()
    .min(10, { message: "message_min" })
    .max(5000, { message: "message_max" }),
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

/** Client analytics hints + optional Google reCAPTCHA token (v2 checkbox or v3 execute) */
export const contactApiBodySchema = contactSubmissionSchema.extend({
  recaptchaToken: z.string().optional(),
  locale: z.string().max(24).optional(),
  pagePath: z.string().max(512).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(200).optional(),
});
