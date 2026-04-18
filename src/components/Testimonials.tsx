"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Star, Users } from "lucide-react";

const testimonials = [
  {
    quote:
      "Exceptional service. Always on time, professional drivers, and transparent pricing. My go-to for airport transfers.",
    name: "Erik Andersson",
    title: "Business Executive",
    avatarUrl: "https://i.pravatar.cc/128?img=12",
  },
  {
    quote:
      "Clean vehicles, reliable service, and no surprises with pricing. Perfect for Stockholm business trips.",
    name: "Anna Lindström",
    title: "Frequent Traveler",
    avatarUrl: "https://i.pravatar.cc/128?img=45",
  },
  {
    quote:
      "We recommend Taxi to all our guests. Professional, punctual, and premium quality every time.",
    name: "Marcus Johansson",
    title: "Hotel Manager",
    avatarUrl: "https://i.pravatar.cc/128?img=33",
  },
];

const trustIndicators = [
  { value: "5.0", label: "Average rating", icon: Star },
  { value: "1000+", label: "Happy customers", icon: Users },
  { value: "24/7", label: "Always on call", icon: Clock },
];

function GoogleReviewBadge() {
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
      <span className="font-medium">Google review</span>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      className="relative scroll-mt-20 overflow-hidden bg-[#243047] py-16 sm:scroll-mt-24 sm:py-20 md:py-24"
      id="reviews"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(250,204,21,0.07),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="font-heading inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black sm:text-sm">
            Testimonials
          </span>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            What People Say
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
            Trusted by Stockholm&apos;s professionals and travelers
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
          className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-8 sm:mt-12 sm:gap-12 md:gap-16"
        >
          {trustIndicators.map((ind) => {
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

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:mt-14 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative flex min-h-[300px] flex-col rounded-2xl border border-white/10 bg-[#1a2639]/90 p-6 shadow-lg backdrop-blur-sm sm:min-h-[280px] sm:p-8"
            >
              <div className="absolute right-4 top-4 text-6xl font-serif leading-none text-[var(--accent)]/25 sm:text-7xl">
                &ldquo;
              </div>
              <div className="flex gap-1 text-[var(--accent)]">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
                ))}
              </div>
              <GoogleReviewBadge />
              <p className="relative mt-4 flex-1 text-sm leading-relaxed text-white/85 sm:text-base">
                {t.quote}
              </p>
              <div className="relative mt-6 flex items-center gap-3 border-t border-white/10 pt-6">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--accent)]/40">
                  <Image src={t.avatarUrl} alt="" fill className="object-cover" sizes="44px" />
                </div>
                <div>
                  <p className="font-medium text-white">{t.name}</p>
                  <p className="text-xs text-white/65 sm:text-sm">{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
