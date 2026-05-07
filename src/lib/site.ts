/** Company & marketing — set NEXT_PUBLIC_FACEBOOK_URL / NEXT_PUBLIC_INSTAGRAM_URL in `.env.local` for your pages. */

/** Google Business “Get more reviews” link — set `NEXT_PUBLIC_GOOGLE_REVIEWS_URL` in `.env.local` for direct “Write a review”. */
export function googleReviewsInviteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL?.trim();
  if (fromEnv) return fromEnv;
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Sahotra Services AB, Sigtuna, Sweden")
  );
}

export const SITE_VEHICLE_TAGLINE =
  "Premium, environment‑friendly vehicles — comfortable rides with lower environmental impact.";

/** Short line for booking UI and cards. */
export const SITE_VEHICLE_SHORT = "Premium eco-friendly vehicle";

const facebookUrl =
  process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://www.facebook.com";
const instagramUrl =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com";

/** Swedish org.nr (10 digits) — display as XXXXXX-XXXX */
export function formatSwedishOrgNumber(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length !== 10) return digits;
  return `${d.slice(0, 6)}-${d.slice(6)}`;
}

export const COMPANY = {
  legalName: "Sahotra Services AB",
  /** Registered company number (Allabolag / Bolagsverket) */
  organizationNumber: "5593565376",
  allabolagUrl:
    "https://www.allabolag.se/foretag/sahotra-services-ab/sigtuna/passagerartransporter/2KI9IO0I63IJZ",
  brandTitle:
    "Taxi to or from Stockholm to Arlanda and Skavsta Airport",
  description:
    "Premium rides across Stockholm and Arlanda. Reliable airport transfers, city trips, and more. Fixed prices, 24/7 booking, professional drivers — a project of Sahotra Services AB.",
  emails: {
    bookings: "info@bookarlandataxi.se",
    company: "sahotraservicesab@gmail.com",
  },
  address: {
    street: "Ormbergsvägen 7",
    postalCity: "193 36 Sigtuna",
    line: "Ormbergsvägen 7, 193 36 Sigtuna",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent("Ormbergsvägen 7, 193 36 Sigtuna, Sweden"),
  },
  whatsappDigits: "46729450613",
  phoneE164: "+46729450613",
  phoneDisplay: "+46 72 945 06 13",
  facebookUrl,
  instagramUrl,
  workMailto:
    "mailto:info@bookarlandataxi.se?subject=Work%20at%20Sahotra%20Services%20AB",
};

export const VASTERVAS_ROUTE_OFFER =
  "Västerås ↔ Arlanda / Stockholm — 1000 SEK fixed price";
