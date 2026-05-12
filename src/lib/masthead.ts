export type MastheadBackgroundMode = "video" | "image";

/** Hero background only — headline and copy come from next-intl `hero` messages. */
export type MastheadContent = {
  backgroundMode: MastheadBackgroundMode;
  videoUrl: string;
  posterUrl: string;
  /** Full-bleed hero background on narrow viewports (replaces video, which is desktop-only). */
  mobilePosterUrl: string;
};

export const DEFAULT_MASTHEAD: MastheadContent = {
  backgroundMode: "video",
  videoUrl: "/masthead.mp4",
  posterUrl: "/masthead.jpg",
  mobilePosterUrl: "/mobile-masthead.jpg",
};
