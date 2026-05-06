"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import type { MastheadContent } from "@/lib/sanity/masthead";

type Props = {
  initial: MastheadContent;
};

function mastheadFingerprint(c: MastheadContent): string {
  return [
    c.badgeText,
    c.heading,
    c.subheading,
    c.backgroundMode,
    c.videoUrl,
    c.posterUrl,
  ].join("\0");
}

function HeroLiveInner({ initial }: Props) {
  const [live, setLive] = useState<MastheadContent | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/masthead", { signal: ac.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MastheadContent | null) => {
        if (data) setLive(data);
      })
      .catch(() => {});

    return () => ac.abort();
  }, []);

  return <Hero content={live ?? initial} />;
}

/**
 * Renders the hero from SSG/ISR HTML first, then refreshes from `/api/masthead` after mount
 * so CMS edits show up without a full reload (stale-while-revalidate on the client).
 */
export default function HeroWithLiveMasthead({ initial }: Props) {
  return <HeroLiveInner key={mastheadFingerprint(initial)} initial={initial} />;
}
