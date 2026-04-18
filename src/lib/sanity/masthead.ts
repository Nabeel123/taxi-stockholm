import { unstable_cache } from "next/cache";
import { getSanityClient } from "@/lib/sanity/client";
import { MASTHEAD_CACHE_TAG, MASTHEAD_REVALIDATE_SECONDS } from "@/lib/sanity/constants";

export { MASTHEAD_CACHE_TAG, MASTHEAD_REVALIDATE_SECONDS } from "@/lib/sanity/constants";

export type MastheadBackgroundMode = "video" | "image";

/** Fields from Sanity; booking card copy, primary CTA, and static hero image path live in `Hero`. */
export type MastheadContent = {
  badgeText: string;
  heading: string;
  subheading: string;
  backgroundMode: MastheadBackgroundMode;
  videoUrl: string;
  posterUrl: string;
};

const mastheadQuery = `*[_type == "masthead"][0]{
  badgeText,
  heading,
  headlineLine1,
  headlineLine2,
  subheading,
  backgroundMode,
  backgroundVideoUrl,
  posterUrl,
  "videoFromAsset": backgroundVideo.asset->url,
  "posterFromAsset": posterImage.asset->url
}`;

type MastheadDoc = {
  badgeText?: string;
  heading?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  subheading?: string;
  backgroundMode?: MastheadBackgroundMode;
  backgroundVideoUrl?: string;
  posterUrl?: string;
  videoFromAsset?: string;
  posterFromAsset?: string;
} | null;

export const DEFAULT_MASTHEAD: MastheadContent = {
  badgeText: "Premium Taxi Agency",
  heading: "Reliable Rides, Every Time.",
  subheading:
    "Your trusted travel partner in Stockholm. Punctual, reliable, and professional chauffeur services in our Tesla Model S 2024 fleet.",
  backgroundMode: "video",
  videoUrl: "/masthead.mp4",
  posterUrl: "/masthead.jpg",
};

function normalizeMode(value: unknown): MastheadBackgroundMode {
  return value === "image" ? "image" : "video";
}

function resolveHeading(doc: MastheadDoc, fallback: string): string {
  if (!doc) return fallback;
  const h = doc.heading?.trim();
  if (h) return h;
  const legacy = [doc.headlineLine1, doc.headlineLine2]
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .join(" ")
    .trim();
  if (legacy) return legacy;
  return fallback;
}

function mergeMasthead(doc: MastheadDoc): MastheadContent {
  const base = DEFAULT_MASTHEAD;
  if (!doc) return base;

  const videoUrl = doc.videoFromAsset ?? doc.backgroundVideoUrl ?? base.videoUrl;
  const posterUrl = doc.posterFromAsset ?? doc.posterUrl ?? base.posterUrl;

  return {
    badgeText: doc.badgeText ?? base.badgeText,
    heading: resolveHeading(doc, base.heading),
    subheading: doc.subheading ?? base.subheading,
    backgroundMode: normalizeMode(doc.backgroundMode),
    videoUrl,
    posterUrl,
  };
}

async function loadMastheadFromSanity(): Promise<MastheadContent> {
  const sanity = getSanityClient();
  if (!sanity) return DEFAULT_MASTHEAD;

  try {
    const doc = await sanity.fetch<MastheadDoc>(mastheadQuery, {}, {
      next: { revalidate: MASTHEAD_REVALIDATE_SECONDS },
    });
    return mergeMasthead(doc);
  } catch {
    return DEFAULT_MASTHEAD;
  }
}

/**
 * Cached masthead for SSG/ISR: deduped across the request, revalidated on interval,
 * taggable for on-demand `revalidateTag`.
 */
export const getMasthead = unstable_cache(loadMastheadFromSanity, ["sanity-masthead-v1"], {
  revalidate: MASTHEAD_REVALIDATE_SECONDS,
  tags: [MASTHEAD_CACHE_TAG],
});
