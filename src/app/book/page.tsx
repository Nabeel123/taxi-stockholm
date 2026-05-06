"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

const BookingForm = dynamic(() => import("@/components/BookingForm"), {
  loading: () => <BookFormSkeleton />,
  ssr: true,
});

function BookFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-8 rounded-full bg-white/10" />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/50 p-6">
        <div className="h-6 w-40 rounded bg-white/10" />
        <div className="mt-4 h-4 w-64 rounded bg-white/5" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

const PACKAGE_TO_SERVICE: Record<string, string> = {
  "city-to-arlanda": "airport-dropoff",
  "arlanda-to-city": "airport-pickup",
};

function BookContent() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service") || searchParams.get("package");
  const service = serviceParam
    ? PACKAGE_TO_SERVICE[serviceParam] || serviceParam
    : undefined;
  const pickup = searchParams.get("pickup") || undefined;
  const dropoff = searchParams.get("dropoff") || undefined;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center rounded-lg p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Back"
        >
          <span className="text-xl" aria-hidden>←</span>
        </Link>
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">Book your ride</h1>
          <p className="mt-0.5 text-sm text-white/60">Complete your booking details</p>
        </div>
      </div>
      <BookingForm
        key={service ?? "default"}
        defaultService={service}
        defaultPickup={pickup}
        defaultDropoff={dropoff}
      />
    </div>
  );
}

export default function BookPage() {
  return (
    <div className="min-h-screen bg-[var(--dark-slate)]">
      <Header />
      <main className="pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20">
        <Suspense
          fallback={
            <div className="mx-auto max-w-2xl px-4 py-12 text-center text-white/60">
              Loading...
            </div>
          }
        >
          <BookContent />
        </Suspense>
      </main>
    </div>
  );
}
