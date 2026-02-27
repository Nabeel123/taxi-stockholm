"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Clock, MessageCircle } from "lucide-react";

export default function CTASection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="bg-[var(--dark-slate)] py-16 sm:py-20 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold tracking-wider text-black">
            <Clock className="h-4 w-4" />
            24/7 SERVICE AVAILABLE
          </div>
        </div>

        <h2 className="mt-8 text-center text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          Need A Tesla Ride Right Now?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-white/70">
          Call us directly or book online for immediate Tesla Model S 2024 pickup anywhere in Stockholm
        </p>

        {/* Main CTA card */}
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2 md:gap-8 md:p-10">
            {/* Left: Contact info */}
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/90">
                Call Now
              </p>
              <a
                href="tel:+46700123456"
                className="mt-2 flex flex-wrap items-center gap-2 gap-y-1 text-xl font-bold text-white transition-colors duration-300 ease-out hover:text-[var(--accent)] sm:gap-3 sm:text-2xl md:text-3xl"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)]">
                  <Phone className="h-6 w-6 text-black" />
                </span>
                +46 700 123 456
              </a>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--accent)]" />
                  24/7 Available
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[var(--accent)]" />
                  Instant Response
                </span>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex flex-col justify-center gap-4">
              <a
                href="tel:+46700123456"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-4 font-bold text-black transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-[var(--accent-hover)] sm:w-auto"
              >
                CALL NOW
                <span>→</span>
              </a>
              <Link
                href="/book"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-neutral-700 bg-neutral-800/50 px-6 py-4 font-bold text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[var(--accent)] hover:bg-neutral-800 sm:w-auto"
              >
                BOOK ONLINE
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 border-t border-neutral-800">
            <div className="border-r border-neutral-800 px-3 py-3 text-center sm:px-6 sm:py-4">
              <p className="text-lg font-bold text-white sm:text-xl md:text-2xl">2 min</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/60 sm:mt-1 sm:text-xs">
                Average Response
              </p>
            </div>
            <div className="border-r border-neutral-800 px-3 py-3 text-center sm:px-6 sm:py-4">
              <p className="text-lg font-bold text-white sm:text-xl md:text-2xl">5 min</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/60 sm:mt-1 sm:text-xs">
                Pickup Time
              </p>
            </div>
            <div className="px-3 py-3 text-center sm:px-6 sm:py-4">
              <p className="text-lg font-bold text-white sm:text-xl md:text-2xl">595 SEK</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/60 sm:mt-1 sm:text-xs">
                Airport Fixed
              </p>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="mt-8 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Tesla Model S 2024
          <span className="text-white/40">•</span>
          Professional drivers
          <span className="text-white/40">•</span>
          Licensed &amp; insured
        </p>
      </div>
    </motion.section>
  );
}
