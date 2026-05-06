"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Award,
  Languages,
  MapPinned,
  type LucideIcon,
} from "lucide-react";

type FeatureCopy = {
  title: string;
  lines: string[];
};

export default function AboutOperations() {
  const t = useTranslations("about");
  const tSite = useTranslations("site");
  const rawFeatures = t.raw("features") as FeatureCopy[];

  const features: {
    icon: LucideIcon;
    title: string;
    lines: string[];
  }[] = rawFeatures.map((copy, idx) => {
    const icons: LucideIcon[] = [Languages, MapPinned, Award];
    return { icon: icons[idx]!, title: copy.title, lines: copy.lines };
  });

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-24" id="about">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/about.jpg"
          alt=""
          fill
          className="object-cover object-[65%_45%] opacity-[0.18] saturate-[0.85] sm:object-[60%_40%] md:opacity-[0.22]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-warm)] via-[var(--surface-warm)]/92 to-[var(--surface-warm-mid)]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface-warm)] via-[var(--surface-warm)]/75 to-transparent sm:from-[var(--surface-warm)] sm:via-[var(--surface-warm)]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/[0.07] via-transparent to-[var(--accent)]/[0.06]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_100%_50%,rgba(20,33,61,0.14),transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <h2 className="font-heading text-balance text-2xl font-bold leading-tight tracking-tight text-[var(--secondary)] sm:text-3xl md:text-[2.25rem] md:leading-[1.12]">
              {tSite("brandTitle")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              {tSite("description")}
            </p>

            <ul className="mt-10 space-y-10">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex gap-4 sm:gap-5">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--primary)]/20 bg-white/60 shadow-sm backdrop-blur-sm sm:h-12 sm:w-12"
                      aria-hidden
                    >
                      <Icon
                        className="h-5 w-5 text-[var(--primary)] sm:h-[1.375rem] sm:w-[1.375rem]"
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading text-base font-bold text-[var(--secondary)] sm:text-lg">
                        {item.title}
                      </p>
                      <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-neutral-600 sm:text-base">
                        {item.lines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/book"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-[var(--secondary)] shadow-sm transition hover:bg-[var(--accent-hover)] sm:text-base"
            >
              {t("bookNow")}
            </Link>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-xl sm:aspect-[4/5] md:aspect-[5/6] lg:aspect-square">
                <Image
                  src="/about.jpg"
                  alt={t("imageAlt")}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                <div className="absolute right-3 top-3 z-10 max-w-[min(100%,17rem)] rounded-xl border border-white/10 bg-[var(--primary)]/95 p-3.5 shadow-2xl backdrop-blur-sm sm:right-4 sm:top-4 sm:max-w-[18.5rem] sm:p-4">
                  <p className="text-sm font-medium text-white">
                    {t("pickupLine")}{" "}
                    <span className="font-bold text-[var(--accent)]">{t("pickupEta")}</span>
                  </p>
                  <p className="mt-1 text-xs leading-snug text-white/65">
                    {t("pickupSub")}
                  </p>
                  <div className="relative mt-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-[62%] rounded-full bg-[var(--accent)]" aria-hidden />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
