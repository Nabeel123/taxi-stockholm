"use client";

import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Star, Users, type LucideIcon } from "lucide-react";
import { googleReviewsInviteUrl } from "@/lib/site";

function GoogleReviewBadge({ label }: { label: string }) {
  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs text-white/85">
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span className="font-medium">{label}</span>
    </div>
  );
}

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const items = (t.raw("items") ?? []) as { quote: string; name: string; title: string; avatarUrl: string }[];
  const indicators = (
    (t.raw("trustIndicators") ?? []) as { value: string; label: string }[]
  ).map((row, idx) => {
    const icons: LucideIcon[] = [Star, Users, Clock];
    return { ...row, icon: icons[idx] ?? Star };
  });

  /** Merge avatar URLs from original static data (URLs not stored per locale). */
  const avatarsByName: Record<string, string> = {
    "Erik Andersson": "https://i.pravatar.cc/128?img=12",
    "Anna Lindström": "https://i.pravatar.cc/128?img=45",
    "Marcus Johansson": "https://i.pravatar.cc/128?img=33",
    "Lisa Berg": "https://i.pravatar.cc/128?img=5",
    "Jonas Holm": "https://i.pravatar.cc/128?img=14",
    "Sofia Nordin": "https://i.pravatar.cc/128?img=47",
    "David Chen": "https://i.pravatar.cc/128?img=68",
  };

  const scrollByCards = useCallback((direction: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const visible = isDesktop ? 4 : 2;
    const gap = 16;
    const cardWidth = (el.clientWidth - gap * (visible - 1)) / visible;
    const delta = (cardWidth + gap) * (direction === "next" ? 1 : -1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-[#243047] pb-[max(3.75rem,calc(env(safe-area-inset-bottom,0px)+2.75rem))] pt-14 sm:py-20 md:py-24"
      id="reviews"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(250,204,21,0.07),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 1, y: 0 }} className="text-center">
          <span className="font-heading inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black sm:text-sm">
            {t("kicker")}
          </span>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl md:text-4xl">{t("title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">{t("subtitle")}</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8">
            <p className="text-sm text-white/65 sm:text-base">{t("googleReviewPrompt")}</p>
            <a
              href={googleReviewsInviteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:border-white/35 hover:bg-white/15"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("googleReviewCta")}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto mt-10 hidden max-w-4xl flex-wrap justify-center gap-8 sm:mt-12 sm:gap-12 md:flex md:gap-16"
        >
          {indicators.map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.label}
                className="flex min-w-[100px] flex-1 flex-col items-center text-center sm:min-w-[120px]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="mt-3 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                  {ind.value}
                </span>
                <span className="mt-1 max-w-[9rem] text-xs font-semibold uppercase leading-snug tracking-wide text-white/80 sm:max-w-none sm:text-sm">
                  {ind.label}
                </span>
              </div>
            );
          })}
        </motion.div>

        <div className="relative mx-auto mt-8 max-w-6xl md:mt-14">
          <div className="pointer-events-none absolute -left-1 top-1/2 z-10 hidden -translate-y-1/2 md:block">
            <button
              type="button"
              onClick={() => scrollByCards("prev")}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#1a2639]/95 text-white shadow-lg backdrop-blur-sm transition hover:bg-[#1a2639] hover:text-[var(--accent)]"
              aria-label={t("prevAria")}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="pointer-events-none absolute -right-1 top-1/2 z-10 hidden -translate-y-1/2 md:block">
            <button
              type="button"
              onClick={() => scrollByCards("next")}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#1a2639]/95 text-white shadow-lg backdrop-blur-sm transition hover:bg-[#1a2639] hover:text-[var(--accent)]"
              aria-label={t("nextAria")}
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="mb-3 flex justify-end gap-2 md:hidden">
            <button
              type="button"
              onClick={() => scrollByCards("prev")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#1a2639]/95 text-white shadow-md transition hover:text-[var(--accent)]"
              aria-label={t("prevAria")}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards("next")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#1a2639]/95 text-white shadow-md transition hover:text-[var(--accent)]"
              aria-label={t("nextAria")}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div
            ref={scrollerRef}
            className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((row) => {
              const avatarUrl = avatarsByName[row.name] ?? "https://i.pravatar.cc/128";
              return (
                <article
                  key={`${row.name}-${row.quote.slice(0, 24)}`}
                  className="relative flex min-h-[280px] shrink-0 grow-0 snap-start flex-col rounded-2xl border border-white/10 bg-[#1a2639]/90 p-5 shadow-lg backdrop-blur-sm sm:min-h-[300px] sm:p-6 md:p-8 basis-[calc((100%-1rem)/2)] md:basis-[calc((100%-3rem)/4)]"
                >
                  <div className="absolute right-4 top-4 text-5xl font-serif leading-none text-[var(--accent)]/25 sm:text-6xl md:text-7xl">
                    &ldquo;
                  </div>
                  <div className="flex gap-1 text-[var(--accent)]">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
                    ))}
                  </div>
                  <GoogleReviewBadge label={t("googleReview")} />
                  <p className="relative mt-3 flex-1 text-sm leading-relaxed text-white/85 sm:mt-4 sm:text-base">
                    {row.quote}
                  </p>
                  <div className="relative mt-5 flex items-center gap-3 border-t border-white/10 pt-5 sm:mt-6 sm:pt-6">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--accent)]/40 sm:h-11 sm:w-11">
                      <Image
                        src={avatarUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white">{row.name}</p>
                      <p className="text-xs text-white/65 sm:text-sm">{row.title}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
