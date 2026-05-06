"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { MapPin, Phone, Star } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import type { MastheadContent } from "@/lib/sanity/masthead";
import { COMPANY } from "@/lib/site";

/** Used when masthead Background is “Image” (not configurable in CMS). */
const HERO_BACKGROUND_IMAGE = "/masthead.jpg";

type HeroProps = {
  content: MastheadContent;
};

export default function Hero({ content }: HeroProps) {
  const t = useTranslations("hero");
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const trustBadges = [t("trustRating"), t("trustRides"), t("trustFixed")] as const;
  const CALL_HREF = `tel:${COMPANY.phoneE164.replace(/\s/g, "")}`;
  const WHATSAPP_HREF = `https://wa.me/${COMPANY.whatsappDigits}`;

  const priceHref = useMemo(() => {
    const params = new URLSearchParams();
    if (pickup) params.set("pickup", pickup);
    if (dropoff) params.set("dropoff", dropoff);
    const q = params.toString();
    return q ? `/book?${q}` : "/book";
  }, [pickup, dropoff]);

  useEffect(() => {
    router.prefetch("/book");
    /* next-intl `useRouter` reference can churn; prefetch once after mount */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVideo = content.backgroundMode === "video" && Boolean(content.videoUrl?.trim());

  return (
    <section id="hero" className="relative flex min-h-screen flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
        {isVideo ? (
          <>
            <div
              className="absolute inset-0 bg-[var(--dark-slate)] md:hidden"
              aria-hidden
            />
            <video
              className="absolute inset-0 hidden h-full w-full object-cover object-center md:block"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={content.posterUrl || undefined}
              aria-hidden
            >
              {content.videoUrl ? (
                <source src={content.videoUrl} type="video/mp4" />
              ) : null}
            </video>
          </>
        ) : (
          <Image
            src={HERO_BACKGROUND_IMAGE}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            aria-hidden
          />
        )}
        <div
          className="absolute inset-0 bg-[var(--dark-slate)]/30"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[var(--dark-slate)]/55 via-[var(--dark-slate)]/20 to-[var(--accent)]/[0.06]"
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-16 pt-24 text-center sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-40">
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-heading inline-block rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-black sm:text-sm">
              {t("mastheadKicker")}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-3xl font-bold leading-[1.1] tracking-tight text-[var(--accent)] sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {t("mastheadHeading")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/95 sm:text-lg md:text-xl"
          >
            {t("mastheadSubheading")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 w-full rounded-2xl border border-white/15 bg-[#0f172a]/65 p-4 shadow-2xl backdrop-blur-md sm:p-5"
          >
            <p className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 sm:text-sm">
              <MapPin className="h-4 w-4 text-[var(--accent)]" />
              {t("bookingCardTitle")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <AddressAutocomplete
                value={pickup}
                onChange={setPickup}
                placeholder={t("pickupPlaceholder")}
                aria-label={t("pickupPlaceholder")}
                className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-left text-base text-white placeholder-white/45 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
              />
              <AddressAutocomplete
                value={dropoff}
                onChange={setDropoff}
                placeholder={t("dropoffPlaceholder")}
                aria-label={t("dropoffPlaceholder")}
                className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-left text-base text-white placeholder-white/45 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
              />
            </div>
            <Link
              href={priceHref}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3.5 text-base font-bold uppercase tracking-wide text-black transition-all duration-300 ease-out hover:scale-[1.01] hover:bg-[var(--accent-hover)] hover:shadow-lg hover:shadow-[var(--accent)]/25"
            >
              {t("primaryCta")}
            </Link>
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
