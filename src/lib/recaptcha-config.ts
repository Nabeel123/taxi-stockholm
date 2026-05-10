/**
 * Contact form reCAPTCHA mode (site key pair must match the same product).
 * v3: `api.js?render=` + `execute()`; v2 Checkbox: checkbox widget (“Invalid key type” when mismatched).
 */

function recaptchaTypedVariant(): "v3" | "v2" | undefined {
  for (const v of [
    process.env.GOOGLE_RECAPTCHA_TYPE,
    process.env.RECAPTCHA_TYPE,
    process.env.NEXT_PUBLIC_RECAPTCHA_TYPE,
  ]) {
    const raw = v?.trim().toLowerCase();
    if (!raw) continue;
    if (raw === "v3" || raw === "3" || raw === "score") return "v3";
    if (raw === "v2" || raw === "2" || raw === "checkbox") return "v2";
  }
  return undefined;
}

/** True → load reCAPTCHA v3 Score flow on the contact page. */
export function isContactRecaptchaV3Enabled(): boolean {
  const typed = recaptchaTypedVariant();
  if (typed === "v2") return false;
  if (typed === "v3") return true;

  for (const v of [
    process.env.GOOGLE_RECAPTCHA_V3,
    process.env.RECAPTCHA_V3,
    process.env.NEXT_PUBLIC_RECAPTCHA_V3,
  ]) {
    const s = v?.trim().toLowerCase();
    if (s === "1" || s === "true" || s === "yes") return true;
  }
  return false;
}
