"use client";

import { motion } from "framer-motion";
import { Clock, Car, ShieldCheck } from "lucide-react";

const operations = [
  {
    icon: Clock,
    title: "Operation Hours",
    desc: "24/7 service available for advance bookings.",
  },
  {
    icon: Car,
    title: "Available Fleet",
    desc: "Tesla Model S 2024 — Premium sedans with zero emissions.",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    desc: "Verified drivers, real-time tracking, and 24/7 helpline.",
  },
];

const storyBullets = [
  "English & Swedish speaking chauffeurs",
  "Licensed, insured, and professionally trained drivers",
  "Discreet, business-ready service for executives and guests",
];

export default function AboutOperations() {
  return (
    <section className="bg-white py-16 sm:py-20 md:py-24" id="about">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="font-heading inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black sm:text-sm">
            About Us
          </span>
          <h2 className="mt-2 text-2xl font-bold text-[var(--dark-slate)] sm:text-3xl md:text-4xl">
            Why Choose Us
          </h2>
        </motion.div>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl sm:p-8 lg:p-10"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
              Our Story
            </h3>
            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Stockholm&apos;s Premier Tesla Taxi
            </h2>
            <p className="mt-4 leading-relaxed text-white/80">
              Providing luxury transportation across Stockholm with 15+ years of excellence. Our Tesla
              Model S 2024 fleet delivers punctual, reliable, and eco-friendly rides for business,
              airport transfers, and city tours.
            </p>
            <ul className="mt-6 space-y-3">
              {storyBullets.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-white/90 sm:text-base">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl sm:p-8 lg:p-10"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
              Operation Details
            </h3>
            <div className="mt-6 space-y-6">
              {operations.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
                      <Icon className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="mt-1 text-sm text-white/80">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
