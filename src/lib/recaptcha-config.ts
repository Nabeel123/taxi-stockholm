/**
 * Whether the contact page should load reCAPTCHA v3 (`api.js?render=`) and `execute()`.
 * v2 Checkbox keys → leave all of these unset/false or you get “Invalid key type”.
 */
export function isContactRecaptchaV3Enabled(): boolean {
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
