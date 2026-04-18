"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";

export default function Hero() {
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const priceHref = useMemo(() => {
    const params = new URLSearchParams();
    if (pickup) params.set("pickup", pickup);
    if (dropoff) params.set("dropoff", dropoff);
    const q = params.toString();
    return q ? `/book?${q}` : "/book";
  }, [pickup, dropoff]);

  useEffect(() => {
    router.prefetch("/book");
  }, [router]);

  return (
    <section id="hero" className="relative flex min-h-screen flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
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
          poster="/masthead.jpg"
          aria-hidden
        >
          <source src="/masthead.mp4" type="video/mp4" />
        </video>
        {/* Light theme scrim: dark-slate + subtle accent warmth so copy stays readable */}
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
              Premium Taxi Agency
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-3xl font-bold leading-[1.1] tracking-tight text-[var(--accent)] sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Reliable Rides,
            <br />
            Every Time.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/95 sm:text-lg md:text-xl"
          >
            Your trusted travel partner in Stockholm. Punctual, reliable, and professional chauffeur
            services in our Tesla Model S 2024 fleet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 w-full rounded-2xl border border-white/15 bg-[#0f172a]/65 p-4 shadow-2xl backdrop-blur-md sm:p-5"
          >
            <p className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 sm:text-sm">
              <MapPin className="h-4 w-4 text-[var(--accent)]" />
              Get a price in seconds
            </p>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <AddressAutocomplete
                value={pickup}
                onChange={setPickup}
                placeholder="Pickup address"
                aria-label="Pickup address"
                className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-left text-base text-white placeholder-white/45 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
              />
              <AddressAutocomplete
                value={dropoff}
                onChange={setDropoff}
                placeholder="Drop-off address"
                aria-label="Drop-off address"
                className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-left text-base text-white placeholder-white/45 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
              />
            </div>
            <Link
              href={priceHref}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3.5 text-base font-bold uppercase tracking-wide text-black transition-all duration-300 ease-out hover:scale-[1.01] hover:bg-[var(--accent-hover)] hover:shadow-lg hover:shadow-[var(--accent)]/25"
            >
              Get price
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white/90 sm:text-base"
          >
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" />
              5.0 rating
            </span>
            <span className="hidden text-white/40 sm:inline" aria-hidden>
              ·
            </span>
            <span className="font-medium">1000+ rides</span>
            <span className="hidden text-white/40 sm:inline" aria-hidden>
              ·
            </span>
            <span className="font-medium">Fixed prices</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
