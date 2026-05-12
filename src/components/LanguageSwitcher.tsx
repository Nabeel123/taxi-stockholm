"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

function FlagSweden({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 10" className={className} aria-hidden>
      <rect width="16" height="10" fill="#006AA7" />
      <rect x="5" y="0" width="2.5" height="10" fill="#FECC00" />
      <rect x="0" y="4" width="16" height="2" fill="#FECC00" />
    </svg>
  );
}

function FlagUnitedKingdom({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden>
      <defs>
        <clipPath id={`uk-clip-${uid}`}>
          <path d="M0,0h60v30H0z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#uk-clip-${uid})`}>
        <path fill="#012169" d="M0,0h60v30H0z" />
        <path stroke="#fff" strokeWidth="6" d="m0,0 60,30M60,0 0,30" />
        <path stroke="#C8102E" strokeWidth="4" d="m0,0 60,30M60,0 0,30" />
        <path stroke="#fff" strokeWidth="10" d="M30,0v30M0,15h60" />
        <path stroke="#C8102E" strokeWidth="6" d="M30,0v30M0,15h60" />
      </g>
    </svg>
  );
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");

  const btnBase =
    "flex min-h-10 min-w-10 touch-manipulation items-center justify-center rounded-full p-2 transition sm:min-h-9 sm:min-w-9 sm:p-1.5";

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-neutral-200 bg-neutral-50 p-1"
      role="group"
      aria-label={t("label")}
    >
      <button
        type="button"
        onClick={() => router.replace(pathname, { locale: "sv" })}
        className={`${btnBase} ${
          locale === "sv"
            ? "bg-[var(--accent)] shadow-sm ring-1 ring-black/10"
            : "text-neutral-600 hover:text-neutral-900 active:bg-neutral-200/80"
        }`}
        aria-pressed={locale === "sv"}
        aria-label={t("switchToSv")}
      >
        <FlagSweden className="h-4 w-[26px] rounded-[2px] shadow-sm sm:h-3.5 sm:w-[22px]" />
      </button>
      <button
        type="button"
        onClick={() => router.replace(pathname, { locale: "en" })}
        className={`${btnBase} ${
          locale === "en"
            ? "bg-[var(--accent)] shadow-sm ring-1 ring-black/10"
            : "text-neutral-600 hover:text-neutral-900 active:bg-neutral-200/80"
        }`}
        aria-pressed={locale === "en"}
        aria-label={t("switchToEn")}
      >
        <FlagUnitedKingdom className="h-4 w-[26px] rounded-[2px] shadow-sm sm:h-3.5 sm:w-[22px]" />
      </button>
    </div>
  );
}
