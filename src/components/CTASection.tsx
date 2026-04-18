"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Clock, Car, Shield, Star, MapPin, Info } from "lucide-react";

const TEL = "+46700123456";
const TEL_DISPLAY = "+46 700 123 456";

function ArlandaPriceHint() {
  return (
    <span className="group/tooltip relative inline-flex items-center align-middle">
      <button
        type="button"
        className="ml-1 inline-flex shrink-0 rounded p-0.5 text-[#FACC15] transition-colors hover:text-[#fde047] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
        aria-label="About Arlanda fixed price: one-way fare between Stockholm city center and Arlanda Airport (ARN), no surge."
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        id="arlanda-price-tooltip"
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-left text-xs leading-snug text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100"
      >
        One-way fixed fare between Stockholm city center and Arlanda Airport (ARN). No surge or hidden fees.
      </span>
    </span>
  );
}

export default function CTASection() {
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => {
      if (!mq.matches) {
        setStickyVisible(false);
        return;
      }
      setStickyVisible(window.scrollY > 320);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="bg-[#0F172A] py-16 sm:py-20 md:py-24"
        id="cta"
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="font-heading inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold tracking-wider text-white">
              <span
                className="relative flex h-2.5 w-2.5 shrink-0"
                aria-hidden
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
              </span>
              <span className="text-white">AVAILABLE NOW</span>
            </div>
          </div>

          <h2
            id="cta-heading"
            className="mt-8 text-center text-2xl font-bold text-white sm:text-3xl md:text-4xl"
          >
            Need A Tesla Ride Right Now?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-white/90 sm:text-lg">
            Tesla Model S pickup in 5 minutes. Anywhere in Stockholm.
          </p>

          {/* Trust signals */}
          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 sm:mt-10">
            <div className="font-heading inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100">
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="availability-dot relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-emerald-50">
                3 drivers available now in Stockholm
              </span>
            </div>
            <p className="flex flex-wrap items-center justify-center gap-1 text-sm font-medium text-white/95 sm:text-base">
              <Star
                className="h-4 w-4 fill-[#FACC15] text-[#FACC15]"
                aria-hidden
              />
              <span>4.9</span>
              <span className="text-white/50" aria-hidden>
                ·
              </span>
              <span>2,400+ rides completed</span>
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl md:mt-12">
            <div className="flex flex-col gap-8 p-5 sm:p-6 md:p-10">
              {/* Primary first on mobile; on md, row-reverse puts Book on the right (dominant) */}
              <div className="flex min-h-[48px] flex-col gap-8 md:flex-row-reverse md:items-center md:justify-between md:gap-10">
                <div className="flex w-full flex-col md:max-w-[min(100%,20rem)] md:shrink-0">
                  <Link
                    href="/book"
                    className="inline-flex w-full min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-6 py-4 text-base font-extrabold uppercase tracking-wide text-[#0F172A] shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#eab308] hover:shadow-lg hover:shadow-[#FACC15]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 active:translate-y-0 sm:text-lg"
                  >
                    Book Online
                    <span aria-hidden>→</span>
                  </Link>
                </div>

                <div className="min-w-0 flex-1 text-center md:text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                    Or call us
                  </p>
                  <a
                    href={`tel:${TEL}`}
                    className="group mt-2 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl px-2 py-3 text-lg font-bold text-white no-underline transition-all duration-200 ease-out hover:scale-[1.02] hover:text-[#FACC15] hover:shadow-[0_0_24px_rgba(250,204,21,0.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 md:justify-start md:text-xl lg:text-2xl"
                    aria-label={`Call ${TEL_DISPLAY}`}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#FACC15] ring-1 ring-white/15 transition-all duration-200 group-hover:bg-[#FACC15] group-hover:text-[#0F172A] group-hover:ring-[#FACC15]"
                      aria-hidden
                    >
                      <Phone className="h-5 w-5" strokeWidth={2.5} />
                    </span>
                    {TEL_DISPLAY}
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-neutral-700/90 border-t border-neutral-800 bg-black/25">
              <div className="flex flex-col items-center px-2 py-5 text-center sm:px-4 sm:py-6">
                <Clock
                  className="mb-2 h-5 w-5 text-[#FACC15]"
                  strokeWidth={2}
                  aria-hidden
                />
                <p className="text-lg font-bold text-white sm:text-xl md:text-2xl">
                  2 min
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-white/90 sm:text-xs">
                  Avg. response
                </p>
              </div>
              <div className="flex flex-col items-center px-2 py-5 text-center sm:px-4 sm:py-6">
                <Car
                  className="mb-2 h-5 w-5 text-[#FACC15]"
                  strokeWidth={2}
                  aria-hidden
                />
                <p className="text-lg font-bold text-white sm:text-xl md:text-2xl">
                  5 min
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-white/90 sm:text-xs">
                  Pickup time
                </p>
              </div>
              <div className="flex flex-col items-center px-2 py-5 text-center sm:px-4 sm:py-6">
                <Shield
                  className="mb-2 h-5 w-5 text-[#FACC15]"
                  strokeWidth={2}
                  aria-hidden
                />
                <p className="text-lg font-bold text-white sm:text-xl md:text-2xl">
                  595 SEK
                </p>
                <p className="mt-1 flex flex-wrap items-center justify-center gap-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-white/90 sm:text-xs">
                  <span>
                    <span aria-hidden>· </span>Arlanda fixed price
                  </span>
                  <ArlandaPriceHint />
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-white/80">
            <MapPin className="h-8 w-8 shrink-0 text-[#FACC15]" aria-hidden strokeWidth={2} />
            <span>Tesla Model S 2024</span>
            <span className="text-white/40" aria-hidden>
              ·
            </span>
            <span>Licensed &amp; insured</span>
          </p>
        </div>
      </motion.section>

      {/* Mobile sticky CTA — appears after scroll */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-neutral-800 bg-[#0F172A]/95 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 md:hidden ${
          stickyVisible ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
        role="region"
        aria-label="Quick actions"
      >
        <div className="mx-auto flex max-w-lg gap-2">
          <a
            href={`tel:${TEL}`}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#FACC15]/40 bg-neutral-900/80 text-sm font-bold uppercase tracking-wide text-white transition hover:border-[#FACC15] hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] active:scale-[0.98]"
            aria-label={`Call ${TEL_DISPLAY}`}
          >
            <Phone className="h-4 w-4" aria-hidden />
            Call
          </a>
          <Link
            href="/book"
            className="flex min-h-12 flex-[1.35] items-center justify-center gap-1 rounded-xl bg-[#FACC15] text-sm font-bold uppercase tracking-wide text-[#0F172A] shadow-md transition hover:-translate-y-0.5 hover:bg-[#eab308] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] active:translate-y-0"
          >
            Book
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </>
  );
}
