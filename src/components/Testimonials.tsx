"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Exceptional service. Always on time, professional drivers, and transparent pricing. My go-to for airport transfers.",
    name: "Erik Andersson",
    title: "Business Executive",
    initial: "E",
  },
  {
    quote:
      "Clean vehicles, reliable service, and no surprises with pricing. Perfect for Stockholm business trips.",
    name: "Anna Lindström",
    title: "Frequent Traveler",
    initial: "A",
  },
  {
    quote:
      "We recommend Taxi to all our guests. Professional, punctual, and premium quality every time.",
    name: "Marcus Johansson",
    title: "Hotel Manager",
    initial: "M",
  },
];

const trustIndicators = [
  { value: "5.0", label: "AVERAGE RATING" },
  { value: "1000+", label: "HAPPY CUSTOMERS" },
  { value: "24/7", label: "SERVICE" },
];

export default function Testimonials() {
  return (
    <section className="scroll-mt-20 bg-[var(--dark-slate)] py-16 sm:py-20 md:py-24 sm:scroll-mt-24" id="reviews">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black sm:text-sm">
            Testimonials
          </span>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            What People Say
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60 sm:text-base">
            Trusted by Stockholm&apos;s professionals and travelers
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:mt-16 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative flex min-h-[280px] flex-col rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-lg sm:p-8"
            >
              {/* Large quotation mark - CabX style */}
              <div className="absolute right-4 top-4 text-6xl font-serif leading-none text-[var(--accent)]/30 sm:text-7xl">
                &ldquo;
              </div>
              <div className="flex gap-1 text-[var(--accent)]">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
                ))}
              </div>
              <p className="relative mt-4 flex-1 text-sm leading-relaxed text-white/80 sm:text-base">
                {t.quote}
              </p>
              <div className="relative mt-6 flex items-center gap-3 border-t border-neutral-800 pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-black">
                  {t.initial}
                </div>
                <div>
                  <p className="font-medium text-white">{t.name}</p>
                  <p className="text-xs text-white/60 sm:text-sm">{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-12 sm:mt-16 sm:gap-16">
          {trustIndicators.map((ind) => (
            <div
              key={ind.label}
              className="flex min-w-[80px] flex-1 flex-col items-center text-center"
            >
              <span className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                {ind.value}
              </span>
              <span className="mt-1 text-xs uppercase tracking-wider text-white/60 sm:text-sm">
                {ind.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
