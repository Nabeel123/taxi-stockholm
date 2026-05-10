"use client";

import { Fragment, useCallback } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Phone, Star } from "lucide-react";
import type { MastheadContent } from "@/lib/masthead";
import { COMPANY } from "@/lib/site";

/** Matches `Header` so hash updates after programmatic scroll refresh active nav. */
const LOCATION_SYNC = "header:locationsync";

type HeroProps = {
  content: MastheadContent;
};

export default function Hero({ content }: HeroProps) {
  const t = useTranslations("hero");
  const tHeader = useTranslations("header");
  const pathname = usePathname();

  const trustBadges = [t("trustRating"), t("trustRides"), t("trustFixed")] as const;
  const CALL_HREF = `tel:${COMPANY.phoneE164.replace(/\s/g, "")}`;
  const WHATSAPP_HREF = `https://wa.me/${COMPANY.whatsappDigits}`;

  const scrollToServices = useCallback(() => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `${pathname}#services`);
    window.dispatchEvent(new Event(LOCATION_SYNC));
  }, [pathname]);

  const isVideo = content.backgroundMode === "video" && Boolean(content.videoUrl?.trim());

  return (
    <section id="hero" className="relative flex min-h-screen flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[#1c2a45] to-[#0a1220]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_55%)]"
          aria-hidden
        />
        {isVideo ? (
          <video
            className="absolute inset-0 hidden h-full w-full object-cover object-center md:block"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          >
            {content.videoUrl ? (
              <source src={content.videoUrl} type="video/mp4" />
            ) : null}
          </video>
        ) : null}
        <div
          className="absolute inset-0 bg-[var(--dark-slate)]/30"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[var(--dark-slate)]/55 via-[var(--dark-slate)]/20 to-[var(--accent)]/[0.06]"
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-[max(5rem,env(safe-area-inset-bottom,0px)+3rem)] pt-[calc(6rem+env(safe-area-inset-top,0px))] text-center sm:px-6 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-40">
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-heading inline-block rounded-full bg-[var(--accent)] px-[1.125rem] py-2 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-black shadow-sm sm:px-5 sm:text-sm sm:tracking-[0.15em]">
              {t("mastheadKicker")}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-balance text-[clamp(1.875rem,5.5vw+0.85rem,3.05rem)] font-bold leading-[1.08] tracking-tight text-[var(--accent)] sm:text-[clamp(2.25rem,4vw+1rem,3.75rem)] md:text-5xl lg:text-6xl"
          >
            {t("mastheadHeading")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-[clamp(0.9375rem,2.15vw+0.55rem,1.0625rem)] leading-[1.55] text-white/93 sm:text-lg md:text-xl"
          >
            {t("mastheadSubheading")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 flex w-full justify-center px-1"
          >
            <button
              type="button"
              onClick={scrollToServices}
              className="inline-flex min-h-[2.875rem] w-full max-w-[20rem] touch-manipulation items-center justify-center rounded-2xl bg-[var(--accent)] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_8px_28px_-6px_rgb(0_0_0/0.55)] transition-all duration-300 ease-out hover:bg-[var(--accent-hover)] hover:shadow-[0_12px_32px_-8px_rgb(0_0_0/0.5)] active:translate-y-[1px] sm:max-w-none sm:min-h-12 sm:rounded-xl sm:px-14 sm:text-base sm:shadow-lg"
            >
              {tHeader("bookNow")}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-6 grid w-full gap-3 sm:max-w-xl sm:mx-auto lg:hidden"
          >
            <a
              href={CALL_HREF}
              className="inline-flex min-h-[2.75rem] touch-manipulation items-center justify-center gap-2 rounded-2xl border border-white/[0.18] bg-white/[0.09] px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.13] active:bg-white/[0.16]"
            >
              <Phone className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={2} />
              <span className="tabular-nums">{t("callLabel", { phone: COMPANY.phoneDisplay })}</span>
            </a>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[2.75rem] touch-manipulation items-center justify-center gap-2 rounded-2xl border-2 border-[var(--whatsapp-green)]/85 bg-[var(--whatsapp-green)]/22 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--whatsapp-green)]/30 active:bg-[var(--whatsapp-green)]/35"
            >
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.151 1.03 7.045 2.903 1.894 1.903 2.903 4.375 2.903 7.034 0 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("whatsapp")}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white/90 sm:text-base"
          >
            {trustBadges.map((label, index) => (
              <Fragment key={`${index}-${label}`}>
                {index > 0 ? (
                  <span className="hidden text-white/40 sm:inline" aria-hidden>
                    ·
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 font-medium">
                  {index === 0 ? (
                    <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" />
                  ) : null}
                  {label}
                </span>
              </Fragment>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 hidden items-center justify-center gap-3 lg:flex lg:flex-wrap"
          >
            <p className="w-full text-center text-xs font-medium uppercase tracking-wider text-white/55">
              {t("contactPrompt")}
            </p>
            <a
              href={CALL_HREF}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/15"
            >
              <Phone className="h-4 w-4 text-[var(--accent)]" strokeWidth={2} />
              {t("callLabel", { phone: COMPANY.phoneDisplay })}
            </a>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--whatsapp-green)] bg-[var(--whatsapp-green)]/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-[var(--whatsapp-green)]/30"
            >
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.151 1.03 7.045 2.903 1.894 1.903 2.903 4.375 2.903 7.034 0 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("whatsapp")}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
