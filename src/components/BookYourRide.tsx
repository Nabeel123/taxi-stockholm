"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plane, MapPin, Landmark, Clock, User } from "lucide-react";
import { SERVICES } from "@/lib/constants";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  "plane-arrival": Plane,
  "plane-departure": Plane,
  landmark: Landmark,
  "map-pin": MapPin,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function BookYourRide() {
  const [selectedId, setSelectedId] = useState<string>("airport-pickup");
  const [customPickup, setCustomPickup] = useState("");
  const [customDest, setCustomDest] = useState("");

  const selectedService = SERVICES.find((s) => s.id === selectedId) ?? SERVICES[0];
  const IconComponent = icons[selectedService.icon] || MapPin;
  const isCustomRoute = selectedId === "custom-route";

  const customRouteHref = (() => {
    const params = new URLSearchParams();
    params.set("service", "custom-route");
    if (customPickup) params.set("pickup", customPickup);
    if (customDest) params.set("dropoff", customDest);
    return `/book?${params.toString()}`;
  })();

  return (
    <section className="scroll-mt-20 overflow-hidden bg-white py-16 sm:py-20 md:py-24 sm:scroll-mt-24" id="services">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.35 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black sm:text-sm">
            Services
          </span>
          <h2 className="mt-2 text-2xl font-bold text-[var(--dark-slate)] sm:text-3xl md:text-4xl">
            Book Your Ride
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600 sm:text-base">
            Choose your service and get instant booking
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-[280px_1fr] lg:gap-6"
        >
          {/* Left: Service selection */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col">
            {SERVICES.map((service, i) => {
              const Icon = icons[service.icon] || MapPin;
              const isSelected = selectedId === service.id;
              return (
                <motion.button
                  key={service.id}
                  type="button"
                  variants={itemVariants}
                  custom={i}
                  onClick={() => setSelectedId(service.id)}
                  className={`group relative flex min-w-0 flex-1 items-center gap-2 rounded-xl border p-2.5 text-left transition-all duration-200 ease-out sm:min-w-[calc(50%-0.25rem)] sm:gap-3 sm:p-3 lg:min-w-0 ${
                    isSelected
                      ? "border-[var(--accent)] bg-neutral-950 shadow-md ring-1 ring-[var(--accent)]"
                      : "border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-900/90"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors ${
                      isSelected ? "bg-[var(--accent)]" : "bg-neutral-700"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isSelected ? "text-black" : "text-white/80"
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    {service.popular && (
                      <span
                        className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          isSelected
                            ? "bg-[var(--accent)] text-black"
                            : "bg-[var(--accent)]/20 text-[var(--accent)]"
                        }`}
                      >
                        Popular
                      </span>
                    )}
                    <h3
                      className={`text-xs font-semibold uppercase tracking-wide sm:text-sm ${
                        isSelected ? "text-white" : "text-white/90"
                      }`}
                    >
                      {service.name}
                    </h3>
                    <p className={`mt-0.5 line-clamp-2 text-[11px] sm:text-xs leading-tight ${isSelected ? "text-white/90" : "text-white/80"}`}>
                      {service.description}
                    </p>
                    <p
                      className={`mt-1 text-xs font-bold sm:text-sm ${
                        isSelected ? "text-[var(--accent)]" : "text-white/90"
                      }`}
                    >
                      {service.priceLabel}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Detail panel - min-height prevents layout shift when switching to City Tour */}
          <div className="min-h-[360px] sm:min-h-[420px] lg:min-h-[460px]">
            {isCustomRoute ? (
              <div
                key="custom-form"
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
                    <IconComponent className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wide text-[var(--accent)] sm:text-xl">
                      {selectedService.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/80">{selectedService.longDesc}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-white/90">
                      Pickup
                    </label>
                    <AddressAutocomplete
                      value={customPickup}
                      onChange={setCustomPickup}
                      placeholder="Start typing an address in Sweden"
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-base text-white placeholder-white/50 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-white/90">
                      Destination
                    </label>
                    <AddressAutocomplete
                      value={customDest}
                      onChange={setCustomDest}
                      placeholder="Start typing an address in Sweden"
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-base text-white placeholder-white/50 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                  </div>
                </div>
                <Link
                  href={customRouteHref}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3.5 text-base font-bold text-black transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-[var(--accent-hover)] sm:w-auto"
                >
                  {selectedService.ctaLabel}
                  <span className="ml-1">→</span>
                </Link>
              </div>
            ) : (
              <div
                key={selectedId}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
                    <IconComponent className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
                      {selectedService.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/80">{selectedService.longDesc}</p>
                  </div>
                </div>

                <p className="mt-5 text-2xl font-bold text-[var(--accent)] sm:text-4xl">
                  {selectedService.priceLabel}
                </p>
                <p className="mt-2 text-sm text-white/70">{selectedService.tagline}</p>

                {/* Feature boxes for City Tour */}
                {"highlights" in selectedService && selectedService.highlights ? (
                  <>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white/90">
                        <Clock className="h-4 w-4 text-[var(--accent)]" />
                        {selectedService.duration}
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white/90">
                        <MapPin className="h-4 w-4 text-[var(--accent)]" />
                        {selectedService.route}
                      </div>
                      {"extraLabel" in selectedService && (
                        <div className="flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white/90">
                          <User className="h-4 w-4 text-[var(--accent)]" />
                          {selectedService.extraLabel}
                        </div>
                      )}
                    </div>
                    <h4 className="mt-6 text-sm font-semibold uppercase tracking-wider text-white">
                      Tour Highlights
                    </h4>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {selectedService.highlights.map((h) => (
                        <div key={h} className="flex items-center gap-2 text-sm text-white/90">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                          {h}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-4 sm:gap-5">
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <Clock className="h-4 w-4 text-[var(--accent)]" />
                      {selectedService.duration}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <MapPin className="h-4 w-4 text-[var(--accent)]" />
                      {selectedService.route}
                    </div>
                  </div>
                )}

                {/* Feature list for airport services */}
                {!("highlights" in selectedService) && selectedService.features && (
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
                    {selectedService.features.map((f, i) => (
                      <span key={f}>
                        {f}
                        {i < selectedService.features.length - 1 && " • "}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/book?service=${selectedId}`}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3.5 text-base font-bold text-black transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-[var(--accent-hover)] sm:w-auto"
                >
                  {selectedService.ctaLabel}
                  <span className="ml-1">→</span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
