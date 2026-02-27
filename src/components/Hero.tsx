"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1920&q=80";

export default function Hero() {
  const router = useRouter();
  useEffect(() => {
    router.prefetch("/book");
  }, [router]);

  return (
    <section id="hero" className="relative flex min-h-screen flex-col justify-end overflow-hidden">
      {/* Tesla interior background - dark blue overlay like template */}
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Tesla Model S interior"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0f172a]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent" />
      </div>

      {/* Content - centered for symmetry */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-20 pt-24 text-center sm:px-6 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-40">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-black sm:text-sm">
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
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg md:text-xl"
          >
            Your trusted travel partner in Stockholm. Punctual, reliable, and professional chauffeur services in our Tesla Model S 2024 fleet.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/book"
              className="mt-10 inline-flex items-center justify-center rounded-xl border-2 border-[var(--accent)] bg-transparent px-10 py-4 text-base font-bold text-white uppercase tracking-wider transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-[var(--accent)] hover:text-black hover:shadow-xl hover:shadow-[var(--accent)]/20 animate-border-pulse sm:py-4 sm:text-lg"
            >
              Book Your Ride
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
