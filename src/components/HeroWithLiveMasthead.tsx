"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import type { MastheadContent } from "@/lib/sanity/masthead";

type Props = {
  initial: MastheadContent;
};

/**
 * Renders the hero from SSG/ISR HTML first, then refreshes from `/api/masthead` after mount
 * so CMS edits show up without a full reload (stale-while-revalidate on the client).
 */
export default function HeroWithLiveMasthead({ initial }: Props) {
  const [content, setContent] = useState(initial);

  useEffect(() => {
    setContent(initial);
  }, [initial]);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/masthead", { signal: ac.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MastheadContent | null) => {
        if (data) setContent(data);
      })
      .catch(() => {});

    return () => ac.abort();
  }, []);

  return <Hero content={content} />;
}
