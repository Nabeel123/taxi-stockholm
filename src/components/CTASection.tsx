"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Phone, Clock, Car, Shield, Star, MapPin, Info } from "lucide-react";
import { COMPANY } from "@/lib/site";

function ArlandaPriceHint() {
  const t = useTranslations("cta");

  return (
    <span className="group/tooltip relative inline-flex items-center align-middle">
      <button
        type="button"
        className="ml-1 inline-flex shrink-0 rounded p-0.5 text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)]"
        aria-label={t("arlandaTooltipAria")}
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        id="arlanda-price-tooltip"
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-left text-xs leading-snug text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100"
      >
        {t("arlandaTooltipBody")}
      </span>
    </span>
  );
}

export default function CTASection() {
  const t = useTranslations("cta");
  const tSite = useTranslations("site");
  const tel = COMPANY.phoneE164.replace(/\s/g, "");
  const vasterasOfferLine = tSite("vastervasOffer");
  const vasterasWhatsappHref = `https://wa.me/${COMPANY.whatsappDigits}?text=${encodeURIComponent(
    t("vasterasWhatsappLead", { offer: vasterasOfferLine }),
  )}`;

  return (
    <motion.section
      initial={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0F172A] py-16 sm:py-20 md:py-24"
      id="cta"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="font-heading inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold tracking-wider text-white">
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
            </span>
            <span className="text-white">{t("availableNow")}</span>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-5 text-center sm:px-6 sm:py-6">
          <p className="font-heading text-base font-bold text-white sm:text-lg">{tSite("vastervasOffer")}</p>
          <p className="mt-2 text-sm text-white/85">
            {t("bannerBook")}{" "}
            <span className="font-semibold text-[var(--accent)]">{t("bannerWebsite")}</span> {t("bannerOr")}{" "}
            <span className="font-semibold text-emerald-200">{t("bannerWhatsapp")}</span>
          </p>
          <div className="mt-4 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
            <Link
              href={{ pathname: "/book", query: { service: "vasteras-route" } }}
              className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold uppercase tracking-wide text-[var(--secondary)] transition hover:bg-[var(--accent-hover)] sm:w-auto sm:min-h-11"
            >
              {t("bookOnline")}
            </Link>
            <a
              href={vasterasWhatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl border-2 border-[var(--whatsapp-green)] bg-[var(--whatsapp-green)]/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--whatsapp-green)]/35 sm:w-auto sm:min-h-11"
            >
              {t("instantBookingWhatsapp")}
            </a>
          </div>
        </div>

        <h2
          id="cta-heading"
          className="mt-10 text-center text-2xl font-bold text-white sm:mt-12 sm:text-3xl md:text-4xl"
        >
          {t("needRide")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-base text-white/90 sm:text-lg">
          {t("sublead")}
        </p>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 sm:mt-10">
          <div className="font-heading inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100">
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="availability-dot relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-emerald-50">{t("driversAvailable")}</span>
          </div>
          <p className="flex flex-wrap items-center justify-center gap-1 text-sm font-medium text-white/95 sm:text-base">
            <Star
              className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]"
              aria-hidden
            />
            <span>4.9</span>
            <span className="text-white/50" aria-hidden>
              ·
            </span>
            <span>{t("ridesCompleted")}</span>
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl md:mt-12">
          <div className="flex flex-col gap-8 p-5 sm:p-6 md:p-10">
            <div className="flex min-h-[48px] flex-col gap-8 md:flex-row-reverse md:items-center md:justify-between md:gap-10">
              <div className="flex w-full flex-col md:max-w-[min(100%,20rem)] md:shrink-0">
                <Link
                  href="/book"
                  className="inline-flex w-full min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-4 text-base font-extrabold uppercase tracking-wide text-[var(--secondary)] shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-lg hover:shadow-[0_0_24px_rgb(255_214_10_/_0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] active:translate-y-0 sm:text-lg"
                >
                  {t("bookOnlineCaps")}
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <div className="min-w-0 flex-1 text-center md:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{t("orCallUs")}</p>
                <a
                  href={`tel:${tel}`}
                  className="group mt-2 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl px-2 py-3 text-lg font-bold text-white no-underline transition-all duration-200 ease-out hover:scale-[1.02] hover:text-[var(--accent)] hover:shadow-[0_0_24px_rgb(255_214_10_/_0.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] md:justify-start md:text-xl lg:text-2xl"
                  aria-label={t("callAria", { phone: COMPANY.phoneDisplay })}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--accent)] ring-1 ring-white/15 transition-all duration-200 group-hover:bg-[var(--accent)] group-hover:text-[var(--secondary)] group-hover:ring-[var(--accent)]"
                    aria-hidden
                  >
                    <Phone className="h-5 w-5" strokeWidth={2.5} />
                  </span>
                  {COMPANY.phoneDisplay}
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-neutral-700/90 border-t border-neutral-800 bg-black/25">
            <div className="flex flex-col items-center px-2 py-5 text-center sm:px-4 sm:py-6">
              <Clock
                className="mb-2 h-5 w-5 text-[var(--accent)]"
                strokeWidth={2}
                aria-hidden
              />
              <p className="text-lg font-bold text-white sm:text-xl md:text-2xl">{t("responseValue")}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-white/90 sm:text-xs">
                {t("avgResponse")}
              </p>
            </div>
            <div className="flex flex-col items-center px-2 py-5 text-center sm:px-4 sm:py-6">
              <Car
                className="mb-2 h-5 w-5 text-[var(--accent)]"
                strokeWidth={2}
                aria-hidden
              />
              <p className="text-lg font-bold text-white sm:text-xl md:text-2xl">{t("pickupValue")}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-white/90 sm:text-xs">
                {t("pickupTime")}
              </p>
            </div>
            <div className="flex flex-col items-center px-2 py-5 text-center sm:px-4 sm:py-6">
              <Shield
                className="mb-2 h-5 w-5 text-[var(--accent)]"
                strokeWidth={2}
                aria-hidden
              />
              <p className="text-lg font-bold text-white sm:text-xl md:text-2xl">{t("secpayPlaceholder")}</p>
              <p className="mt-1 flex flex-wrap items-center justify-center gap-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-white/90 sm:text-xs">
                <span>
                  <span aria-hidden>· </span>
                  {t("arlandaFixedPrice")}
                </span>
                <ArlandaPriceHint />
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-white/80">
          <MapPin className="h-8 w-8 shrink-0 text-[var(--accent)]" aria-hidden strokeWidth={2} />
          <span>{tSite("vehicleTagline")}</span>
          <span className="text-white/40" aria-hidden>
            ·
          </span>
          <span>{tSite("licensedInsured")}</span>
        </p>
      </div>
    </motion.section>
  );
}
